import { ENV } from "../../lib/env.js";
import {
  AiProviderError,
  retryWithAiKeys,
} from "../aiKeyManager.js";

const DEFAULT_BASE_URL = "http://apiaccess.iti.net.eg/api/v1/student/chat";
const DEFAULT_MODEL = "us.meta.llama3-3-70b-instruct-v1:0";
const DEFAULT_VISION_MODEL = "qwen.qwen3-vl-235b-a22b";
const DEFAULT_TIMEOUT_MS = 30000;
const RETRYABLE_STATUSES = new Set([401, 403, 429, 500, 502, 503]);

export function getItiConfig({ isVision = false } = {}) {
  return {
    baseUrl: ENV.ITI_API_BASE_URL || DEFAULT_BASE_URL,
    model: isVision
      ? ENV.ITI_VISION_MODEL || DEFAULT_VISION_MODEL
      : ENV.ITI_MODEL || DEFAULT_MODEL,
  };
}

export async function callItiProvider(messages, systemPrompt, options = {}) {
  const { baseUrl, model } = getItiConfig(options);
  const selectedModel = options.model || model;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  return retryWithAiKeys(async ({ apiKey }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: selectedModel,
          messages,
          system_prompt: systemPrompt || "",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new AiProviderError(
          `ITI Gateway Error: ${response.status} - ${errorText}`,
          {
            status: response.status,
            retryable: RETRYABLE_STATUSES.has(response.status),
          },
        );
      }

      const data = await response.json().catch((error) => {
        throw new AiProviderError("Invalid AI response", {
          retryable: true,
          cause: error,
        });
      });

      if (!data || (typeof data === "object" && !Object.keys(data).length)) {
        throw new AiProviderError("Empty AI response", { retryable: true });
      }

      if (typeof options.transformResponse === "function") {
        return options.transformResponse(data);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new AiProviderError("AI provider timeout", {
          retryable: true,
          cause: error,
        });
      }

      if (error instanceof AiProviderError) {
        throw error;
      }

      throw new AiProviderError("AI provider network error", {
        retryable: true,
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  });
}

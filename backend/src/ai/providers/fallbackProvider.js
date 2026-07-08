import { ENV } from "../../lib/env.js";
import { callItiProvider } from "./itiProvider.js";

const FALLBACK_MODELS = ["qwen.qwen3-vl-235b-a22b", "deepseek.v3.2"];

export async function callWithFallback(messages, systemPrompt, options = {}) {
  try {
    return await callItiProvider(messages, systemPrompt, options);
  } catch (primaryError) {
    if (
      primaryError.message ===
      "All AI providers are currently unavailable. Please try again later."
    ) {
      throw primaryError;
    }

    const candidates = [
      ENV.ITI_FALLBACK_MODEL,
      ...FALLBACK_MODELS,
    ].filter(Boolean);

    for (const model of candidates) {
      try {
        return await callItiProvider(messages, systemPrompt, {
          ...options,
          model,
        });
      } catch (fallbackError) {
        console.error(
          `ITI fallback model ${model} failed:`,
          fallbackError.message,
        );
      }
    }

    throw primaryError;
  }
}

import { ENV } from "../../lib/env.js";

const DEFAULT_BASE_URL = "http://apiaccess.iti.net.eg/api/v1/student/chat";
const DEFAULT_MODEL = "us.meta.llama3-3-70b-instruct-v1:0";
const DEFAULT_VISION_MODEL = "qwen.qwen3-vl-235b-a22b";

export function getItiConfig({ isVision = false } = {}) {
  return {
    baseUrl: ENV.ITI_API_BASE_URL || DEFAULT_BASE_URL,
    apiKey: ENV.ITI_API_KEY || ENV.OPENAI_API_KEY,
    model: isVision
      ? ENV.ITI_VISION_MODEL || DEFAULT_VISION_MODEL
      : ENV.ITI_MODEL || DEFAULT_MODEL,
  };
}

export async function callItiProvider(messages, systemPrompt, options = {}) {
  const { baseUrl, apiKey, model } = getItiConfig(options);
  const selectedModel = options.model || model;

  if (!apiKey) {
    throw new Error("ITI API key is not configured");
  }

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
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ITI Gateway Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

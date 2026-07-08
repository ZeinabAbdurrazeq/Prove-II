import { ENV } from "../lib/env.js";

const RETRYABLE_STATUSES = new Set([401, 403, 429, 500, 502, 503]);
const NETWORK_ERROR_NAMES = new Set(["AbortError", "TimeoutError"]);

function parseKeyList(value) {
  return String(value || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function loadAiKeys() {
  const multiKeyList = parseKeyList(ENV.AI_API_KEYS);

  if (multiKeyList.length) {
    return multiKeyList;
  }

  return [
    ENV.AI_API_KEY,
    ENV.ITI_API_KEY,
    ENV.OPENAI_API_KEY,
  ]
    .map((key) => String(key || "").trim())
    .filter(Boolean);
}

const aiKeys = loadAiKeys();
let currentKeyIndex = 0;
const failedKeys = new Map();

export class AiProviderError extends Error {
  constructor(message, { status, retryable = false, cause } = {}) {
    super(message);
    this.name = "AiProviderError";
    this.status = status;
    this.retryable = retryable;
    this.cause = cause;
  }
}

export function getCurrentKey() {
  return aiKeys[currentKeyIndex] || null;
}

export function getNextKey() {
  if (!aiKeys.length) return null;
  currentKeyIndex = (currentKeyIndex + 1) % aiKeys.length;
  return getCurrentKey();
}

function getFailureReason(error) {
  if (error?.status) return error.status;
  if (error?.message) return error.message;
  if (error?.name) return error.name;
  return "provider error";
}

export function markKeyFailed(error, keyIndex = currentKeyIndex) {
  failedKeys.set(keyIndex, {
    failedAt: new Date(),
    reason: getFailureReason(error),
  });

  console.error(
    `AI key #${keyIndex + 1} failed with ${getFailureReason(error)}, rotating to next key.`,
  );

  if (currentKeyIndex === keyIndex) {
    getNextKey();
  }
}

export function isRetryableAiError(error) {
  if (!error) return false;
  if (error.retryable === true) return true;
  if (RETRYABLE_STATUSES.has(Number(error.status))) return true;
  if (NETWORK_ERROR_NAMES.has(error.name)) return true;

  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("empty ai response") ||
    message.includes("invalid ai response")
  );
}

export async function retryWithAiKeys(operation) {
  if (!aiKeys.length) {
    throw new Error("AI API key is not configured");
  }

  let lastError;

  for (let attempt = 0; attempt < aiKeys.length; attempt += 1) {
    const keyIndex = currentKeyIndex;
    const apiKey = getCurrentKey();

    try {
      return await operation({ apiKey, keyIndex, attempt });
    } catch (error) {
      if (!isRetryableAiError(error)) {
        throw error;
      }

      lastError = error;
      markKeyFailed(error, keyIndex);
    }
  }

  throw new AiProviderError(
    "All AI providers are currently unavailable. Please try again later.",
    { retryable: false, cause: lastError },
  );
}

export function getAiKeyHealth() {
  return {
    totalKeys: aiKeys.length,
    currentKeyIndex,
    failedKeys: Array.from(failedKeys.entries()).map(([keyIndex, details]) => ({
      keyIndex,
      failedAt: details.failedAt,
      reason: details.reason,
    })),
  };
}

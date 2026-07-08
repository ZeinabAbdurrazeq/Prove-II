import { callWithFallback } from "../ai/providers/fallbackProvider.js";
import BlogPost from "../models/BlogPost.js";

/**
 * Detect whether text is predominantly Arabic.
 * Returns "ar" if ≥15% of non-space characters are in the Arabic unicode block,
 * otherwise returns "en".
 */
function detectLanguage(text = "") {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
  const stripped = text.replace(/\s+/g, "");
  if (!stripped) return "en";
  const arabicChars = (stripped.match(arabicRegex) || []).length;
  return arabicChars / stripped.length >= 0.15 ? "ar" : "en";
}

/**
 * Translate community post content via the ITI AI provider (non-blocking).
 * Updates the BlogPost document in-place. Never throws.
 */
export async function translatePost(postId, content) {
  try {
    const originalLanguage = detectLanguage(content);
    const targetLanguage = originalLanguage === "ar" ? "en" : "ar";
    const targetLabel = targetLanguage === "ar" ? "Arabic" : "English";
    const sourceLabel = originalLanguage === "ar" ? "Arabic" : "English";

    // Mark as pending immediately so the client knows translation is in progress
    await BlogPost.findByIdAndUpdate(postId, {
      originalLanguage,
      translatedLanguage: targetLanguage,
      translationStatus: "pending",
    });

    const systemPrompt = [
      `You are a professional translator specializing in ${sourceLabel} to ${targetLabel} translation.`,
      "Translate the following text accurately, preserving the original tone, formatting, and meaning.",
      "Return ONLY the translated text. Do not add any explanation, notes, or prefix.",
    ].join(" ");

    const messages = [
      {
        role: "user",
        content: `Translate this ${sourceLabel} text to ${targetLabel}:\n\n${content}`,
      },
    ];

    const result = await callWithFallback(messages, systemPrompt);

    // The ITI provider returns: { message: { content: "..." } } or { choices: [{ message: { content } }] }
    const translated =
      result?.message?.content ||
      result?.choices?.[0]?.message?.content ||
      result?.content ||
      "";

    if (!translated || typeof translated !== "string") {
      throw new Error("Empty translation response");
    }

    await BlogPost.findByIdAndUpdate(postId, {
      translatedContent: translated.trim(),
      translationStatus: "done",
    });
  } catch (error) {
    console.error(`[translationService] Failed to translate post ${postId}:`, error.message);
    try {
      await BlogPost.findByIdAndUpdate(postId, { translationStatus: "failed" });
    } catch {
      // ignore secondary failure
    }
  }
}

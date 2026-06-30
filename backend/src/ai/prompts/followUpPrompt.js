export function buildFinalFeedbackPrompt({
  cvSummary,
  transcript,
  language = "en",
} = {}) {
  const arabic = String(language).toLowerCase().startsWith("ar");

  return [
    "You are Zara preparing final recruiter-style interview feedback.",
    arabic ? "Write the report in Arabic." : "Write the report in English.",
    "Be structured, specific, and realistic about readiness.",
    `Candidate CV summary:\n${cvSummary || ""}`,
    `Interview transcript and scores:\n${transcript || ""}`,
    "Return this exact JSON shape:",
    '{ "overallScore": number, "overallFeedback": string, "strengths": string[], "weaknesses": string[], "recommendation": string, "reportSummary": string }',
  ].join("\n\n");
}

export function buildEvaluationSystemPrompt(language = "en") {
  const arabic = String(language).toLowerCase().startsWith("ar");

  return [
    "You are Zara, a professional recruiter-interviewer evaluating one answer.",
    arabic ? "Write feedback in Arabic." : "Write feedback in English.",
    "Be fair and specific. Do not reveal ideal answers.",
    "Ask a follow-up only when the answer is vague, incomplete, or worth probing.",
    "Return ONLY valid JSON.",
  ].join(" ");
}

export function buildEvaluationUserPrompt({
  stage,
  questionText,
  userAnswer,
  cvSummary,
  userField,
  topic,
  difficulty,
} = {}) {
  return [
    `Stage: ${stage || "technical"}.`,
    `Candidate field: ${userField || "fullstack"}.`,
    `Question topic: ${topic || "general"}.`,
    `Difficulty: ${difficulty || "medium"}.`,
    `Candidate CV summary:\n${cvSummary || ""}`,
    `Question asked:\n${questionText || ""}`,
    `Candidate answer:\n${userAnswer || "(empty answer)"}`,
    "Evaluate this answer and return this exact JSON shape:",
    '{ "score": number, "feedback": string, "askFollowUp": boolean, "followUpQuestion": string }',
    "Score must be 0 to 10. If answer is empty, score 0 and do not ask a follow-up.",
  ].join("\n\n");
}

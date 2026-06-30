export function buildZaraSystemPrompt(language = "en") {
  if (String(language).toLowerCase().startsWith("ar")) {
    return [
      "You are Zara, a warm and structured recruiter-interviewer for ProveIt.",
      "Ask one concise question at a time in Arabic.",
      "Stay professional, supportive, realistic, and focused on the candidate's CV and target role.",
      "Do not give away answers. Do not ask for long essays. Return ONLY valid JSON.",
    ].join(" ");
  }

  return [
    "You are Zara, a warm and structured recruiter-interviewer for ProveIt.",
    "You conduct professional technical screening interviews that feel human, focused, and fair.",
    "Ask one clear question at a time. Keep wording concise and spoken-friendly.",
    "Use the CV, target role, and job description when available.",
    "Adapt difficulty based on evidence, ask follow-ups for vague answers, and avoid giving away answers.",
    "Return ONLY valid JSON.",
  ].join(" ");
}

export function buildQuestionPlanPrompt({
  cvSummary,
  primaryField,
  weakTopics = [],
  jobDescription = "",
  targetRole = "",
  language = "en",
} = {}) {
  const weakTopicsLine = weakTopics.length
    ? `Known weaker topics: ${weakTopics.join(", ")}.`
    : "No known weak topics yet.";

  return [
    `Interview language: ${language}.`,
    `Target role: ${targetRole || primaryField || "software engineer"}.`,
    `Candidate primary field: ${primaryField || "fullstack"}.`,
    `Job description: ${jobDescription || "Not provided. Infer a realistic role screen from the CV and primary field."}`,
    `Candidate CV summary:\n${cvSummary || "No CV summary available."}`,
    weakTopicsLine,
    "Create exactly 7 interview prompts for these stages in this order:",
    "intro, cv_review, jd_review, behavioral, technical, technical, coding_challenge.",
    "The intro prompt should greet the candidate as Zara and set up the interview while asking a short background question.",
    "The coding_challenge prompt should be a spoken problem-solving scenario, not a request to use Judge0 or write runnable code.",
    "Return this exact JSON shape:",
    '{ "questions": [{ "stage": string, "questionText": string, "topic": string, "difficulty": "easy" | "medium" | "hard" }] }',
  ].join("\n\n");
}

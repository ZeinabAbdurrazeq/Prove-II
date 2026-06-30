export const INTERVIEW_STAGES = [
  "intro",
  "cv_review",
  "jd_review",
  "behavioral",
  "technical",
  "coding_challenge",
  "evaluation",
  "final_feedback",
];

export const STAGE_LABELS = {
  intro: "Interview setup",
  cv_review: "CV review",
  jd_review: "Role alignment",
  behavioral: "Behavioral screen",
  technical: "Technical depth",
  coding_challenge: "Problem solving",
  evaluation: "Answer evaluation",
  final_feedback: "Final feedback",
};

const QUESTION_STAGES = [
  "intro",
  "cv_review",
  "jd_review",
  "behavioral",
  "technical",
  "technical",
  "coding_challenge",
];

export function normalizeStage(stage) {
  return INTERVIEW_STAGES.includes(stage) ? stage : "intro";
}

export function getStageForQuestion(index, explicitStage) {
  if (explicitStage && INTERVIEW_STAGES.includes(explicitStage)) {
    return explicitStage;
  }

  return QUESTION_STAGES[Math.min(Number(index) || 0, QUESTION_STAGES.length - 1)];
}

export function getStageLabel(stage) {
  return STAGE_LABELS[normalizeStage(stage)];
}

export function getStageTransition(stage) {
  const normalized = normalizeStage(stage);

  const transitions = {
    intro:
      "I will start by setting context, then we will move through your background and role fit.",
    cv_review:
      "Now I want to connect the interview to what you have actually done.",
    jd_review:
      "Next, I will check how your experience maps to the target role.",
    behavioral:
      "Let's shift into recruiter-style behavioral signals.",
    technical:
      "Now we will go deeper technically and keep the questions role-based.",
    coding_challenge:
      "I will use a short problem-solving prompt to understand your approach.",
    evaluation:
      "I am reviewing your answer before deciding the next best question.",
    final_feedback:
      "I am preparing a structured summary with strengths, gaps, and readiness.",
  };

  return transitions[normalized];
}

export function buildStageMeta(stage) {
  const normalized = normalizeStage(stage);

  return {
    stage: normalized,
    stageLabel: getStageLabel(normalized),
    transitionMessage: getStageTransition(normalized),
    interviewerName: "Zara",
  };
}

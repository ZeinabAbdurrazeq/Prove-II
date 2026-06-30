import {
  buildStageMeta,
  getStageForQuestion,
} from "./interviewStateMachine.js";
import {
  evaluateAnswer,
  generateInterviewFeedback,
  generateInterviewQuestions,
} from "../lib/openai.js";

export async function prepareInterviewQuestions({
  profile,
  weakTopics = [],
  language = "en",
  jobDescription = "",
  targetRole = "",
} = {}) {
  const generated = await generateInterviewQuestions({
    cvSummary: profile?.cvSummary,
    primaryField: profile?.primaryField,
    weakTopics,
    language,
    jobDescription,
    targetRole,
  });

  return generated.map((question, index) => {
    const stage = getStageForQuestion(index, question.stage);

    return {
      questionText: question.questionText,
      topic: question.topic || stage,
      difficulty: question.difficulty || "medium",
      stage,
    };
  });
}

export async function evaluateInterviewAnswer({
  question,
  answer,
  cvSummary,
  userField,
  language,
} = {}) {
  return evaluateAnswer(
    question.questionText,
    answer,
    cvSummary,
    userField,
    language,
    {
      stage: question.stage,
      topic: question.topic,
      difficulty: question.difficulty,
    },
  );
}

export async function buildFinalInterviewFeedback(session) {
  const cvSummary = session.cvAnalysis?.cvSummary || "";
  return generateInterviewFeedback(
    session.questions,
    cvSummary,
    session.language || "en",
  );
}

export function buildQuestionResponseMeta(question, index) {
  const stage = getStageForQuestion(index, question?.stage);
  return buildStageMeta(stage);
}

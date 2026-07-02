import CodeSubmission from "../models/CodeSubmission.js";
import User from "../models/User.js";

const SOLVED_POINTS = {
  easy: 10,
  medium: 20,
  hard: 35,
};

const FIRST_TRY_BONUS = 5;
const DAILY_ACTIVITY_BONUS = 3;
const WRONG_SUBMISSION_PENALTY = -2;

function normalizeDifficulty(difficulty) {
  const normalized = String(difficulty || "").toLowerCase();
  return SOLVED_POINTS[normalized] ? normalized : null;
}

function toDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getUserLevel(score = 0) {
  if (score < 100) return "Entry-Level";
  if (score < 200) return "Junior";
  if (score < 300) return "Intermediate";
  return "Advanced";
}

function buildStats(submissions, score) {
  const solvedByProblem = new Map();
  let acceptedCount = 0;

  for (const submission of submissions) {
    if (!submission.accepted) continue;

    acceptedCount += 1;
    if (!solvedByProblem.has(submission.problemId)) {
      solvedByProblem.set(submission.problemId, submission.difficulty);
    }
  }

  const stats = {
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalSolved: solvedByProblem.size,
    successRate:
      submissions.length > 0
        ? Math.round((acceptedCount / submissions.length) * 100)
        : 0,
    lastActivityBonusDate: "",
    lastUpdated: new Date(),
  };

  for (const difficulty of solvedByProblem.values()) {
    if (difficulty === "easy") stats.easySolved += 1;
    if (difficulty === "medium") stats.mediumSolved += 1;
    if (difficulty === "hard") stats.hardSolved += 1;
  }

  const lastDailyBonus = submissions
    .filter((submission) => Number(submission.dailyBonusAwarded || 0) > 0)
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  if (lastDailyBonus?.createdAt) {
    stats.lastActivityBonusDate = toDayKey(lastDailyBonus.createdAt);
  }

  return {
    score,
    level: getUserLevel(score),
    scoreStats: stats,
  };
}

export async function calculateUserScore(userId) {
  const submissions = await CodeSubmission.find({ userId }).sort({ createdAt: 1 });
  const score = Math.max(
    0,
    submissions.reduce(
      (total, submission) => total + Number(submission.scoreDelta || 0),
      0,
    ),
  );

  const update = buildStats(submissions, score);
  await User.findByIdAndUpdate(userId, update, { new: true });

  return update;
}

export async function updateUserScoreAfterSubmission(userId, submission) {
  const difficulty = normalizeDifficulty(submission?.difficulty);
  const problemId = String(submission?.problemId || "").trim();
  const problemTitle = String(submission?.problemTitle || problemId).trim();
  const accepted = submission?.accepted === true;

  if (!userId || !problemId || !problemTitle || !difficulty) {
    return null;
  }

  const previousSubmissions = await CodeSubmission.find({ userId, problemId })
    .sort({ createdAt: 1 })
    .select("accepted wrongPenaltyApplied createdAt");

  const alreadySolved = previousSubmissions.some((item) => item.accepted);
  const penaltyAlreadyApplied = previousSubmissions.some(
    (item) => Number(item.wrongPenaltyApplied || 0) < 0,
  );
  const firstTry = accepted && previousSubmissions.length === 0;

  let solvedPointsAwarded = 0;
  let firstTryBonusAwarded = 0;
  let dailyBonusAwarded = 0;
  let wrongPenaltyApplied = 0;

  if (accepted) {
    if (!alreadySolved) {
      solvedPointsAwarded = SOLVED_POINTS[difficulty];
    }

    if (firstTry) {
      firstTryBonusAwarded = FIRST_TRY_BONUS;
    }

    const today = toDayKey();
    const alreadyReceivedDailyBonus = await CodeSubmission.exists({
      userId,
      accepted: true,
      dailyBonusAwarded: { $gt: 0 },
      createdAt: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lte: new Date(`${today}T23:59:59.999Z`),
      },
    });

    if (!alreadyReceivedDailyBonus) {
      dailyBonusAwarded = DAILY_ACTIVITY_BONUS;
    }
  } else if (!penaltyAlreadyApplied) {
    wrongPenaltyApplied = WRONG_SUBMISSION_PENALTY;
  }

  const scoreDelta =
    solvedPointsAwarded +
    firstTryBonusAwarded +
    dailyBonusAwarded +
    wrongPenaltyApplied;

  const codeSubmission = await CodeSubmission.create({
    userId,
    problemId,
    problemTitle,
    difficulty,
    language: String(submission?.language || ""),
    accepted,
    firstTry,
    solvedPointsAwarded,
    firstTryBonusAwarded,
    dailyBonusAwarded,
    wrongPenaltyApplied,
    scoreDelta,
  });

  const scoreState = await calculateUserScore(userId);

  return {
    submission: codeSubmission,
    score: scoreState.score,
    level: scoreState.level,
    scoreStats: scoreState.scoreStats,
    scoreDelta,
  };
}

import CodeSubmission from "../models/CodeSubmission.js";
import User from "../models/User.js";

function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    profileImage: user.profileImage,
    score: Number(user.score || 0),
    level: user.level,
    scoreStats: user.scoreStats,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function attachSharedRanks(users) {
  let previousScore = null;
  let currentRank = 0;

  return users.map((user, index) => {
    const score = Number(user.score || 0);

    // Users with identical total scores share the same rank. Inside a tied
    // score group, name/createdAt keeps the list stable without changing rank.
    if (previousScore === null || score < previousScore) {
      currentRank = index + 1;
      previousScore = score;
    }

    return {
      ...toPublicUser(user),
      rank: currentRank,
    };
  });
}

export async function getLeaderboard(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
    const users = await User.find({})
      .select("name profileImage score level scoreStats createdAt updatedAt")
      .sort({ score: -1, name: 1, createdAt: 1 })
      .limit(limit);

    res.status(200).json({ users: attachSharedRanks(users) });
  } catch (error) {
    console.error("Error in getLeaderboard Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getMyScoreSummary(req, res) {
  try {
    const user = await User.findById(req.user._id).select(
      "name profileImage score level scoreStats createdAt updatedAt",
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    const score = Number(user.score || 0);
    const higherScoreCount = await User.countDocuments({ score: { $gt: score } });

    res.status(200).json({
      user: {
        ...toPublicUser(user),
        rank: higherScoreCount + 1,
      },
    });
  } catch (error) {
    console.error("Error in getMyScoreSummary Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getMySolvedProblems(req, res) {
  try {
    const submissions = await CodeSubmission.find({
      userId: req.user._id,
      accepted: true,
    }).sort({ createdAt: 1 });

    const solvedByProblem = new Map();

    for (const submission of submissions) {
      if (solvedByProblem.has(submission.problemId)) continue;

      solvedByProblem.set(submission.problemId, {
        problemId: submission.problemId,
        title: submission.problemTitle,
        difficulty: submission.difficulty,
        pointsEarned: Math.max(0, Number(submission.scoreDelta || 0)),
        solvedPointsAwarded: Number(submission.solvedPointsAwarded || 0),
        firstTryBonusAwarded: Number(submission.firstTryBonusAwarded || 0),
        dailyBonusAwarded: Number(submission.dailyBonusAwarded || 0),
        solvedAt: submission.createdAt,
      });
    }

    const solvedProblems = Array.from(solvedByProblem.values()).sort(
      (a, b) => new Date(b.solvedAt) - new Date(a.solvedAt),
    );

    res.status(200).json({ solvedProblems });
  } catch (error) {
    console.error("Error in getMySolvedProblems Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

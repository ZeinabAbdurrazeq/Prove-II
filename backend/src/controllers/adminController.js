import User from "../models/User.js";
import Session from "../models/Session.js";
import AIInterviewSession from "../models/AIInterviewSession.js";
import Subscription from "../models/Subscription.js";
import Invitation from "../models/Invitation.js";
import CandidateProfile from "../models/CandidateProfile.js";
import InterviewQuestions from "../models/InterviewQuestions.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_USER_ROLES = ["user", "admin"];
const SESSION_STATUSES = ["active", "completed"];
const INTERVIEW_STATUSES = ["in-progress", "completed"];
const PLAN_ORDER = ["free", "pro", "premium"];

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const roundToOne = (value = 0) => Math.round(Number(value || 0) * 10) / 10;

const buildLastNDays = (days) => {
  const today = new Date();
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return Array.from({ length: days }, (_, index) => {
    const offset = days - 1 - index;
    const date = new Date(utcToday);
    date.setUTCDate(utcToday.getUTCDate() - offset);
    return date.toISOString().slice(0, 10);
  });
};

const getDayWindowStart = (days) => {
  const today = new Date();
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const start = new Date(utcToday);
  start.setUTCDate(utcToday.getUTCDate() - (days - 1));
  return start;
};

const normalizeQueryNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildPagedResponse = ({ items, total, page, limit, key }) => ({
  [key]: items,
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const inferCategory = (questionText = "", topic = "") => {
  const haystack = `${topic} ${questionText}`.toLowerCase();

  const rules = [
    { category: "javascript", keywords: ["javascript", "typescript", "js", "closure", "promise", "event loop", "async"] },
    { category: "react", keywords: ["react", "jsx", "hooks", "component", "state", "props", "context", "redux"] },
    { category: "nodejs", keywords: ["node", "express", "api", "server", "middleware", "rest", "graphql"] },
    { category: "database", keywords: ["sql", "database", "mongodb", "mongoose", "index", "transaction", "schema"] },
    { category: "algorithms", keywords: ["algorithm", "binary", "search", "sorting", "dynamic programming", "complexity"] },
    { category: "system design", keywords: ["system design", "architecture", "scalable", "distributed", "load balancer", "cache"] },
    { category: "css", keywords: ["css", "html", "layout", "flex", "grid", "responsive", "style"] },
    { category: "testing", keywords: ["test", "testing", "jest", "unit", "integration", "e2e", "cypress"] },
    { category: "communication", keywords: ["behavioral", "communication", "leadership", "team", "conflict", "ownership"] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return topic?.trim() || "general";
};

export const adminLogin = async (req, res) => {
  try {
    const admin = req.user;

    if (!admin) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    return res.status(200).json({
      admin: {
        email: admin.email,
        role: admin.role || "admin",
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to verify admin access" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSessions, totalInterviews, completedInterviewStats, activeSubscriptions, pendingInvitations, subscriptionBreakdown] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      AIInterviewSession.countDocuments(),
      AIInterviewSession.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$overallScore" },
            completedCount: { $sum: 1 },
          },
        },
      ]),
      Subscription.countDocuments({ status: "active", plan: { $in: ["pro", "premium"] } }),
      Invitation.countDocuments({ status: "pending" }),
      Subscription.aggregate([
        { $group: { _id: "$plan", count: { $sum: 1 } } },
      ]),
    ]);

    const distributionMap = PLAN_ORDER.reduce((acc, plan) => {
      acc[plan] = { plan, count: 0, percentage: 0 };
      return acc;
    }, {});

    for (const item of subscriptionBreakdown) {
      const plan = item._id || "free";
      if (!distributionMap[plan]) {
        distributionMap[plan] = { plan, count: 0, percentage: 0 };
      }
      distributionMap[plan].count = item.count;
    }

    const totalSubscriptions = Object.values(distributionMap).reduce((sum, item) => sum + item.count, 0);

    for (const plan of Object.values(distributionMap)) {
      plan.percentage = totalSubscriptions ? roundToOne((plan.count / totalSubscriptions) * 100) : 0;
    }

    const averageAiScore = roundToOne(completedInterviewStats[0]?.averageScore || 0);

    return res.status(200).json({
      totalUsers,
      totalSessions,
      totalInterviews,
      averageAiScore,
      activeSubscriptions,
      pendingInvitations,
      subscriptionDistribution: PLAN_ORDER.map((plan) => distributionMap[plan]),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load dashboard stats" });
  }
};

export const getSessionsOverTime = async (req, res) => {
  try {
    const labels = buildLastNDays(30);
    const startDate = getDayWindowStart(30);

    const results = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const counts = new Map(results.map((item) => [item._id, item.count]));

    return res.status(200).json({
      labels,
      series: labels.map((date) => ({ date, count: counts.get(date) || 0 })),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load session chart data" });
  }
};

export const getInterviewsPerDay = async (req, res) => {
  try {
    const labels = buildLastNDays(30);
    const startDate = getDayWindowStart(30);

    const results = await AIInterviewSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const counts = new Map(results.map((item) => [item._id, item.count]));

    return res.status(200).json({
      labels,
      series: labels.map((date) => ({ date, count: counts.get(date) || 0 })),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load interview chart data" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 10), 100);
    const search = String(req.query.search || "").trim();

    const query = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name email profileImage clerkId role createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const normalizedUsers = users.map((user) => ({
      ...user,
      role: user.role || "user",
    }));

    return res.status(200).json({
      ...buildPagedResponse({ items: normalizedUsers, total, page, limit, key: "users" }),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body || {};

    if (!ALLOWED_USER_ROLES.includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true },
    ).select("name email profileImage clerkId role createdAt");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to update user role" });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 10), 100);
    const status = String(req.query.status || "").trim();

    const filter = status && SESSION_STATUSES.includes(status) ? { status } : {};

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate({ path: "host", select: "name email profileImage role clerkId" })
        .populate({ path: "participant", select: "name email profileImage role clerkId" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Session.countDocuments(filter),
    ]);

    return res.status(200).json({
      ...buildPagedResponse({ items: sessions, total, page, limit, key: "sessions" }),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load sessions" });
  }
};

export const getAllAiInterviews = async (req, res) => {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 10), 100);
    const status = String(req.query.status || "").trim();

    const filter = status && INTERVIEW_STATUSES.includes(status) ? { status } : {};

    const [interviews, total] = await Promise.all([
      AIInterviewSession.find(filter)
        .populate({ path: "userId", select: "name email profileImage role clerkId" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AIInterviewSession.countDocuments(filter),
    ]);

    return res.status(200).json({
      ...buildPagedResponse({ items: interviews, total, page, limit, key: "interviews" }),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load AI interviews" });
  }
};

export const getTopCandidates = async (req, res) => {
  try {
    const candidates = await CandidateProfile.find()
      .populate({ path: "userId", select: "name email profileImage role clerkId" })
      .sort({ overallAverageScore: -1, totalInterviewsCompleted: -1, createdAt: 1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      candidates,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load top candidates" });
  }
};

export const getProblemsStats = async (req, res) => {
  try {
    const [questionDocs, interviewDocs] = await Promise.all([
      InterviewQuestions.find({}, "category questionText").lean(),
      AIInterviewSession.find({}, "questions").lean(),
    ]);

    const categoryMap = new Map(
      questionDocs.map((question) => [String(question._id), question.category]),
    );
    const statsMap = new Map();

    const ensureEntry = (category) => {
      const key = String(category || "general").trim().toLowerCase();
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          category: key,
          attempts: 0,
          totalScore: 0,
          averageScore: 0,
        });
      }
      return statsMap.get(key);
    };

    for (const interview of interviewDocs) {
      for (const question of interview.questions || []) {
        const inferredCategory =
          categoryMap.get(String(question.questionId || "")) ||
          question.topic ||
          inferCategory(question.questionText, question.topic);

        const entry = ensureEntry(inferredCategory);
        entry.attempts += 1;
        entry.totalScore += Number(question.score || 0);
      }
    }

    const categories = Array.from(statsMap.values()).map((item) => ({
      category: item.category,
      attempts: item.attempts,
      averageScore: item.attempts ? roundToOne(item.totalScore / item.attempts) : 0,
    }));

    categories.sort((a, b) => b.attempts - a.attempts || b.averageScore - a.averageScore);

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load problems statistics" });
  }
};




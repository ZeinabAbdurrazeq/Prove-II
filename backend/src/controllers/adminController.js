import User from "../models/User.js";
import Session from "../models/Session.js";
import AIInterviewSession from "../models/AIInterviewSession.js";
import Subscription from "../models/Subscription.js";
import Invitation from "../models/Invitation.js";
import CandidateProfile from "../models/CandidateProfile.js";
import InterviewQuestions from "../models/InterviewQuestions.js";
import CodeSubmission from "../models/CodeSubmission.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_USER_ROLES = ["user", "admin"];
const SESSION_STATUSES = ["active", "completed"];
const INTERVIEW_STATUSES = ["in-progress", "completed"];
const PLAN_ORDER = ["free", "singleInterview", "premium", "pro"];

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
      Subscription.countDocuments({
        status: "active",
        $or: [
          { plan: { $in: ["pro", "premium"] } },
          { aiInterviewCredits: { $gt: 0 } },
        ],
      }),
      Invitation.countDocuments({ status: "pending" }),
      Subscription.aggregate([
        {
          $group: {
            _id: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$plan", "free"] },
                    { $gt: ["$aiInterviewCredits", 0] },
                  ],
                },
                "singleInterview",
                "$plan",
              ],
            },
            count: { $sum: 1 },
          },
        },
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
        .select("name email profileImage clerkId role score level createdAt")
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

export const createAdminUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const role = ALLOWED_USER_ROLES.includes(req.body?.role) ? req.body.role : "user";
    const profileImage = String(req.body?.profileImage || "").trim();
    const score = Math.max(Number(req.body?.score || 0), 0);
    const level = String(req.body?.level || "Entry-Level").trim();
    const clerkId =
      String(req.body?.clerkId || "").trim() ||
      `manual-${email.replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    if (!name || !email) {
      return res.status(400).json({ msg: "Name and email are required" });
    }

    const user = await User.create({
      name,
      email,
      profileImage,
      clerkId,
      role,
      score,
      level,
    });

    return res.status(201).json({ user });
  } catch (error) {
    const duplicate = error?.code === 11000;
    return res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Email or Clerk ID already exists" : "Failed to create user",
    });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const payload = {};

    if (req.body?.name !== undefined) payload.name = String(req.body.name || "").trim();
    if (req.body?.email !== undefined) payload.email = String(req.body.email || "").trim().toLowerCase();
    if (req.body?.profileImage !== undefined) payload.profileImage = String(req.body.profileImage || "").trim();
    if (req.body?.role !== undefined && ALLOWED_USER_ROLES.includes(req.body.role)) payload.role = req.body.role;
    if (req.body?.score !== undefined) payload.score = Math.max(Number(req.body.score || 0), 0);
    if (req.body?.level !== undefined) payload.level = String(req.body.level || "Entry-Level").trim();
    if (req.body?.clerkId !== undefined) payload.clerkId = String(req.body.clerkId || "").trim();

    if (payload.name === "" || payload.email === "" || payload.clerkId === "") {
      return res.status(400).json({ msg: "Name, email, and Clerk ID cannot be empty" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, payload, {
      new: true,
      runValidators: true,
    }).select("name email profileImage clerkId role score level createdAt updatedAt");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    const duplicate = error?.code === 11000;
    return res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Email or Clerk ID already exists" : "Failed to update user",
    });
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

export const deleteAdminUser = async (req, res) => {
  try {
    if (String(req.user?._id) === String(req.params.userId)) {
      return res.status(400).json({ msg: "You cannot delete your own admin account" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to delete user" });
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

export const getAllSubmissions = async (req, res) => {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 10), 100);
    const status = String(req.query.status || "").trim();
    const difficulty = String(req.query.difficulty || "").trim();
    const search = String(req.query.search || "").trim();

    const filter = {};
    if (status === "accepted") filter.accepted = true;
    if (status === "rejected") filter.accepted = false;
    if (["easy", "medium", "hard"].includes(difficulty)) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { problemTitle: { $regex: escapeRegex(search), $options: "i" } },
        { problemId: { $regex: escapeRegex(search), $options: "i" } },
        { language: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    const [submissions, total] = await Promise.all([
      CodeSubmission.find(filter)
        .populate({ path: "userId", select: "name email profileImage role clerkId score level" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CodeSubmission.countDocuments(filter),
    ]);

    return res.status(200).json({
      ...buildPagedResponse({ items: submissions, total, page, limit, key: "submissions" }),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to load submissions" });
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

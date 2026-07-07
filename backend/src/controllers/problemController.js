import Problem from "../models/Problem.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeQueryNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function getProblems(req, res) {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 100), 100);
    const search = String(req.query.search || "").trim();
    const difficulty = String(req.query.difficulty || "").trim();

    const query = { active: true };

    if (search) {
      query.$or = [
        { id: { $regex: escapeRegex(search), $options: "i" } },
        { title: { $regex: escapeRegex(search), $options: "i" } },
        { category: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    if (["Easy", "Medium", "Hard"].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .sort({ difficulty: 1, createdAt: 1, title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Problem.countDocuments(query),
    ]);

    res.status(200).json({
      problems,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Error in getProblems Controller:", error.message);
    res.status(500).json({ msg: "Failed to load problems" });
  }
}

export async function getProblemById(req, res) {
  try {
    const problem = await Problem.findOne({
      id: String(req.params.id || "").trim().toLowerCase(),
      active: true,
    }).lean();

    if (!problem) return res.status(404).json({ msg: "Problem not found" });

    res.status(200).json({ problem });
  } catch (error) {
    console.error("Error in getProblemById Controller:", error.message);
    res.status(500).json({ msg: "Failed to load problem" });
  }
}

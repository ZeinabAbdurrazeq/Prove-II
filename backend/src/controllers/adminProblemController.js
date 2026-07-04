import Problem from "../models/Problem.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeQueryNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeProblemId = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeExamples = (value) =>
  Array.isArray(value)
    ? value.map((example) => ({
        input: String(example?.input || "").trim(),
        output: String(example?.output || "").trim(),
        explanation: String(example?.explanation || "").trim(),
      }))
    : [];

const normalizePayload = (body = {}) => {
  const title = String(body.title || "").trim();
  const id = normalizeProblemId(body.id || title);
  const difficulty = ["Easy", "Medium", "Hard"].includes(body.difficulty)
    ? body.difficulty
    : "Easy";

  return {
    id,
    title,
    difficulty,
    category: String(body.category || "General").trim(),
    description: {
      text: String(body.description?.text || body.descriptionText || "").trim(),
      notes: normalizeList(body.description?.notes || body.notes),
    },
    examples: normalizeExamples(body.examples),
    constraints: normalizeList(body.constraints),
    starterCode: {
      javascript: String(body.starterCode?.javascript || "").trimEnd(),
      python: String(body.starterCode?.python || "").trimEnd(),
      java: String(body.starterCode?.java || "").trimEnd(),
    },
    expectedOutput: {
      javascript: String(body.expectedOutput?.javascript || "").trimEnd(),
      python: String(body.expectedOutput?.python || "").trimEnd(),
      java: String(body.expectedOutput?.java || "").trimEnd(),
    },
    active: body.active !== false,
  };
};

export async function getAdminProblems(req, res) {
  try {
    const page = normalizeQueryNumber(req.query.page, 1);
    const limit = Math.min(normalizeQueryNumber(req.query.limit, 10), 100);
    const search = String(req.query.search || "").trim();
    const difficulty = String(req.query.difficulty || "").trim();

    const query = {};

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
        .sort({ createdAt: -1 })
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
    res.status(500).json({ msg: "Failed to load problems" });
  }
}

export async function createAdminProblem(req, res) {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.title || !payload.id) {
      return res.status(400).json({ msg: "Title and problem id are required" });
    }

    const problem = await Problem.create(payload);
    res.status(201).json({ problem });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Problem id already exists" : "Failed to create problem",
    });
  }
}

export async function updateAdminProblem(req, res) {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.title || !payload.id) {
      return res.status(400).json({ msg: "Title and problem id are required" });
    }

    const problem = await Problem.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!problem) return res.status(404).json({ msg: "Problem not found" });

    res.status(200).json({ problem });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Problem id already exists" : "Failed to update problem",
    });
  }
}

export async function deleteAdminProblem(req, res) {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ msg: "Problem not found" });
    res.status(200).json({ msg: "Problem deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete problem" });
  }
}

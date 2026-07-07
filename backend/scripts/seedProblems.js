import mongoose from "mongoose";
import "../src/lib/env.js";
import { ENV } from "../src/lib/env.js";
import Problem from "../src/models/Problem.js";
import { PROBLEMS } from "../../frontend/src/data/problems.js";

const problems = Object.values(PROBLEMS).map((problem) => ({
  id: problem.id,
  title: problem.title,
  difficulty: problem.difficulty,
  category: problem.category || "General",
  description: {
    text: problem.description?.text || "",
    notes: problem.description?.notes || [],
  },
  examples: problem.examples || [],
  constraints: problem.constraints || [],
  starterCode: {
    javascript: problem.starterCode?.javascript || "",
    python: problem.starterCode?.python || "",
    java: problem.starterCode?.java || "",
  },
  expectedOutput: {
    javascript: problem.expectedOutput?.javascript || "",
    python: problem.expectedOutput?.python || "",
    java: problem.expectedOutput?.java || "",
  },
  active: problem.active !== false,
}));

async function seedProblems() {
  if (!ENV.DB_URL) {
    throw new Error("DB_URL is required to seed problems");
  }

  await mongoose.connect(ENV.DB_URL);

  const operations = problems.map((problem) => ({
    updateOne: {
      filter: { id: problem.id },
      update: { $set: problem },
      upsert: true,
    },
  }));

  const result = operations.length
    ? await Problem.bulkWrite(operations)
    : { upsertedCount: 0, modifiedCount: 0, matchedCount: 0 };

  console.log(
    `Seeded ${problems.length} problems. Upserted: ${result.upsertedCount || 0}, modified: ${result.modifiedCount || 0}, matched: ${result.matchedCount || 0}`,
  );

  await mongoose.disconnect();
}

seedProblems().catch(async (error) => {
  console.error("Failed to seed problems:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

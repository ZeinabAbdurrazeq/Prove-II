import mongoose from "mongoose";

const localizedListSchema = {
  type: [String],
  default: [],
};

const problemExampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const problemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      text: { type: String, default: "" },
      notes: localizedListSchema,
    },
    examples: {
      type: [problemExampleSchema],
      default: [],
    },
    constraints: localizedListSchema,
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    expectedOutput: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

problemSchema.index({ id: 1 }, { unique: true });
problemSchema.index({ title: "text", category: "text", id: "text" });

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;

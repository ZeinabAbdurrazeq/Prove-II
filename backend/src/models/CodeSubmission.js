import mongoose from "mongoose";

const codeSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: String,
      required: true,
      trim: true,
    },
    problemTitle: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    accepted: {
      type: Boolean,
      required: true,
    },
    firstTry: {
      type: Boolean,
      default: false,
    },
    solvedPointsAwarded: {
      type: Number,
      default: 0,
    },
    firstTryBonusAwarded: {
      type: Number,
      default: 0,
    },
    dailyBonusAwarded: {
      type: Number,
      default: 0,
    },
    wrongPenaltyApplied: {
      type: Number,
      default: 0,
    },
    scoreDelta: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

codeSubmissionSchema.index({ userId: 1, problemId: 1, createdAt: 1 });
codeSubmissionSchema.index({ userId: 1, accepted: 1 });

const CodeSubmission = mongoose.model("CodeSubmission", codeSubmissionSchema);

export default CodeSubmission;

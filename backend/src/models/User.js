import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: String,
      enum: ["Entry-Level", "Junior", "Intermediate", "Advanced"],
      default: "Entry-Level",
    },
    scoreStats: {
      easySolved: { type: Number, default: 0, min: 0 },
      mediumSolved: { type: Number, default: 0, min: 0 },
      hardSolved: { type: Number, default: 0, min: 0 },
      totalSolved: { type: Number, default: 0, min: 0 },
      successRate: { type: Number, default: 0, min: 0, max: 100 },
      lastActivityBonusDate: { type: String, default: "" },
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

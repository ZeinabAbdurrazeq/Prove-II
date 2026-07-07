import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "", trim: true },
    ar: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const blogSectionSchema = new mongoose.Schema(
  {
    heading: localizedTextSchema,
    body: localizedTextSchema,
  },
  { _id: false },
);

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "celebrate", "insightful"],
      required: true,
    },
  },
  { _id: false, timestamps: true },
);

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

const moderationHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["submitted", "edited", "approved", "rejected"],
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const blogPostSchema = new mongoose.Schema(
  {
    postType: {
      type: String,
      enum: ["article", "community"],
      default: "article",
      index: true,
    },
    title: localizedTextSchema,
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: localizedTextSchema,
    category: localizedTextSchema,
    readTime: localizedTextSchema,
    author: localizedTextSchema,
    content: {
      type: [blogSectionSchema],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    communityContent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    moderationHistory: {
      type: [moderationHistorySchema],
      default: [],
    },
  },
  { timestamps: true },
);

blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ postType: 1, status: 1, createdAt: -1 });
blogPostSchema.index({ slug: 1 }, { unique: true });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;

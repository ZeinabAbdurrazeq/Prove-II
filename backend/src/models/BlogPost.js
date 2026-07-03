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

const blogPostSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ slug: 1 }, { unique: true });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;

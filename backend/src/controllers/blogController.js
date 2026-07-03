import BlogPost from "../models/BlogPost.js";
import { ensureBlogSeed } from "../lib/blogSeed.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toLocalized(value, fallback = "") {
  if (typeof value === "object" && value !== null) {
    return {
      en: String(value.en || fallback || "").trim(),
      ar: String(value.ar || "").trim(),
    };
  }

  return { en: String(value || fallback || "").trim(), ar: "" };
}

function normalizePayload(body = {}) {
  const title = toLocalized(body.title);
  const slug = normalizeSlug(body.slug || title.en);
  const published = Boolean(body.published);

  return {
    title,
    slug,
    excerpt: toLocalized(body.excerpt),
    category: toLocalized(body.category, "General"),
    readTime: toLocalized(body.readTime),
    author: toLocalized(body.author, "ProveIt Team"),
    content: Array.isArray(body.content)
      ? body.content.map((section) => ({
          heading: toLocalized(section.heading),
          body: toLocalized(section.body),
        }))
      : [],
    published,
    publishedAt: published ? body.publishedAt || new Date() : null,
  };
}

function localizePost(post, language = "en") {
  const lang = String(language).toLowerCase().startsWith("ar") ? "ar" : "en";
  const pick = (field) => field?.[lang] || field?.en || field?.ar || "";

  return {
    _id: post._id,
    slug: post.slug,
    title: pick(post.title),
    excerpt: pick(post.excerpt),
    category: pick(post.category),
    readTime: pick(post.readTime),
    author: pick(post.author),
    date: post.publishedAt || post.createdAt,
    published: post.published,
    content: (post.content || []).map((section) => ({
      heading: pick(section.heading),
      body: pick(section.body),
    })),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export async function getPublishedPosts(req, res) {
  try {
    await ensureBlogSeed();

    const posts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      posts: posts.map((post) => localizePost(post, req.query.lang)),
    });
  } catch (error) {
    console.error("Error in getPublishedPosts:", error.message);
    res.status(500).json({ msg: "Failed to load blog posts" });
  }
}

export async function getPublishedPostBySlug(req, res) {
  try {
    await ensureBlogSeed();

    const post = await BlogPost.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();

    if (!post) return res.status(404).json({ msg: "Blog post not found" });

    res.status(200).json({ post: localizePost(post, req.query.lang) });
  } catch (error) {
    console.error("Error in getPublishedPostBySlug:", error.message);
    res.status(500).json({ msg: "Failed to load blog post" });
  }
}

export async function getAdminBlogPosts(req, res) {
  try {
    await ensureBlogSeed();

    const search = String(req.query.search || "").trim();
    const query = search
      ? {
          $or: [
            { "title.en": { $regex: escapeRegex(search), $options: "i" } },
            { "title.ar": { $regex: escapeRegex(search), $options: "i" } },
            { slug: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error in getAdminBlogPosts:", error.message);
    res.status(500).json({ msg: "Failed to load blog posts" });
  }
}

export async function createAdminBlogPost(req, res) {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.title.en || !payload.slug) {
      return res.status(400).json({ msg: "Title and slug are required" });
    }

    const post = await BlogPost.create(payload);
    res.status(201).json({ post });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Slug already exists" : "Failed to create blog post",
    });
  }
}

export async function updateAdminBlogPost(req, res) {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.title.en || !payload.slug) {
      return res.status(400).json({ msg: "Title and slug are required" });
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!post) return res.status(404).json({ msg: "Blog post not found" });

    res.status(200).json({ post });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : 500).json({
      msg: duplicate ? "Slug already exists" : "Failed to update blog post",
    });
  }
}

export async function deleteAdminBlogPost(req, res) {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ msg: "Blog post not found" });
    res.status(200).json({ msg: "Blog post deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete blog post" });
  }
}

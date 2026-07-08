import BlogPost from "../models/BlogPost.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import { ensureBlogSeed } from "../lib/blogSeed.js";
import { translatePost } from "../services/translationService.js";

const COMMUNITY_STATUSES = ["pending", "approved", "rejected"];
const REACTION_TYPES = ["like", "support", "love", "celebrate", "haha", "angry"];
const MAX_IMAGE_URL_LENGTH = 1000;

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
    postType: "article",
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
    status: published ? "approved" : "pending",
  };
}

function localizeArticle(post, language = "en") {
  const lang = String(language).toLowerCase().startsWith("ar") ? "ar" : "en";
  const pick = (field) => field?.[lang] || field?.en || field?.ar || "";

  return {
    _id: post._id,
    postType: "article",
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

function reactionCounts(reactions = []) {
  return REACTION_TYPES.reduce((counts, type) => {
    counts[type] = reactions.filter((reaction) => reaction.type === type).length;
    return counts;
  }, {});
}

function commentReactionCounts(reactions = []) {
  return REACTION_TYPES.reduce((counts, type) => {
    counts[type] = reactions.filter((r) => r.type === type).length;
    return counts;
  }, {});
}

function publicUser(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name || "ProveIt member",
    profileImage: user.profileImage || "",
    level: user.level || "",
  };
}

function formatComment(comment, currentUserId = null, replies = []) {
  const currentId = currentUserId ? String(currentUserId) : "";
  const authorId = comment.userId?._id || comment.userId;
  const myReaction = (comment.reactions || []).find(
    (r) => String(r.userId) === currentId,
  );

  return {
    _id: comment._id,
    content: comment.content,
    author: publicUser(comment.userId),
    parentCommentId: comment.parentCommentId || null,
    canManage: Boolean(currentId && String(authorId) === currentId),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    reactionCounts: commentReactionCounts(comment.reactions || []),
    myReaction: myReaction?.type || null,
    replies: replies.map((reply) => formatComment(reply, currentUserId, [])),
  };
}

function formatCommunityPost(post, currentUserId = null, includePrivate = false) {
  const currentId = currentUserId ? String(currentUserId) : "";
  const userReaction = (post.reactions || []).find(
    (reaction) => String(reaction.userId?._id || reaction.userId) === currentId,
  );
  const isOwner = currentId && String(post.authorId?._id || post.authorId) === currentId;

  // Separate top-level comments from replies
  const allComments = post.comments || [];
  const topLevel = allComments.filter((c) => !c.parentCommentId);
  const repliesMap = {};
  allComments.forEach((c) => {
    if (c.parentCommentId) {
      const key = String(c.parentCommentId);
      if (!repliesMap[key]) repliesMap[key] = [];
      repliesMap[key].push(c);
    }
  });

  return {
    _id: post._id,
    postType: "community",
    title: post.title?.en || "",
    slug: post.slug,
    content: post.communityContent || "",
    imageUrl: post.imageUrl || "",
    status: post.status,
    author: publicUser(post.authorId),
    date: post.approvedAt || post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    approvedAt: post.approvedAt,
    rejectedAt: post.rejectedAt,
    rejectionReason: includePrivate || isOwner ? post.rejectionReason || "" : "",
    canEdit: Boolean(isOwner && ["pending", "approved", "rejected"].includes(post.status)),
    canDelete: Boolean(isOwner && post.status !== "approved"),
    reactionCounts: reactionCounts(post.reactions),
    myReaction: userReaction?.type || null,
    comments: topLevel.map((c) =>
      formatComment(c, currentUserId, repliesMap[String(c._id)] || []),
    ),
    moderationHistory: includePrivate ? post.moderationHistory || [] : undefined,
    // Translation
    originalLanguage: post.originalLanguage || "",
    translatedContent: post.translatedContent || "",
    translatedLanguage: post.translatedLanguage || "",
    translationStatus: post.translationStatus || "",
  };
}

function normalizeCommunityBody(body = {}) {
  const content = String(body.content || "").trim();
  const title = String(body.title || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();

  if (!content) {
    return { error: "Post content is required" };
  }

  if (content.length > 4000) {
    return { error: "Post content is too long" };
  }

  if (title.length > 120) {
    return { error: "Post title is too long" };
  }

  if (imageUrl) {
    if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
      return { error: "Image URL is too long" };
    }

    try {
      const parsed = new URL(imageUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { error: "Image URL must start with http or https" };
      }
    } catch {
      return { error: "Image URL is invalid" };
    }
  }

  return { content, title, imageUrl };
}

function buildCommunitySlug(userId, content, title = "") {
  const base = normalizeSlug(title || content.slice(0, 54) || "community-post");
  return `${base || "community-post"}-${String(userId).slice(-6)}-${Date.now().toString(36)}`;
}

function isAdminUser(user) {
  if (!user) return false;
  const adminEmail = String(ENV.ADMIN_EMAIL || "").trim().toLowerCase();
  const userEmail = String(user.email || "").trim().toLowerCase();
  return user.role === "admin" || (adminEmail && userEmail === adminEmail);
}

async function notifyAdmins(senderId, postId) {
  const adminEmail = String(ENV.ADMIN_EMAIL || "").trim().toLowerCase();
  const admins = await User.find({
    $or: [
      { role: "admin" },
      ...(adminEmail ? [{ email: adminEmail }] : []),
    ],
  }).select("_id");

  if (!admins.length) return;

  await Notification.insertMany(
    admins.map((admin) => ({
      recipientId: admin._id,
      senderId,
      type: "community-post-pending",
      relatedBlogPostId: postId,
      message: "A new community post is waiting for review.",
    })),
    { ordered: false },
  );
}

async function notifyAuthor(recipientId, senderId, postId, approved) {
  await Notification.create({
    recipientId,
    senderId,
    type: approved ? "community-post-approved" : "community-post-rejected",
    relatedBlogPostId: postId,
    message: approved
      ? "Your post has been approved and is now visible to the community."
      : "Your post was not approved.",
  });
}

async function findCommunityPostForUser(id, userId) {
  return BlogPost.findOne({ _id: id, postType: "community", authorId: userId });
}

// ─── Public routes ────────────────────────────────────────────────────────────

export async function getPublishedPosts(req, res) {
  try {
    await ensureBlogSeed();

    const currentUserId = req.user?._id || null;
    const posts = await BlogPost.find({
      $or: [
        { postType: { $ne: "community" }, published: true },
        { postType: "community", status: "approved" },
      ],
    })
      .populate("authorId", "name profileImage level")
      .populate("comments.userId", "name profileImage level")
      .sort({ approvedAt: -1, publishedAt: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      posts: posts.map((post) =>
        post.postType === "community"
          ? formatCommunityPost(post, currentUserId)
          : localizeArticle(post, req.query.lang),
      ),
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
      $or: [
        { postType: { $ne: "community" }, published: true },
        { postType: "community", status: "approved" },
      ],
    })
      .populate("authorId", "name profileImage level")
      .populate("comments.userId", "name profileImage level")
      .lean();

    if (!post) return res.status(404).json({ msg: "Blog post not found" });

    res.status(200).json({
      post:
        post.postType === "community"
          ? formatCommunityPost(post, req.user?._id || null)
          : localizeArticle(post, req.query.lang),
    });
  } catch (error) {
    console.error("Error in getPublishedPostBySlug:", error.message);
    res.status(500).json({ msg: "Failed to load blog post" });
  }
}

export async function getMyCommunityPosts(req, res) {
  try {
    const posts = await BlogPost.find({
      postType: "community",
      authorId: req.user._id,
    })
      .populate("authorId", "name profileImage level")
      .populate("comments.userId", "name profileImage level")
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts: posts.map((post) => formatCommunityPost(post, req.user._id, true)),
    });
  } catch (error) {
    console.error("Error in getMyCommunityPosts:", error.message);
    res.status(500).json({ msg: "Failed to load your posts" });
  }
}

export async function createCommunityPost(req, res) {
  try {
    const payload = normalizeCommunityBody(req.body);
    if (payload.error) return res.status(400).json({ msg: payload.error });

    const adminPost = isAdminUser(req.user);
    const now = new Date();

    const post = await BlogPost.create({
      postType: "community",
      title: toLocalized(payload.title),
      slug: buildCommunitySlug(req.user._id, payload.content, payload.title),
      excerpt: toLocalized(payload.content.slice(0, 160)),
      category: toLocalized("Community"),
      readTime: toLocalized("Community post"),
      author: toLocalized(req.user.name),
      content: [],
      published: adminPost,
      publishedAt: adminPost ? now : null,
      authorId: req.user._id,
      communityContent: payload.content,
      imageUrl: payload.imageUrl,
      status: adminPost ? "approved" : "pending",
      approvedBy: adminPost ? req.user._id : null,
      approvedAt: adminPost ? now : null,
      moderationHistory: [
        {
          action: adminPost ? "approved" : "submitted",
          by: req.user._id,
          note: adminPost ? "Auto-approved (admin)" : "Submitted for review",
        },
      ],
    });

    // Notify admins only for non-admin posts
    if (!adminPost) {
      await notifyAdmins(req.user._id, post._id);
    }

    // Trigger translation asynchronously — do NOT await
    translatePost(post._id, payload.content).catch(() => {});

    const populated = await BlogPost.findById(post._id)
      .populate("authorId", "name profileImage level")
      .populate("comments.userId", "name profileImage level");

    res.status(201).json({ post: formatCommunityPost(populated, req.user._id, true) });
  } catch (error) {
    console.error("Error in createCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to create post" });
  }
}

export async function updateMyCommunityPost(req, res) {
  try {
    const payload = normalizeCommunityBody(req.body);
    if (payload.error) return res.status(400).json({ msg: payload.error });

    const post = await findCommunityPostForUser(req.params.id, req.user._id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const adminPost = isAdminUser(req.user);
    const now = new Date();

    post.title = toLocalized(payload.title);
    post.excerpt = toLocalized(payload.content.slice(0, 160));
    post.communityContent = payload.content;
    post.imageUrl = payload.imageUrl;

    if (adminPost) {
      post.published = true;
      post.publishedAt = now;
      post.status = "approved";
      post.approvedBy = req.user._id;
      post.approvedAt = now;
    } else {
      post.published = false;
      post.publishedAt = null;
      post.status = "pending";
      post.rejectedBy = null;
      post.rejectedAt = null;
      post.rejectionReason = "";
    }

    post.moderationHistory.push({
      action: adminPost ? "approved" : "edited",
      by: req.user._id,
      note: adminPost ? "Edited and auto-approved (admin)" : "Edited by author and returned to pending review",
    });

    // Reset translation when content changes
    post.translationStatus = "pending";
    post.translatedContent = "";

    await post.save();

    if (!adminPost) {
      await notifyAdmins(req.user._id, post._id);
    }

    // Re-translate asynchronously
    translatePost(post._id, payload.content).catch(() => {});

    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");
    res.status(200).json({ post: formatCommunityPost(post, req.user._id, true) });
  } catch (error) {
    console.error("Error in updateMyCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to update post" });
  }
}

export async function deleteMyCommunityPost(req, res) {
  try {
    const post = await findCommunityPostForUser(req.params.id, req.user._id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.status === "approved" && !isAdminUser(req.user)) {
      return res.status(400).json({ msg: "Approved posts cannot be deleted by the author" });
    }

    await post.deleteOne();
    res.status(200).json({ msg: "Post deleted" });
  } catch (error) {
    console.error("Error in deleteMyCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to delete post" });
  }
}

export async function reactToCommunityPost(req, res) {
  try {
    const type = String(req.body?.type || "").trim().toLowerCase();
    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ msg: "Invalid reaction type" });
    }

    const post = await BlogPost.findOne({
      _id: req.params.id,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    const existingIndex = post.reactions.findIndex(
      (reaction) => String(reaction.userId) === String(req.user._id),
    );

    if (existingIndex >= 0) {
      if (post.reactions[existingIndex].type === type) {
        post.reactions.splice(existingIndex, 1);
      } else {
        post.reactions[existingIndex].type = type;
      }
    } else {
      post.reactions.push({ userId: req.user._id, type });
    }

    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in reactToCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to update reaction" });
  }
}

export async function addCommunityComment(req, res) {
  try {
    const content = String(req.body?.content || "").trim();
    if (!content) return res.status(400).json({ msg: "Comment is required" });
    if (content.length > 1000) return res.status(400).json({ msg: "Comment is too long" });

    const post = await BlogPost.findOne({
      _id: req.params.id,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    post.comments.push({ userId: req.user._id, content, parentCommentId: null });
    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(201).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in addCommunityComment:", error.message);
    res.status(500).json({ msg: "Failed to add comment" });
  }
}

export async function addCommentReply(req, res) {
  try {
    const content = String(req.body?.content || "").trim();
    if (!content) return res.status(400).json({ msg: "Reply content is required" });
    if (content.length > 1000) return res.status(400).json({ msg: "Reply is too long" });

    const post = await BlogPost.findOne({
      _id: req.params.id,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    const parentComment = post.comments.id(req.params.commentId);
    if (!parentComment) return res.status(404).json({ msg: "Parent comment not found" });

    // Enforce one-level nesting: only reply to top-level comments
    if (parentComment.parentCommentId) {
      return res.status(400).json({ msg: "Cannot reply to a reply" });
    }

    post.comments.push({
      userId: req.user._id,
      content,
      parentCommentId: parentComment._id,
    });

    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(201).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in addCommentReply:", error.message);
    res.status(500).json({ msg: "Failed to add reply" });
  }
}

export async function reactToComment(req, res) {
  try {
    const type = String(req.body?.type || "").trim().toLowerCase();
    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ msg: "Invalid reaction type" });
    }

    const post = await BlogPost.findOne({
      _id: req.params.postId,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const existingIndex = (comment.reactions || []).findIndex(
      (r) => String(r.userId) === String(req.user._id),
    );

    if (existingIndex >= 0) {
      if (comment.reactions[existingIndex].type === type) {
        comment.reactions.splice(existingIndex, 1);
      } else {
        comment.reactions[existingIndex].type = type;
      }
    } else {
      comment.reactions.push({ userId: req.user._id, type });
    }

    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in reactToComment:", error.message);
    res.status(500).json({ msg: "Failed to update comment reaction" });
  }
}

export async function updateCommunityComment(req, res) {
  try {
    const content = String(req.body?.content || "").trim();
    if (!content) return res.status(400).json({ msg: "Comment is required" });
    if (content.length > 1000) return res.status(400).json({ msg: "Comment is too long" });

    const post = await BlogPost.findOne({
      _id: req.params.postId,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (String(comment.userId) !== String(req.user._id)) {
      return res.status(403).json({ msg: "You can only edit your own comments" });
    }

    comment.content = content;
    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in updateCommunityComment:", error.message);
    res.status(500).json({ msg: "Failed to update comment" });
  }
}

export async function deleteCommunityComment(req, res) {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.postId,
      postType: "community",
      status: "approved",
    });

    if (!post) return res.status(404).json({ msg: "Approved post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (String(comment.userId) !== String(req.user._id)) {
      return res.status(403).json({ msg: "You can only delete your own comments" });
    }

    comment.deleteOne();
    await post.save();
    await post.populate("authorId", "name profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id) });
  } catch (error) {
    console.error("Error in deleteCommunityComment:", error.message);
    res.status(500).json({ msg: "Failed to delete comment" });
  }
}

// ─── Admin routes ─────────────────────────────────────────────────────────────

export async function getAdminBlogPosts(req, res) {
  try {
    await ensureBlogSeed();

    const search = String(req.query.search || "").trim();
    const query = {
      postType: { $ne: "community" },
      ...(search
        ? {
            $or: [
              { "title.en": { $regex: escapeRegex(search), $options: "i" } },
              { "title.ar": { $regex: escapeRegex(search), $options: "i" } },
              { slug: { $regex: escapeRegex(search), $options: "i" } },
            ],
          }
        : {}),
    };

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

    const post = await BlogPost.findOneAndUpdate(
      { _id: req.params.id, postType: { $ne: "community" } },
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

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
    const post = await BlogPost.findOneAndDelete({
      _id: req.params.id,
      postType: { $ne: "community" },
    });
    if (!post) return res.status(404).json({ msg: "Blog post not found" });
    res.status(200).json({ msg: "Blog post deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete blog post" });
  }
}

export async function getAdminCommunityPosts(req, res) {
  try {
    const status = String(req.query.status || "pending").toLowerCase();
    const queryStatus = COMMUNITY_STATUSES.includes(status) ? status : "pending";

    const posts = await BlogPost.find({
      postType: "community",
      status: queryStatus,
    })
      .populate("authorId", "name email profileImage level")
      .populate("comments.userId", "name profileImage level")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts: posts.map((post) => formatCommunityPost(post, req.user._id, true)),
    });
  } catch (error) {
    console.error("Error in getAdminCommunityPosts:", error.message);
    res.status(500).json({ msg: "Failed to load community posts" });
  }
}

export async function approveCommunityPost(req, res) {
  try {
    const post = await BlogPost.findOne({ _id: req.params.id, postType: "community" });
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.status = "approved";
    post.published = true;
    post.publishedAt = new Date();
    post.approvedBy = req.user._id;
    post.approvedAt = new Date();
    post.rejectedBy = null;
    post.rejectedAt = null;
    post.rejectionReason = "";
    post.moderationHistory.push({
      action: "approved",
      by: req.user._id,
      note: "Approved by admin",
    });

    await post.save();
    await notifyAuthor(post.authorId, req.user._id, post._id, true);
    await post.populate("authorId", "name email profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id, true) });
  } catch (error) {
    console.error("Error in approveCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to approve post" });
  }
}

export async function rejectCommunityPost(req, res) {
  try {
    const post = await BlogPost.findOne({ _id: req.params.id, postType: "community" });
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const reason = String(req.body?.reason || "").trim();
    post.status = "rejected";
    post.published = false;
    post.publishedAt = null;
    post.approvedBy = null;
    post.approvedAt = null;
    post.rejectedBy = req.user._id;
    post.rejectedAt = new Date();
    post.rejectionReason = reason;
    post.moderationHistory.push({
      action: "rejected",
      by: req.user._id,
      note: reason || "Rejected by admin",
    });

    await post.save();
    await notifyAuthor(post.authorId, req.user._id, post._id, false);
    await post.populate("authorId", "name email profileImage level");
    await post.populate("comments.userId", "name profileImage level");

    res.status(200).json({ post: formatCommunityPost(post, req.user._id, true) });
  } catch (error) {
    console.error("Error in rejectCommunityPost:", error.message);
    res.status(500).json({ msg: "Failed to reject post" });
  }
}

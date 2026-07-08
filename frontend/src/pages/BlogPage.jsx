import { SignInButton, useUser } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpenIcon,
  CalendarIcon,
  ImageIcon,
  Loader2Icon,
  MessageCircleIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
  LanguagesIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import MarketingNav from "../components/MarketingNav";
import { blogApi } from "../api/blog";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

// ─── Constants ────────────────────────────────────────────────────────────────

const TITLE_TEXT = "ProveIt's Blog";
const NEON_COLORS = ["neon-0", "neon-1", "neon-2", "neon-3", "neon-4", "neon-5"];

const REACTIONS = [
  { type: "like",      emoji: "👍", key: "blog.reaction.like"      },
  { type: "support",   emoji: "🤝", key: "blog.reaction.support"   },
  { type: "love",      emoji: "❤️", key: "blog.reaction.love"      },
  { type: "celebrate", emoji: "🎉", key: "blog.reaction.celebrate" },
  { type: "haha",      emoji: "😄", key: "blog.reaction.haha"      },
  { type: "angry",     emoji: "😠", key: "blog.reaction.angry"     },
];

function reactionEmoji(type) {
  return REACTIONS.find((r) => r.type === type)?.emoji ?? "👍";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatRelative(value) {
  if (!value) return "";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "";
  }
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedTitle() {
  return (
    <h1
      className="community-title text-3xl font-black leading-tight sm:text-4xl md:text-6xl"
      aria-label={TITLE_TEXT}
    >
      {Array.from(TITLE_TEXT).map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className={`community-title-letter ${
            letter === " " ? "community-title-space" : NEON_COLORS[index % NEON_COLORS.length]
          }`}
          style={{ "--delay": `${index * 22}ms` }}
        >
          {letter === " " ? "\u00a0" : letter}
        </span>
      ))}
    </h1>
  );
}

function Avatar({ user, size = "h-11 w-11" }) {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name || "Author"}
        className={`${size} shrink-0 rounded-2xl border border-base-300 object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} grid shrink-0 place-items-center rounded-2xl bg-primary/10 text-sm font-black text-primary`}
      aria-hidden="true"
    >
      {getInitials(user?.name)}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-error",
  };
  return (
    <span className={`badge ${classes[status] || "badge-ghost"} capitalize`}>
      {status === "pending" ? "Pending Review" : status}
    </span>
  );
}

// ─── Reaction Picker ──────────────────────────────────────────────────────────

function ReactionPicker({ postId, myReaction, reactionCounts, isSignedIn, busy, onReact, t }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const longPressTimer = useRef(null);
  const containerRef = useRef(null);
  const totalReactions = Object.values(reactionCounts || {}).reduce((a, b) => a + b, 0);

  // Close picker when clicking outside
  useEffect(() => {
    if (!pickerOpen) return;
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [pickerOpen]);

  function handleMainClick() {
    if (!isSignedIn) { toast.error("Please sign in to react."); return; }
    onReact(postId, "like");
  }

  function handleMouseEnter() {
    longPressTimer.current = setTimeout(() => setPickerOpen(true), 400);
  }

  function handleMouseLeave() {
    clearTimeout(longPressTimer.current);
  }

  function handleTouchStart() {
    longPressTimer.current = setTimeout(() => setPickerOpen(true), 500);
  }

  function handleTouchEnd() {
    clearTimeout(longPressTimer.current);
  }

  function pickReaction(type) {
    if (!isSignedIn) { toast.error("Please sign in to react."); return; }
    setPickerOpen(false);
    onReact(postId, type);
  }

  const activeEmoji = myReaction ? reactionEmoji(myReaction) : null;

  // Reaction-specific button colors
  const REACTION_STYLES = {
    like:      { bg: "#1877f2", color: "#fff" },
    support:   { bg: "#00936b", color: "#fff" },
    love:      { bg: "#f33e58", color: "#fff" },
    celebrate: { bg: "#7c3aed", color: "#fff" },
    haha:      { bg: "#f59e0b", color: "#fff" },
    angry:     { bg: "#ef4444", color: "#fff" },
  };

  const activeStyle = myReaction ? REACTION_STYLES[myReaction] : null;

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        type="button"
        className={`btn btn-sm rounded-full gap-1.5 select-none transition-all duration-200 ${
          myReaction ? "border-0" : "btn-ghost"
        }`}
        style={activeStyle
          ? { backgroundColor: activeStyle.bg, color: activeStyle.color, borderColor: activeStyle.bg }
          : undefined
        }
        onClick={handleMainClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={busy}
        aria-label="React to post"
      >
        <span className={`leading-none select-none ${myReaction ? "text-lg" : "text-base"}`}>
          {activeEmoji ?? "👍"}
        </span>
        <span className="hidden sm:inline text-xs font-semibold">
          {myReaction ? t(`blog.reaction.${myReaction}`) : t("blog.reaction.like")}
        </span>
        {totalReactions > 0 && (
          <span
            className="badge badge-sm"
            style={activeStyle ? { backgroundColor: "rgba(255,255,255,0.25)", color: activeStyle.color, border: "none" } : undefined}
          >
            {totalReactions}
          </span>
        )}
      </button>

      {pickerOpen && (
        <div className="reaction-picker" role="menu" aria-label="Reaction picker">
          {REACTIONS.map(({ type, emoji, key }) => (
            <button
              key={type}
              type="button"
              className="reaction-picker-btn"
              onClick={() => pickReaction(type)}
              aria-label={t(key)}
              role="menuitem"
            >
              {emoji}
              <span className="reaction-tooltip">{t(key)}</span>
              {reactionCounts?.[type] > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] rounded-full bg-primary px-1 text-[9px] font-bold text-primary-content leading-4 text-center">
                  {reactionCounts[type]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Translation Toggle ───────────────────────────────────────────────────────

function TranslationToggle({ post, t }) {
  const [showTranslation, setShowTranslation] = useState(false);

  if (post.translationStatus === "failed") {
    return (
      <p className="mt-2 text-xs text-base-content/45 italic">
        {t("blog.translationUnavailable")}
      </p>
    );
  }

  if (post.translationStatus !== "done" || !post.translatedContent) {
    return null;
  }

  return (
    <div className="mt-1">
      {showTranslation && (
        <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-base-content/75 border-s-2 border-primary/30 ps-3 italic text-sm">
          {post.translatedContent}
        </p>
      )}
      <button
        type="button"
        className="translation-toggle-btn"
        onClick={() => setShowTranslation((v) => !v)}
      >
        <LanguagesIcon className="size-3" />
        {showTranslation ? t("blog.seeOriginal") : t("blog.seeTranslation")}
      </button>
    </div>
  );
}

// ─── Comment Reaction Bar ─────────────────────────────────────────────────────

function CommentReactionBar({ postId, commentId, reactionCounts, myReaction, isSignedIn, busy, onReactToComment, t }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef(null);
  const totalReactions = Object.values(reactionCounts || {}).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!pickerOpen) return;
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pickerOpen]);

  function pick(type) {
    if (!isSignedIn) { toast.error("Please sign in to react."); return; }
    setPickerOpen(false);
    onReactToComment(postId, commentId, type);
  }

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        type="button"
        className="btn btn-ghost btn-xs rounded-full gap-1 px-2"
        onClick={() => {
          if (!isSignedIn) { toast.error("Please sign in to react."); return; }
          setPickerOpen((v) => !v);
        }}
        disabled={busy}
        aria-label="React to comment"
      >
        <span className="text-sm leading-none">{myReaction ? reactionEmoji(myReaction) : "👍"}</span>
        {totalReactions > 0 && (
          <span className="text-xs text-base-content/60">{totalReactions}</span>
        )}
      </button>

      {pickerOpen && (
        <div className="reaction-picker" role="menu">
          {REACTIONS.map(({ type, emoji, key }) => (
            <button
              key={type}
              type="button"
              className="reaction-picker-btn"
              style={{ fontSize: "1.1rem", padding: "2px" }}
              onClick={() => pick(type)}
              aria-label={t(key)}
              role="menuitem"
            >
              {emoji}
              <span className="reaction-tooltip">{t(key)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Comment ───────────────────────────────────────────────────────────

function CommentItem({
  comment,
  postId,
  isSignedIn,
  busy,
  isReply = false,
  onEditComment,
  onDeleteComment,
  onAddReply,
  onReactToComment,
  t,
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  function startEdit() {
    setEditing(true);
    setEditContent(comment.content);
  }

  function submitEdit() {
    onEditComment(postId, comment._id, editContent);
    setEditing(false);
  }

  function submitReply() {
    if (!replyText.trim()) return;
    onAddReply(postId, comment._id, replyText);
    setReplyText("");
    setReplyOpen(false);
  }

  return (
    <div className={`rounded-lg border border-base-200 bg-base-200/40 p-3 ${isReply ? "mt-2" : ""}`}>
      <div className="flex items-start gap-2">
        <Avatar user={comment.author} size="h-8 w-8" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{comment.author?.name || "Member"}</p>
            <span className="text-xs text-base-content/50">{formatRelative(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered input-sm min-w-0 flex-1"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                aria-label="Edit comment"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={submitEdit}
                disabled={!editContent.trim() || busy}
              >
                Save
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1 break-words text-sm leading-6">{comment.content}</p>
          )}

          {/* Comment actions row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CommentReactionBar
              postId={postId}
              commentId={comment._id}
              reactionCounts={comment.reactionCounts}
              myReaction={comment.myReaction}
              isSignedIn={isSignedIn}
              busy={busy}
              onReactToComment={onReactToComment}
              t={t}
            />
            {!isReply && isSignedIn && (
              <button
                type="button"
                className="btn btn-ghost btn-xs px-2 text-xs"
                onClick={() => setReplyOpen((v) => !v)}
              >
                {t("blog.reply")}
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {replyOpen && !isReply && (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered input-sm min-w-0 flex-1"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("blog.replyPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-primary btn-sm gap-1"
                onClick={submitReply}
                disabled={!replyText.trim() || busy}
              >
                <SendIcon className="size-3" />
                {t("blog.send")}
              </button>
            </div>
          )}
        </div>

        {/* Edit/delete */}
        {comment.canManage && !editing && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Edit comment"
              onClick={startEdit}
            >
              <PencilIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle text-error"
              aria-label="Delete comment"
              onClick={() => onDeleteComment(postId, comment._id)}
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {!isReply && (comment.replies || []).length > 0 && (
        <div className="comment-replies mt-2 space-y-2">
          {(comment.replies || []).map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              isSignedIn={isSignedIn}
              busy={busy}
              isReply={true}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              onAddReply={onAddReply}
              onReactToComment={onReactToComment}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Community Post Card ──────────────────────────────────────────────────────

function CommunityPostCard({
  post,
  isSignedIn,
  language,
  onReact,
  onComment,
  onEditComment,
  onDeleteComment,
  onAddReply,
  onReactToComment,
  busy,
  t,
}) {
  const [comment, setComment] = useState("");

  function submitComment() {
    onComment(post._id, comment);
    setComment("");
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="p-4 sm:p-5">
        {/* Author header */}
        <div className="flex min-w-0 items-start gap-3">
          <Avatar user={post.author} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-black">
                {post.author?.name || "ProveIt member"}
              </h2>
              {post.author?.level ? (
                <span className="badge badge-outline max-w-full truncate text-xs">
                  {post.author.level}
                </span>
              ) : null}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-base-content/55">
              <CalendarIcon className="size-3.5" />
              <span>{formatDate(post.date || post.createdAt, language)}</span>
            </p>
          </div>
        </div>

        {/* Title */}
        {post.title ? (
          <h3 className="mt-4 text-lg font-black leading-snug">{post.title}</h3>
        ) : null}

        {/* Content + translation toggle */}
        <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-base-content/80">
          {post.content}
        </p>
        <TranslationToggle post={post} t={t} />

        {/* Image */}
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title || "Community post image"}
            className="mt-4 w-full max-h-[420px] rounded-xl border border-base-300 object-cover"
            loading="lazy"
          />
        ) : null}

        {/* Reactions */}
        <div className="mt-4 border-y border-base-200 py-3">
          <ReactionPicker
            postId={post._id}
            myReaction={post.myReaction}
            reactionCounts={post.reactionCounts}
            isSignedIn={isSignedIn}
            busy={busy}
            onReact={onReact}
            t={t}
          />
        </div>

        {/* Comments section */}
        <section className="mt-4 space-y-3" aria-label="Comments">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MessageCircleIcon className="size-4" />
            <span>{t("blog.comments")}</span>
          </div>

          {(post.comments || []).map((item) => (
            <CommentItem
              key={item._id}
              comment={item}
              postId={post._id}
              isSignedIn={isSignedIn}
              busy={busy}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              onAddReply={onAddReply}
              onReactToComment={onReactToComment}
              t={t}
            />
          ))}

          {/* New comment input */}
          {isSignedIn ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor={`comment-${post._id}`}>
                {t("blog.writeComment")}
              </label>
              <input
                id={`comment-${post._id}`}
                className="input input-bordered min-w-0 flex-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("blog.writeComment")}
                onKeyDown={(e) => e.key === "Enter" && !busy && comment.trim() && submitComment()}
              />
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={submitComment}
                disabled={busy || !comment.trim()}
              >
                <SendIcon className="size-4" />
                {t("blog.send")}
              </button>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="btn btn-outline btn-sm">
                {t("blog.signInToComment")}
              </button>
            </SignInButton>
          )}
        </section>
      </div>
    </article>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ post, language, t }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10">
          <BookOpenIcon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="badge badge-outline max-w-full truncate">{post.category}</span>
          <p className="mt-1 text-xs text-base-content/55">
            {formatDate(post.date, language)}
          </p>
        </div>
      </div>
      <h2 className="mt-4 text-xl font-black leading-snug">{post.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-base-content/70">{post.excerpt}</p>
      <span className="btn btn-ghost btn-sm mt-4 w-fit gap-2 px-0 text-primary">
        {t("blog.readMore")}
      </span>
    </Link>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────

function PostModal({ open, onClose, onSubmit, initialPost, busy, isAdmin }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialPost?.title || "");
    setContent(initialPost?.content || "");
    setImageUrl(initialPost?.imageUrl || "");
  }, [open, initialPost]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, imageUrl });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-base-300/70 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-300 bg-base-100 shadow-2xl">
        <form className="p-5 sm:p-6" onSubmit={submit}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">
                {initialPost ? "Edit community post" : "Create community post"}
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                {isAdmin
                  ? "As an admin, your post will be published immediately."
                  : "Posts are reviewed by an admin before becoming public."}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={onClose}
              aria-label="Close post form"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <label className="form-control mt-5">
            <span className="label-text font-semibold">Title optional</span>
            <input
              className="input input-bordered mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="What is your post about?"
            />
          </label>

          <label className="form-control mt-4">
            <span className="label-text font-semibold">Post content</span>
            <textarea
              className="textarea textarea-bordered mt-2 min-h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={4000}
              required
              placeholder="Share an interview lesson, coding tip, or community update."
            />
            <span className="mt-1 text-xs text-base-content/50">{content.length}/4000</span>
          </label>

          <label className="form-control mt-4">
            <span className="label-text font-semibold">Image URL optional</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered min-w-0 flex-1"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <span className="btn btn-ghost pointer-events-none gap-2">
                <ImageIcon className="size-4" />
                Preview
              </span>
            </div>
          </label>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Post preview"
              className="mt-4 max-h-64 w-full rounded-lg border border-base-300 object-cover"
            />
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={busy || !content.trim()}
            >
              {busy ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <PlusIcon className="size-4" />
              )}
              {isAdmin ? "Publish now" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── My Posts Panel ───────────────────────────────────────────────────────────

function MyPostsPanel({ posts, onEdit, onDelete, busy }) {
  if (!posts.length) return null;
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black">My community posts</h2>
      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <article
            key={post._id}
            className="rounded-lg border border-base-200 bg-base-200/40 p-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={post.status} />
                  <span className="text-xs text-base-content/50">
                    {formatRelative(post.updatedAt || post.createdAt)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 break-words text-sm">
                  {post.title ? `${post.title}: ` : ""}
                  {post.content}
                </p>
                {post.status === "rejected" && post.rejectionReason ? (
                  <p className="mt-2 text-xs text-error">{post.rejectionReason}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                {post.canEdit ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs gap-1"
                    onClick={() => onEdit(post)}
                  >
                    <PencilIcon className="size-3.5" />
                    Edit
                  </button>
                ) : null}
                {post.canDelete ? (
                  <button
                    type="button"
                    className="btn btn-error btn-xs gap-1"
                    onClick={() => onDelete(post._id)}
                    disabled={busy}
                  >
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Main BlogPage ────────────────────────────────────────────────────────────

function BlogPage() {
  const queryClient = useQueryClient();
  const { isSignedIn, user } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Detect admin: Clerk user metadata or email match
  const isAdmin = Boolean(
    user?.publicMetadata?.role === "admin" ||
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase()
  );

  const postsQuery = useQuery({
    queryKey: ["blogPosts", language],
    queryFn: () => blogApi.getPosts(language),
  });

  const myPostsQuery = useQuery({
    queryKey: ["myCommunityPosts"],
    queryFn: blogApi.getMyPosts,
    enabled: Boolean(isSignedIn),
  });

  const refreshPosts = () => {
    queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    queryClient.invalidateQueries({ queryKey: ["myCommunityPosts"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingPost
        ? blogApi.updateCommunityPost({ id: editingPost._id, payload })
        : blogApi.createCommunityPost(payload),
    onSuccess: (data) => {
      const status = data?.post?.status;
      if (status === "approved") {
        toast.success("Post published immediately! 🎉");
      } else {
        toast.success("Post submitted for review.");
      }
      setModalOpen(false);
      setEditingPost(null);
      refreshPosts();
    },
    onError: (error) => toast.error(error.response?.data?.msg || "Could not save post"),
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.deleteCommunityPost,
    onSuccess: () => { toast.success("Post deleted."); refreshPosts(); },
    onError: (error) => toast.error(error.response?.data?.msg || "Could not delete post"),
  });

  const reactMutation = useMutation({
    mutationFn: blogApi.reactToPost,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not update reaction"),
  });

  const commentMutation = useMutation({
    mutationFn: blogApi.addComment,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not add comment"),
  });

  const replyMutation = useMutation({
    mutationFn: blogApi.addCommentReply,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not add reply"),
  });

  const commentReactMutation = useMutation({
    mutationFn: blogApi.reactToComment,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not update reaction"),
  });

  const editCommentMutation = useMutation({
    mutationFn: blogApi.updateComment,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not update comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: blogApi.deleteComment,
    onSuccess: refreshPosts,
    onError: (error) => toast.error(error.response?.data?.msg || "Could not delete comment"),
  });

  const posts = postsQuery.data?.posts || [];
  const myPosts = myPostsQuery.data?.posts || [];
  const isBusy =
    saveMutation.isPending ||
    deleteMutation.isPending ||
    reactMutation.isPending ||
    commentMutation.isPending ||
    replyMutation.isPending ||
    commentReactMutation.isPending ||
    editCommentMutation.isPending ||
    deleteCommentMutation.isPending;

  const openCreate = () => { setEditingPost(null); setModalOpen(true); };
  const openEdit = (post) => { setEditingPost(post); setModalOpen(true); };

  const handleReact = (id, type) => {
    if (!isSignedIn) { toast.error("Please sign in to react."); return; }
    reactMutation.mutate({ id, type });
  };

  const handleComment = (id, content) => {
    if (!content.trim()) return;
    commentMutation.mutate({ id, content });
  };

  const handleAddReply = (postId, commentId, content) => {
    if (!content.trim()) return;
    replyMutation.mutate({ postId, commentId, content });
  };

  const handleReactToComment = (postId, commentId, type) => {
    commentReactMutation.mutate({ postId, commentId, type });
  };

  return (
    <div className="blog-feed-root min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        {/* Hero */}
        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="badge badge-primary badge-lg mb-5">
                  {t("blog.badge")}
                </div>
                <AnimatedTitle />
                <p className="mt-5 text-base leading-relaxed text-base-content/70 sm:text-lg">
                  {t("blog.subtitle")}
                </p>
              </div>
              {isSignedIn ? (
                <button
                  type="button"
                  className="btn btn-primary gap-2 rounded-full shrink-0"
                  onClick={openCreate}
                >
                  <PlusIcon className="size-4" />
                  {t("blog.addPost")}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-primary gap-2 rounded-full shrink-0">
                    <PlusIcon className="size-4" />
                    {t("blog.signInToPost")}
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </section>

        {/* Feed + Sidebar */}
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Feed */}
          <div className="min-w-0 space-y-5">
            {postsQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2Icon className="size-10 animate-spin text-primary" />
              </div>
            ) : postsQuery.error ? (
              <div className="rounded-2xl border border-error/20 bg-error/10 p-6 text-center">
                <p className="font-semibold">{t("blog.error")}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
                <p className="font-semibold">{t("blog.empty")}</p>
              </div>
            ) : (
              posts.map((post) =>
                post.postType === "community" ? (
                  <CommunityPostCard
                    key={post._id}
                    post={post}
                    isSignedIn={isSignedIn}
                    language={language}
                    busy={isBusy}
                    onReact={handleReact}
                    onComment={handleComment}
                    onEditComment={(postId, commentId, content) =>
                      editCommentMutation.mutate({ postId, commentId, content })
                    }
                    onDeleteComment={(postId, commentId) =>
                      deleteCommentMutation.mutate({ postId, commentId })
                    }
                    onAddReply={handleAddReply}
                    onReactToComment={handleReactToComment}
                    t={t}
                  />
                ) : (
                  <ArticleCard
                    key={post._id || post.slug}
                    post={post}
                    language={language}
                    t={t}
                  />
                ),
              )
            )}
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <h2 className="text-lg font-black">{t("blog.guidelines")}</h2>
              <p className="mt-2 text-sm leading-6 text-base-content/65">
                {t("blog.guidelinesBody")}
              </p>
            </section>

            {isSignedIn ? (
              myPostsQuery.isLoading ? (
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-center">
                  <Loader2Icon className="mx-auto size-6 animate-spin text-primary" />
                </div>
              ) : (
                <MyPostsPanel
                  posts={myPosts}
                  onEdit={openEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  busy={deleteMutation.isPending}
                />
              )
            ) : null}
          </aside>
        </section>
      </main>

      <PostModal
        open={modalOpen}
        initialPost={editingPost}
        busy={saveMutation.isPending}
        isAdmin={isAdmin}
        onClose={() => { setModalOpen(false); setEditingPost(null); }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  );
}

export default BlogPage;

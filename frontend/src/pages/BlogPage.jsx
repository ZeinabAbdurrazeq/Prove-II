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
  SparklesIcon,
  ThumbsUpIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router";
import MarketingNav from "../components/MarketingNav";
import { blogApi } from "../api/blog";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const reactions = [
  { type: "like", label: "Like", icon: ThumbsUpIcon },
  { type: "celebrate", label: "Celebrate", icon: SparklesIcon },
  { type: "insightful", label: "Insightful", icon: BookOpenIcon },
];

const titleText = "ProveIt Blog & Community";
const titleColors = [
  "text-primary",
  "text-secondary",
  "text-accent",
  "text-info",
  "text-success",
  "text-warning",
];

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

function AnimatedTitle() {
  return (
    <h1
      className="community-title text-3xl font-black leading-tight sm:text-4xl md:text-6xl"
      aria-label={titleText}
    >
      {Array.from(titleText).map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className={`community-title-letter ${
            letter === " " ? "community-title-space" : titleColors[index % titleColors.length]
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

function CommunityPostCard({
  post,
  isSignedIn,
  language,
  onReact,
  onComment,
  onEditComment,
  onDeleteComment,
  busy,
}) {
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const submitComment = () => {
    onComment(post._id, comment);
    setComment("");
  };

  const submitCommentEdit = (commentId) => {
    onEditComment(post._id, commentId, editingCommentContent);
    setEditingCommentId("");
    setEditingCommentContent("");
  };

  return (
    <article className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
      <div className="p-4 sm:p-5">
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

        {post.title ? (
          <h3 className="mt-4 text-lg font-black leading-snug">{post.title}</h3>
        ) : null}

        <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-base-content/80">
          {post.content}
        </p>

        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title || "Community post image"}
            className="mt-4 max-h-[420px] w-full rounded-lg border border-base-300 object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 border-y border-base-200 py-3">
          {reactions.map(({ type, label, icon: Icon }) => {
            const active = post.myReaction === type;
            return (
              <button
                key={type}
                type="button"
                className={`btn btn-sm rounded-full ${
                  active ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => onReact(post._id, type)}
                disabled={busy}
                aria-label={`${label} reaction`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
                <span className="badge badge-sm">
                  {post.reactionCounts?.[type] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-4 space-y-3" aria-label="Comments">
          <div className="flex items-center gap-2 text-sm font-bold">
            <MessageCircleIcon className="size-4" />
            <span>Comments</span>
          </div>

          {(post.comments || []).map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-base-200 bg-base-200/40 p-3"
            >
              <div className="flex items-start gap-2">
                <Avatar user={item.author} size="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.author?.name || "Member"}</p>
                    <span className="text-xs text-base-content/50">
                      {formatRelative(item.createdAt)}
                    </span>
                  </div>
                  {editingCommentId === item._id ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        className="input input-bordered input-sm min-w-0 flex-1"
                        value={editingCommentContent}
                        onChange={(event) =>
                          setEditingCommentContent(event.target.value)
                        }
                        aria-label="Edit comment"
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => submitCommentEdit(item._id)}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 break-words text-sm leading-6">
                      {item.content}
                    </p>
                  )}
                </div>
                {item.canManage ? (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Edit comment"
                      onClick={() => {
                        setEditingCommentId(item._id);
                        setEditingCommentContent(item.content);
                      }}
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle text-error"
                      aria-label="Delete comment"
                      onClick={() => onDeleteComment(post._id, item._id)}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {isSignedIn ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor={`comment-${post._id}`}>
                Write a comment
              </label>
              <input
                id={`comment-${post._id}`}
                className="input input-bordered min-w-0 flex-1"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a comment"
              />
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={submitComment}
                disabled={busy || !comment.trim()}
              >
                <SendIcon className="size-4" />
                Send
              </button>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="btn btn-outline btn-sm">
                Sign in to comment
              </button>
            </SignInButton>
          )}
        </section>
      </div>
    </article>
  );
}

function ArticleCard({ post, language, t }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-lg bg-primary/10">
          <BookOpenIcon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="badge badge-outline max-w-full truncate">
            {post.category}
          </span>
          <p className="mt-1 text-xs text-base-content/55">
            {formatDate(post.date, language)}
          </p>
        </div>
      </div>
      <h2 className="mt-4 text-xl font-black leading-snug">{post.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-base-content/70">
        {post.excerpt}
      </p>
      <span className="btn btn-ghost btn-sm mt-4 w-fit gap-2 px-0 text-primary">
        {t("blog.readMore")}
      </span>
    </Link>
  );
}

function PostModal({ open, onClose, onSubmit, initialPost, busy }) {
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

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ title, content, imageUrl });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-base-300/70 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-2xl">
        <form className="p-5 sm:p-6" onSubmit={submit}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">
                {initialPost ? "Edit community post" : "Create community post"}
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                Posts are reviewed by an admin before becoming public.
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
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="What is your post about?"
            />
          </label>

          <label className="form-control mt-4">
            <span className="label-text font-semibold">Post content</span>
            <textarea
              className="textarea textarea-bordered mt-2 min-h-40"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={4000}
              required
              placeholder="Share an interview lesson, coding tip, or community update."
            />
            <span className="mt-1 text-xs text-base-content/50">
              {content.length}/4000
            </span>
          </label>

          <label className="form-control mt-4">
            <span className="label-text font-semibold">Image URL optional</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered min-w-0 flex-1"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
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
              {busy ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
              Submit for review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyPostsPanel({ posts, onEdit, onDelete, busy }) {
  if (!posts.length) return null;

  return (
    <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
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

function BlogPage() {
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

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
    onSuccess: () => {
      toast.success("Post submitted for review.");
      setModalOpen(false);
      setEditingPost(null);
      refreshPosts();
    },
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not save post"),
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.deleteCommunityPost,
    onSuccess: () => {
      toast.success("Post deleted.");
      refreshPosts();
    },
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not delete post"),
  });

  const reactMutation = useMutation({
    mutationFn: blogApi.reactToPost,
    onSuccess: refreshPosts,
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not update reaction"),
  });

  const commentMutation = useMutation({
    mutationFn: blogApi.addComment,
    onSuccess: refreshPosts,
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not add comment"),
  });

  const editCommentMutation = useMutation({
    mutationFn: blogApi.updateComment,
    onSuccess: refreshPosts,
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not update comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: blogApi.deleteComment,
    onSuccess: refreshPosts,
    onError: (error) =>
      toast.error(error.response?.data?.msg || "Could not delete comment"),
  });

  const posts = postsQuery.data?.posts || [];
  const myPosts = myPostsQuery.data?.posts || [];
  const isBusy =
    saveMutation.isPending ||
    deleteMutation.isPending ||
    reactMutation.isPending ||
    commentMutation.isPending ||
    editCommentMutation.isPending ||
    deleteCommentMutation.isPending;

  const openCreate = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleReact = (id, type) => {
    if (!isSignedIn) {
      toast.error("Please sign in to react.");
      return;
    }
    reactMutation.mutate({ id, type });
  };

  const handleComment = (id, content) => {
    if (!content.trim()) return;
    commentMutation.mutate({ id, content });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-300">
      <MarketingNav />

      <style>{`
        .community-title-letter {
          display: inline-block;
          transform-origin: 50% 70%;
          transition: color 180ms ease, transform 180ms ease;
        }

        .community-title:hover .community-title-letter:not(.community-title-space) {
          animation: community-wiggle 540ms ease var(--delay) both;
        }

        @keyframes community-wiggle {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-1px) rotate(-2deg); }
          50% { transform: translateX(1px) rotate(2deg); }
          75% { transform: translateX(-1px) rotate(-1deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .community-title-letter {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <main>
        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
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
                  className="btn btn-primary gap-2 rounded-full"
                  onClick={openCreate}
                >
                  <PlusIcon className="size-4" />
                  Add Post
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-primary gap-2 rounded-full">
                    <PlusIcon className="size-4" />
                    Sign in to post
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-5">
            {postsQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2Icon className="size-10 animate-spin text-primary" />
              </div>
            ) : postsQuery.error ? (
              <div className="rounded-lg border border-error/20 bg-error/10 p-6 text-center">
                <p className="font-semibold">{t("blog.error")}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-base-300 bg-base-100 p-8 text-center">
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

          <aside className="min-w-0 space-y-5">
            <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
              <h2 className="text-lg font-black">Community guidelines</h2>
              <p className="mt-2 text-sm leading-6 text-base-content/65">
                Share practical interview lessons, coding insights, and helpful
                career notes. Every community post is reviewed before it appears
                publicly.
              </p>
            </section>

            {isSignedIn ? (
              myPostsQuery.isLoading ? (
                <div className="rounded-lg border border-base-300 bg-base-100 p-5 text-center">
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
        onClose={() => {
          setModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />
    </div>
  );
}

export default BlogPage;

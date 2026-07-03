import {
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  Code2Icon,
  FileTextIcon,
  Loader2Icon,
  UsersIcon,
} from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import MarketingNav from "../components/MarketingNav";
import { blogApi } from "../api/blog";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const postIcons = {
  Preparation: BookOpenIcon,
  "Live Practice": Code2Icon,
  "AI Interview": BrainIcon,
  "Practice Modes": UsersIcon,
  Profile: FileTextIcon,
  "Interview Tips": Code2Icon,
};

function formatDate(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function BlogPage() {
  const { language } = useLanguage();
  const t = getTranslator(language);
  const { data, isLoading, error } = useQuery({
    queryKey: ["blogPosts", language],
    queryFn: () => blogApi.getPosts(language),
  });
  const posts = data?.posts || [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-300">
      <MarketingNav />

      <main>
        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
            <div className="max-w-3xl">
              <div className="badge badge-primary badge-lg mb-5">
                {t("blog.badge")}
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
                {t("blog.title")}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-base-content/70 sm:text-lg">
                {t("blog.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon className="size-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-error/20 bg-error/10 p-6 text-center">
              <p className="font-semibold">{t("blog.error")}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
              <p className="font-semibold">{t("blog.empty")}</p>
            </div>
          ) : (
            <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const Icon = postIcons[post.category] || BookOpenIcon;

                return (
                  <Link
                    key={post._id || post.slug}
                    to={`/blog/${post.slug}`}
                    className="card min-w-0 border border-base-300 bg-base-100 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="card-body min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <span className="badge badge-outline max-w-[12rem] truncate">
                          {post.category}
                        </span>
                      </div>
                      <h2 className="mt-4 text-xl font-black leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-base-content/70">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/55">
                        <span>{formatDate(post.date, language)}</span>
                        <span>{post.readTime}</span>
                      </div>
                      <span className="btn btn-ghost btn-sm mt-4 w-fit gap-2 px-0 text-primary">
                        {language === "ar" ? (
                          <>
                            <ArrowRightIcon className="size-4 rotate-180" />
                            {t("blog.readMore")}
                          </>
                        ) : (
                          <>
                            {t("blog.readMore")}
                            <ArrowRightIcon className="size-4" />
                          </>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default BlogPage;

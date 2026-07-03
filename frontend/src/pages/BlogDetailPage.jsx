import { Loader2Icon } from "lucide-react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import MarketingNav from "../components/MarketingNav";
import { blogApi } from "../api/blog";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function formatDate(value, language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function BlogDetailPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const { data, isLoading, error } = useQuery({
    queryKey: ["blogPost", slug, language],
    queryFn: () => blogApi.getPost(slug, language),
    enabled: !!slug,
  });

  const post = data?.post;

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-base-300">
        <MarketingNav />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-base-300">
        <MarketingNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="badge badge-outline">{t("blog.notFoundBadge")}</p>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            {t("blog.notFoundTitle")}
          </h1>
          <Link to="/blog" className="btn btn-primary mt-8 gap-2">
            {t("blog.back")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-300">
      <MarketingNav />

      <main>
        <article>
          <header className="bg-base-100">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
              >
                {t("blog.back")}
              </Link>

              <div className="mt-8">
                <span className="badge badge-primary badge-lg">
                  {post.category}
                </span>
                <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-5 text-base leading-relaxed text-base-content/70 sm:text-lg">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-base-content/60">
                  <span>{post.author}</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatDate(post.date, language)}</span>
                  <span aria-hidden="true">/</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="space-y-10">
              {(post.content || []).map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h2 className="text-2xl font-bold">{section.heading}</h2>
                  <p className="mt-4 text-base leading-8 text-base-content/75">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-lg border border-base-300 bg-base-100 p-5 sm:p-6">
              <h2 className="text-2xl font-bold">{t("blog.ctaTitle")}</h2>
              <p className="mt-3 leading-7 text-base-content/70">
                {t("blog.ctaBody")}
              </p>
              <Link to="/pricing" className="btn btn-primary mt-6 gap-2">
                {t("blog.ctaButton")}
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default BlogDetailPage;

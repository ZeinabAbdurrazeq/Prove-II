import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Link, useParams } from "react-router";
import MarketingNav from "../components/MarketingNav";
import { getBlogPost } from "../data/blogPosts";

function BlogDetailPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-base-300">
        <MarketingNav />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="badge badge-outline">Article not found</p>
          <h1 className="mt-5 text-4xl font-bold">This post is not available.</h1>
          <Link to="/blog" className="btn btn-primary mt-8 gap-2">
            <ArrowLeftIcon className="size-4" />
            Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        <article>
          <header className="bg-base-100">
            <div className="mx-auto max-w-4xl px-6 py-16">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
              >
                <ArrowLeftIcon className="size-4" />
                Back to Blog
              </Link>

              <div className="mt-8">
                <span className="badge badge-primary badge-lg">
                  {post.category}
                </span>
                <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-base-content/70">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-base-content/60">
                  <span>{post.author}</span>
                  <span aria-hidden="true">/</span>
                  <span>{post.date}</span>
                  <span aria-hidden="true">/</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-6 py-14">
            <div className="space-y-10">
              {post.content.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-bold">{section.heading}</h2>
                  <p className="mt-4 text-base leading-8 text-base-content/75">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-lg border border-base-300 bg-base-100 p-6">
              <h2 className="text-2xl font-bold">Keep practicing with ProveIt</h2>
              <p className="mt-3 leading-7 text-base-content/70">
                Turn the ideas from this article into live practice, solo
                problem solving, and AI interview rehearsal.
              </p>
              <Link to="/pricing" className="btn btn-primary mt-6 gap-2">
                Explore plans
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default BlogDetailPage;

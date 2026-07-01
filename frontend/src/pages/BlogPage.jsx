import {
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  Code2Icon,
  FileTextIcon,
  UsersIcon,
} from "lucide-react";
import { Link } from "react-router";
import MarketingNav from "../components/MarketingNav";
import { blogPosts } from "../data/blogPosts";

const postIcons = {
  Preparation: BookOpenIcon,
  "Live Practice": Code2Icon,
  "AI Interview": BrainIcon,
  "Practice Modes": UsersIcon,
  Profile: FileTextIcon,
  "Interview Tips": Code2Icon,
};

function BlogPage() {
  return (
    <div className="min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-3xl">
              <div className="badge badge-primary badge-lg mb-5">
                Interview insights
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                Practical writing for better technical interviews.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-base-content/70">
                Guides on preparation, live coding, AI interview practice, and
                building the kind of candidate profile that helps your skills
                show up clearly.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogPosts.map((post) => {
              const Icon = postIcons[post.category] || BookOpenIcon;

              return (
                <Link
                  key={post.title}
                  to={`/blog/${post.slug}`}
                  className="card border border-base-300 bg-base-100 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <span className="badge badge-outline">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-black">{post.title}</h2>
                    <p className="text-sm leading-relaxed text-base-content/70">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-base-content/55">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="btn btn-ghost btn-sm mt-4 w-fit gap-2 px-0 text-primary">
                      Read more
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BlogPage;

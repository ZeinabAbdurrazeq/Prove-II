import {
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  Code2Icon,
  FileTextIcon,
  UsersIcon,
} from "lucide-react";
import MarketingNav from "../components/MarketingNav";

const posts = [
  {
    title: "How to Prepare for a Technical Interview",
    excerpt:
      "Build a repeatable practice routine that balances algorithms, communication, system thinking, and review.",
    category: "Preparation",
    readTime: "6 min read",
    date: "Jul 1, 2026",
    icon: BookOpenIcon,
  },
  {
    title: "Why Live Coding Practice Matters",
    excerpt:
      "Real interviews are interactive. Practicing with another person helps you explain choices under realistic pressure.",
    category: "Live Practice",
    readTime: "5 min read",
    date: "Jun 24, 2026",
    icon: Code2Icon,
  },
  {
    title: "How AI Interviewers Improve Readiness",
    excerpt:
      "A structured AI recruiter can help candidates rehearse background, behavioral, and technical answers consistently.",
    category: "AI Interview",
    readTime: "7 min read",
    date: "Jun 18, 2026",
    icon: BrainIcon,
  },
  {
    title: "Solo vs Pair Problem Solving",
    excerpt:
      "Solo practice builds fluency, while pair sessions reveal how clearly you collaborate and communicate.",
    category: "Practice Modes",
    readTime: "4 min read",
    date: "Jun 10, 2026",
    icon: UsersIcon,
  },
  {
    title: "What Makes a Strong Candidate Profile",
    excerpt:
      "Strong profiles connect projects, ownership, trade-offs, and measurable outcomes into one clear story.",
    category: "Profile",
    readTime: "5 min read",
    date: "Jun 3, 2026",
    icon: FileTextIcon,
  },
  {
    title: "Common Mistakes in Coding Interviews",
    excerpt:
      "Avoid silent problem solving, unclear assumptions, overengineering, and skipping edge-case discussion.",
    category: "Interview Tips",
    readTime: "6 min read",
    date: "May 28, 2026",
    icon: Code2Icon,
  },
];

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
            {posts.map((post) => {
              const Icon = post.icon;

              return (
                <article
                  key={post.title}
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
                    <button className="btn btn-ghost btn-sm mt-4 w-fit gap-2 px-0 text-primary">
                      Read more
                      <ArrowRightIcon className="size-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BlogPage;

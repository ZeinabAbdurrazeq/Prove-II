import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { useMemo, useState } from "react";

import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const problems = useMemo(() => Object.values(PROBLEMS), []);
  const filteredProblems = useMemo(
    () =>
      difficultyFilter === "All"
        ? problems
        : problems.filter((problem) => problem.difficulty === difficultyFilter),
    [difficultyFilter, problems],
  );

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;
  const difficultyStats = [
    { label: "All", count: problems.length, className: "progress-primary" },
    { label: "Easy", count: easyProblemsCount, className: "progress-success" },
    { label: "Medium", count: mediumProblemsCount, className: "progress-warning" },
    { label: "Hard", count: hardProblemsCount, className: "progress-error" },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-4">
          {difficultyStats.map((item) => {
            const active = difficultyFilter === item.label;
            const percent = problems.length > 0 ? Math.round((item.count / problems.length) * 100) : 0;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setDifficultyFilter(item.label)}
                className={`rounded-lg border bg-base-100 p-4 text-left shadow-sm transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-base-300 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold">{item.label}</span>
                  <span className="badge badge-outline">{item.count}</span>
                </div>
                <progress
                  className={`progress ${item.className} mt-3 h-2 w-full`}
                  value={item.count}
                  max={problems.length || 1}
                />
                <p className="mt-2 text-xs text-base-content/55">{percent}% of practice set</p>
              </button>
            );
          })}
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body">
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold">{problem.title}</h2>
                          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/60"> {problem.category}</p>
                      </div>
                    </div>
                    <p className="text-base-content/80 mb-3">{problem.description.text}</p>
                  </div>
                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 text-primary">
                    <span className="font-medium">Solve</span>
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredProblems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-base-300 bg-base-100 p-10 text-center">
              <p className="font-semibold">No problems match this difficulty.</p>
              <button
                type="button"
                onClick={() => setDifficultyFilter("All")}
                className="btn btn-outline btn-sm mt-4 rounded-full"
              >
                Show all problems
              </button>
            </div>
          ) : null}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{easyProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{mediumProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;

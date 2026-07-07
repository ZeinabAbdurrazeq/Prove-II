import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { useMemo, useState } from "react";

import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const problems = useMemo(() => Object.values(PROBLEMS), []);
  const filteredProblems = useMemo(
    () => {
      const normalizedSearch = searchTerm.trim().toLowerCase();

      return problems.filter((problem) => {
        const matchesDifficulty =
          difficultyFilter === "All" ||
          problem.difficulty === difficultyFilter;

        if (!matchesDifficulty) return false;

        if (!normalizedSearch) return true;

        const haystack = `${problem.id} ${problem.title} ${problem.category}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    },
    [difficultyFilter, problems, searchTerm],
  );
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const visibleProblems = filteredProblems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;
  const showAllProblems = difficultyFilter === "All";

  const setFilter = (nextFilter) => {
    setDifficultyFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

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

        <div className="mb-8 rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold">Search</span>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Search title, id, or category"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold">Difficulty</span>
              <select
                className="select select-bordered"
                value={difficultyFilter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="All" disabled>
                  Choose difficulty
                </option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>

            <label className="flex h-12 items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-4">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={showAllProblems}
                onChange={(event) =>
                  setFilter(event.target.checked ? "All" : "Easy")
                }
              />
              <span className="font-semibold">All problems</span>
            </label>
          </div>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {visibleProblems.map((problem) => (
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
              <p className="font-semibold">No problems match these filters.</p>
              <button
                type="button"
                onClick={() => {
                  setDifficultyFilter("All");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="btn btn-outline btn-sm mt-4 rounded-full"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>

        {filteredProblems.length > pageSize ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-outline btn-sm rounded-full"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span className="text-sm font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm rounded-full"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
            </button>
          </div>
        ) : null}

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

import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDifficultyBadgeClass } from "../lib/utils";

function SolvedProblems({ problems = [], isLoading = false }) {
  return (
    <div className="card mt-8 border-2 border-success/20 bg-base-100">
      <div className="card-body">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-success/15 p-2 text-success">
            <CheckCircle2Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Solved Problems</h2>
            <p className="text-sm text-base-content/60">Problems you completed successfully</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="size-9 animate-spin text-primary" />
          </div>
        ) : problems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {problems.map((problem) => (
              <div
                key={problem.problemId}
                className="rounded-lg border border-base-300 bg-base-200/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{problem.title}</h3>
                    <p className="mt-1 text-xs text-base-content/60">
                      Solved{" "}
                      {problem.solvedAt
                        ? formatDistanceToNow(new Date(problem.solvedAt), { addSuffix: true })
                        : "recently"}
                    </p>
                  </div>
                  <span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-base-300 pt-3">
                  <span className="text-xs font-semibold uppercase text-base-content/55">
                    Points earned
                  </span>
                  <span className="font-black text-success">+{Number(problem.pointsEarned || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-base-300 bg-base-200/40 p-8 text-center">
            <p className="font-semibold">No solved problems yet</p>
            <p className="mt-1 text-sm text-base-content/60">Run a correct solution to start tracking progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SolvedProblems;

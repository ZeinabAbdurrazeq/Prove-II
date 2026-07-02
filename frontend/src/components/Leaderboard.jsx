import { AwardIcon, Loader2Icon, TrophyIcon } from "lucide-react";

function Leaderboard({ users = [], isLoading = false, compact = false, currentUserId = "" }) {
  const visibleUsers = compact ? users.slice(0, 5) : users;

  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/15 p-2 text-warning">
              <TrophyIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Leaderboard</h2>
              <p className="text-sm text-base-content/60">Ranked by total score</p>
            </div>
          </div>
          {isLoading ? <Loader2Icon className="size-5 animate-spin text-primary" /> : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-8 animate-spin text-primary" />
          </div>
        ) : visibleUsers.length > 0 ? (
          <div className="space-y-2">
            {visibleUsers.map((user) => {
              const isCurrentUser = currentUserId && user._id === currentUserId;

              return (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                    isCurrentUser
                      ? "border-primary bg-primary/10"
                      : "border-base-300 bg-base-200/40"
                  }`}
                >
                  <div className="flex w-12 shrink-0 items-center gap-2">
                    <AwardIcon className="size-4 text-warning" />
                    <span className="font-black">#{user.rank}</span>
                  </div>

                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-base-300 font-bold">
                      {String(user.name || "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="text-xs text-base-content/60">{user.level || "Entry-Level"}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-primary">{Number(user.score || 0)}</p>
                    <p className="text-xs text-base-content/60">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-base-300 bg-base-200/40 p-8 text-center">
            <p className="font-semibold">No ranking data yet</p>
            <p className="mt-1 text-sm text-base-content/60">Solve problems to start the board.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

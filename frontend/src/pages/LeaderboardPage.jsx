import Navbar from "../components/Navbar";
import Leaderboard from "../components/Leaderboard";
import { useLeaderboard, useMyScoreSummary } from "../hooks/useUsers";

function LeaderboardPage() {
  const { data: leaderboardData, isLoading } = useLeaderboard(100);
  const { data: scoreSummaryData } = useMyScoreSummary();

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-4xl font-black">Leaderboard</h1>
          <p className="mt-2 text-base-content/60">
            Highest total score ranks first. Equal scores share the same rank.
          </p>
        </div>

        <Leaderboard
          users={leaderboardData?.users || []}
          isLoading={isLoading}
          currentUserId={scoreSummaryData?.user?._id}
        />
      </main>
    </div>
  );
}

export default LeaderboardPage;

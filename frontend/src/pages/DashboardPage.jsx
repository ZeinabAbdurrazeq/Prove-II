import { useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import { useLeaderboard, useMyScoreSummary, useMySolvedProblems } from "../hooks/useUsers";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import Leaderboard from "../components/Leaderboard";
import SolvedProblems from "../components/SolvedProblems";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ difficulty: "" });

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();
  const { data: scoreSummaryData } = useMyScoreSummary();
  const { data: solvedProblemsData, isLoading: loadingSolvedProblems } = useMySolvedProblems();
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useLeaderboard(5);

  const handleCreateRoom = () => {
    if (!roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const scoreSummary = scoreSummaryData?.user;
  const solvedProblems = solvedProblemsData?.solvedProblems || [];
  const leaderboardUsers = leaderboardData?.users || [];

  const isUserInSession = (session) => {
    if (!user?.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
              scoreSummary={scoreSummary}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
          <SolvedProblems problems={solvedProblems} isLoading={loadingSolvedProblems} />

          <div className="mt-8">
            <Leaderboard
              users={leaderboardUsers}
              isLoading={loadingLeaderboard}
              compact
              currentUserId={scoreSummary?._id}
            />
          </div>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;

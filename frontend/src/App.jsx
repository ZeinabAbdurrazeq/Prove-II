import { useUser } from "@clerk/react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import SessionPage from "./pages/SessionPage";
import AvailabilitySettingsPage from "./pages/AvailabilitySettingsPage";
import SchedulePage from "./pages/SchedulePage";
import InvitationsPage from "./pages/InvitationsPage";
import PricingPage from "./pages/PricingPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import CvUploadPage from "./pages/CvUploadPage";
import AiInterviewHubPage from "./pages/AiInterviewHubPage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SiteFooter from "./components/SiteFooter";
import NotFoundPage from "./pages/NotFoundPage";

const hideFooterPrefixes = ["/problem/", "/session/", "/ai-interview/session/"];

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) return null;

  const showFooter = !hideFooterPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/leaderboard"
          element={isSignedIn ? <LeaderboardPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/availability/settings"
          element={
            isSignedIn ? <AvailabilitySettingsPage /> : <Navigate to={'/'} />
          }
        />
        <Route
          path="/schedule"
          element={isSignedIn ? <SchedulePage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/invitations"
          element={isSignedIn ? <InvitationsPage /> : <Navigate to={'/'} />}
        />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/subscription"
          element={isSignedIn ? <SubscriptionPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/ai-interview"
          element={isSignedIn ? <AiInterviewHubPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/ai-interview/upload-cv"
          element={isSignedIn ? <CvUploadPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/ai-interview/session/:sessionId"
          element={isSignedIn ? <InterviewPage /> : <Navigate to={'/'} />}
        />
        <Route
          path="/ai-interview/results/:sessionId"
          element={isSignedIn ? <ResultsPage /> : <Navigate to={'/'} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {showFooter ? <SiteFooter /> : null}
      <Toaster />
    </>
  );
}

export default App;

import { useUser } from "@clerk/react";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import SiteFooter from "./components/SiteFooter";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const AvailabilitySettingsPage = lazy(() => import("./pages/AvailabilitySettingsPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const InvitationsPage = lazy(() => import("./pages/InvitationsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const CvUploadPage = lazy(() => import("./pages/CvUploadPage"));
const AiInterviewHubPage = lazy(() => import("./pages/AiInterviewHubPage"));
const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const hideFooterPrefixes = ["/problem/", "/session/", "/ai-interview/session/"];

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100 text-base-content">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) return null;

  const showFooter = !hideFooterPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>

      {showFooter ? <SiteFooter /> : null}
      <Toaster />
    </>
  );
}

export default App;

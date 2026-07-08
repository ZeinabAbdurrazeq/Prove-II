import { useNavigate, useParams } from "react-router";
import {
  Loader2Icon,
  ThumbsUpIcon,
  TargetIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useInterviewResults } from "../hooks/useAiInterview";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

// Color the score ring/badge: green > 7, yellow 5-7, red < 5.
function scoreColor(score) {
  if (score >= 7) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-error";
}

function scoreBadgeClass(percentage) {
  if (percentage >= 70) return "badge-success";
  if (percentage >= 50) return "badge-warning";
  return "badge-error";
}

function ResultsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const { data, isLoading } = useInterviewResults(sessionId);

  const session = data?.session;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-base-content/60">{t("aiInterview.resultsNotFound")}</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate("/ai-interview")}
          >
            {t("aiInterview.backToAIInterview")}
          </button>
        </div>
      </div>
    );
  }

  const overall = Number(session.overallScore || 0); // Out of 100
  const codingScore = Number(session.codingScore || 0); // Out of 21
  const communicationScore = Number(session.communicationScore || 0); // Out of 9
  const aiInterviewScore = overall - codingScore - communicationScore; // Out of 70

  // Helper to color based on percentage
  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return "text-success";
    if (pct >= 50) return "text-warning";
    return "text-error";
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-base-content sm:text-5xl">
            Interview Completed
          </h1>
          <p className="mt-3 text-lg text-base-content/60">
            Great job! Here is the summary of your AI interview performance.
          </p>
        </div>

        {/* OVERALL SCORE & SUMMARY */}
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">
          <div className="grid md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col items-center justify-center border-b border-base-300 bg-base-200/50 p-10 md:border-b-0 md:border-r">
              <div
                className="radial-progress text-4xl font-black shadow-inner"
                style={{
                  "--value": overall,
                  "--size": "11rem",
                  "--thickness": "1rem",
                }}
                role="progressbar"
              >
                <span className={getScoreColor(overall, 100)}>{overall}</span>
              </div>
              <p className="mt-4 text-sm font-bold uppercase tracking-widest text-base-content/60">
                Overall Score
              </p>
            </div>
            
            <div className="p-10">
              <h2 className="text-xl font-bold">AI Summary</h2>
              <p className="ai-message mt-3 leading-relaxed text-base-content/80">
                {session.overallFeedback || "Your responses have been processed and analyzed by Sarah."}
              </p>
              
              {session.recommendation && (
                <div className="mt-6 rounded-2xl bg-primary/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Recommendation
                  </p>
                  <p className="ai-message mt-2 text-sm font-medium text-base-content/90">
                    {session.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DETAILED BREAKDOWN */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { label: "AI Interview", score: aiInterviewScore, max: 70 },
            { label: "Problem Solving", score: codingScore, max: 21 },
            { label: "Communication", score: communicationScore, max: 9 },
          ].map((cat, idx) => {
            const pct = (cat.score / cat.max) * 100;
            return (
              <div key={idx} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                  {cat.label}
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className={`text-3xl font-black ${getScoreColor(cat.score, cat.max)}`}>
                    {cat.score}
                  </span>
                  <span className="mb-1 text-sm font-medium text-base-content/40">/ {cat.max}</span>
                </div>
                <progress className={`progress mt-4 w-full ${scoreBadgeClass(pct).replace('badge', 'progress')}`} value={pct} max="100"></progress>
              </div>
            );
          })}
        </div>

        {/* STRENGTHS / WEAKNESSES */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-base-200 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-success/20 text-success">
                <ThumbsUpIcon className="size-5" />
              </div>
              <h2 className="text-lg font-bold">Strengths</h2>
            </div>
            <div className="mt-6">
              {session.strengths?.length > 0 ? (
                <ul className="space-y-4">
                  {session.strengths.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-base-content/80">
                      <span className="text-success mt-0.5">✦</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-base-content/50">{t("aiInterview.noneRecorded")}</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-base-200 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-warning/20 text-warning">
                <TargetIcon className="size-5" />
              </div>
              <h2 className="text-lg font-bold">Areas to Improve</h2>
            </div>
            <div className="mt-6">
              {session.weaknesses?.length > 0 ? (
                <ul className="space-y-4">
                  {session.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-base-content/80">
                      <span className="text-warning mt-0.5">✦</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-base-content/50">{t("aiInterview.noneRecorded")}</p>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex justify-center pb-12">
          <button
            className="btn btn-primary btn-wide rounded-xl shadow-lg shadow-primary/30 transition-transform hover:scale-105"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;

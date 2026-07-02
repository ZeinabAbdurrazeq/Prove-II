import { MedalIcon, TrophyIcon, UsersIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function StatsCards({ activeSessionsCount, recentSessionsCount, scoreSummary }) {
  const { language } = useLanguage();
  const t = getTranslator(language);
  const score = Number(scoreSummary?.score || 0);
  const rank = scoreSummary?.rank ? `#${scoreSummary.rank}` : "--";

  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      <div className="card border-2 border-warning/20 bg-base-100 hover:border-warning/40">
        <div className="card-body">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-2xl bg-warning/10 p-3">
              <MedalIcon className="h-7 w-7 text-warning" />
            </div>
            <div className="badge badge-warning">{rank}</div>
          </div>
          <div className="text-4xl font-black mb-1">{score}</div>
          <div className="text-sm opacity-60">Total score</div>
        </div>
      </div>

      {/* Active Count */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary">{t("dashboard.liveBadge")}</div>
          </div>
          <div className="text-4xl font-black mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">{t("dashboard.activeSessions")}</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <TrophyIcon className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <div className="text-4xl font-black mb-1">{recentSessionsCount}</div>
          <div className="text-sm opacity-60">{t("dashboard.totalSessions")}</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;

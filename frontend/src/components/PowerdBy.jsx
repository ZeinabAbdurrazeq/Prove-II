import { BrainCircuit, MonitorPlay, Trophy, Video } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const items = [
  { icon: Video, label: "home.poweredVideo" },
  { icon: MonitorPlay, label: "home.poweredWorkspace" },
  { icon: BrainCircuit, label: "home.poweredAi" },
  { icon: Trophy, label: "home.poweredScoring" },
];

function PowerdBy() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-base-300 bg-base-200/50 p-6 sm:p-8">
        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-base-content/50">
          {t("home.poweredBy")}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-center gap-3 rounded-2xl bg-base-100 p-4 text-center shadow-sm rtl:flex-row-reverse">
                <Icon className="size-5 text-primary" />
                <span className="font-semibold">{t(item.label)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PowerdBy;

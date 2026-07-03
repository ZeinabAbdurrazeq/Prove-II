import { Bot, CalendarDays, Code2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const features = [
  { icon: Code2, title: "home.platformCodingTitle", body: "home.platformCodingBody" },
  { icon: Bot, title: "home.platformAiTitle", body: "home.platformAiBody" },
  { icon: CalendarDays, title: "home.platformScheduleTitle", body: "home.platformScheduleBody" },
];

function PowerfulFeatures() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-100 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.platformEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {t("home.platformTitle")}
          </h2>
          <p className="mt-4 leading-8 text-base-content/70">
            {t("home.platformSubtitle")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-2xl border border-base-300 bg-base-200/50 p-5">
                <div className="flex gap-4 rtl:flex-row-reverse">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-black">{t(feature.title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      {t(feature.body)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PowerfulFeatures;

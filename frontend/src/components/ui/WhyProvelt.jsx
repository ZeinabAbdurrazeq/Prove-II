import { Medal, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslator } from "../../lib/translations";

const reasons = [
  { icon: ShieldCheck, title: "home.whyRealTitle", body: "home.whyRealBody" },
  { icon: Sparkles, title: "home.whyAiTitle", body: "home.whyAiBody" },
  { icon: Medal, title: "home.whyProgressTitle", body: "home.whyProgressBody" },
];

function WhyChooseProvelt() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-200 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.whyEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {t("home.whyTitle")}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <article key={reason.title} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                <Icon className="size-8 text-primary" />
                <h3 className="mt-5 text-xl font-black">{t(reason.title)}</h3>
                <p className="mt-3 leading-7 text-base-content/70">{t(reason.body)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseProvelt;

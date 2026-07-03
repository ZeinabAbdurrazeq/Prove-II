import { CheckCircle2, Code2, Users } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslator } from "../../lib/translations";

const steps = [
  { icon: Users, title: "home.workflowChooseTitle", body: "home.workflowChooseBody" },
  { icon: Code2, title: "home.workflowFaceTitle", body: "home.workflowFaceBody" },
  { icon: CheckCircle2, title: "home.workflowProgressTitle", body: "home.workflowProgressBody" },
];

function HowItWorks() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-200 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.workflowEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {t("home.workflowTitle")}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-sm font-black text-base-content/30">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-black">{t(step.title)}</h3>
                <p className="mt-3 leading-7 text-base-content/70">{t(step.body)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

import {
  BotIcon,
  BrainCircuitIcon,
  Code2Icon,
  CompassIcon,
  EyeIcon,
  HandshakeIcon,
  MicIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function AboutPage() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  const proofPoints = [
    t("about.proof1"),
    t("about.proof2"),
    t("about.proof3"),
    t("about.proof4"),
  ];

  const flows = [
    { title: t("about.flow1Title"), body: t("about.flow1Body"), icon: Code2Icon },
    { title: t("about.flow2Title"), body: t("about.flow2Body"), icon: UsersIcon },
    { title: t("about.flow3Title"), body: t("about.flow3Body"), icon: MicIcon },
    { title: t("about.flow4Title"), body: t("about.flow4Body"), icon: BotIcon },
  ];

  const aiFeatures = [
    [t("about.aiFeature1"), BrainCircuitIcon],
    [t("about.aiFeature2"), HandshakeIcon],
    [t("about.aiFeature3"), Code2Icon],
    [t("about.aiFeature4"), CompassIcon],
  ];

  const values = [
    t("about.valuePoint1"),
    t("about.valuePoint2"),
    t("about.valuePoint3"),
    t("about.valuePoint4"),
  ];

  return (
    <div className="min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        <section className="bg-base-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="badge badge-primary badge-lg mb-5">
                {t("about.title")}
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                {t("about.heroTitle")}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-base-content/70">
                {t("about.heroBody")}
              </p>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                {proofPoints.map((item) => (
                  <div key={item} className="rounded-lg bg-base-100 p-4">
                    <p className="text-sm font-bold">{item}</p>
                    <p className="mt-2 text-xs text-base-content/60">
                      {t("about.proofBody")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <TargetIcon className="size-8 text-primary" />
                <h2 className="text-2xl font-black">{t("about.problemTitle")}</h2>
                <p className="leading-relaxed text-base-content/70">
                  {t("about.problemBody")}
                </p>
              </div>
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <EyeIcon className="size-8 text-secondary" />
                <h2 className="text-2xl font-black">{t("about.visionTitle")}</h2>
                <p className="leading-relaxed text-base-content/70">
                  {t("about.visionBody")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 max-w-2xl">
              <div className="badge badge-secondary mb-4">{t("about.flowsBadge")}</div>
              <h2 className="text-3xl font-black md:text-4xl">
                {t("about.flowsTitle")}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {flows.map((flow) => {
                const Icon = flow.icon;
                return (
                  <div
                    key={flow.title}
                    className="card border border-base-300 bg-base-200 shadow-sm"
                  >
                    <div className="card-body">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-black">{flow.title}</h3>
                      <p className="text-sm leading-relaxed text-base-content/70">
                        {flow.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="badge badge-accent mb-4">{t("about.aiBadge")}</div>
            <h2 className="text-3xl font-black md:text-4xl">
              {t("about.aiTitle")}
            </h2>
            <p className="mt-5 leading-relaxed text-base-content/70">
              {t("about.aiBody")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {aiFeatures.map(([label, icon]) => {
              const FeatureIcon = icon;

              return (
                <div key={label} className="rounded-lg bg-base-100 p-5 shadow-sm">
                  <FeatureIcon className="size-6 text-primary" />
                  <p className="mt-3 font-bold">{label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="text-3xl font-black">{t("about.valuesTitle")}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {values.map((value) => (
                <div
                  key={value}
                  className="rounded-lg border border-base-300 bg-base-200 p-5"
                >
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;

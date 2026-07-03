import { Link } from "react-router";
import { SignInButton, useUser } from "@clerk/react";
import {
  ArrowRightIcon,
  BotIcon,
  CheckCircle2Icon,
  Code2Icon,
  MonitorPlayIcon,
  NetworkIcon,
  PlayCircleIcon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
} from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const rotatingWords = [
  "home.rotatingInterviews",
  "home.rotatingCoding",
  "home.rotatingPairPractice",
  "home.rotatingRealtime",
];

const workflowSteps = [
  {
    icon: UsersIcon,
    titleKey: "home.workflowChooseTitle",
    bodyKey: "home.workflowChooseBody",
  },
  {
    icon: VideoIcon,
    titleKey: "home.workflowFaceTitle",
    bodyKey: "home.workflowFaceBody",
  },
  {
    icon: CheckCircle2Icon,
    titleKey: "home.workflowProgressTitle",
    bodyKey: "home.workflowProgressBody",
  },
];

const featureCards = [
  {
    icon: Code2Icon,
    titleKey: "home.platformCodingTitle",
    bodyKey: "home.platformCodingBody",
  },
  {
    icon: BotIcon,
    titleKey: "home.platformAiTitle",
    bodyKey: "home.platformAiBody",
  },
  {
    icon: NetworkIcon,
    titleKey: "home.platformScheduleTitle",
    bodyKey: "home.platformScheduleBody",
  },
];

const testimonials = [
  {
    name: "Mohamed Saad",
    roleKey: "home.testimonialMohamedRole",
    image: "/mohamed-saad.jpeg",
    quoteKey: "home.testimonialMohamedQuote",
  },
  {
    name: "Nour",
    roleKey: "home.testimonialNourRole",
    image: "/nour.jpg",
    quoteKey: "home.testimonialNourQuote",
  },
];

function HomePage() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-300 text-base-content">
      <MarketingNav />

      <main>
        <section className="relative isolate overflow-hidden bg-base-100">
          <div className="absolute inset-0 -z-10 opacity-60">
            <div className="absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-10rem] end-[-6rem] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          </div>

          <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:px-8 lg:py-20">
            <div className="min-w-0 text-center lg:text-start">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-4 py-2 text-sm font-semibold shadow-sm rtl:flex-row-reverse">
                <ZapIcon className="size-4 text-primary" />
                <span>{t("home.badge")}</span>
              </div>

              <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl xl:text-7xl">
                <span>{t("home.heroTitle1")}</span>
                <span className="mt-2 block text-primary">
                  {t("home.heroTitle2")}
                </span>
                <span className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 text-2xl text-base-content/70 sm:text-3xl lg:justify-start rtl:lg:justify-end">
                  <SparklesIcon className="size-6 text-secondary" />
                  <span className="max-w-full break-words rounded-xl border border-base-300 bg-base-200 px-3 py-1 text-primary">
                    {t(rotatingWords[new Date().getSeconds() % rotatingWords.length])}
                  </span>
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-base-content/70 sm:text-lg lg:mx-0">
                {t("home.heroSubtitle")}
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start rtl:lg:justify-end">
                {isSignedIn ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                    {t("home.ctaDashboard")}
                    <ArrowRightIcon className="size-5 rtl:rotate-180" />
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                      {t("home.ctaStart")}
                      <ArrowRightIcon className="size-5 rtl:rotate-180" />
                    </button>
                  </SignInButton>
                )}

                <Link to="/pricing" className="btn btn-outline btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                  <PlayCircleIcon className="size-5" />
                  {t("home.ctaDemo")}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start rtl:lg:justify-end">
                {[t("home.pillVideo"), t("home.pillEditor"), t("home.pillMultiLang")].map((item) => (
                  <span key={item} className="badge badge-lg badge-outline gap-2">
                    <CheckCircle2Icon className="size-4 text-success" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="max-w-full rounded-[2rem] border border-base-300 bg-base-200/80 p-2 shadow-2xl sm:p-3">
                <div className="rounded-[1.5rem] border border-base-300 bg-base-100 p-3 sm:p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{t("home.roomTitle")}</p>
                      <p className="text-xs text-base-content/55">{t("home.roomSubtitle")}</p>
                    </div>
                    <span className="badge badge-success badge-outline">{t("home.roomLive")}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {testimonials.map((person) => (
                      <div key={person.name} className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="h-52 w-full object-cover object-top sm:h-64"
                        />
                        <div className="p-4">
                          <p className="font-bold">{person.name}</p>
                          <p className="text-xs text-base-content/55">{t(person.roleKey)}</p>
                          <p className="mt-3 text-sm leading-6 text-base-content/70">
                            {t(person.quoteKey)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-base-300 bg-base-200 p-4">
                    <div className="flex items-center gap-3 rtl:flex-row-reverse">
                      <MonitorPlayIcon className="size-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold">{t("home.workspaceReadyTitle")}</p>
                        <p className="text-xs text-base-content/60">{t("home.workspaceReadyBody")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              {t("home.workflowEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              {t("home.workflowTitle")}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.titleKey} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-sm font-black text-base-content/30">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black">{t(step.titleKey)}</h3>
                  <p className="mt-3 leading-7 text-base-content/70">{t(step.bodyKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
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
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.titleKey} className="rounded-2xl border border-base-300 bg-base-200/50 p-5">
                      <div className="flex gap-4 rtl:flex-row-reverse">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                          <Icon className="size-5" />
                        </span>
                        <div>
                          <h3 className="font-black">{t(feature.titleKey)}</h3>
                          <p className="mt-2 text-sm leading-6 text-base-content/70">
                            {t(feature.bodyKey)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <div className="stat-value text-primary">10K+</div>
              <div className="stat-title">{t("home.statUsers")}</div>
            </div>
            <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <div className="stat-value text-secondary">50K+</div>
              <div className="stat-title">{t("home.statSessions")}</div>
            </div>
            <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <div className="stat-value text-accent">99.9%</div>
              <div className="stat-title">{t("home.statUptime")}</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black">{t("home.finalCtaTitle")}</h2>
                <p className="mt-3 leading-7 text-base-content/70">
                  {t("home.finalCtaBody")}
                </p>
              </div>
              {isSignedIn ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                  {t("home.ctaDashboard")}
                  <ArrowRightIcon className="size-5 rtl:rotate-180" />
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                    {t("home.ctaStart")}
                    <ArrowRightIcon className="size-5 rtl:rotate-180" />
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;

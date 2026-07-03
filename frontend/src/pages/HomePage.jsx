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
  "Interviews",
  "Coding",
  "Pair Practice",
  "Real-time",
];

const workflowSteps = [
  {
    icon: UsersIcon,
    title: "Choose your mode",
    body: "Practice solo, invite a peer, or rehearse with the AI recruiter when you need a focused interview loop.",
  },
  {
    icon: VideoIcon,
    title: "Work face to face",
    body: "Use live video, chat, and a shared editor so communication and implementation improve together.",
  },
  {
    icon: CheckCircle2Icon,
    title: "Review real progress",
    body: "Track solved problems, sessions, score, rank, and interview feedback from one workspace.",
  },
];

const featureCards = [
  {
    icon: Code2Icon,
    title: "Collaborative coding",
    body: "A shared editor, synced problem choice, language switching, and code execution keep sessions practical.",
  },
  {
    icon: BotIcon,
    title: "AI recruiter",
    body: "CV-aware interview practice helps you rehearse technical and behavioral answers with structured feedback.",
  },
  {
    icon: NetworkIcon,
    title: "Invite and schedule",
    body: "Availability, invitations, notifications, and session links make pairing easier to coordinate.",
  },
];

const testimonials = [
  {
    name: "Mohamed Saad",
    role: "Senior Technical Interviewer",
    image: "/mohamed-saad.jpeg",
    quote:
      "ProveIt turns interview preparation into a real conversation. Candidates practice the skill that matters most: explaining decisions while building.",
  },
  {
    name: "Nour",
    role: "Engineering Career Coach",
    image: "/nour.jpg",
    quote:
      "The mix of live sessions, AI rehearsal, and visible progress gives learners a clear path from practice to confidence.",
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

          <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-8 lg:py-20">
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
                <span className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 text-2xl text-base-content/70 sm:text-3xl lg:justify-start">
                  <SparklesIcon className="size-6 text-secondary" />
                  <span className="rounded-xl border border-base-300 bg-base-200 px-3 py-1 text-primary">
                    {rotatingWords[new Date().getSeconds() % rotatingWords.length]}
                  </span>
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-base-content/70 sm:text-lg lg:mx-0">
                {t("home.heroSubtitle")}
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start rtl:lg:justify-end">
                {isSignedIn ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg gap-2 rtl:flex-row-reverse">
                    {t("home.ctaDashboard")}
                    <ArrowRightIcon className="size-5 rtl:rotate-180" />
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn btn-primary btn-lg gap-2 rtl:flex-row-reverse">
                      {t("home.ctaStart")}
                      <ArrowRightIcon className="size-5 rtl:rotate-180" />
                    </button>
                  </SignInButton>
                )}

                <Link to="/pricing" className="btn btn-outline btn-lg gap-2 rtl:flex-row-reverse">
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
              <div className="rounded-[2rem] border border-base-300 bg-base-200/80 p-3 shadow-2xl">
                <div className="rounded-[1.5rem] border border-base-300 bg-base-100 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">Live interview room</p>
                      <p className="text-xs text-base-content/55">Two people. One shared answer.</p>
                    </div>
                    <span className="badge badge-success badge-outline">Live</span>
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
                          <p className="text-xs text-base-content/55">{person.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-base-300 bg-base-200 p-4">
                    <div className="flex items-center gap-3 rtl:flex-row-reverse">
                      <MonitorPlayIcon className="size-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold">Shared workspace ready</p>
                        <p className="text-xs text-base-content/60">Video, code, chat, problem choice, and execution.</p>
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
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              A calmer way to prepare for technical interviews.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-sm font-black text-base-content/30">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 leading-7 text-base-content/70">{step.body}</p>
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
                  Platform
                </p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Everything needed to prove readiness.
                </h2>
                <p className="mt-4 leading-8 text-base-content/70">
                  ProveIt combines the pieces candidates usually split across tools:
                  live practice, scoring, scheduling, AI interviews, and progress.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-2xl border border-base-300 bg-base-200/50 p-5">
                      <div className="flex gap-4 rtl:flex-row-reverse">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                          <Icon className="size-5" />
                        </span>
                        <div>
                          <h3 className="font-black">{feature.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-base-content/70">
                            {feature.body}
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
                <h2 className="text-3xl font-black">Ready to practice with evidence?</h2>
                <p className="mt-3 leading-7 text-base-content/70">
                  Start with a live session, solve a problem, or rehearse your next interview with AI.
                </p>
              </div>
              {isSignedIn ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg gap-2 rtl:flex-row-reverse">
                  {t("home.ctaDashboard")}
                  <ArrowRightIcon className="size-5 rtl:rotate-180" />
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-lg gap-2 rtl:flex-row-reverse">
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

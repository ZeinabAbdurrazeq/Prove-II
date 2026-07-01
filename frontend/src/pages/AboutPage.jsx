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

const flows = [
  {
    title: "Solo Problem Solving",
    body: "Practice focused coding problems independently, build fluency, and review your own reasoning before a real interview.",
    icon: Code2Icon,
  },
  {
    title: "Peer Collaboration",
    body: "Work with another developer in live sessions so communication, trade-offs, and teamwork become part of your practice.",
    icon: UsersIcon,
  },
  {
    title: "Mock Interview with Senior",
    body: "Simulate a higher-pressure interview format with a human interviewer and structured feedback.",
    icon: MicIcon,
  },
  {
    title: "AI Interviewer Agent",
    body: "Meet Zara, the AI recruiter agent that reviews your CV, asks staged questions, adapts follow-ups, and prepares feedback.",
    icon: BotIcon,
  },
];

const values = [
  "Practice should feel realistic, not theoretical.",
  "Feedback should be specific enough to act on.",
  "Candidates should improve through repetition and reflection.",
  "Interview readiness is technical, behavioral, and communicative.",
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        <section className="bg-base-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="badge badge-primary badge-lg mb-5">
                About ProveIt
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                A realistic interview practice platform for developers.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-base-content/70">
                ProveIt helps candidates practice the full technical interview
                journey: solving problems, collaborating live, rehearsing with
                humans, and preparing with an AI recruiter that keeps the
                interview structured and role-aware.
              </p>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                {["CV-aware", "Live coding", "Peer practice", "AI feedback"].map(
                  (item) => (
                    <div key={item} className="rounded-lg bg-base-100 p-4">
                      <p className="text-sm font-bold">{item}</p>
                      <p className="mt-2 text-xs text-base-content/60">
                        Built for repeated, realistic preparation.
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <TargetIcon className="size-8 text-primary" />
                <h2 className="text-2xl font-black">The Problem</h2>
                <p className="leading-relaxed text-base-content/70">
                  Many developers prepare alone, then struggle when the
                  interview requires communication, pressure management, live
                  collaboration, and clear stories from their own experience.
                </p>
              </div>
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <EyeIcon className="size-8 text-secondary" />
                <h2 className="text-2xl font-black">The Vision</h2>
                <p className="leading-relaxed text-base-content/70">
                  ProveIt turns interview preparation into a complete practice
                  loop where technical depth, collaboration, and recruiter-style
                  feedback reinforce each other.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 max-w-2xl">
              <div className="badge badge-secondary mb-4">Four flows</div>
              <h2 className="text-3xl font-black md:text-4xl">
                Practice the way real interviews actually happen.
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
            <div className="badge badge-accent mb-4">AI Recruiter Agent</div>
            <h2 className="text-3xl font-black md:text-4xl">
              Zara makes AI practice feel structured, focused, and fair.
            </h2>
            <p className="mt-5 leading-relaxed text-base-content/70">
              The AI interviewer reviews the candidate profile, asks one
              question at a time, adapts follow-ups when answers are vague, and
              ends with actionable feedback and a readiness recommendation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["CV understanding", BrainCircuitIcon],
              ["Behavioral signals", HandshakeIcon],
              ["Role-based technical depth", Code2Icon],
              ["Readiness recommendation", CompassIcon],
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-lg bg-base-100 p-5 shadow-sm">
                <Icon className="size-6 text-primary" />
                <p className="mt-3 font-bold">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="text-3xl font-black">What makes ProveIt different</h2>
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

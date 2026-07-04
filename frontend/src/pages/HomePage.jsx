import { Link } from "react-router";
import { SignInButton, useUser } from "@clerk/react";
import { lazy, Suspense } from "react";
import { Zap } from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const GetStarted = lazy(() => import("../components/GetStarted"));
const MagicRings = lazy(() => import("../components/lib-componetns/MagicRings"));
const PowerdBy = lazy(() => import("../components/PowerdBy"));
const PowerfulFeatures = lazy(() => import("../components/PowerfullFeature"));
const RotatingText = lazy(() => import("../components/lib-componetns/RotatingText"));
const TestimonialsSection = lazy(() => import("../components/Testmonials"));
const HowItWorks = lazy(() => import("../components/ui/howItWorks"));
const WhyChooseProvelt = lazy(() => import("../components/ui/WhyProvelt"));

function SectionFallback() {
  return <div className="min-h-32 bg-base-100" aria-hidden="true" />;
}

function HomePage() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <>
      <MarketingNav />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-4 py-20 text-base-content sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-35">
          <Suspense fallback={<div className="h-full w-full bg-primary/5" />}>
            <MagicRings
              color="#5E81AC"
              colorTwo="#88C0D0"
              speed={0.85}
              ringCount={8}
              attenuation={9}
              lineThickness={2.4}
              baseRadius={0.35}
              radiusStep={0.15}
              scaleRate={0.11}
              opacity={4}
              blur={0.12}
              noiseAmount={0.04}
              rotation={0.25}
              ringGap={1.3}
              fadeIn={0.95}
              fadeOut={0.75}
              followMouse
              mouseInfluence={0.22}
              hoverScale={1.25}
              parallax={0.06}
              clickBurst
            />
          </Suspense>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-1.5 shadow-sm sm:px-4 rtl:flex-row-reverse">
            <Zap className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 break-words text-xs font-medium text-base-content/70 sm:text-sm">
              {t("home.badgeText")}
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-normal text-base-content sm:text-5xl md:text-6xl lg:text-7xl">
            {t("home.heroTitleMain")}{" "}
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 text-primary">
              {t("home.heroTitleSpan")}

              <Suspense
                fallback={
                  <span className="rounded-lg border border-base-300 bg-base-200 px-3 py-1 text-primary">
                    {t("home.rotating.interviews")}
                  </span>
                }
              >
                <RotatingText
                  texts={[
                    t("home.rotating.interviews"),
                    t("home.rotating.coding"),
                    t("home.rotating.pair"),
                    t("home.rotating.realtime"),
                  ]}
                  mainClassName="rounded-lg border border-base-300 bg-base-200 px-3 py-1 text-primary overflow-hidden"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.02}
                  splitLevelClassName="overflow-hidden"
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                  rotationInterval={2200}
                  splitBy={language === "ar" ? "words" : "characters"}
                  auto
                  loop
                />
              </Suspense>
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl px-2 text-base leading-relaxed text-base-content/70 sm:text-lg md:text-xl">
            {t("home.heroDesc")}
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="btn btn-primary btn-lg min-h-12 w-full gap-2 whitespace-normal sm:w-auto"
              >
                {t("home.btnDashboard")}
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg min-h-12 w-full gap-2 whitespace-normal sm:w-auto">
                  {t("home.btnStart")}
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </section>

      <Suspense fallback={<SectionFallback />}>
        <HowItWorks />
        <PowerfulFeatures />
        <WhyChooseProvelt />
        <PowerdBy />
        <TestimonialsSection />
        <GetStarted />
      </Suspense>
    </>
  );
}

export default HomePage;

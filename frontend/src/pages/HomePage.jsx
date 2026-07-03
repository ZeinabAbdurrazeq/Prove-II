import { Link } from "react-router";
import { SignInButton, useUser } from "@clerk/react";
import { ArrowRight, PlayCircle, Zap } from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import GetStarted from "../components/GetStarted";
import MagicRings from "../components/lib-componetns/MagicRings";
import RotatingText from "../components/lib-componetns/RotatingText";
import PowerdBy from "../components/PowerdBy";
import PowerfulFeatures from "../components/PowerfullFeature";
import SiteFooter from "../components/SiteFooter";
import TestimonialsSection from "../components/Testmonials";
import HowItWorks from "../components/ui/howItWorks";
import WhyChooseProvelt from "../components/ui/WhyProvelt";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function HomePage() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <>
      <MarketingNav />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-4 py-20 text-base-content sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-35">
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
                splitBy="characters"
                auto
                loop
              />
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl px-2 text-base leading-relaxed text-base-content/70 sm:text-lg md:text-xl">
            {t("home.heroDesc")}
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="btn btn-primary btn-lg min-h-12 w-full gap-2 whitespace-normal sm:w-auto rtl:flex-row-reverse"
              >
                {t("home.btnDashboard")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg min-h-12 w-full gap-2 whitespace-normal sm:w-auto rtl:flex-row-reverse">
                  {t("home.btnStart")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </button>
              </SignInButton>
            )}

            <Link
              to="/pricing"
              className="btn btn-outline btn-lg min-h-12 w-full gap-2 whitespace-normal sm:w-auto rtl:flex-row-reverse"
            >
              <PlayCircle className="size-5 text-primary" />
              {t("home.btnWatchDemo")}
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />
      <PowerfulFeatures />
      <WhyChooseProvelt />
      <PowerdBy />
      <TestimonialsSection />
      <GetStarted />
      <SiteFooter />
    </>
  );
}

export default HomePage;

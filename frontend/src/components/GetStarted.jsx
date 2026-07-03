import { SignInButton, useUser } from "@clerk/react";
import { Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function GetStarted() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  const cta = isSignedIn ? (
    <Link to="/dashboard" className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90">
      {t("home.btnDashboard")}
    </Link>
  ) : (
    <SignInButton mode="modal">
      <button className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90">
        {t("home.getStarted.btn")}
      </button>
    </SignInButton>
  );

  return (
    <section className="w-full bg-base-100 px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-r from-primary via-secondary to-accent px-6 py-16 text-center text-primary-content shadow-xl sm:px-8 sm:py-20">
        <div className="absolute -start-20 -top-20 size-64 rounded-full bg-base-100/10 blur-3xl" />
        <div className="absolute -bottom-20 -end-20 size-64 rounded-full bg-base-100/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            {t("home.getStarted.title")}
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-85">
            {t("home.getStarted.subtitle")}
          </p>

          <div className="mt-10">{cta}</div>
        </div>
      </div>
    </section>
  );
}

export default GetStarted;

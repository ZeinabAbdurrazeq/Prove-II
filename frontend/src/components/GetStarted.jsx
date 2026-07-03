import { SignInButton, useUser } from "@clerk/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function GetStarted() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-100 px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <h2 className="text-3xl font-black">{t("home.finalCtaTitle")}</h2>
            <p className="mt-3 leading-7 text-base-content/70">{t("home.finalCtaBody")}</p>
          </div>

          {isSignedIn ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
              {t("home.btnDashboard")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-lg min-h-12 gap-2 whitespace-normal rtl:flex-row-reverse">
                {t("home.btnStart")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}

export default GetStarted;

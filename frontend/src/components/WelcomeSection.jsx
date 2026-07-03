import { useUser } from "@clerk/react";
import { SparklesIcon, ZapIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-6 lg:py-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-base-300/70 bg-base-100/70 p-5 shadow-sm backdrop-blur sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-3xl text-center lg:text-left rtl:lg:text-right">
            <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center lg:justify-start rtl:sm:flex-row-reverse">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                <SparklesIcon className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t("dashboard.welcomeBack").replace(
                  "{name}",
                  user?.firstName || t("dashboard.there"),
                )}
              </h1>
            </div>
            <p className="mx-auto max-w-2xl text-base text-base-content/60 sm:text-lg lg:mx-0">
              {t("dashboard.ready")}
            </p>
          </div>

          <button
            onClick={onCreateSession}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-4 text-base font-bold text-white transition-all duration-200 hover:opacity-90 sm:w-auto sm:px-8 lg:px-10"
          >
            <ZapIcon className="size-5 shrink-0 sm:size-6" />
            <span>{t("dashboard.createSession")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;

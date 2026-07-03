import { ListChecks, SquarePlus, SquareTerminal, Video } from "lucide-react";
import { createElement } from "react";
import AnimatedContent from "../lib-componetns/AnimatedContent";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslator } from "../../lib/translations";

function HowItWorks() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  const steps = [
    {
      icon: SquarePlus,
      title: t("home.howItWorks.step1.title"),
      description: t("home.howItWorks.step1.desc"),
    },
    {
      icon: Video,
      title: t("home.howItWorks.step2.title"),
      description: t("home.howItWorks.step2.desc"),
    },
    {
      icon: SquareTerminal,
      title: t("home.howItWorks.step3.title"),
      description: t("home.howItWorks.step3.desc"),
    },
    {
      icon: ListChecks,
      title: t("home.howItWorks.step4.title"),
      description: t("home.howItWorks.step4.desc"),
    },
  ];

  return (
    <section className="bg-base-100 px-4 py-20 text-base-content sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <AnimatedContent delay={0.1}>
          <h2 className="mb-4 text-4xl font-extrabold tracking-normal md:text-5xl">
            {t("home.howItWorks.title")}{" "}
            <span className="text-primary">{t("home.howItWorks.span")}</span>
          </h2>
        </AnimatedContent>

        <AnimatedContent delay={0.2}>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-base-content/70 md:mb-20">
            {t("home.howItWorks.subtitle")}
          </p>
        </AnimatedContent>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <AnimatedContent key={title} delay={0.25 + index * 0.12}>
              <article className="group flex h-full flex-col items-center rounded-2xl border border-base-300 bg-base-200/60 p-6 text-center transition-colors duration-300 hover:bg-base-200">
                <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-base-300 bg-base-100">
                  {createElement(Icon, {
                    className: "size-7 text-primary",
                    strokeWidth: 1.7,
                  })}
                </div>

                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                <p className="max-w-[260px] leading-relaxed text-base-content/70">
                  {description}
                </p>
              </article>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

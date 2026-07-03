import AnimatedContent from "../lib-componetns/AnimatedContent";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslator } from "../../lib/translations";

function WhyChooseProvelt() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  const features = [
    {
      title: t("home.why.speed.title"),
      description: t("home.why.speed.desc"),
    },
    {
      title: t("home.why.remote.title"),
      description: t("home.why.remote.desc"),
    },
    {
      title: t("home.why.security.title"),
      description: t("home.why.security.desc"),
    },
    {
      title: t("home.why.teams.title"),
      description: t("home.why.teams.desc"),
    },
  ];

  return (
    <section className="bg-base-100 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
        <div className="w-full lg:w-[360px]">
          <AnimatedContent delay={0.1}>
            <h2 className="text-4xl font-bold leading-tight text-base-content md:text-5xl">
              {t("home.why.title")}{" "}
              <span className="text-primary">{t("home.why.span")}</span>?
            </h2>
          </AnimatedContent>

          <AnimatedContent delay={0.2}>
            <p className="mt-5 text-lg leading-relaxed text-base-content/70">
              {t("home.why.subtitle")}
            </p>
          </AnimatedContent>

          <AnimatedContent delay={0.3}>
            <a
              href="/blog"
              className="mt-7 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {t("home.why.docLink")}
            </a>
          </AnimatedContent>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {features.map((feature, index) => (
            <AnimatedContent key={feature.title} delay={0.2 + index * 0.1}>
              <article className="group relative min-h-[220px] overflow-hidden rounded-3xl border border-base-300 bg-base-200/70 p-8 sm:p-10">
                <div className="absolute inset-y-0 start-0 w-1 rounded-s-3xl bg-primary" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-primary/5 opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <h3 className="mb-3 text-xl font-bold text-base-content">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-base-content/70">
                    {feature.description}
                  </p>
                </div>
              </article>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseProvelt;

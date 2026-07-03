import { Lock, MonitorSmartphone, User } from "lucide-react";
import { createElement } from "react";
import { IoTerminal } from "react-icons/io5";
import { LuMonitorUp } from "react-icons/lu";
import { RiRecordCircleLine } from "react-icons/ri";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function PowerfulFeatures() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-100 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center md:mb-16">
          <h2 className="text-4xl font-bold tracking-normal text-base-content md:text-5xl">
            {t("home.features.title")}{" "}
            <span className="text-primary">{t("home.features.span")}</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-base-content/70">
            {t("home.features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          <article className="flex flex-col justify-between gap-6 rounded-3xl border border-base-300 bg-base-200/70 p-5 transition-colors duration-300 hover:border-primary/30 sm:p-6 lg:p-8 xl:col-span-2 xl:flex-row xl:gap-10">
            <div className="max-w-full xl:max-w-md">
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 sm:mb-8 sm:size-16">
                <IoTerminal className="size-7 text-primary sm:size-9" />
              </div>

              <h3 className="mb-4 text-2xl font-bold text-base-content sm:text-3xl lg:text-4xl">
                {t("home.features.editor.title")}
              </h3>

              <p className="mb-8 text-base leading-relaxed text-base-content/70 sm:text-lg lg:text-xl">
                {t("home.features.editor.desc")}
              </p>

              <div className="flex flex-wrap gap-3">
                {["Python", "JavaScript", "Go"].map((lang) => (
                  <span
                    key={lang}
                    className="rounded-lg border border-base-300 bg-base-100 px-3 py-1.5 text-sm font-medium text-base-content"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full flex-1 self-start overflow-hidden rounded-2xl border border-base-300 bg-base-100">
              <div className="flex items-center gap-3 border-b border-base-300 bg-base-200 px-4 py-4 sm:px-5">
                <div className="size-3 rounded-full bg-error" />
                <div className="size-3 rounded-full bg-warning" />
                <div className="size-3 rounded-full bg-success" />
              </div>

              <div className="overflow-x-auto whitespace-nowrap p-3 font-mono text-xs leading-7 text-base-content sm:p-5 sm:text-sm sm:leading-8 lg:text-[15px] lg:leading-9">
                <div>
                  <span className="me-4 opacity-40">1</span>
                  <span className="text-primary">function</span>{" "}
                  <span className="text-secondary">solveProblem</span>(arr) {"{"}
                </div>
                <div>
                  <span className="me-4 opacity-40">2</span>
                  <span className="ms-4 text-primary">const</span> result =
                  arr.<span className="text-secondary">map</span>(x =&gt; x * 2);
                </div>
                <div>
                  <span className="me-4 opacity-40">3</span>
                  <span className="ms-4 text-accent">return</span> result;
                </div>
                <div>
                  <span className="me-4 opacity-40">4</span>
                  <span className="ms-4">{"}"}</span>
                </div>
                <div className="-mx-3 border-s-2 border-primary bg-base-200 px-3 sm:-mx-5 sm:px-5">
                  <span className="me-4 opacity-40">5</span>
                  console.<span className="text-secondary">log</span>(
                  <span className="text-success">"Success!"</span>);
                </div>
              </div>
            </div>
          </article>

          <FeatureCard
            icon={MonitorSmartphone}
            title={t("home.features.video.title")}
            body={t("home.features.video.desc")}
          >
            <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
              <div className="flex aspect-video items-center justify-center rounded-xl border border-base-300 bg-base-100">
                <User className="size-8 text-primary sm:size-10" />
              </div>
              <div className="flex aspect-video items-center justify-center rounded-xl border border-base-300 bg-base-100">
                <User className="size-8 text-primary sm:size-10" />
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={Lock}
            title={t("home.features.auth.title")}
            body={t("home.features.auth.desc")}
          />
          <FeatureCard
            icon={LuMonitorUp}
            title={t("home.features.sharing.title")}
            body={t("home.features.sharing.desc")}
          />
          <FeatureCard
            icon={RiRecordCircleLine}
            title={t("home.features.recording.title")}
            body={t("home.features.recording.desc")}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, body, children }) {
  return (
    <article className="rounded-3xl border border-base-300 bg-base-200/70 p-5 transition-colors duration-300 hover:border-primary/30 sm:p-6 lg:p-8">
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 sm:mb-8 sm:size-16">
        {createElement(Icon, { className: "size-7 text-primary sm:size-8" })}
      </div>

      <h3 className="mb-4 text-2xl font-bold text-base-content sm:text-3xl">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-base-content/70 sm:text-lg">
        {body}
      </p>
      {children}
    </article>
  );
}

export default PowerfulFeatures;

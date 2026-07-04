import { FaDatabase, FaNodeJs, FaReact } from "react-icons/fa";
import { SiExpress, SiSocketdotio, SiTailwindcss } from "react-icons/si";
import { createElement } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const techs = [
  { icon: FaReact, label: "React.js" },
  { icon: FaNodeJs, label: "Node.js" },
  { icon: FaDatabase, label: "MongoDB" },
  { icon: SiTailwindcss, label: "TailwindCSS" },
  { icon: SiExpress, label: "Express.js" },
  { icon: SiSocketdotio, label: "Socket.io" },
];

function PowerdBy() {
  const { language } = useLanguage();
  const t = getTranslator(language);
  const marqueeSet = [...techs, ...techs, ...techs];
  const marqueeRows = [marqueeSet, marqueeSet];

  return (
    <section className="overflow-hidden bg-base-200 px-4 py-16 text-center sm:px-6">
      <p className="mb-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/60">
        {t("home.powered.title")}
      </p>

      <div className="relative w-full overflow-hidden" dir="ltr">
        <div className="powerdby-scroll flex w-max">
          {marqueeRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex shrink-0 gap-10 pr-10 sm:gap-14 sm:pr-14"
              aria-hidden={rowIndex > 0}
            >
              {row.map(({ icon: Icon, label }) => (
                <div
                  key={`${label}-${rowIndex}`}
                  className="group flex items-center gap-3 text-base font-semibold text-base-content"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl border border-base-300 bg-base-100 text-primary transition-all duration-300 group-hover:border-primary">
                    {createElement(Icon, { size: 20 })}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PowerdBy;

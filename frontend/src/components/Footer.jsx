import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  const links = {
    [t("home.footer.col1")]: [
      t("home.footer.col1.item1"),
      t("home.footer.col1.item2"),
      t("home.footer.col1.item3"),
    ],
    [t("home.footer.col2")]: [
      t("home.footer.col2.item1"),
      t("home.footer.col2.item2"),
      t("home.footer.col2.item3"),
    ],
    [t("home.footer.col3")]: [
      t("home.footer.col3.item1"),
      t("home.footer.col3.item2"),
      t("home.footer.col3.item3"),
    ],
  };

  return (
    <footer className="border-t border-[#D8DEE9] bg-[#d8dbe0]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E81AC] shadow-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4L1 7L4 10M10 4L13 7L10 10M8 2L6 12"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="text-xl font-bold text-[#2E3440]">ProveIt</span>
          </div>

          <p className="leading-7 text-[#4C566A]">{t("home.footer.desc")}</p>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#2E3440]">
                {title}
              </h3>

              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#4C566A] transition-colors duration-200 hover:text-[#5E81AC]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#D8DEE9]">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-6 text-sm text-[#4C566A]">
          <p>{t("home.footer.copy")}</p>
        </div>
      </div>
    </footer>
  );
}

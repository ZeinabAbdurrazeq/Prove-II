import React from "react";
import { PaletteIcon, CheckIcon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";
import ThemePreview from "./ThemePreview";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const { language } = useLanguage();
  const t = getTranslator(language);

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm gap-1.5 rounded-xl px-2 text-base-content/70 hover:text-base-content md:px-2.5"
        aria-label={t("nav.theme") || "Theme"}
      >
        <PaletteIcon className="size-4 text-base-content/70" />
        <span className="hidden sm:inline text-sm font-semibold capitalize">
          {t(`theme.${theme}`) || theme}
        </span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-2xl bg-base-200 border border-base-300/80 rounded-2xl w-56 z-[100] mt-1 gap-1 max-h-96 overflow-y-auto flex-nowrap"
      >
        <div className="px-3 py-1.5 text-xs font-bold text-base-content/50 border-b border-base-300/40 mb-1">
          {t("nav.theme") || "Theme"}
        </div>
        {themes.map((tItem) => {
          const isActive = tItem.id === theme;
          return (
            <li key={tItem.id}>
              <button
                type="button"
                onClick={() => handleThemeSelect(tItem.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                    : "text-base-content/80 hover:bg-base-300/60 hover:text-base-content"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="size-4 shrink-0 flex items-center justify-center">
                    {isActive && <CheckIcon className="size-4 text-primary" />}
                  </div>
                  <span className="capitalize">{t(tItem.labelKey) || tItem.id}</span>
                </div>
                <ThemePreview themeId={tItem.id} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ThemeSwitcher;

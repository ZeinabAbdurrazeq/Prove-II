import { createContext, useEffect, useState } from "react";
import { THEMES } from "../lib/themes";

export const ThemeContext = createContext(null);
const STORAGE_KEY = "provelt-theme";
const DEFAULT_THEME = "proveit";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((t) => t.id === stored)) {
        return stored;
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
    return DEFAULT_THEME;
  });

  const setTheme = (newTheme) => {
    if (THEMES.some((t) => t.id === newTheme)) {
      setThemeState(newTheme);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Ignore localStorage write errors
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;

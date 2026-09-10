// ThemeContext.jsx
// Centralized dark/light theme state. Applies `data-theme` on
// <html> (so the CSS variables in src/styles/theme.css cascade to
// the whole app) and persists the choice in localStorage. Dark
// remains the default/current design if nothing is stored yet or
// localStorage is unavailable for any reason.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "ronika-portfolio:theme";
const DEFAULT_THEME = "dark";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  toggleTheme: () => {},
  setTheme: () => {},
});

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function applyThemeToDocument(theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = readStoredTheme();
    const initial = stored || DEFAULT_THEME;
    applyThemeToDocument(initial);
    return initial;
  });

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable (e.g. private browsing) — theme
         still works for this session, it just won't persist. */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}

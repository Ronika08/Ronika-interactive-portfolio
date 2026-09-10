// ThemeToggle.jsx
// Small, always-visible global control that switches the whole
// portfolio between the existing dark "Obsidian Glass" theme and a
// new light theme. Fixed to the viewport so it works identically on
// every section, on desktop and mobile, without altering any
// existing page layout.

import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={!isDark}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="theme-toggle__label">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

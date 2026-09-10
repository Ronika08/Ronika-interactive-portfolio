// AdminPage.jsx
//
// Portfolio Manager / Content Manager — reachable only by typing
// /admin directly in the address bar (never linked from the public
// site). Lets the portfolio owner add/edit/delete content from the
// browser without touching source files, persisted to localStorage.
//
// IMPORTANT — READ BEFORE RELYING ON THIS FOR "SECURITY":
// The gate below is a LOCAL CONVENIENCE GATE ONLY. It is NOT real
// authentication. It does not protect the source code, the
// localStorage data (anyone with access to this browser profile can
// read it via devtools), or prevent someone from finding /admin and
// setting their own local passcode on their own browser (which only
// affects their own browser's local override, never the original
// portfolio content shipped to every other visitor). Its only job is
// to avoid an accidental drive-by click into edit mode. Swap this
// for real auth (e.g. Supabase Auth) before treating this as
// protecting anything sensitive.

import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import ProfileTab from "./tabs/ProfileTab";
import SkillsTab from "./tabs/SkillsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import AchievementsTab from "./tabs/AchievementsTab";
import CertificatesTab from "./tabs/CertificatesTab";
import ResumeTab from "./tabs/ResumeTab";
import SettingsTab from "./tabs/SettingsTab";
import { ORIGINALS } from "./adminOriginals";
import "./AdminPage.css";

const GATE_KEY = "ronika-portfolio:admin-passcode";

const TABS = [
  { id: "profile", label: "Profile / About", icon: "👤" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "achievements", label: "Achievements", icon: "🏆" },
  { id: "certificates", label: "Certificates", icon: "📜" },
  { id: "resume", label: "Resume", icon: "📄" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function OwnerGate({ onUnlock }) {
  const hasPasscode = (() => {
    try {
      return Boolean(window.localStorage.getItem(GATE_KEY));
    } catch {
      return false;
    }
  })();

  const [mode] = useState(hasPasscode ? "unlock" : "setup");
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState("");

  const handleSetup = (e) => {
    e.preventDefault();
    if (value.trim().length < 4) {
      setError("Choose at least 4 characters — this is just to keep casual visitors out.");
      return;
    }
    if (value !== confirmValue) {
      setError("Those don't match. Try again.");
      return;
    }
    try {
      window.localStorage.setItem(GATE_KEY, value);
      onUnlock();
    } catch {
      setError("Could not save a local passcode (local storage may be disabled). Continuing without a gate.");
      onUnlock();
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    let stored;
    try {
      stored = window.localStorage.getItem(GATE_KEY) || "";
    } catch {
      onUnlock();
      return;
    }
    if (value === stored) {
      onUnlock();
    } else {
      setError("That's not the right passcode for this browser.");
    }
  };

  return (
    <div className="am-gate">
      <div className="am-gate__card">
        <h1 className="am-gate__title">Portfolio Manager</h1>
        <p className="am-gate__notice">
          This is a <strong>local convenience gate only</strong> — not real authentication. It just
          keeps this editor from opening by accident. Anyone with access to this browser profile
          can still read the underlying local storage. Do not rely on this for anything sensitive.
        </p>

        {mode === "setup" ? (
          <form onSubmit={handleSetup} className="am-gate__form">
            <p className="am-gate__hint">No local passcode is set on this browser yet. Choose one now.</p>
            <label className="am-field">
              <span>New passcode</span>
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </label>
            <label className="am-field">
              <span>Confirm passcode</span>
              <input
                type="password"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
              />
            </label>
            {error && <p className="am-gate__error">{error}</p>}
            <button type="submit" className="am-btn am-btn--primary">Set passcode &amp; continue</button>
          </form>
        ) : (
          <form onSubmit={handleUnlock} className="am-gate__form">
            <label className="am-field">
              <span>Passcode</span>
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </label>
            {error && <p className="am-gate__error">{error}</p>}
            <button type="submit" className="am-btn am-btn--primary">Unlock</button>
          </form>
        )}

        <a className="am-gate__back" href="/">← Back to portfolio</a>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { theme } = useTheme();

  useEffect(() => {
    document.title = unlocked ? "Portfolio Manager — Ronika S" : "Portfolio Manager (locked)";
  }, [unlocked]);

  if (!unlocked) {
    return <OwnerGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="am-shell" data-theme={theme}>
      <header className="am-header">
        <div>
          <h1 className="am-header__title">Portfolio Manager</h1>
          <p className="am-header__subtitle">Local, browser-only content editor · not connected to a live backend</p>
        </div>
        <a className="am-btn am-btn--ghost" href="/">← Back to portfolio</a>
      </header>

      <nav className="am-tabs" aria-label="Portfolio Manager sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`am-tab${activeTab === tab.id ? " am-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
          >
            <span aria-hidden="true">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      <main className="am-content">
        {activeTab === "profile" && <ProfileTab original={ORIGINALS.profile} />}
        {activeTab === "skills" && <SkillsTab original={ORIGINALS.skills} />}
        {activeTab === "projects" && <ProjectsTab original={ORIGINALS.projects} />}
        {activeTab === "achievements" && <AchievementsTab original={ORIGINALS.achievements} />}
        {activeTab === "certificates" && <CertificatesTab original={ORIGINALS.certificates} />}
        {activeTab === "resume" && <ResumeTab original={ORIGINALS.resume} />}
        {activeTab === "settings" && <SettingsTab originals={ORIGINALS} />}
      </main>
    </div>
  );
}

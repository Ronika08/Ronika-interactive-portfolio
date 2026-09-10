import { useRef, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { exportAllData, importAllData, resetAllOverrides } from "../../../utils/portfolioStorage";

export default function SettingsTab({ originals }) {
  const { theme, setTheme } = useTheme();
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const payload = exportAllData(originals);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ronika-portfolio-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus({ type: "success", message: "Export downloaded." });
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!window.confirm("Importing will overwrite your current local edits for every section included in this file. Continue?")) {
        e.target.value = "";
        return;
      }
      const result = importAllData(parsed);
      if (result.ok) {
        setStatus({ type: "success", message: `Imported: ${result.importedDomains.join(", ")}. Reload the portfolio to see the changes.` });
      } else {
        setStatus({ type: "error", message: result.error });
      }
    } catch {
      setStatus({ type: "error", message: "That file isn't valid JSON." });
    } finally {
      e.target.value = "";
    }
  };

  const handleResetAll = () => {
    if (!window.confirm("Reset ALL sections (Profile, Skills, Projects, Achievements, Certificates, Resume) to their original shipped content? This discards every local edit.")) return;
    resetAllOverrides();
    setStatus({ type: "success", message: "All sections reset to original content." });
  };

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Settings</h2>
          <p className="am-panel__desc">Theme, backup/restore, and reset for the whole Portfolio Manager.</p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      <div className="am-field">
        <span>Theme</span>
        <div className="am-row" style={{ marginTop: 0 }}>
          <button type="button" className={`am-btn${theme === "dark" ? " am-btn--primary" : ""}`} onClick={() => setTheme("dark")}>🌙 Dark</button>
          <button type="button" className={`am-btn${theme === "light" ? " am-btn--primary" : ""}`} onClick={() => setTheme("light")}>☀️ Light</button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--glass-border, rgba(255,255,255,0.08))", margin: "20px 0" }} />

      <h3 className="am-panel__title" style={{ fontSize: "0.95rem" }}>Export portfolio data</h3>
      <p className="am-panel__desc" style={{ marginBottom: 10 }}>
        Downloads a single JSON file with the current effective content for every section (your local edits where
        present, the original shipped content otherwise). Use this as a backup, or to move your edits to another browser.
      </p>
      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={handleExport}>⬇ Export JSON</button>
      </div>

      <h3 className="am-panel__title" style={{ fontSize: "0.95rem", marginTop: 20 }}>Import portfolio data</h3>
      <p className="am-panel__desc" style={{ marginBottom: 10 }}>
        Restores content from a previously exported JSON file. The file is validated before anything is applied —
        if any section fails validation, nothing is imported.
      </p>
      <div className="am-row">
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} />
      </div>

      <h3 className="am-panel__title" style={{ fontSize: "0.95rem", marginTop: 20 }}>Reset everything</h3>
      <p className="am-panel__desc" style={{ marginBottom: 10 }}>
        Clears every local override in this browser and restores the original shipped portfolio content.
      </p>
      <div className="am-row">
        <button type="button" className="am-btn am-btn--danger" onClick={handleResetAll}>↺ Reset all sections to original</button>
      </div>
    </div>
  );
}

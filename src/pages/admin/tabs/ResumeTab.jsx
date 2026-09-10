import { useState } from "react";
import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

export default function ResumeTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.RESUME, original);
  const [localFile, setLocalFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Resume</h2>
          <p className="am-panel__desc">
            The live Resume section will use this path.
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      <label className="am-field">
        <span>Current public resume path</span>
        <input
          type="text"
          value={data.resumePath || ""}
          onChange={(e) => setData((prev) => ({ ...prev, resumePath: e.target.value }))}
        />
      </label>
      <p className="am-panel__desc" style={{ marginBottom: 14 }}>
        This should point to a file that actually exists in <code>public/</code> (e.g. <code>/resume.pdf</code>).
        The Portfolio Manager cannot write files into your deployed <code>public/</code> folder from the browser —
        it can only store the path you type here. To publish a new resume file for real, replace{" "}
        <code>public/resume.pdf</code> in your project source (or add the new file to <code>public/</code>) and
        redeploy, then update the path above to match.
      </p>

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save resume path</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset the resume path to /resume.pdf?")) resetToOriginal();
        }}>↺ Reset to original</button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--glass-border, rgba(255,255,255,0.08))", margin: "22px 0" }} />

      <h3 className="am-panel__title" style={{ fontSize: "0.95rem" }}>Local preview of a new PDF (this browser only)</h3>
      <p className="am-panel__desc" style={{ marginBottom: 10 }}>
        You can pick a PDF here to preview it in this browser tab only. This does <strong>not</strong> upload or
        publish the file — a browser cannot write into your deployed <code>public/</code> folder. Use this purely
        to sanity-check a new resume before you manually add it to the project and redeploy.
      </p>
      <label className="am-field">
        <span>Choose a local PDF to preview</span>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </label>
      {localPreviewUrl && (
        <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid var(--glass-border, rgba(255,255,255,0.1))" }}>
          <iframe src={localPreviewUrl} title="Local resume preview" width="100%" height="480" style={{ border: "none", background: "#fff" }} />
        </div>
      )}
      {localFile && (
        <p className="am-panel__desc" style={{ marginTop: 8 }}>
          Previewing: {localFile.name} ({Math.round(localFile.size / 1024)} KB) — remember to copy this file into{" "}
          <code>public/</code> yourself and update the path above once you've deployed it.
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

function emptyCertificate() {
  return {
    id: `cert-${Date.now()}`,
    title: "",
    issuer: "",
    platform: "",
    issueDate: "",
    period: "",
    credentialId: "",
    certificateUrl: "",
    certificateFile: "",
    image: "",
    skills: [],
    category: "",
    status: "",
  };
}

function SkillsChips({ skills, onChange }) {
  const [draft, setDraft] = useState("");
  const list = Array.isArray(skills) ? skills : [];
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...list, v]);
    setDraft("");
  };
  return (
    <label className="am-field">
      <span>Skills</span>
      <div className="am-chip-list">
        {list.map((s, i) => (
          <span className="am-chip" key={`${s}-${i}`}>
            {s}
            <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))}>✕</button>
          </span>
        ))}
        {list.length === 0 && <span className="am-empty">None yet.</span>}
      </div>
      <div className="am-inline-add">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="Add a skill…" />
        <button type="button" className="am-btn" onClick={add}>Add</button>
      </div>
    </label>
  );
}

function CertificateEditor({ item, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const update = (patch) => onUpdate({ ...item, ...patch });

  return (
    <div className="am-item">
      <div className="am-item__head" onClick={() => setOpen((v) => !v)}>
        <span>
          <span className="am-item__title">{item.title || "Untitled certificate"}</span>
          <div className="am-item__meta">{item.issuer || "—"} {item.status === "Coming Soon" ? "· Coming Soon" : ""}</div>
        </span>
        <button type="button" className="am-btn am-btn--danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>
      </div>

      {open && (
        <div className="am-item__body">
          <div className="am-grid-2">
            <label className="am-field">
              <span>Title</span>
              <input type="text" value={item.title} onChange={(e) => update({ title: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Issuer</span>
              <input type="text" value={item.issuer} onChange={(e) => update({ issuer: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Platform</span>
              <input type="text" value={item.platform || ""} onChange={(e) => update({ platform: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Category</span>
              <input type="text" value={item.category} onChange={(e) => update({ category: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Issue Date</span>
              <input type="text" value={item.issueDate} onChange={(e) => update({ issueDate: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Period</span>
              <input type="text" value={item.period} onChange={(e) => update({ period: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Credential ID</span>
              <input type="text" value={item.credentialId} onChange={(e) => update({ credentialId: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Status (e.g. "Coming Soon", or leave blank)</span>
              <input type="text" value={item.status || ""} onChange={(e) => update({ status: e.target.value })} />
            </label>
          </div>

          <label className="am-field">
            <span>Certificate File (path — never fabricate a file that doesn't exist in public/certificates/)</span>
            <input type="text" value={item.certificateFile || ""} onChange={(e) => update({ certificateFile: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Certificate URL (external, optional)</span>
            <input type="url" value={item.certificateUrl || ""} onChange={(e) => update({ certificateUrl: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Image (optional)</span>
            <input type="text" value={item.image || ""} onChange={(e) => update({ image: e.target.value })} />
          </label>

          <SkillsChips skills={item.skills} onChange={(v) => update({ skills: v })} />
        </div>
      )}
    </div>
  );
}

export default function CertificatesTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.CERTIFICATES, original);

  const updateAt = (idx, item) => setData((prev) => prev.map((c, i) => (i === idx ? item : c)));
  const deleteAt = (idx) => {
    if (!window.confirm(`Delete "${data[idx]?.title || "this certificate"}"?`)) return;
    setData((prev) => prev.filter((_, i) => i !== idx));
  };
  const addCertificate = () => setData((prev) => [...prev, emptyCertificate()]);

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Certificates</h2>
          <p className="am-panel__desc">
            The PDF viewer opens whatever "Certificate File" path you set — make sure the file actually exists under public/certificates/. No "Verify" button, matching the current design.
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      {data.length === 0 && <p className="am-empty">No certificates yet.</p>}

      {data.map((item, idx) => (
        <CertificateEditor
          key={item.id || idx}
          item={item}
          onUpdate={(v) => updateAt(idx, v)}
          onDelete={() => deleteAt(idx)}
        />
      ))}

      <div className="am-row">
        <button type="button" className="am-btn" onClick={addCertificate}>+ Add certificate</button>
      </div>

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save changes</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset Certificates to the original shipped content?")) resetToOriginal();
        }}>↺ Reset to original</button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

export default function SkillsTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.SKILLS, original);
  const [newCategory, setNewCategory] = useState("");
  const [newSkillByCategory, setNewSkillByCategory] = useState({});

  const categories = Object.keys(data || {});

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name || data[name]) return;
    setData((prev) => ({ ...prev, [name]: [] }));
    setNewCategory("");
  };

  const removeCategory = (cat) => {
    if (!window.confirm(`Delete the "${cat}" category and all its skills?`)) return;
    setData((prev) => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const addSkill = (cat) => {
    const value = (newSkillByCategory[cat] || "").trim();
    if (!value) return;
    setData((prev) => ({ ...prev, [cat]: [...(prev[cat] || []), value] }));
    setNewSkillByCategory((prev) => ({ ...prev, [cat]: "" }));
  };

  const removeSkill = (cat, skill) => {
    setData((prev) => ({ ...prev, [cat]: prev[cat].filter((s) => s !== skill) }));
  };

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Skills</h2>
          <p className="am-panel__desc">
            Categories and chips shown in the Skills section (and summarized by RoniGenie).
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      {categories.length === 0 && <p className="am-empty">No skill categories yet.</p>}

      {categories.map((cat) => (
        <div className="am-item" key={cat}>
          <div className="am-item__head">
            <span className="am-item__title">{cat}</span>
            <button type="button" className="am-btn am-btn--danger" onClick={() => removeCategory(cat)}>Delete category</button>
          </div>
          <div className="am-item__body">
            <div className="am-chip-list">
              {(data[cat] || []).map((skill) => (
                <span className="am-chip" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(cat, skill)} aria-label={`Remove ${skill}`}>✕</button>
                </span>
              ))}
              {(data[cat] || []).length === 0 && <span className="am-empty">No skills in this category.</span>}
            </div>
            <div className="am-inline-add">
              <input
                type="text"
                placeholder="Add a skill…"
                value={newSkillByCategory[cat] || ""}
                onChange={(e) => setNewSkillByCategory((prev) => ({ ...prev, [cat]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(cat))}
              />
              <button type="button" className="am-btn" onClick={() => addSkill(cat)}>Add</button>
            </div>
          </div>
        </div>
      ))}

      <div className="am-inline-add">
        <input
          type="text"
          placeholder="New category name…"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
        />
        <button type="button" className="am-btn" onClick={addCategory}>+ Add category</button>
      </div>

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save changes</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset Skills to the original shipped content?")) resetToOriginal();
        }}>↺ Reset to original</button>
      </div>
    </div>
  );
}

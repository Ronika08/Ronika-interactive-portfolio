import { useState } from "react";
import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

function emptyAchievement() {
  return {
    id: `ach-${Date.now()}`,
    title: "",
    description: "",
    category: "",
    date: "",
    icon: "🏆",
    highlight: false,
  };
}

function AchievementEditor({ item, onUpdate, onDelete, onMove, isFirst, isLast }) {
  const [open, setOpen] = useState(false);
  const update = (patch) => onUpdate({ ...item, ...patch });

  return (
    <div className="am-item">
      <div className="am-item__head" onClick={() => setOpen((v) => !v)}>
        <span>
          <span className="am-item__title">{item.icon} {item.title || "Untitled achievement"}</span>
          <div className="am-item__meta">{item.category || "Uncategorized"} · {item.date || "No date"}</div>
        </span>
        <div className="am-row" style={{ margin: 0 }} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="am-btn" disabled={isFirst} onClick={() => onMove(-1)}>↑</button>
          <button type="button" className="am-btn" disabled={isLast} onClick={() => onMove(1)}>↓</button>
          <button type="button" className="am-btn am-btn--danger" onClick={onDelete}>Delete</button>
        </div>
      </div>

      {open && (
        <div className="am-item__body">
          <div className="am-grid-2">
            <label className="am-field">
              <span>Title</span>
              <input type="text" value={item.title} onChange={(e) => update({ title: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Category</span>
              <input type="text" value={item.category} onChange={(e) => update({ category: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Icon (emoji)</span>
              <input type="text" value={item.icon} onChange={(e) => update({ icon: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Date (YYYY, YYYY-MM, or leave blank — never guess)</span>
              <input type="text" value={item.date} onChange={(e) => update({ date: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Highlight</span>
              <select value={item.highlight ? "yes" : "no"} onChange={(e) => update({ highlight: e.target.value === "yes" })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
          </div>
          <label className="am-field">
            <span>Description</span>
            <textarea value={item.description} onChange={(e) => update({ description: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}

export default function AchievementsTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.ACHIEVEMENTS, original);

  const updateAt = (idx, item) => setData((prev) => prev.map((a, i) => (i === idx ? item : a)));
  const deleteAt = (idx) => {
    if (!window.confirm(`Delete "${data[idx]?.title || "this achievement"}"?`)) return;
    setData((prev) => prev.filter((_, i) => i !== idx));
  };
  const moveAt = (idx, dir) => {
    setData((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };
  const addAchievement = () => setData((prev) => [...prev, emptyAchievement()]);

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Achievements</h2>
          <p className="am-panel__desc">
            Leave "Date" blank rather than guessing — the Achievements section safely hides missing dates instead of showing "Invalid Date".
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      {data.length === 0 && <p className="am-empty">No achievements yet.</p>}

      {data.map((item, idx) => (
        <AchievementEditor
          key={item.id || idx}
          item={item}
          isFirst={idx === 0}
          isLast={idx === data.length - 1}
          onUpdate={(v) => updateAt(idx, v)}
          onDelete={() => deleteAt(idx)}
          onMove={(dir) => moveAt(idx, dir)}
        />
      ))}

      <div className="am-row">
        <button type="button" className="am-btn" onClick={addAchievement}>+ Add achievement</button>
      </div>

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save changes</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset Achievements to the original shipped content?")) resetToOriginal();
        }}>↺ Reset to original</button>
      </div>
    </div>
  );
}

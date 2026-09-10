import { useState } from "react";
import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

const DIAGRAM_FIELDS = [
  ["erDiagrams", "ER Diagrams"],
  ["architectureDiagrams", "Architecture Diagrams"],
  ["workflowDiagrams", "Workflow Diagrams"],
  ["otherDiagrams", "Other Diagrams"],
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `project-${Date.now()}`;
}

function emptyProject() {
  return {
    id: "",
    title: "",
    tagline: "",
    category: "",
    status: "Coming Soon",
    shortDescription: "",
    problemStatement: "",
    solution: "",
    impact: "",
    architecture: "",
    features: [],
    techStack: [],
    challenges: [],
    lessonsLearned: [],
    github: "",
    liveDemo: "",
    screenshots: [],
    demoVideo: "",
    erDiagrams: [],
    architectureDiagrams: [],
    workflowDiagrams: [],
    otherDiagrams: [],
    featured: false,
  };
}

function ListEditor({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const list = Array.isArray(items) ? items : [];

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...list, v]);
    setDraft("");
  };
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));

  return (
    <label className="am-field">
      <span>{label}</span>
      <div className="am-chip-list">
        {list.map((item, idx) => (
          <span className="am-chip" key={`${item}-${idx}`}>
            {item}
            <button type="button" onClick={() => remove(idx)} aria-label={`Remove ${item}`}>✕</button>
          </span>
        ))}
        {list.length === 0 && <span className="am-empty">None yet.</span>}
      </div>
      <div className="am-inline-add">
        <input
          type="text"
          placeholder={placeholder || "Add…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button type="button" className="am-btn" onClick={add}>Add</button>
      </div>
    </label>
  );
}

function ProjectEditor({ project, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const update = (patch) => onUpdate({ ...project, ...patch });

  return (
    <div className="am-item">
      <div className="am-item__head" onClick={() => setOpen((v) => !v)}>
        <span>
          <span className="am-item__title">{project.title || "Untitled project"}</span>{" "}
          {project.featured && <span className="am-chip" style={{ marginLeft: 6 }}>Featured</span>}
          <div className="am-item__meta">{project.status} · {project.category || "Uncategorized"}</div>
        </span>
        <button
          type="button"
          className="am-btn am-btn--danger"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          Delete
        </button>
      </div>

      {open && (
        <div className="am-item__body">
          <div className="am-grid-2">
            <label className="am-field">
              <span>Title</span>
              <input type="text" value={project.title} onChange={(e) => update({ title: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Category</span>
              <input type="text" value={project.category} onChange={(e) => update({ category: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Status</span>
              <select value={project.status} onChange={(e) => update({ status: e.target.value })}>
                <option>Live</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Coming Soon</option>
              </select>
            </label>
            <label className="am-field">
              <span>Featured</span>
              <select value={project.featured ? "yes" : "no"} onChange={(e) => update({ featured: e.target.value === "yes" })}>
                <option value="no">No</option>
                <option value="yes">Yes — highlight as a Featured Project</option>
              </select>
            </label>
          </div>

          <label className="am-field">
            <span>Tagline</span>
            <input type="text" value={project.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Short Description</span>
            <textarea value={project.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Problem Statement</span>
            <textarea value={project.problemStatement} onChange={(e) => update({ problemStatement: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Solution</span>
            <textarea value={project.solution} onChange={(e) => update({ solution: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Impact (leave blank rather than inventing metrics)</span>
            <textarea value={project.impact} onChange={(e) => update({ impact: e.target.value })} />
          </label>
          <label className="am-field">
            <span>Architecture</span>
            <textarea value={project.architecture} onChange={(e) => update({ architecture: e.target.value })} />
          </label>

          <ListEditor label="Tech Stack" items={project.techStack} onChange={(v) => update({ techStack: v })} placeholder="e.g. React" />
          <ListEditor label="Features" items={project.features} onChange={(v) => update({ features: v })} />
          <ListEditor label="Challenges" items={project.challenges} onChange={(v) => update({ challenges: v })} />
          <ListEditor label="Lessons Learned" items={project.lessonsLearned} onChange={(v) => update({ lessonsLearned: v })} />

          <div className="am-grid-2">
            <label className="am-field">
              <span>GitHub URL (leave blank if none — never fabricate)</span>
              <input type="url" value={project.github} onChange={(e) => update({ github: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Live Demo URL</span>
              <input type="url" value={project.liveDemo} onChange={(e) => update({ liveDemo: e.target.value })} />
            </label>
            <label className="am-field">
              <span>Demo Video Path</span>
              <input type="text" value={project.demoVideo} onChange={(e) => update({ demoVideo: e.target.value })} />
            </label>
          </div>

          <ListEditor label="Screenshots (paths)" items={project.screenshots} onChange={(v) => update({ screenshots: v })} />

          {DIAGRAM_FIELDS.map(([key, label]) => (
            <ListEditor
              key={key}
              label={`${label} (paths)`}
              items={project[key]}
              onChange={(v) => update({ [key]: v })}
              placeholder="/diagrams/example.png"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.PROJECTS, original);

  const updateAt = (idx, project) => setData((prev) => prev.map((p, i) => (i === idx ? project : p)));
  const deleteAt = (idx) => {
    if (!window.confirm(`Delete "${data[idx]?.title || "this project"}"? This cannot be undone (unless you Reset to original).`)) return;
    setData((prev) => prev.filter((_, i) => i !== idx));
  };
  const addProject = () => {
    const p = emptyProject();
    p.id = slugify(`new-project-${data.length + 1}`);
    setData((prev) => [...prev, p]);
  };

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Projects</h2>
          <p className="am-panel__desc">
            Project order, tabs, media, and diagrams in the Projects section all read from this data.
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      {data.length === 0 && <p className="am-empty">No projects yet.</p>}

      {data.map((project, idx) => (
        <ProjectEditor
          key={project.id || idx}
          project={project}
          onUpdate={(p) => updateAt(idx, p)}
          onDelete={() => deleteAt(idx)}
        />
      ))}

      <div className="am-row">
        <button type="button" className="am-btn" onClick={addProject}>+ Add project</button>
      </div>

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save changes</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset Projects to the original shipped content?")) resetToOriginal();
        }}>↺ Reset to original</button>
      </div>
    </div>
  );
}

import { DOMAINS } from "../../../utils/portfolioStorage";
import useDomainEditor from "../useDomainEditor";

const TEXT_FIELDS = [
  ["name", "Name"],
  ["headline", "Headline"],
  ["tagline", "Tagline"],
  ["subtitle", "Subtitle"],
  ["location", "Location"],
  ["availability", "Availability"],
  ["email", "Email"],
  ["github", "GitHub URL"],
  ["linkedin", "LinkedIn URL"],
  ["cgpa", "CGPA"],
  ["college", "College"],
  ["branch", "Branch"],
  ["graduationYear", "Graduation Year"],
];

const TEXTAREA_FIELDS = [
  ["summary", "Summary"],
  ["careerGoal", "Career Goal"],
  ["whySoftwareEngineering", "Why Software Engineering?"],
  ["whyAI", "Why AI?"],
  ["motivation", "What Motivates Me?"],
];

const LIST_FIELDS = [
  ["strengths", "Strengths (one per line)"],
  ["interests", "Interests (one per line)"],
];

export default function ProfileTab({ original }) {
  const { data, setData, status, save, resetToOriginal, isOverridden } = useDomainEditor(DOMAINS.PROFILE, original);

  const updateField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));
  const updateListField = (key, text) =>
    setData((prev) => ({ ...prev, [key]: text.split("\n").map((s) => s.trim()).filter(Boolean) }));

  return (
    <div className="am-panel">
      <div className="am-panel__header">
        <div>
          <h2 className="am-panel__title">Profile / About</h2>
          <p className="am-panel__desc">
            Feeds the About section, the Resume section, Explorer Modes, and RoniGenie.
            {isOverridden && " (currently showing your saved local edits)"}
          </p>
        </div>
      </div>

      {status && <p className={`am-alert am-alert--${status.type}`}>{status.message}</p>}

      <div className="am-grid-2">
        {TEXT_FIELDS.map(([key, label]) => (
          <label className="am-field" key={key}>
            <span>{label}</span>
            <input
              type="text"
              value={data[key] ?? ""}
              onChange={(e) => updateField(key, e.target.value)}
            />
          </label>
        ))}
      </div>

      {TEXTAREA_FIELDS.map(([key, label]) => (
        <label className="am-field" key={key}>
          <span>{label}</span>
          <textarea
            value={data[key] ?? ""}
            onChange={(e) => updateField(key, e.target.value)}
          />
        </label>
      ))}

      {LIST_FIELDS.map(([key, label]) => (
        <label className="am-field" key={key}>
          <span>{label}</span>
          <textarea
            value={(Array.isArray(data[key]) ? data[key] : []).join("\n")}
            onChange={(e) => updateListField(key, e.target.value)}
          />
        </label>
      ))}

      <div className="am-row">
        <button type="button" className="am-btn am-btn--primary" onClick={save}>💾 Save changes</button>
        <button type="button" className="am-btn am-btn--danger" onClick={() => {
          if (window.confirm("Reset Profile / About to the original shipped content? This discards your local edits for this section.")) {
            resetToOriginal();
          }
        }}>↺ Reset to original</button>
      </div>
    </div>
  );
}

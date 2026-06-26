/**
 * ResumeSection.jsx
 * Obsidian Glass — Driven from profile.json
 */

import { motion } from "framer-motion";
import profileData from "../../data/profile.json";
import "./ResumeSection.css";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeSlideUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardAnim = {
  hidden:  { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

/* ─── Sub-components ─────────────────────────────────────── */

function SectionCard({ icon, title, children }) {
  return (
    <motion.div className="rs-card" variants={cardAnim}>
      <div className="rs-card-header">
        <span className="rs-card-icon" aria-hidden="true">{icon}</span>
        <h3 className="rs-card-title">{title}</h3>
      </div>
      <div className="rs-card-body">{children}</div>
    </motion.div>
  );
}

function HighlightsCard({ highlights }) {
  return (
    <SectionCard icon="⚡" title="Recruiter Highlights">
      <ul className="rs-highlights-list" role="list">
        {highlights.map((h, i) => (
          <li key={i} className="rs-highlight-item">{h}</li>
        ))}
      </ul>
    </SectionCard>
  );
}

function EducationCard({ education }) {
  return (
    <SectionCard icon="🎓" title="Education">
      {education.map((edu, i) => (
        <div key={i} className="rs-edu-item">
          <p className="rs-edu-degree">{edu.degree}</p>
          <p className="rs-edu-institution">{edu.institution}</p>
          <div className="rs-edu-meta">
            <span>{edu.period}</span>
            {edu.grade && <span>{edu.grade}</span>}
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

function ExperienceCard({ experience }) {
  return (
    <SectionCard icon="💼" title="Experience">
      {experience.map((exp, i) => (
        <div key={i} className="rs-exp-item">
          <p className="rs-exp-role">{exp.role}</p>
          <p className="rs-exp-company">{exp.company}</p>
          <div className="rs-exp-period">{exp.period}</div>
          {exp.description && <p className="rs-exp-desc">{exp.description}</p>}
        </div>
      ))}
    </SectionCard>
  );
}

function SkillsCard({ skillsSnapshot }) {
  return (
    <SectionCard icon="🛠️" title="Skills Snapshot">
      <div className="rs-skills-snapshot">
        {Object.entries(skillsSnapshot).map(([domain, skills]) => (
          <div key={domain}>
            <div className="rs-skill-row-label">{domain}</div>
            <div className="rs-skill-chips">
              {skills.map((s) => (
                <span key={s} className="rs-skill-chip">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export default function ResumeSection() {
  const p = profileData;

  return (
    <section className="rs-section" id="resume" aria-labelledby="rs-section-title">
      <div className="rs-container">

        {/* Header */}
        <motion.header
          className="rs-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlideUp} className="rs-eyebrow">Career</motion.div>
          <motion.h1 className="rs-title" id="rs-section-title" variants={fadeSlideUp}>
            Resume &amp; <span className="rs-title-accent">Experience</span>
          </motion.h1>
        </motion.header>

        {/* Grid Layout */}
        <motion.div
          className="rs-layout"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {/* Hero card — full width */}
          <motion.div className="rs-card rs-hero" variants={cardAnim}>
            <div className="rs-hero-left">
              <div className="rs-avatar" aria-hidden="true">👤</div>

              <div className="rs-availability">
                <span className="rs-availability-dot" aria-hidden="true" />
                {p.availability}
              </div>

              <h2 className="rs-name">{p.name}</h2>
              <p className="rs-headline">{p.headline}</p>
              <p className="rs-summary">{p.summary}</p>

              <div className="rs-meta" role="list">
                <div className="rs-meta-item" role="listitem">
                  <span className="rs-meta-icon" aria-hidden="true">📍</span>
                  {p.location}
                </div>
                <div className="rs-meta-item" role="listitem">
                  <span className="rs-meta-icon" aria-hidden="true">✉️</span>
                  <a href={`mailto:${p.email}`} className="rs-meta-link">{p.email}</a>
                </div>
                <div className="rs-meta-item" role="listitem">
                  <span className="rs-meta-icon" aria-hidden="true">🐙</span>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rs-meta-link"
                  >
                    {p.github.replace("https://", "")}
                  </a>
                </div>
                <div className="rs-meta-item" role="listitem">
                  <span className="rs-meta-icon" aria-hidden="true">💼</span>
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rs-meta-link"
                  >
                    {p.linkedin.replace("https://", "")}
                  </a>
                </div>
              </div>
            </div>

            <div className="rs-hero-right">
  <p className="rs-cta-label">Resume</p>

  <div className="rs-preview-icon" aria-hidden="true">
    📄
  </div>
<a
href={p.resume}
target="_blank"
rel="noopener noreferrer"
className="rs-btn-open"

>

👁 View Resume </a>

<a
href={p.resume}
download="Ronika_S_Resume.pdf"
className="rs-btn-download"

>

⬇ Download PDF 
</a>

  <div
    style={{
      width: "100%",
      marginTop: "20px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)"
    }}
  >
    <iframe
      src="/resume.pdf"
      title="Resume Preview"
      width="100%"
      height="500"
      style={{
        border: "none",
        background: "#fff"
      }}
    />
  </div>
</div>

          </motion.div>

          {/* Highlights */}
          <HighlightsCard highlights={p.recruiterHighlights} />

          {/* Education */}
          <EducationCard education={p.education} />

          {/* Experience */}
          <ExperienceCard experience={p.experience} />

          {/* Skills */}
          <SkillsCard skillsSnapshot={p.skillsSnapshot} />
        </motion.div>
      </div>
    </section>
  );
}

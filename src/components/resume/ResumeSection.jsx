/**
 * ResumeSection.jsx
 * Obsidian Glass — Driven from profile.json
 *
 * Hardened to tolerate a partial or evolving profile.json: every
 * field read from profile data is guarded, and any card whose
 * underlying data is missing or empty is skipped instead of being
 * rendered with blank content. This lets the section be safely
 * mounted in App.jsx regardless of how complete profile.json is.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import profileJson from "../../data/profile.json";
import { getEffectiveData, getOverride, DOMAINS } from "../../utils/portfolioStorage";
import "./ResumeSection.css";

const profileData = getEffectiveData(DOMAINS.PROFILE, profileJson);
const resumeOverride = getOverride(DOMAINS.RESUME);

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
  const items = Array.isArray(highlights) ? highlights.filter(Boolean) : [];
  if (items.length === 0) return null;

  return (
    <SectionCard icon="⚡" title="Recruiter Highlights">
      <ul className="rs-highlights-list" role="list">
        {items.map((h, i) => (
          <li key={i} className="rs-highlight-item">{h}</li>
        ))}
      </ul>
    </SectionCard>
  );
}

function EducationCard({ education }) {
  const items = Array.isArray(education) ? education.filter(Boolean) : [];
  if (items.length === 0) return null;

  return (
    <SectionCard icon="🎓" title="Education">
      {items.map((edu, i) => (
        <div key={i} className="rs-edu-item">
          {edu.degree && <p className="rs-edu-degree">{edu.degree}</p>}
          {edu.institution && <p className="rs-edu-institution">{edu.institution}</p>}
          {(edu.period || edu.grade) && (
            <div className="rs-edu-meta">
              {edu.period && <span>{edu.period}</span>}
              {edu.grade && <span>{edu.grade}</span>}
            </div>
          )}
        </div>
      ))}
    </SectionCard>
  );
}

function ExperienceCard({ experience }) {
  const items = Array.isArray(experience) ? experience.filter(Boolean) : [];
  if (items.length === 0) return null;

  return (
    <SectionCard icon="💼" title="Experience">
      {items.map((exp, i) => (
        <div key={i} className="rs-exp-item">
          {exp.role && <p className="rs-exp-role">{exp.role}</p>}
          {exp.company && <p className="rs-exp-company">{exp.company}</p>}
          {exp.period && <div className="rs-exp-period">{exp.period}</div>}
          {exp.description && <p className="rs-exp-desc">{exp.description}</p>}
        </div>
      ))}
    </SectionCard>
  );
}

function SkillsCard({ skillsSnapshot }) {
  const entries =
    skillsSnapshot && typeof skillsSnapshot === "object"
      ? Object.entries(skillsSnapshot).filter(
          ([, skills]) => Array.isArray(skills) && skills.length > 0
        )
      : [];
  if (entries.length === 0) return null;

  return (
    <SectionCard icon="🛠️" title="Skills Snapshot">
      <div className="rs-skills-snapshot">
        {entries.map(([domain, skills]) => (
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
  const [photoError, setPhotoError] = useState(false);
  const p = resumeOverride?.resumePath
    ? { ...(profileData || {}), resume: resumeOverride.resumePath }
    : profileData || {};

  const downloadFilename = p.name
    ? `${String(p.name).trim().replace(/\s+/g, "_")}_Resume.pdf`
    : "Resume.pdf";

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
              {!photoError && (p.photo || "/profile-photo.jpg") ? (
                <img
                  src={p.photo || "/profile-photo.jpg"}
                  alt={p.name || "Ronika S"}
                  className="rs-avatar"
                  loading="lazy"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="rs-avatar" aria-hidden="true">👤</div>
              )}

              {p.availability && (
                <div className="rs-availability">
                  <span className="rs-availability-dot" aria-hidden="true" />
                  {p.availability}
                </div>
              )}

              {p.name && <h2 className="rs-name">{p.name}</h2>}
              {p.headline && <p className="rs-headline">{p.headline}</p>}
              {p.summary && <p className="rs-summary">{p.summary}</p>}

              <div className="rs-meta" role="list">
                {p.location && (
                  <div className="rs-meta-item" role="listitem">
                    <span className="rs-meta-icon" aria-hidden="true">📍</span>
                    {p.location}
                  </div>
                )}
                {p.email && (
                  <div className="rs-meta-item" role="listitem">
                    <span className="rs-meta-icon" aria-hidden="true">✉️</span>
                    <a href={`mailto:${p.email}`} className="rs-meta-link">{p.email}</a>
                  </div>
                )}
                {p.github && (
                  <div className="rs-meta-item" role="listitem">
                    <span className="rs-meta-icon" aria-hidden="true">🐙</span>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rs-meta-link"
                    >
                      {p.github.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {p.linkedin && (
                  <div className="rs-meta-item" role="listitem">
                    <span className="rs-meta-icon" aria-hidden="true">💼</span>
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rs-meta-link"
                    >
                      {p.linkedin.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="rs-hero-right">
              {p.resume ? (
                <>
                  <p className="rs-cta-label">Resume</p>

                  <div className="rs-preview-icon" aria-hidden="true">📄</div>

                  <a
                    href={p.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rs-btn-open"
                  >
                    👁 View Resume
                  </a>

                  <a
                    href={p.resume}
                    download={downloadFilename}
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
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <iframe
                      src={p.resume}
                      title="Resume Preview"
                      width="100%"
                      height="500"
                      style={{ border: "none", background: "#fff" }}
                    />
                  </div>
                </>
              ) : (
                <p className="rs-cta-label">Resume not available yet</p>
              )}
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

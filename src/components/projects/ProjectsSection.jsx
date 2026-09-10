/**
 * ProjectsSection.jsx
 * Obsidian Glass Design — Fully data-driven from projects.json
 * No hardcoded project cards. Add/remove projects via JSON only.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projectsJson from "../../data/projects.json";
import { getEffectiveData, DOMAINS } from "../../utils/portfolioStorage";
import "./ProjectsSection.css";

const projectsData = getEffectiveData(DOMAINS.PROJECTS, projectsJson);

/* Projects that get the dedicated "Preview" button + modal (Phase 2-4
   of the preview-system update). Kept as an explicit id list rather
   than a data flag so it's obvious and easy to adjust later without
   touching the Featured-badge logic. */
const PREVIEW_ENABLED_IDS = new Set([
  "sakhi-ai",
  "it-ops-intelligence",
  "lru-cache",
  "mini-database-engine",
  "hallucination-detection",
]);

/* Repos that must never be exposed as an active, recruiter-clickable
   Source Code link in the Preview modal, even if a URL is ever present
   in the underlying data (e.g. stored for admin reference only). */
const PRIVATE_SOURCE_IDS = new Set(["hallucination-detection"]);

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeSlideUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const overlayVariant = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariant = {
  hidden:  { opacity: 0, y: 48, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: 24, scale: 0.97,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Utilities ─────────────────────────────────────────────── */
function getStatusClass(status) {
  const map = { Live: "live", Completed: "completed", "In Progress": "wip" };
  return `ps-badge-status-${map[status] || "completed"}`;
}

function getAllCategories(projects) {
  const cats = ["All", ...new Set(projects.map((p) => p.category))];
  return cats;
}

function countByCategory(projects, cat) {
  if (cat === "All") return projects.length;
  return projects.filter((p) => p.category === cat).length;
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Status badge with animated dot for live projects */
function StatusBadge({ status }) {
  return (
    <span className={`ps-badge ${getStatusClass(status)}`} aria-label={`Status: ${status}`}>
      <span className="ps-status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

/** Category badge */
function CategoryBadge({ category }) {
  return (
    <span className="ps-badge ps-badge-category" aria-label={`Category: ${category}`}>
      {category}
    </span>
  );
}

/** Tech chips row on card — shows first 4, overflow count */
function TechChips({ tech = [], limit = 4 }) {
  const visible = tech.slice(0, limit);
  const overflow = tech.length - limit;
  return (
    <div className="ps-tech-chips" aria-label="Tech stack">
      {visible.map((t) => (
        <span key={t} className="ps-chip">{t}</span>
      ))}
      {overflow > 0 && (
        <span className="ps-chip ps-chip-overflow">+{overflow}</span>
      )}
    </div>
  );
}

/** Feature / challenge list */
function FeatureList({ items = [], violet = false }) {
  if (!items.length) return <p className="ps-info-text">—</p>;
  return (
    <ul className="ps-feature-list" role="list">
      {items.map((item, i) => (
        <li key={i} className={`ps-feature-item${violet ? " violet" : ""}`}>{item}</li>
      ))}
    </ul>
  );
}

/** Info block used in modal overview */
function InfoBlock({ label, icon, children, full = false }) {
  return (
    <div className={`ps-info-block${full ? " ps-overview-full" : ""}`}>
      <div className="ps-info-label">
        <span className="ps-info-label-icon" aria-hidden="true">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

/* ─── Modal Tabs ─────────────────────────────────────────────── */
const TABS = [
  { id: "overview",  label: "Overview"    },
  { id: "details",   label: "Details"     },
  { id: "tech",      label: "Tech Stack"  },
];

function ProjectModal({ project, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  /* Focus trap + close on Escape */
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.activeElement;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();

      /* Simple focus trap */
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const hasGithub = project.github && project.github !== "https://github.com";
  const hasDemo   = project.liveDemo && project.liveDemo !== "";

  return (
    <div
      className="ps-modal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-modal-title"
    >
      {/* Top gradient bar */}
      <div className="ps-modal-topbar" aria-hidden="true" />

      {/* Header */}
      <header className="ps-modal-header">
        <div className="ps-modal-header-left">
          <div className="ps-modal-badges">
            <StatusBadge status={project.status} />
            <CategoryBadge category={project.category} />
          </div>
          <h2 className="ps-modal-title" id="ps-modal-title">{project.title}</h2>
          <p className="ps-modal-tagline">{project.tagline}</p>
        </div>
        <button
          className="ps-modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close project details"
        >
          ✕
        </button>
      </header>

      {/* Tabs */}
      <nav className="ps-modal-tabs" role="tablist" aria-label="Project sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`ps-panel-${tab.id}`}
            id={`ps-tab-${tab.id}`}
            className={`ps-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Body */}
      <div className="ps-modal-body">
        {/* ── Overview Tab ── */}
        <section
          id="ps-panel-overview"
          role="tabpanel"
          aria-labelledby="ps-tab-overview"
          className={`ps-tab-content${activeTab === "overview" ? " active" : ""}`}
        >
          <div className="ps-overview-grid">
            <InfoBlock label="Problem Statement" icon="⚠️" full>
              <p className="ps-info-text">{project.problemStatement}</p>
            </InfoBlock>

            <InfoBlock label="Solution" icon="💡">
              <p className="ps-info-text">{project.solution}</p>
            </InfoBlock>

            <InfoBlock label="Impact" icon="📈">
              <p className="ps-info-text">{project.impact}</p>
            </InfoBlock>

            <InfoBlock label="Architecture" icon="🏗️" full>
              <div className="ps-arch-block">{project.architecture}</div>
            </InfoBlock>
          </div>
        </section>

        {/* ── Details Tab ── */}
        <section
          id="ps-panel-details"
          role="tabpanel"
          aria-labelledby="ps-tab-details"
          className={`ps-tab-content${activeTab === "details" ? " active" : ""}`}
        >
          <div className="ps-overview-grid">
            <InfoBlock label="Features" icon="✨" full>
              <FeatureList items={project.features} />
            </InfoBlock>

            <InfoBlock label="Challenges" icon="🔥">
              <FeatureList items={project.challenges} violet />
            </InfoBlock>

            <InfoBlock label="Lessons Learned" icon="🎓">
              <FeatureList items={project.lessonsLearned} violet />
            </InfoBlock>
          </div>
        </section>

        {/* ── Tech Stack Tab ── */}
        <section
          id="ps-panel-tech"
          role="tabpanel"
          aria-labelledby="ps-tab-tech"
          className={`ps-tab-content${activeTab === "tech" ? " active" : ""}`}
        >
          <InfoBlock label="Full Technology Stack" icon="🛠️" full>
            <div className="ps-tech-grid">
              {project.techStack.map((tech) => (
                <span key={tech} className="ps-tech-chip-lg">{tech}</span>
              ))}
            </div>
          </InfoBlock>

          {project.shortDescription && (
            <InfoBlock label="Summary" icon="📋" full>
              <p className="ps-info-text">{project.shortDescription}</p>
            </InfoBlock>
          )}
        </section>
      </div>

      {/* Footer links */}
      <footer className="ps-modal-footer">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-btn ps-btn-secondary"
            aria-label={`View ${project.title} source on GitHub`}
          >
            <span aria-hidden="true">⌥</span> GitHub
          </a>
        )}
        {project.liveDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-btn ps-btn-primary"
            aria-label={`Open live demo of ${project.title}`}
          >
            <span aria-hidden="true">▶</span> Live Demo
          </a>
        )}
        {!project.github && !project.liveDemo && (
          <span className="ps-info-text" style={{ fontSize: 13 }}>
            Links coming soon
          </span>
        )}
      </footer>
    </div>
  );
}

/* ─── Diagram viewer ──────────────────────────────────────────
   Renders a diagram path as an image, or as a PDF frame when the
   path ends in .pdf (same lightweight technique the certificates
   PDF viewer uses). Returns null for empty/invalid paths so it can
   be mapped over safely. */
function DiagramViewer({ src, alt }) {
  if (typeof src !== "string" || !src.trim()) return null;
  const isPdf = src.toLowerCase().endsWith(".pdf");
  return isPdf ? (
    <iframe src={src} title={alt} className="ps-preview-diagram-frame" />
  ) : (
    <img src={src} alt={alt} className="ps-preview-diagram-img" loading="lazy" />
  );
}

/* ─── Project Preview Modal ─────────────────────────────────────
   A focused, lightweight companion to ProjectModal for the projects
   where I want a fast "Open Demo / Try It Out / Architecture / ER
   Diagram" view. Reuses the same ps-modal/ps-overlay chrome, escape
   key handling, focus trap, and body-scroll lock as ProjectModal so
   it feels like the same product rather than a second modal system.
   Every option reads straight from project data and renders
   "Coming Soon" until a real resource is added — nothing here is
   fabricated. */
function ProjectPreviewModal({ project, onClose }) {
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.activeElement;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const hasDemo = Boolean(project.demoVideo && project.demoVideo.trim());
  const hasLive = Boolean(project.liveDemo && project.liveDemo.trim());
  const archDiagrams = Array.isArray(project.architectureDiagrams) ? project.architectureDiagrams.filter(Boolean) : [];
  const erDiagrams = Array.isArray(project.erDiagrams) ? project.erDiagrams.filter(Boolean) : [];
  const hasSource = Boolean(project.github && project.github.trim()) && !PRIVATE_SOURCE_IDS.has(project.id);

  return (
    <div
      className="ps-modal ps-preview-modal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-preview-title"
    >
      <div className="ps-modal-topbar" aria-hidden="true" />

      <header className="ps-modal-header">
        <div className="ps-modal-header-left">
          <div className="ps-modal-badges">
            <StatusBadge status={project.status} />
            <CategoryBadge category={project.category} />
          </div>
          <h2 className="ps-modal-title" id="ps-preview-title">{project.title}</h2>
          <p className="ps-modal-tagline">Project Preview</p>
        </div>
        <button
          className="ps-modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close project preview"
        >
          ✕
        </button>
      </header>

      <div className="ps-modal-body ps-preview-body">
        {project.shortDescription && (
          <InfoBlock label="Project Overview" icon="📋" full>
            <p className="ps-info-text">{project.shortDescription}</p>
          </InfoBlock>
        )}

        {Array.isArray(project.techStack) && project.techStack.length > 0 && (
          <InfoBlock label="Technologies" icon="🛠️" full>
            <div className="ps-tech-chips">
              {project.techStack.map((t) => (
                <span key={t} className="ps-chip">{t}</span>
              ))}
            </div>
          </InfoBlock>
        )}

        <div className="ps-preview-options">
          {/* Open Demo */}
          <div className="ps-preview-option">
            <div className="ps-preview-option-head">
              <span className="ps-preview-option-icon" aria-hidden="true">🎬</span>
              <span className="ps-preview-option-label">Open Demo</span>
            </div>
            {hasDemo ? (
              <video controls className="ps-preview-media" src={project.demoVideo}>
                Your browser does not support embedded video.
              </video>
            ) : (
              <span className="ps-preview-soon">Coming Soon</span>
            )}
          </div>

          {/* Try It Out */}
          <div className="ps-preview-option">
            <div className="ps-preview-option-head">
              <span className="ps-preview-option-icon" aria-hidden="true">🚀</span>
              <span className="ps-preview-option-label">Try It Out</span>
            </div>
            {hasLive ? (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-btn ps-btn-primary"
                aria-label={`Open the live deployed app for ${project.title}`}
              >
                Open Live App <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="ps-preview-soon">Coming Soon</span>
            )}
          </div>

          {/* Architecture Diagram */}
          <div className="ps-preview-option">
            <div className="ps-preview-option-head">
              <span className="ps-preview-option-icon" aria-hidden="true">🏗️</span>
              <span className="ps-preview-option-label">Architecture Diagram</span>
            </div>
            {archDiagrams.length > 0 ? (
              <div className="ps-preview-diagrams">
                {archDiagrams.map((src, i) => (
                  <DiagramViewer key={src + i} src={src} alt={`${project.title} architecture diagram ${i + 1}`} />
                ))}
              </div>
            ) : (
              <span className="ps-preview-soon">Coming Soon</span>
            )}
          </div>

          {/* ER Diagram */}
          <div className="ps-preview-option">
            <div className="ps-preview-option-head">
              <span className="ps-preview-option-icon" aria-hidden="true">🗂️</span>
              <span className="ps-preview-option-label">ER Diagram</span>
            </div>
            {erDiagrams.length > 0 ? (
              <div className="ps-preview-diagrams">
                {erDiagrams.map((src, i) => (
                  <DiagramViewer key={src + i} src={src} alt={`${project.title} ER diagram ${i + 1}`} />
                ))}
              </div>
            ) : (
              <span className="ps-preview-soon">Coming Soon</span>
            )}
          </div>

          {/* Source Code */}
          <div className="ps-preview-option">
            <div className="ps-preview-option-head">
              <span className="ps-preview-option-icon" aria-hidden="true">💻</span>
              <span className="ps-preview-option-label">Source Code</span>
            </div>
            {hasSource ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-btn ps-btn-secondary"
                aria-label={`View ${project.title} source code on GitHub`}
              >
                <span aria-hidden="true">⌥</span> View Source <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="ps-preview-soon">Coming Soon</span>
            )}
          </div>
        </div>

        {/* ── Optional project-specific info (data-driven; only renders
             when a project actually supplies it — currently IT Ops) ── */}
        {project.demoAccess && Array.isArray(project.demoAccess.accounts) && project.demoAccess.accounts.length > 0 && (
          <details className="ps-preview-extra">
            <summary className="ps-preview-extra-summary">
              <span aria-hidden="true">🔐</span> Demo Access
            </summary>
            <div className="ps-preview-extra-body">
              {project.demoAccess.note && (
                <p className="ps-info-text">{project.demoAccess.note}</p>
              )}
              <div className="ps-demo-access-table-wrap">
                <table className="ps-demo-access-table">
                  <thead>
                    <tr>
                      <th scope="col">Role</th>
                      <th scope="col">Username</th>
                      <th scope="col">Password</th>
                      <th scope="col">Authority / Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.demoAccess.accounts.map((acc) => (
                      <tr key={acc.role}>
                        <td data-label="Role">{acc.role}</td>
                        <td data-label="Username"><code>{acc.username}</code></td>
                        <td data-label="Password"><code>{acc.password}</code></td>
                        <td data-label="Authority / Access">{acc.authority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        )}

        {project.demonstrates && Array.isArray(project.demonstrates.items) && project.demonstrates.items.length > 0 && (
          <details className="ps-preview-extra">
            <summary className="ps-preview-extra-summary">
              <span aria-hidden="true">🏗️</span> What This Project Demonstrates
            </summary>
            <div className="ps-preview-extra-body">
              {project.demonstrates.title && (
                <p className="ps-info-text ps-preview-extra-title">{project.demonstrates.title}</p>
              )}
              {project.demonstrates.intro && (
                <p className="ps-info-text">{project.demonstrates.intro}</p>
              )}
              <ul className="ps-feature-list" role="list">
                {project.demonstrates.items.map((item, i) => (
                  <li key={i} className="ps-feature-item">{item}</li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {project.endToEndFlow && (
          <details className="ps-preview-extra">
            <summary className="ps-preview-extra-summary">
              <span aria-hidden="true">🔄</span> End-to-End Operational Flow
            </summary>
            <div className="ps-preview-extra-body">
              <p className="ps-info-text ps-flow-text">{project.endToEndFlow}</p>
            </div>
          </details>
        )}

        {Array.isArray(project.rbacOverview) && project.rbacOverview.length > 0 && (
          <details className="ps-preview-extra">
            <summary className="ps-preview-extra-summary">
              <span aria-hidden="true">👥</span> RBAC Overview
            </summary>
            <div className="ps-preview-extra-body">
              <ul className="ps-feature-list" role="list">
                {project.rbacOverview.map((r) => (
                  <li key={r.role} className="ps-feature-item">
                    <strong>{r.role}</strong> → {r.description}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────────────── */
function ProjectCard({ project, onClick, onPreview }) {
  return (
    <motion.article
      className="ps-card"
      variants={cardVariant}
      layout
      onClick={() => onClick(project)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(project)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
    >
      {/* Corner accent */}
      <div className="ps-card-corner" aria-hidden="true" />

      {project.featured && (
        <span className="ps-badge-featured" aria-label="Featured project">★ Featured</span>
      )}

      {/* Top row: badges + arrow */}
      <div className="ps-card-top">
        <div className="ps-card-badges">
          <StatusBadge status={project.status} />
          <CategoryBadge category={project.category} />
        </div>
        <div className="ps-card-arrow" aria-hidden="true">↗</div>
      </div>

      {/* Content */}
      <h3 className="ps-card-title">{project.title}</h3>
      <p className="ps-card-tagline">{project.tagline}</p>
      <p className="ps-card-desc">{project.shortDescription}</p>

      {/* Tech chips */}
      <TechChips tech={project.techStack} limit={4} />

      {PREVIEW_ENABLED_IDS.has(project.id) && (
        <button
          type="button"
          className="ps-btn ps-btn-secondary ps-card-preview-btn"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(project);
          }}
          aria-label={`Preview ${project.title}: demo, live app, and diagrams`}
        >
          <span aria-hidden="true">▣</span> Preview
        </button>
      )}
    </motion.article>
  );
}

/* ─── Main Section ───────────────────────────────────────────── */
export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);

  /* Derive categories dynamically from JSON — no hardcoding */
  const categories = getAllCategories(projectsData);

  /* Filter projects by selected category */
  const filteredProjects =
    activeFilter === "All"
      ? projectsData
      : projectsData.filter((p) => p.category === activeFilter);

  const handleOpenProject  = useCallback((project) => setSelectedProject(project), []);
  const handleCloseProject = useCallback(() => setSelectedProject(null), []);

  const handleOpenPreview  = useCallback((project) => setPreviewProject(project), []);
  const handleClosePreview = useCallback(() => setPreviewProject(null), []);

  /* Click outside overlay to close */
  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) handleCloseProject(); },
    [handleCloseProject]
  );

  const handlePreviewOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) handleClosePreview(); },
    [handleClosePreview]
  );

  return (
    <section className="ps-section" id="projects" aria-labelledby="ps-section-title">
      <div className="ps-container">

        {/* ── Header ── */}
        <motion.header
          className="ps-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeSlideUp} className="ps-eyebrow">
            Portfolio
          </motion.div>
          <motion.h1
            className="ps-title"
            id="ps-section-title"
            variants={fadeSlideUp}
          >
            Things I've <span className="ps-title-accent">Built</span>
          </motion.h1>
          <motion.p className="ps-subtitle" variants={fadeSlideUp}>
            From AI systems to systems programming — {projectsData.length} projects spanning
            the full stack, each solving a real problem.
          </motion.p>
        </motion.header>

        {/* ── Filter Bar ── */}
        <motion.nav
          className="ps-filters"
          role="navigation"
          aria-label="Filter projects by category"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerContainer}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              variants={fadeSlideUp}
              className={`ps-filter-btn${activeFilter === cat ? " active" : ""}`}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
            >
              {cat}
              <span className="ps-filter-count" aria-label={`${countByCategory(projectsData, cat)} projects`}>
                {countByCategory(projectsData, cat)}
              </span>
            </motion.button>
          ))}
        </motion.nav>

        {/* ── Project Grid ── */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key={activeFilter}
              className="ps-grid"
              role="list"
              aria-label="Projects"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleOpenProject}
                  onPreview={handleOpenPreview}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="ps-empty"
              variants={fadeSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span className="ps-empty-icon" aria-hidden="true">🔭</span>
              <p className="ps-empty-text">No projects in this category yet.</p>
              <p className="ps-empty-sub">Check back soon — something is always being built.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="ps-overlay"
            variants={overlayVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
            aria-label="Project details overlay"
          >
            <motion.div
              variants={modalVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%", maxWidth: 900 }}
            >
              <ProjectModal
                project={selectedProject}
                onClose={handleCloseProject}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewProject && (
          <motion.div
            className="ps-overlay"
            variants={overlayVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handlePreviewOverlayClick}
            aria-label="Project preview overlay"
          >
            <motion.div
              variants={modalVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%", maxWidth: 640 }}
            >
              <ProjectPreviewModal
                project={previewProject}
                onClose={handleClosePreview}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

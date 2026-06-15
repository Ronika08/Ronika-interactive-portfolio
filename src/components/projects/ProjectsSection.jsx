/**
 * ProjectsSection.jsx
 * Obsidian Glass Design — Fully data-driven from projects.json
 * No hardcoded project cards. Add/remove projects via JSON only.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projectsData from "../../data/projects.json";
import "./ProjectsSection.css";

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

/* ─── Project Card ───────────────────────────────────────────── */
function ProjectCard({ project, onClick }) {
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
    </motion.article>
  );
}

/* ─── Main Section ───────────────────────────────────────────── */
export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  /* Derive categories dynamically from JSON — no hardcoding */
  const categories = getAllCategories(projectsData);

  /* Filter projects by selected category */
  const filteredProjects =
    activeFilter === "All"
      ? projectsData
      : projectsData.filter((p) => p.category === activeFilter);

  const handleOpenProject  = useCallback((project) => setSelectedProject(project), []);
  const handleCloseProject = useCallback(() => setSelectedProject(null), []);

  /* Click outside overlay to close */
  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) handleCloseProject(); },
    [handleCloseProject]
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
    </section>
  );
}

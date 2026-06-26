/**
 * CertificatesSection.jsx
 * Obsidian Glass Design — Fully data-driven from certificates.json
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import certsData from "../../data/certificates.json";
import "./CertificatesSection.css";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeSlideUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

const overlayAnim = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

const modalAnim = {
  hidden:  { opacity: 0, y: 44, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.22 } },
};

/* ─── Helpers ─────────────────────────────────────────────── */
const ISSUER_ICONS = {
  "Amazon Web Services": "☁️",
  "Google": "🎯",
  "Coursera / DeepLearning.AI": "🧠",
  "DeepLearning.AI": "🧠",
  "Activeloop": "⚡",
  "Meta / Coursera": "🔷",
  "Udemy": "📚",
  "ByteByteGo": "🏗️",
  "Udemy / Maximilian Schwarzmüller": "📚",
  "Coursera / University of Alberta": "🎓",
};

function getIssuerIcon(issuer) {
  return ISSUER_ICONS[issuer] || "🏅";
}

function formatDate(dateStr) {
  if (!dateStr) return "No Expiry";
  const [year, month] = dateStr.split("-");
  const d = new Date(+year, +month - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function getAllIssuers(certs) {
  return ["All", ...new Set(certs.map((c) => c.category))];
}

/* ─── Certificate Modal ───────────────────────────────────── */
function CertModal({ cert, onClose }) {
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const els = modalRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = els[0];
        const last  = els[els.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="cs-modal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cs-modal-title"
    >
      <div className="cs-modal-topbar" aria-hidden="true" />

      <header className="cs-modal-header">
        <div className="cs-modal-logo" aria-hidden="true">{getIssuerIcon(cert.issuer)}</div>
        <div className="cs-modal-header-text">
          <div className="cs-modal-category">{cert.category}</div>
          <h2 className="cs-modal-title" id="cs-modal-title">{cert.title}</h2>
          <p className="cs-modal-issuer">{cert.issuer}</p>
        </div>
        <button
          className="cs-modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close certificate details"
        >✕</button>
      </header>

      <div className="cs-modal-body">
        <div className="cs-modal-row">
          <div className="cs-modal-field">
            <div className="cs-modal-field-label">Issue Date</div>
            <div className="cs-modal-field-value">{formatDate(cert.issueDate)}</div>
          </div>
          <div className="cs-modal-field">
            <div className="cs-modal-field-label">Expiry</div>
            <div className="cs-modal-field-value">{formatDate(cert.expiryDate)}</div>
          </div>
          <div className="cs-modal-field" style={{ gridColumn: "1 / -1" }}>
            <div className="cs-modal-field-label">Credential ID</div>
            <div className="cs-modal-field-value">{cert.credentialId}</div>
          </div>
        </div>

        <div className="cs-modal-skills-section">
          <div className="cs-modal-skills-label">Skills Covered</div>
          <div className="cs-modal-skills-grid">
            {cert.skills.map((s) => (
              <span key={s} className="cs-modal-skill-chip">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <footer className="cs-modal-footer">
        <a
          href={cert.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-btn-primary"
          aria-label={`View ${cert.title} credential`}
        >
          <span aria-hidden="true">🔗</span> View Credential
        </a>
        <button className="cs-btn-secondary" onClick={onClose}>Close</button>
      </footer>
    </div>
  );
}

/* ─── Certificate Card ────────────────────────────────────── */
function CertCard({ cert, onClick }) {
  const visibleSkills = cert.skills.slice(0, 3);
  const overflow = cert.skills.length - 3;

  return (
    <motion.article
      className="cs-card"
      variants={cardAnim}
      layout
      onClick={() => onClick(cert)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(cert)}
      role="button"
      tabIndex={0}
      aria-label={`View ${cert.title} certificate from ${cert.issuer}`}
    >
      <div className="cs-card-logo" aria-hidden="true">{getIssuerIcon(cert.issuer)}</div>

      <div className="cs-card-meta">
        <span className="cs-category-badge">{cert.category}</span>
        <span className="cs-card-date">{formatDate(cert.issueDate)}</span>
      </div>

      <h3 className="cs-card-title">{cert.title}</h3>
      <p className="cs-card-issuer">{cert.issuer}</p>

      <div className="cs-card-skills">
        {visibleSkills.map((s) => (
          <span key={s} className="cs-skill-chip">{s}</span>
        ))}
        {overflow > 0 && <span className="cs-skill-chip">+{overflow} more</span>}
      </div>

      <div className="cs-card-footer">
        <span className="cs-credential-id">{cert.credentialId}</span>
        <span className="cs-view-badge" aria-hidden="true">View ↗</span>
      </div>
    </motion.article>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export default function CertificatesSection() {
  const [query, setQuery]     = useState("");
  const [filter, setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => getAllIssuers(certsData), []);

  const filtered = useMemo(() => {
    return certsData.filter((c) => {
      const matchCat  = filter === "All" || c.category === filter;
      const q = query.toLowerCase();
      const matchQ = !q ||
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, filter]);

  const handleOpen  = useCallback((cert) => setSelected(cert), []);
  const handleClose = useCallback(() => setSelected(null), []);
  const handleOverlay = useCallback(
    (e) => { if (e.target === e.currentTarget) handleClose(); },
    [handleClose]
  );

  return (
    <section className="cs-section" id="certificates" aria-labelledby="cs-section-title">
      <div className="cs-container">

        {/* Header */}
        <motion.header
          className="cs-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlideUp} className="cs-eyebrow">Credentials</motion.div>
          <motion.h1 className="cs-title" id="cs-section-title" variants={fadeSlideUp}>
            Certificates &amp; <span className="cs-title-accent">Certifications</span>
          </motion.h1>
          <motion.p className="cs-subtitle" variants={fadeSlideUp}>
            {certsData.length} credentials across AI/ML, cloud, backend, and systems engineering.
          </motion.p>
        </motion.header>

        {/* Toolbar */}
        <motion.div
          className="cs-toolbar"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
        >
          <motion.div className="cs-search-wrap" variants={fadeSlideUp}>
            <span className="cs-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="cs-search"
              placeholder="Search certificates or skills…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search certificates"
            />
          </motion.div>

          <motion.div className="cs-filters" role="group" aria-label="Filter by category" variants={fadeSlideUp}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cs-filter-btn${filter === cat ? " active" : ""}`}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <motion.span className="cs-count" variants={fadeSlideUp} aria-live="polite">
            {filtered.length} / {certsData.length}
          </motion.span>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${filter}-${query}`}
              className="cs-grid"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="list"
              aria-label="Certificates"
            >
              {filtered.map((cert) => (
                <CertCard key={cert.id} cert={cert} onClick={handleOpen} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="cs-empty"
              variants={fadeSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span className="cs-empty-icon" aria-hidden="true">📭</span>
              <p className="cs-empty-text">No certificates match your search.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="cs-overlay"
            variants={overlayAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlay}
            aria-label="Certificate details overlay"
          >
            <motion.div
              variants={modalAnim}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%", maxWidth: 640 }}
            >
              <CertModal cert={selected} onClose={handleClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

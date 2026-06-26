/**
 * ContactSection.jsx
 * Obsidian Glass — Driven from profile.json
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import profileData from "../../data/profile.json";
import "./ContactSection.css";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeSlideUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const cardAnim = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

/* ─── Copy to Clipboard Hook ─────────────────────────────── */
function useCopy(text) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard API unavailable — silent fail */
    }
  }, [text]);

  return [copied, copy];
}

/* ─── Contact Card component ─────────────────────────────── */
function ContactCard({ icon, iconClass, label, value, children, violet = false }) {
  return (
    <motion.div
      className={`ct-card${violet ? " ct-card-violet" : ""}`}
      variants={cardAnim}
    >
      <div className={`ct-card-icon ${iconClass}`} aria-hidden="true">{icon}</div>
      <div className="ct-card-label">{label}</div>
      <div className="ct-card-value">{value}</div>
      {children}
    </motion.div>
  );
}

/* ─── Email Card (with copy) ─────────────────────────────── */
function EmailCard({ email }) {
  const [copied, copy] = useCopy(email);

  return (
    <ContactCard
      icon="✉️"
      iconClass="ct-icon-cyan"
      label="Email"
      value={<a href={`mailto:${email}`}>{email}</a>}
    >
      <button
        className="ct-card-btn ct-btn-cyan"
        onClick={copy}
        aria-label={copied ? "Email copied!" : "Copy email address"}
      >
        <span aria-hidden="true">{copied ? "✓" : "⎘"}</span>
        {copied ? "Copied!" : "Copy Email"}
      </button>
      <span className={`ct-copy-feedback${copied ? " visible" : ""}`} aria-live="polite">
        ✓ Copied to clipboard
      </span>
    </ContactCard>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export default function ContactSection() {
  const p = profileData;

  return (
    <section className="ct-section" id="contact" aria-labelledby="ct-section-title">
      <div className="ct-container">

        {/* Header */}
        <motion.header
          className="ct-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlideUp} className="ct-eyebrow">Contact</motion.div>
          <motion.h1 className="ct-title" id="ct-section-title" variants={fadeSlideUp}>
            Let's <span className="ct-title-accent">Connect</span>
          </motion.h1>
          <motion.p className="ct-cta-text" variants={fadeSlideUp}>
            Open to full-time roles, freelance projects, and interesting conversations.
            The best ideas start with a simple hello.
          </motion.p>
        </motion.header>

        {/* Availability badge */}
        <motion.div
          className="ct-availability"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeSlideUp}
        >
          <div className="ct-avail-badge" role="status" aria-label={p.availability}>
            <span className="ct-avail-dot" aria-hidden="true" />
            {p.availability}
          </div>
        </motion.div>

        {/* Contact cards grid */}
        <motion.div
          className="ct-grid ct-grid-wide"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {/* Email */}
          <EmailCard email={p.email} />

          {/* GitHub */}
          <ContactCard
            icon="🐙"
            iconClass="ct-icon-violet"
            label="GitHub"
            value={<a href={p.github} target="_blank" rel="noopener noreferrer">
              {p.github.replace("https://", "")}
            </a>}
            violet
          >
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-card-btn ct-btn-violet"
              aria-label="Open GitHub profile"
            >
              <span aria-hidden="true">↗</span> Open GitHub
            </a>
          </ContactCard>

          {/* LinkedIn */}
          <ContactCard
            icon="💼"
            iconClass="ct-icon-cyan"
            label="LinkedIn"
            value={<a href={p.linkedin} target="_blank" rel="noopener noreferrer">
              {p.linkedin.replace("https://", "")}
            </a>}
          >
            <a
              href={p.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-card-btn ct-btn-cyan"
              aria-label="Open LinkedIn profile"
            >
              <span aria-hidden="true">↗</span> Open LinkedIn
            </a>
          </ContactCard>
        </motion.div>

        {/* Location card — secondary row */}
        <motion.div
          className="ct-grid"
          style={{ gridTemplateColumns: "1fr" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className="ct-card" variants={cardAnim}>
            <div className="ct-card-icon ct-icon-green" aria-hidden="true">📍</div>
            <div className="ct-card-label">Location</div>
            <div className="ct-card-value">{p.location}</div>
            <p style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              Available for remote opportunities globally and on-site roles in India.
            </p>
          </motion.div>
        </motion.div>

        {/* CTA block */}
        <motion.div
          className="ct-cta-block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeSlideUp}
          style={{ marginTop: 20 }}
        >
          <h2 className="ct-cta-headline">Ready to build something remarkable?</h2>
          <p className="ct-cta-sub">
            Whether it's a full-time role, a freelance contract, or a collaboration —
            reach out and let's figure out if we're a good fit.
          </p>
          <div className="ct-cta-buttons">
            <a
              href={`mailto:${p.email}`}
              className="ct-btn-primary"
              aria-label="Send an email"
            >
              ✉️ Send an Email
            </a>
            <a
              href={p.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-btn-ghost"
              aria-label="Connect on LinkedIn"
            >
              💼 Connect on LinkedIn
            </a>
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-btn-ghost"
              aria-label="See my work on GitHub"
            >
              🐙 See My Work
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="ct-footer-line"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          Built with <span>React + Vite</span> · Designed in <span>Obsidian Glass</span> · {new Date().getFullYear()}
        </motion.p>
      </div>
    </section>
  );
}

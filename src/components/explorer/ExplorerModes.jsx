// ExplorerModes.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import explorerModes from '../../data/explorerModes.json';
import profile from '../../data/profile.json';
import RiddleGame from './RiddleGame';
import './ExplorerModes.css';

/* ── per-card CSS modifier map ── */
const CARD_MOD = {
  'curious-explorer': 'explorer-card--curious',
  'recruiter-rush':   'explorer-card--recruiter',
  'challenge-mode':   'explorer-card--challenge',
};

/* ── Mode → destination section mapping ──────────────────────────
   Each mode routes to the existing section that best matches its
   promise, using the real section `id`s already rendered by App.jsx.
   No new sections are invented here — only real DOM targets.
   Challenge Mode and Recruiter Rush have no scroll target here:
   instead of routing away, they render a panel in place (see below). */
const MODE_TARGETS = {
  'curious-explorer': { id: 'projects', label: 'Projects' },
};

/* Real section ids already rendered by App.jsx — used by the
   Recruiter Rush panel's step-through CTAs. Verified against
   AchievementsSection.jsx (`id="achievements"`), SkillsSection.jsx
   (`id="skills"`), and ContactSection.jsx (`id="contact"`); nothing
   here is guessed. */
const RECRUITER_SECTION_IDS = {
  achievements: 'achievements',
  skills: 'skills',
  contact: 'contact',
};

/* Modes whose full promise is built and ready to use as-is.
   Challenge Mode renders a real RiddleGame component, and Recruiter
   Rush now renders a real guided profile panel — neither is a
   placeholder anymore. */
const MODE_READY = {
  'curious-explorer': true,
  'recruiter-rush':   true,
  'challenge-mode':   true,
};

/* ── animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants = {
  hidden:  { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

/* Subtle entrance for panels rendered below the cards — consistent
   with the rest of the section's motion language, nothing flashy. */
const panelVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

/* Visually-hidden but screen-reader-accessible style — used for the
   live status announcement without touching the stylesheet. */
const srOnlyStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/* ── ArrowRight micro-icon ── */
function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Single card ── */
function ExplorerCard({ mode, isActive, onSelect }) {
  const mod = CARD_MOD[mode.id] ?? '';
  const ready = MODE_READY[mode.id] ?? true;

  function handleClick() {
    onSelect(mode);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <motion.div
      className={`explorer-card ${mod}${isActive ? ' explorer-card--active' : ''}`}
      variants={cardVariants}
      whileHover={{
        y: -10,
        scale: 1.025,
        transition: { type: 'spring', stiffness: 280, damping: 22 },
      }}
      whileTap={{ scale: 0.975 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={
        ready
          ? `Select ${mode.title}`
          : `Select ${mode.title} — coming soon, currently routes to Projects`
      }
    >
      {/* Icon */}
      <span className="explorer-card__icon" aria-hidden="true">
        {mode.icon}
      </span>

      {/* Title */}
      <h3 className="explorer-card__title">
        {mode.title}
        {!ready && (
          <span className="explorer-card__badge" aria-hidden="true">
            Coming Soon
          </span>
        )}
      </h3>

      {/* Description */}
      <p className="explorer-card__desc">{mode.description}</p>

      {/* Divider */}
      <hr className="explorer-card__divider" />

      {/* Sections */}
      <p className="explorer-card__sections-label">Includes</p>
      <ul className="explorer-card__sections">
        {mode.sections.map((section) => (
          <li key={section} className="explorer-card__section-item">
            {section}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="explorer-card__cta" aria-hidden="true">
        {ready ? 'Enter mode' : 'Preview mode'} <ArrowRight />
      </div>
    </motion.div>
  );
}

/* ── Recruiter Rush guided panel ──────────────────────────────────
   A 60-second, recruiter-oriented profile summary sourced entirely
   from profile.json (no invented experience/metrics/claims), with
   step-through CTAs that scroll to the real Achievements, Skills,
   and Contact sections already rendered by App.jsx.
   Reuses the existing .explorer-card family of classes (rather than
   introducing new ones) so it inherits the same glass/dark visual
   language as the mode cards above it. */
function RecruiterRushPanel({ onNavigate }) {
  const strengths = Array.isArray(profile?.strengths) ? profile.strengths : [];

  return (
    <div className="explorer-card explorer-card--recruiter explorer-card--active">
      <span className="explorer-card__icon" aria-hidden="true">⏱️</span>

      <h3 className="explorer-card__title">60-Second Profile</h3>

      <p className="explorer-card__desc">
        {profile?.name}
        {profile?.headline ? ` — ${profile.headline}` : ''}
      </p>
      <p className="explorer-card__desc">
        Based in {profile?.location}.
      </p>
      {(profile?.branch || profile?.college) && (
        <p className="explorer-card__desc">
          Studying {profile?.branch}
          {profile?.college ? ` at ${profile.college}` : ''}
          {profile?.graduationYear ? ` — graduating ${profile.graduationYear}` : ''}
          {profile?.cgpa ? ` (CGPA ${profile.cgpa})` : ''}.
        </p>
      )}
      {profile?.availability && (
        <p className="explorer-card__desc">{profile.availability}.</p>
      )}
      <p className="explorer-card__desc">Career direction: Software Engineering + AI.</p>
      {profile?.whySoftwareEngineering && (
        <p className="explorer-card__desc">
          <strong>Why software engineering:</strong> {profile.whySoftwareEngineering}
        </p>
      )}
      {profile?.whyAI && (
        <p className="explorer-card__desc">
          <strong>Why AI:</strong> {profile.whyAI}
        </p>
      )}

      {strengths.length > 0 && (
        <>
          <hr className="explorer-card__divider" />
          <p className="explorer-card__sections-label">Strengths</p>
          <ul className="explorer-card__sections">
            {strengths.map((strength) => (
              <li key={strength} className="explorer-card__section-item">
                {strength}
              </li>
            ))}
          </ul>
        </>
      )}

      <hr className="explorer-card__divider" />
      <p className="explorer-card__sections-label">Continue</p>

      <div>
        <button
          type="button"
          className="explorer-card__cta"
          onClick={() => onNavigate(RECRUITER_SECTION_IDS.achievements)}
        >
          View Achievements <ArrowRight />
        </button>
      </div>
      <div>
        <button
          type="button"
          className="explorer-card__cta"
          onClick={() => onNavigate(RECRUITER_SECTION_IDS.skills)}
        >
          Explore My Skills <ArrowRight />
        </button>
      </div>
      <div>
        <button
          type="button"
          className="explorer-card__cta"
          onClick={() => onNavigate(RECRUITER_SECTION_IDS.contact)}
        >
          Let&rsquo;s Connect <ArrowRight />
        </button>
      </div>
    </div>
  );
}

/* ── Root component ── */
export default function ExplorerModes() {
  const [activeId, setActiveId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const panelRef = useRef(null);

  const handleSelect = useCallback((mode) => {
    setActiveId(mode.id);

    /* Challenge Mode and Recruiter Rush render a panel in place
       instead of routing away to another section — their
       "destination" is the panel below the cards, not an existing
       page section. */
    if (mode.id === 'challenge-mode') {
      setStatusMessage(
        `${mode.title} selected. A technical challenge has appeared below — solve it to unlock a project.`
      );
      return;
    }
    if (mode.id === 'recruiter-rush') {
      setStatusMessage(
        `${mode.title} selected. A 60-second profile summary has appeared below.`
      );
      return;
    }

    const target = MODE_TARGETS[mode.id];
    const ready = MODE_READY[mode.id] ?? true;

    if (target) {
      const el = document.getElementById(target.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    setStatusMessage(
      ready
        ? `${mode.title} selected. Taking you to ${target?.label ?? 'the relevant section'}.`
        : `${mode.title} is coming soon. Taking you to ${target?.label ?? 'Projects'} in the meantime.`
    );
  }, []);

  /* Used by the Recruiter Rush panel's step-through CTAs to jump to
     a real existing section. Same safe fallback pattern used
     elsewhere in the app. */
  const handleSectionNav = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* When Challenge Mode or Recruiter Rush becomes active, bring its
     panel into view — the cards stay visible above it, this just
     makes sure the newly rendered panel isn't missed below the fold. */
  useEffect(() => {
    if ((activeId === 'challenge-mode' || activeId === 'recruiter-rush') && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeId]);

  return (
    <section className="explorer-modes" id="explorer-modes">
      {/* Heading */}
      <motion.h2
        className="explorer-modes__heading"
        variants={headingVariants}
        initial="hidden"
        animate="visible"
      >
        Choose Your <span>Explorer Type</span>
      </motion.h2>

      <motion.p
        className="explorer-modes__sub"
        variants={headingVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        Pick the lens that fits how you explore best.
      </motion.p>

      {/* Cards grid */}
      <motion.div
        className="explorer-modes__grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {explorerModes.map((mode) => (
          <ExplorerCard
            key={mode.id}
            mode={mode}
            isActive={activeId === mode.id}
            onSelect={handleSelect}
          />
        ))}
      </motion.div>

      {/* Mode panel — rendered directly below the cards, which
          remain visible above it. Challenge Mode and Recruiter Rush
          each own their panel's internal state and data; this
          component only decides which one to mount. */}
      <AnimatePresence mode="wait">
        {activeId === 'challenge-mode' && (
          <motion.div
            key="challenge-panel"
            ref={panelRef}
            className="explorer-modes__game-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <RiddleGame />
          </motion.div>
        )}
        {activeId === 'recruiter-rush' && (
          <motion.div
            key="recruiter-panel"
            ref={panelRef}
            className="explorer-modes__game-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <RecruiterRushPanel onNavigate={handleSectionNav} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen-reader-only live status — announces the routing decision
          without adding any visible UI or touching the stylesheet. */}
      <p style={srOnlyStyle} role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

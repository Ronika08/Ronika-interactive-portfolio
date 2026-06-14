// ExplorerModes.jsx
import { motion } from 'framer-motion';
import explorerModes from '../../data/explorerModes.json';import './ExplorerModes.css';

/* ── per-card CSS modifier map ── */
const CARD_MOD = {
  'curious-explorer': 'explorer-card--curious',
  'recruiter-rush':   'explorer-card--recruiter',
  'challenge-mode':   'explorer-card--challenge',
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
function ExplorerCard({ mode }) {
  const mod = CARD_MOD[mode.id] ?? '';

  function handleClick() {
    console.log('selected mode id:', mode.id);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <motion.div
      className={`explorer-card ${mod}`}
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
      aria-label={`Select ${mode.title}`}
    >
      {/* Icon */}
      <span className="explorer-card__icon" aria-hidden="true">
        {mode.icon}
      </span>

      {/* Title */}
      <h3 className="explorer-card__title">{mode.title}</h3>

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
        Enter mode <ArrowRight />
      </div>
    </motion.div>
  );
}

/* ── Root component ── */
export default function ExplorerModes() {
  return (
    <section className="explorer-modes">
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
          <ExplorerCard key={mode.id} mode={mode} />
        ))}
      </motion.div>
    </section>
  );
}

// SkillsSection.jsx
import { motion } from 'framer-motion';
import skills from "../../data/skills.json";
import './SkillsSection.css';

/* ── Category metadata ── */
const CAT_META = {
  Programming: { icon: '⚡', mod: 'skill-cat-card--programming' },
  Frontend:    { icon: '🎨', mod: 'skill-cat-card--frontend' },
  Backend:     { icon: '🔧', mod: 'skill-cat-card--backend' },
  Database:    { icon: '🗄️', mod: 'skill-cat-card--database' },
  AI:          { icon: '🤖', mod: 'skill-cat-card--ai' },
  Tools:       { icon: '🛠️', mod: 'skill-cat-card--tools' },
};

/* ── Animation variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const gridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const chipStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const chipAnim = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/* ── Single category card ── */
function SkillCatCard({ category, items }) {
  const meta = CAT_META[category] ?? { icon: '💡', mod: '' };

  return (
    <motion.div
      className={`skill-cat-card ${meta.mod}`}
      variants={cardAnim}
      whileHover={{
        y: -8,
        transition: { type: 'spring', stiffness: 280, damping: 22 },
      }}
    >
      <div className="skill-cat-card__accent-bar" aria-hidden="true" />

      <div className="skill-cat-card__header">
        <span className="skill-cat-card__icon" aria-hidden="true">{meta.icon}</span>
        <h3 className="skill-cat-card__name">{category}</h3>
      </div>

      <motion.div
        className="skill-chips"
        variants={chipStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
      >
        {items.map((skill) => (
          <motion.span
            key={skill}
            className="skill-chip"
            variants={chipAnim}
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────── */
export default function SkillsSection() {
  /*
   * skills.json can be:
   *   { Programming: [...], Frontend: [...], ... }  ← object form
   *   [ { category: "Programming", items: [...] }, ... ] ← array form
   */
  const categories = Array.isArray(skills)
    ? skills
    : Object.entries(skills).map(([category, items]) => ({ category, items }));

  /* Order matches the spec: Programming, Frontend, Backend, Database, AI, Tools */
  const ORDER = ['Programming', 'Frontend', 'Backend', 'Database', 'AI', 'Tools'];
  const sorted = [...categories].sort((a, b) => {
    const ai = ORDER.indexOf(a.category);
    const bi = ORDER.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <section className="skills-section" id="skills">
      <div className="skills-section__inner">

        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p className="skills-section__eyebrow">Technical Proficiency</p>
          <h2 className="skills-section__title">
            Skills &amp; <span>Technologies</span>
          </h2>
        </motion.div>

        {/* ── Grid ── */}
        <motion.div
          className="skills-grid"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {sorted.map(({ category, items }) => (
            <SkillCatCard key={category} category={category} items={items ?? []} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}

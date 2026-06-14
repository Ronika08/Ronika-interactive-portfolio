// AboutSection.jsx
import { motion } from 'framer-motion';
import profile from "../../data/profile.json";
import './AboutSection.css';

/* ── Animation variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemFade = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ── Scroll-aware wrapper ── */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section label ── */
function BlockLabel({ text }) {
  return <p className="about-block__label">{text}</p>;
}

/* ─────────────────────────────────── */
export default function AboutSection() {
  const {
    name,
    description,
    careerGoal,
    location,
    preferredLocation,
    whySoftwareEngineering,
    whyAI,
    motivation,
    strengths = [],
    interests = [],
  } = profile;

  return (
    <section className="about-section" id="about">
      <div className="about-section__inner">

        {/* ── Header ── */}
        <Reveal>
          <p className="about-section__eyebrow">Personal Profile</p>
          <h2 className="about-section__title">
            About <span>{name?.split(' ')[0] ?? 'Me'}</span>
          </h2>
        </Reveal>

        {/* ── 1. Who is Ronika? ── */}
        <Reveal delay={0.05} className="about-block">
          <BlockLabel text="Who is Ronika?" />
          <div className="about-profile-card">
            <p className="about-profile__summary">{description}</p>
            {careerGoal && (
              <p className="about-profile__goal">{careerGoal}</p>
            )}
            <div className="about-profile__meta">
              {location && (
                <span className="about-meta-chip">
                  <span className="about-meta-chip__icon">📍</span>
                  {location}
                </span>
              )}
              {preferredLocation && (
                <span className="about-meta-chip">
                  <span className="about-meta-chip__icon">🎯</span>
                  Open to {preferredLocation}
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── 2. Why Software Engineering? ── */}
        {whySoftwareEngineering && (
          <Reveal delay={0.08} className="about-block">
            <BlockLabel text="Why Software Engineering?" />
            <div className="about-narrative">{whySoftwareEngineering}</div>
          </Reveal>
        )}

        {/* ── 3. Why AI? ── */}
        {whyAI && (
          <Reveal delay={0.08} className="about-block">
            <BlockLabel text="Why AI?" />
            <div className="about-narrative">{whyAI}</div>
          </Reveal>
        )}

        {/* ── 4. What Motivates Me? ── */}
        {motivation && (
          <Reveal delay={0.08} className="about-block">
            <BlockLabel text="What Motivates Me?" />
            <div className="about-narrative">{motivation}</div>
          </Reveal>
        )}

        {/* ── 5. Strengths ── */}
        {strengths.length > 0 && (
          <div className="about-block">
            <Reveal delay={0.04}>
              <BlockLabel text="Strengths" />
            </Reveal>
            <motion.div
              className="about-strengths-grid"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {strengths.map((s) => (
                <motion.div
                  key={s}
                  className="about-strength-card"
                  variants={itemFade}
                  whileHover={{
                    y: -5,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                >
                  <span className="about-strength-card__dot" aria-hidden="true" />
                  {s}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── 6. Interests ── */}
        {interests.length > 0 && (
          <div className="about-block">
            <Reveal delay={0.04}>
              <BlockLabel text="Interests" />
            </Reveal>
            <motion.div
              className="about-interests"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {interests.map((interest) => (
                <motion.span
                  key={interest}
                  className="about-interest-tag"
                  variants={itemFade}
                  whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 320, damping: 18 } }}
                >
                  {interest}
                </motion.span>
              ))}
            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
}

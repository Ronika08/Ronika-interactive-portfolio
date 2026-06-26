/**
 * AchievementsSection.jsx
 * Obsidian Glass — Timeline layout, fully data-driven from achievements.json
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import achievementsData from "../../data/achievements.json";
import "./AchievementsSection.css";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeSlideUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemAnim = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const statAnim = {
  hidden:  { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

/* ─── Helpers ─────────────────────────────────────────────── */
const CATEGORY_META = {
  Hackathon:    { icon: "🏆", label: "Hackathon"    },
  GitHub:       { icon: "⚡", label: "GitHub"       },
  DSA:          { icon: "🧠", label: "DSA"          },
  "Open Source":{ icon: "🔀", label: "Open Source"  },
  Impact:       { icon: "🚀", label: "Impact"       },
  Certification:{ icon: "📜", label: "Certification"},
  Learning:     { icon: "🎓", label: "Learning"     },
  Engineering:  { icon: "🛠️", label: "Engineering"  },
};

function getCatClass(cat) {
  const map = {
    Hackathon:     "as-cat-hackathon",
    GitHub:        "as-cat-github",
    DSA:           "as-cat-dsa",
    "Open Source": "as-cat-opensource",
    Impact:        "as-cat-impact",
    Certification: "as-cat-certification",
    Learning:      "as-cat-learning",
    Engineering:   "as-cat-engineering",
  };
  return map[cat] || "as-cat-default";
}

function formatDate(dateStr) {
  const [year, month] = dateStr.split("-");
  return new Date(+year, +month - 1, 1).toLocaleDateString("en-IN", {
    month: "short", year: "numeric",
  });
}

/* ─── Animated Counter ────────────────────────────────────── */
function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.onChange((v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}</span>;
}

/* ─── Stats Bar ───────────────────────────────────────────── */
function StatsBar({ data }) {
  const highlight = data.filter((a) => a.highlight).length;
  const categories = new Set(data.map((a) => a.category)).size;

  const stats = [
    { label: "Achievements", value: data.length },
    { label: "Highlights",   value: highlight   },
    { label: "Categories",   value: categories  },
  ];

  return (
    <motion.div
      className="as-stats"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {stats.map((s) => (
        <motion.div key={s.label} className="as-stat" variants={statAnim}>
          <span className="as-stat-number">
            <AnimatedNumber value={s.value} />+
          </span>
          <span className="as-stat-label">{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─── Achievement Card ────────────────────────────────────── */
function AchievementCard({ item }) {
  return (
    <motion.div
      className={`as-item${item.highlight ? " highlight" : ""}`}
      variants={itemAnim}
      layout
    >
      <div className="as-dot" aria-hidden="true" />
      <div className="as-card">
        <div className="as-icon" aria-hidden="true">{item.icon}</div>
        <div className="as-content">
          <div className="as-card-top">
            <span className={`as-cat-badge ${getCatClass(item.category)}`}>{item.category}</span>
            {item.highlight && (
              <span className="as-highlight-badge">★ Highlight</span>
            )}
            <span className="as-date">{formatDate(item.date)}</span>
          </div>
          <h3 className="as-card-title">{item.title}</h3>
          <p className="as-card-desc">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Section ────────────────────────────────────────── */
export default function AchievementsSection() {
  const [activeFilter, setActiveFilter] = useState("All");

  /* Derive categories + "All" dynamically */
  const categories = useMemo(() => {
    const cats = [...new Set(achievementsData.map((a) => a.category))];
    return ["All", ...cats];
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return achievementsData;
    return achievementsData.filter((a) => a.category === activeFilter);
  }, [activeFilter]);

  return (
    <section className="as-section" id="achievements" aria-labelledby="as-section-title">
      <div className="as-container">

        {/* Header */}
        <motion.header
          className="as-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div variants={fadeSlideUp} className="as-eyebrow">Journey</motion.div>
          <motion.h1 className="as-title" id="as-section-title" variants={fadeSlideUp}>
            Achievements &amp; <span className="as-title-accent">Milestones</span>
          </motion.h1>
          <motion.p className="as-subtitle" variants={fadeSlideUp}>
            A record of wins, lessons, and moments worth remembering.
          </motion.p>
        </motion.header>

        {/* Stats */}
        <StatsBar data={achievementsData} />

        {/* Filters */}
        <motion.nav
          className="as-filters"
          role="navigation"
          aria-label="Filter achievements"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              variants={fadeSlideUp}
              className={`as-filter-btn${activeFilter === cat ? " active" : ""}`}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
            >
              {cat !== "All" && (
                <span className="as-filter-icon" aria-hidden="true">
                  {CATEGORY_META[cat]?.icon || "•"}
                </span>
              )}
              {cat}
            </motion.button>
          ))}
        </motion.nav>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeFilter}
              className="as-timeline"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              role="list"
              aria-label="Achievement timeline"
            >
              {filtered.map((item) => (
                <AchievementCard key={item.id} item={item} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="as-empty"
              variants={fadeSlideUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <span className="as-empty-icon" aria-hidden="true">🔭</span>
              <p className="as-empty-text">No achievements in this category yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./LandingPage.css";
import profileData from "../../data/profile.json";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

// ─── Profile data (loaded from src/data/profile.json) ─────────────────────────
// Vite supports JSON imports natively. The component reads from the expected path.
// If the file doesn't exist yet, fallback defaults are used so the UI never breaks.


const FALLBACK = {
  name:         "Ronika S",
  tagline:      "Passionate About Technology, Focused on Impact",
  subtitle:     "Every Click Reveals a Story",
  headline:     "Every Click Reveals a Story",
  description:  "A Software Developer and AI enthusiast passionate about building intelligent, scalable, and impactful digital solutions.",
  typingRoles:  ["Developer", "Designer", "Builder", "Creator"],
  availability: "Available for opportunities",
  github:       "https://github.com/",
  linkedin:     "https://linkedin.com/in/",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(words, { typeSpeed = 80, deleteSpeed = 45, pause = 1800 } = {}) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [typing, setTyping]   = useState(true);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce) { setDisplay(words[0]); return; }

    const target = words[wordIdx];

    if (typing) {
      if (display.length < target.length) {
        const t = setTimeout(() => setDisplay(target.slice(0, display.length + 1)), typeSpeed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), pause);
        return () => clearTimeout(t);
      }
    } else {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay(display.slice(0, -1)), deleteSpeed);
        return () => clearTimeout(t);
      } else {
        setWordIdx((i) => (i + 1) % words.length);
        setTyping(true);
      }
    }
  }, [display, typing, wordIdx, words, typeSpeed, deleteSpeed, pause, shouldReduce]);

  return display;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 28 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const cardVariant = {
  initial:   { opacity: 0, y: 40, scale: 0.97 },
  animate:   { opacity: 1, y: 0,  scale: 1 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage({ profile }) {
  // Merge: prop > imported JSON > fallback
  
  const data = { ...FALLBACK, ...profileData, ...profile };
  const { name, tagline, headline, description, typingRoles, availability, github, linkedin } = data;

  const roles = Array.isArray(typingRoles) && typingRoles.length ? typingRoles : FALLBACK.typingRoles;
  const typed = useTypewriter(roles);
  const shouldReduce = useReducedMotion();
  const motionProps = shouldReduce ? { initial: false } : {};

  return (
    <section className="hero" aria-label="Hero section">
      {/* Ambient orbs */}
      <div className="hero__orb hero__orb--cyan"   aria-hidden="true" />
      <div className="hero__orb hero__orb--violet" aria-hidden="true" />
      <div className="hero__orb hero__orb--mid"    aria-hidden="true" />
      <div className="hero__grid"                  aria-hidden="true" />

      {/* Glass card */}
      <motion.div
        className="hero__card"
        {...cardVariant}
        {...motionProps}
      >
        {/* Badge */}
        <motion.div className="hero__badge" {...fadeUp(0.1)} {...motionProps}>
          <span className="hero__badge-dot" aria-hidden="true" />
          {availability}
        </motion.div>

        {/* Name */}
        <motion.h1 className="hero__name" {...fadeUp(0.2)} {...motionProps}>
          {name}
        </motion.h1>

        {/* Tagline */}
        <motion.p className="hero__tagline" {...fadeUp(0.3)} {...motionProps}>
          {tagline}
        </motion.p>

        {/* Typewriter */}
        <motion.div className="hero__typewriter-row" {...fadeUp(0.35)} {...motionProps}>
          <span className="hero__typewriter-label">I am a</span>
          <span className="hero__typewriter" aria-live="polite" aria-atomic="true">
            {typed}
            <span className="hero__cursor" aria-hidden="true" />
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div className="hero__divider" {...fadeUp(0.4)} {...motionProps} aria-hidden="true" />

        {/* Headline + Description */}
        <motion.p className="hero__subtitle" {...fadeUp(0.45)} {...motionProps}>
          {headline && <><strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{headline}</strong>&nbsp;— </>}
          {description}
        </motion.p>

        {/* CTA buttons */}
        <motion.div className="hero__actions" {...fadeUp(0.55)} {...motionProps}>
          <button
            className="btn btn--primary"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
            aria-label="Start Exploring"
          >
            Start Exploring <ArrowRightIcon />
          </button>

          <a
  className="btn btn--secondary"
  href="/resume.pdf"
  target="_blank"
  rel="noopener noreferrer"
>
  <FileIcon /> View Resume
</a>

<a
  className="btn btn--ghost"
  href="/resume.pdf"
  download="Ronika_S_Resume.pdf"
>
  ⬇️ Download Resume
</a>

          <a
  className="btn btn--ghost"
  href={data.github}
  target="_blank"
  rel="noopener noreferrer"
>
<FaGithub size={20} /></a>

          <a
            className="btn btn--ghost"
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile (opens in new tab)"
          >
<FaLinkedin size={20} color="#0A66C2" />          </a>

<a
  className="btn btn--ghost"
href="https://mail.google.com/mail/?view=cm&fs=1&to=ronikaronu8867@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
>
  <SiGmail size={20} color="#EA4335" />
  Email Me
</a>
<a
  className="btn btn--ghost"
href="https://wa.me/918867837633?text=Hi%20Ronika."
  target="_blank"
  rel="noopener noreferrer"
>
  <FaWhatsapp size={20} color="#25D366" />
  WhatsApp
</a>

        </motion.div>

        {/* Social strip */}
       
      </motion.div>
    </section>
  );
}

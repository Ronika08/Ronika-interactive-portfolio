// Chatbot.jsx
// "RoniGenie 🪄🤖💬" — a local, rule-based portfolio assistant. Two-layer
// response system: (1) keyword/intent matching against
// src/data/chatbot.json for known portfolio topics, (2) a graceful
// fallback when nothing matches. No external AI API, no backend
// calls, no invented facts — project/achievement/certificate details
// are read live from their existing JSON files so this never drifts
// out of sync with the rest of the portfolio.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import chatbot from '../../data/chatbot.json';
import projectsJson from '../../data/projects.json';
import achievementsJson from '../../data/achievements.json';
import certificatesJson from '../../data/certificates.json';
import skillsJson from '../../data/skills.json';
import { getEffectiveData, DOMAINS } from '../../utils/portfolioStorage';
import './Chatbot.css';

const projects = getEffectiveData(DOMAINS.PROJECTS, projectsJson);
const achievements = getEffectiveData(DOMAINS.ACHIEVEMENTS, achievementsJson);
const certificates = getEffectiveData(DOMAINS.CERTIFICATES, certificatesJson);
const skills = getEffectiveData(DOMAINS.SKILLS, skillsJson);

/* Safe navigation to an existing section by its real id. Scroll is a
   no-op (never crashes) if the id isn't found on the page. */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

let messageCounter = 0;
function nextMessageId() {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

/* ── Response builders ──────────────────────────────────────────
   Each returns { text, options?, links? }. `options` are chips that
   trigger another intent; `links` are real outbound/file URLs
   rendered as anchors. Nothing here is invented — every fact comes
   from chatbot.json or the portfolio's existing data files. */

function buildMenuResponse() {
  return {
    text: 'What would you like to know?',
    options: chatbot.menu,
  };
}

function buildAboutResponse() {
  const p = chatbot.profile ?? {};
  const parts = [
    [p.name, p.headline].filter(Boolean).join(' — '),
    p.location,
    p.availability,
  ].filter(Boolean);

  return {
    text: parts.join('. ') + (parts.length ? '.' : ''),
    options: chatbot.aboutFollowUps ?? [{ id: 'menu', label: 'Back to Menu' }],
  };
}

function buildSimpleTextResponse(text) {
  return {
    text: text || "I don't have that information yet.",
    options: [{ id: 'menu', label: 'Back to Menu' }],
  };
}

function buildProjectsResponse() {
  if (!Array.isArray(projects) || projects.length === 0) {
    return {
      text: "Project details aren't available right now.",
      options: [{ id: 'menu', label: 'Main Menu' }],
    };
  }
  const lines = projects.map((proj) => `• ${proj.title ?? 'Untitled project'} — ${proj.status ?? 'Status unknown'}`);
  const options = projects
    .filter((proj) => proj?.id)
    .map((proj) => ({ id: `project:${proj.id}`, label: `Learn More: ${proj.title ?? proj.id}` }));
  options.push({ id: 'menu', label: 'Main Menu' });

  return {
    text: `Here's what Ronika has been building:\n${lines.join('\n')}`,
    options,
  };
}

function buildProjectDetailResponse(projectId) {
  const proj = Array.isArray(projects) ? projects.find((p) => p.id === projectId) : null;

  if (!proj) {
    return {
      text: "I couldn't find details for that project.",
      options: [{ id: 'projects', label: 'Back to Projects' }, { id: 'menu', label: 'Main Menu' }],
    };
  }

  const desc = proj.shortDescription || proj.tagline || 'No description available yet.';
  const text = `${proj.title ?? 'This project'} (${proj.status ?? 'Status unknown'})\n${desc}`;

  return {
    text,
    options: [
      { id: 'nav:projects', label: 'View Projects Section' },
      { id: 'projects', label: 'Back to Projects' },
    ],
  };
}

function buildSkillsResponse() {
  if (!skills || typeof skills !== 'object' || Array.isArray(skills)) {
    return {
      text: "Skills information isn't available right now.",
      options: [{ id: 'menu', label: 'Main Menu' }],
    };
  }
  const lines = Object.entries(skills).map(
    ([category, list]) => `${category}: ${Array.isArray(list) ? list.join(', ') : ''}`
  );
  return {
    text: lines.length ? lines.join('\n') : "Skills information isn't available right now.",
    options: [
      { id: 'nav:skills', label: 'View Full Skills' },
      { id: 'menu', label: 'Main Menu' },
    ],
  };
}

function buildAchievementsResponse() {
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return {
      text: "Achievement details aren't available right now.",
      options: [{ id: 'menu', label: 'Main Menu' }],
    };
  }
  const highlights = achievements.filter((a) => a?.highlight);
  const shown = (highlights.length ? highlights : achievements).slice(0, 5);
  const lines = shown.map((a) => `${a.icon ?? '•'} ${a.title ?? 'Achievement'}`);

  return {
    text: `A few highlights out of ${achievements.length} logged achievements:\n${lines.join('\n')}`,
    options: [
      { id: 'nav:achievements', label: 'View Achievements' },
      { id: 'menu', label: 'Main Menu' },
    ],
  };
}

function buildCertificatesResponse() {
  if (!Array.isArray(certificates) || certificates.length === 0) {
    return {
      text: "Certificate details aren't available right now.",
      options: [{ id: 'menu', label: 'Main Menu' }],
    };
  }
  const lines = certificates
    .slice(0, 6)
    .map((c) => `• ${c.title ?? 'Certificate'}${c.issuer ? ` — ${c.issuer}` : ''}${c.status === 'Coming Soon' ? ' (Coming Soon)' : ''}`);
  const more = certificates.length > 6 ? `\n…and ${certificates.length - 6} more.` : '';

  return {
    text: `${lines.join('\n')}${more}`,
    options: [
      { id: 'nav:certificates', label: 'View Certificates' },
      { id: 'menu', label: 'Main Menu' },
    ],
  };
}

function buildEducationResponse() {
  const e = chatbot.education ?? {};
  const text = [e.college, e.branch, e.cgpa ? `CGPA: ${e.cgpa}` : null, e.graduationYear ? `Graduation: ${e.graduationYear}` : null]
    .filter(Boolean)
    .join('\n');
  return {
    text: text || "Education details aren't available right now.",
    options: [{ id: 'menu', label: 'Back to Menu' }],
  };
}

function buildContactResponse() {
  const c = chatbot.contact ?? {};
  const p = chatbot.profile ?? {};
  const textLines = [
    p.location ? `Location: ${p.location}` : null,
    p.availability,
  ].filter(Boolean);

  const links = [
    c.email ? { label: 'Email', url: `mailto:${c.email}` } : null,
    c.github ? { label: 'GitHub', url: c.github } : null,
    c.linkedin ? { label: 'LinkedIn', url: c.linkedin } : null,
  ].filter(Boolean);

  return {
    text: textLines.join('\n'),
    links,
    options: [
      { id: 'nav:contact', label: 'View Contact Section' },
      { id: 'menu', label: 'Main Menu' },
    ],
  };
}

function buildResumeResponse() {
  const resumePath = chatbot.contact?.resume;
  return {
    text: resumePath
      ? "Here's Ronika's resume."
      : "A resume isn't available right now.",
    links: resumePath ? [{ label: 'View Resume', url: resumePath }] : [],
    options: [{ id: 'menu', label: 'Main Menu' }],
  };
}

function buildNavResponse(sectionKey) {
  const sectionId = chatbot.navigation?.[sectionKey];
  if (sectionId) {
    scrollToSection(sectionId);
  }
  return {
    text: sectionId ? `Scrolling to the ${sectionKey} section for you.` : "That section isn't available right now.",
    options: [{ id: 'menu', label: 'Main Menu' }],
  };
}

function buildFallbackResponse() {
  return {
    text: chatbot.fallback?.message || "I'm not sure about that yet.",
    options: chatbot.fallback?.options ?? [{ id: 'menu', label: 'Main Menu' }],
  };
}

/* Resolves any intent id (menu click or matched free-text) into a
   response. project:<id> and nav:<key> are handled as prefixed
   sub-intents so project detail / section navigation don't need
   their own top-level entries in chatbot.json. */
function resolveIntent(intentId) {
  if (!intentId) return buildFallbackResponse();
  if (intentId.startsWith('project:')) return buildProjectDetailResponse(intentId.slice('project:'.length));
  if (intentId.startsWith('nav:')) return buildNavResponse(intentId.slice('nav:'.length));

  switch (intentId) {
    case 'menu':
      return buildMenuResponse();
    case 'about':
      return buildAboutResponse();
    case 'why-se':
      return buildSimpleTextResponse(chatbot.profile?.whySoftwareEngineering);
    case 'why-ai':
      return buildSimpleTextResponse(chatbot.profile?.whyAI);
    case 'strengths':
      return buildSimpleTextResponse((chatbot.strengths ?? []).join(', '));
    case 'career-goal':
      return buildSimpleTextResponse(chatbot.profile?.careerGoal);
    case 'location':
      return buildSimpleTextResponse(
        chatbot.profile?.location ? `Ronika is based in ${chatbot.profile.location}.` : null
      );
    case 'work-location':
      return buildSimpleTextResponse(chatbot.profile?.availability || null);
    case 'projects':
      return buildProjectsResponse();
    case 'skills':
      return buildSkillsResponse();
    case 'achievements':
      return buildAchievementsResponse();
    case 'certificates':
      return buildCertificatesResponse();
    case 'education':
      return buildEducationResponse();
    case 'contact':
      return buildContactResponse();
    case 'resume':
      return buildResumeResponse();
    default:
      return buildFallbackResponse();
  }
}

/* Clean keyword/intention matching — forgiving of case, not a full
   NLP system by design (per project scope). Returns an intent id or
   null if nothing matches closely enough. */
/* A few projects have a shorter spoken name that isn't a literal
   substring of their full projects.json title (e.g. people say
   "Power BI dashboard", not the full "Interactive Power BI / Data
   Analytics Dashboard"). This only adds alternate names to match
   against — the response itself still comes from projects.json. */
const PROJECT_NAME_ALIASES = {
  'power-bi-data-analytics-dashboard': ['power bi', 'power bi dashboard', 'data analytics dashboard'],
};

/* Recognizes natural-language questions about a specific project
   ("tell me about X", "what is X", "explain X", or just "X") by
   checking whether the message mentions that project's actual
   projects.json title (or a known short alias for it) — not by
   requiring a specific question phrase, so any phrasing that names
   the project is understood. */
function matchProjectIntent(text) {
  for (const proj of Array.isArray(projects) ? projects : []) {
    if (!proj?.id || !proj?.title) continue;
    const names = [proj.title, ...(PROJECT_NAME_ALIASES[proj.id] ?? [])];
    if (names.some((name) => text.includes(name.toLowerCase()))) {
      return `project:${proj.id}`;
    }
  }
  return null;
}

function matchIntent(rawText) {
  const text = String(rawText || '').toLowerCase().trim();
  if (!text) return null;

  const projectMatch = matchProjectIntent(text);
  if (projectMatch) return projectMatch;

  for (const intent of chatbot.intents ?? []) {
    const keywords = Array.isArray(intent.keywords) ? intent.keywords : [];
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return intent.id;
    }
  }
  return null;
}

/* ── UI subcomponents ── */

function MessageBubble({ message, onOptionClick }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`rai-message ${isUser ? 'rai-message--user' : 'rai-message--bot'}`}>
      <div className="rai-bubble">
        {message.text.split('\n').map((line, i) => (
          <p key={i} className="rai-bubble__line">{line}</p>
        ))}
      </div>

      {!isUser && Array.isArray(message.links) && message.links.length > 0 && (
        <div className="rai-chip-row">
          {message.links.map((link) => (
            <a
              key={link.url}
              className="rai-chip rai-chip--link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {!isUser && Array.isArray(message.options) && message.options.length > 0 && (
        <div className="rai-chip-row">
          {message.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="rai-chip"
              onClick={() => onOptionClick(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const seededRef = useRef(false);
  const scrollAnchorRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const assistantName = chatbot?.assistantName || 'RoniGenie 🪄🤖💬';

  const pushBot = useCallback((response) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        sender: 'bot',
        text: response.text,
        options: response.options,
        links: response.links,
      },
    ]);
  }, []);

  const pushUser = useCallback((text) => {
    setMessages((prev) => [...prev, { id: nextMessageId(), sender: 'user', text }]);
  }, []);

  /* Seed the greeting + main menu exactly once, the first time the
     chat is opened — not on every open/close toggle. */
  useEffect(() => {
    if (isOpen && !seededRef.current) {
      seededRef.current = true;
      pushBot({ text: chatbot.greeting, options: chatbot.menu });
    }
  }, [isOpen, pushBot]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleOptionClick = useCallback(
    (option) => {
      pushUser(option.label);
      const response = resolveIntent(option.id);
      pushBot(response);
    },
    [pushUser, pushBot]
  );

  const handleSend = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return; // empty-input protection

      pushUser(trimmed);
      const intentId = matchIntent(trimmed);
      pushBot(resolveIntent(intentId));
      setInputValue('');
    },
    [inputValue, pushUser, pushBot]
  );

  const panelTransition = useMemo(
    () => (prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }),
    [prefersReducedMotion]
  );

  return (
    <div className="rai-widget">
      <button
        type="button"
        className="rai-launcher"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? `Close ${assistantName} chatbot` : `Open ${assistantName} chatbot`}
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '💬'}
        <span className="rai-launcher__label">{isOpen ? 'Close' : `Ask ${assistantName}`}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="rai-panel"
            role="dialog"
            aria-label={`${assistantName} chatbot`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={panelTransition}
          >
            <div className="rai-panel__header">
              <span className="rai-panel__title">{assistantName}</span>
              <button
                type="button"
                className="rai-panel__close"
                onClick={() => setIsOpen(false)}
                aria-label={`Close ${assistantName} chatbot`}
              >
                ✕
              </button>
            </div>

            <div className="rai-panel__body">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onOptionClick={handleOptionClick} />
              ))}
              <div ref={scrollAnchorRef} />
            </div>

            <form className="rai-panel__input-row" onSubmit={handleSend}>
              <input
                type="text"
                className="rai-input"
                placeholder="Ask about projects, skills, contact…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                aria-label={`Message ${assistantName}`}
              />
              <button
                type="submit"
                className="rai-send-btn"
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

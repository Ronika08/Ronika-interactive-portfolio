// RiddleGame.jsx
// Functional component for Challenge Mode — an interactive engineering
// mini-game. Each mission is a small simulated system the visitor
// operates/debugs (activating a control, building an RCA chain,
// evicting a cache entry, choosing a query plan, verifying a claim)
// rather than a multiple-choice quiz. Styling lives in RiddleGame.css.
// Data comes entirely from src/data/riddles.json and
// src/data/projects.json — nothing about a mission or project is
// hardcoded here.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import missions from '../../data/riddles.json';
import projects from '../../data/projects.json';
import './RiddleGame.css';

/* Only these statuses count as a real, unlockable project. Missions
   for Coming Soon projects are excluded from the playable game
   entirely — Challenge Mode should never present an unlock as if a
   planned/future project were already built. Computed from
   projects.json, never hardcoded. */
const PLAYABLE_STATUSES = new Set(['Completed', 'Live']);

/* ── Visually-hidden but screen-reader-accessible style ── */
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

/* ── Safe fallback navigation to the existing Projects section. ── */
function scrollToProjects() {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
}

/* ── Animation variants ── */
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const xpPulse = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.18, 1], transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ── Shared small pieces ── */

function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  return (
    <span className={`rg-badge rg-badge-difficulty rg-difficulty-${String(difficulty).toLowerCase()}`}>
      {String(difficulty).toUpperCase()}
    </span>
  );
}

function CategoryBadge({ category }) {
  if (!category) return null;
  return <span className="rg-badge rg-badge-category">{String(category).toUpperCase()}</span>;
}

function HintPanel({ hint, visible, onReveal }) {
  if (!hint) return null;
  return (
    <div className="rg-hint">
      {!visible ? (
        <button type="button" className="rg-btn rg-btn-ghost" onClick={onReveal}>
          Need a hint?
        </button>
      ) : (
        <p className="rg-hint__text">{hint}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MISSION 1 — action-selection (Sakhi AI)
   A simulated interface: the visitor activates the system control
   that solves the user's problem. No lettered options — each
   control is a real system action with its own effect.
   ═══════════════════════════════════════════════════════════════ */
function ActionSelectionMission({ interaction, onSolved }) {
  const [triedIds, setTriedIds] = useState(new Set());
  const [feedback, setFeedback] = useState(null); // { actionId, text, ok }
  const [systemState, setSystemState] = useState(interaction?.systemState ?? {});
  const [resolved, setResolved] = useState(false);

  const actions = Array.isArray(interaction?.actions) ? interaction.actions : [];

  function handleActivate(action) {
    if (resolved) return;
    setTriedIds((prev) => new Set(prev).add(action.id));
    setFeedback({ actionId: action.id, text: action.systemEffect || '', ok: !!action.correct });

    if (action.correct) {
      setResolved(true);
      /* Flip the relevant system-state flags so the panel visibly
         reflects the fix, using only the keys already present in
         the mission data — nothing invented. */
      setSystemState((prev) => {
        const next = { ...prev };
        if ('voice' in next) next.voice = 'ON';
        if ('text' in next && action.id?.includes('voice')) next.text = 'OFF';
        return next;
      });
      onSolved();
    }
  }

  return (
    <div className="rg-mission rg-mission--action">
      {interaction?.userProblem && (
        <p className="rg-mission__problem">{interaction.userProblem}</p>
      )}

      {systemState && Object.keys(systemState).length > 0 && (
        <div className="rg-mission__status" role="status">
          {Object.entries(systemState).map(([key, value]) => (
            <span key={key} className={`rg-status-pill rg-status-pill--${String(value).toLowerCase()}`}>
              {key.toUpperCase()}: {String(value).toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div className="rg-mission__actions" role="group" aria-label="Available system actions">
        {actions.map((action) => {
          const tried = triedIds.has(action.id);
          const isCorrectAndResolved = resolved && action.correct;
          return (
            <button
              key={action.id}
              type="button"
              className={`rg-action-btn${isCorrectAndResolved ? ' rg-action-btn--active' : ''}${
                tried && !action.correct ? ' rg-action-btn--tried' : ''
              }`}
              onClick={() => handleActivate(action)}
              disabled={resolved}
              aria-pressed={isCorrectAndResolved}
            >
              {action.label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <motion.p
          key={feedback.actionId + String(resolved)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rg-mission__feedback ${feedback.ok ? 'rg-mission__feedback--ok' : 'rg-mission__feedback--warn'}`}
          role="status"
        >
          {feedback.ok ? '✓ ' : '— '}
          {feedback.text}
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MISSION 2 — investigation (IT Ops Intelligence)
   Evidence cards: click to inspect/expand, click again to add to the
   RCA evidence chain, then Validate. Correct evidence set comes
   entirely from correctEvidenceIds.
   ═══════════════════════════════════════════════════════════════ */
function InvestigationMission({ interaction, onSolved }) {
  const evidence = Array.isArray(interaction?.evidence) ? interaction.evidence : [];
  const correctIds = useMemo(
    () => new Set(interaction?.correctEvidenceIds ?? []),
    [interaction]
  );

  const [inspected, setInspected] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [validation, setValidation] = useState(null); // 'success' | 'partial' | null
  const [resolved, setResolved] = useState(false);

  function toggleInspect(id) {
    setInspected((prev) => new Set(prev).add(id));
  }

  function toggleSelect(id) {
    if (resolved) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setValidation(null);
  }

  function handleValidate() {
    if (resolved || evidence.length === 0) return;
    const isExactMatch =
      selected.size === correctIds.size &&
      [...selected].every((id) => correctIds.has(id));

    if (isExactMatch) {
      setValidation('success');
      setResolved(true);
      onSolved();
    } else {
      setValidation('partial');
    }
  }

  const chain = evidence.filter((ev) => selected.has(ev.id));

  return (
    <div className="rg-mission rg-mission--investigation">
      {interaction?.consoleLabel && (
        <p className="rg-mission__console-label">{interaction.consoleLabel}</p>
      )}
      {interaction?.incidentSignal && (
        <p className="rg-mission__signal" role="status">⚠ {interaction.incidentSignal}</p>
      )}

      <div className="rg-evidence-grid" role="group" aria-label="Evidence cards">
        {evidence.map((ev) => {
          const isInspected = inspected.has(ev.id);
          const isSelected = selected.has(ev.id);
          return (
            <div key={ev.id} className={`rg-evidence-card${isSelected ? ' rg-evidence-card--selected' : ''}`}>
              <button
                type="button"
                className="rg-evidence-card__header"
                onClick={() => toggleInspect(ev.id)}
                aria-expanded={isInspected}
              >
                {ev.label}
              </button>
              {isInspected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rg-evidence-card__body"
                >
                  <p className="rg-evidence-card__detail">{ev.detail}</p>
                  <button
                    type="button"
                    className="rg-btn rg-btn-ghost"
                    onClick={() => toggleSelect(ev.id)}
                    disabled={resolved}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? 'Remove from RCA Chain' : (interaction?.rcaChainPrompt || 'Add to RCA Chain')}
                  </button>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rg-rca-chain" aria-label="RCA evidence chain">
        {chain.length === 0 ? (
          <span className="rg-rca-chain__empty">No evidence added yet</span>
        ) : (
          chain.map((ev, i) => (
            <span key={ev.id} className="rg-rca-chain__item">
              {ev.label}
              {i < chain.length - 1 && ' → '}
            </span>
          ))
        )}
        {chain.length > 0 && <span className="rg-rca-chain__arrow"> → RCA</span>}
      </div>

      {!resolved && (
        <button
          type="button"
          className="rg-btn rg-btn-primary"
          onClick={handleValidate}
          disabled={selected.size === 0}
        >
          Validate RCA
        </button>
      )}

      {validation === 'partial' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rg-mission__feedback rg-mission__feedback--warn"
          role="status"
        >
          — This evidence chain doesn't fully support the incident yet. Reinspect the cards and adjust the chain.
        </motion.p>
      )}
      {validation === 'success' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rg-mission__feedback rg-mission__feedback--ok"
          role="status"
        >
          ✓ RCA chain validated.
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MISSION 3 — cache-interaction (LRU Cache)
   Visual cache blocks; the visitor evicts the correct entry when
   the cache is full and a new item arrives.
   ═══════════════════════════════════════════════════════════════ */
function CacheMission({ interaction, onSolved }) {
  const stateAfterAccess = Array.isArray(interaction?.stateAfterAccess)
    ? interaction.stateAfterAccess
    : Array.isArray(interaction?.initialState)
      ? interaction.initialState
      : [];
  const evictionChoices = Array.isArray(interaction?.evictionChoices)
    ? interaction.evictionChoices
    : stateAfterAccess;
  const accessedId = interaction?.accessSequence?.[interaction.accessSequence.length - 1];

  const [evicted, setEvicted] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resolved, setResolved] = useState(false);

  function handleEvict(entry) {
    if (resolved) return;
    const isCorrect = entry === interaction?.correctEvictionChoice;
    if (isCorrect) {
      setEvicted(entry);
      setResolved(true);
      setFeedback({ ok: true, text: `${entry} evicted — ${interaction?.newItem ?? 'the new item'} inserted.` });
      onSolved();
    } else {
      setFeedback({ ok: false, text: `${entry} was used more recently than the correct entry to evict. Try again.` });
    }
  }

  return (
    <div className="rg-mission rg-mission--cache">
      <div className="rg-cache-meta">
        <span className="rg-badge">CAPACITY {interaction?.capacity ?? evictionChoices.length}</span>
        {accessedId && <span className="rg-badge">ACCESSED: {accessedId}</span>}
      </div>

      <div className="rg-cache-row" role="group" aria-label="Cache entries, most recent to least recent">
        <span className="rg-cache-row__label">MOST RECENT</span>
        {stateAfterAccess.map((entry) => {
          const isEvicted = evicted === entry;
          const canEvict = evictionChoices.includes(entry) && !resolved;
          return (
            <button
              key={entry}
              type="button"
              className={`rg-cache-block${isEvicted ? ' rg-cache-block--evicted' : ''}`}
              onClick={() => canEvict && handleEvict(entry)}
              disabled={resolved || !evictionChoices.includes(entry)}
              aria-label={`Cache entry ${entry}${canEvict ? ' — select to evict' : ''}`}
            >
              {entry}
            </button>
          );
        })}
        <span className="rg-cache-row__label">LEAST RECENT</span>
      </div>

      {interaction?.newItem && !resolved && (
        <p className="rg-mission__signal" role="status">
          ⚠ CACHE FULL — NEW ITEM: {interaction.newItem}. Choose the entry to evict.
        </p>
      )}

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rg-mission__feedback ${feedback.ok ? 'rg-mission__feedback--ok' : 'rg-mission__feedback--warn'}`}
          role="status"
        >
          {feedback.ok ? '✓ ' : '— '}
          {feedback.text}
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MISSION 4 — query-interaction (Mini Database Engine)
   Select the operation that becomes the query's execution path.
   ═══════════════════════════════════════════════════════════════ */
function QueryMission({ interaction, onSolved }) {
  const operations = Array.isArray(interaction?.operations) ? interaction.operations : [];
  const [chosenId, setChosenId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resolved, setResolved] = useState(false);

  function handleChoose(op) {
    if (resolved) return;
    setChosenId(op.id);
    const isCorrect = op.id === interaction?.correctOperationId;
    if (isCorrect) {
      setResolved(true);
      setFeedback({ ok: true, text: op.detail || 'Execution plan built.' });
      onSolved();
    } else {
      setFeedback({ ok: false, text: op.detail || 'That path is not the efficient one here.' });
    }
  }

  return (
    <div className="rg-mission rg-mission--query">
      <div className="rg-query-meta">
        {interaction?.table && <span className="rg-badge">TABLE: {interaction.table}</span>}
        {interaction?.rowCountLabel && <span className="rg-badge">{interaction.rowCountLabel}</span>}
        {interaction?.indexedColumn && <span className="rg-badge">INDEX: {interaction.indexedColumn}</span>}
      </div>

      {interaction?.queryGoal && <p className="rg-mission__problem">{interaction.queryGoal}</p>}

      <div className="rg-execution-plan" aria-label="Execution plan">
        <span className="rg-execution-plan__step">QUERY</span>
        <span className="rg-execution-plan__arrow">↓</span>
        <span className="rg-execution-plan__slot">
          {chosenId
            ? operations.find((o) => o.id === chosenId)?.label ?? '—'
            : 'Select an operation below'}
        </span>
        <span className="rg-execution-plan__arrow">↓</span>
        <span className="rg-execution-plan__step">{resolved ? 'ROW RETURNED' : 'RESULT'}</span>
      </div>

      <div className="rg-mission__actions" role="group" aria-label="Available operations">
        {operations.map((op) => (
          <button
            key={op.id}
            type="button"
            className={`rg-action-btn${resolved && op.id === chosenId ? ' rg-action-btn--active' : ''}${
              !resolved && chosenId === op.id ? ' rg-action-btn--tried' : ''
            }`}
            onClick={() => handleChoose(op)}
            disabled={resolved}
          >
            {op.label}
          </button>
        ))}
      </div>

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rg-mission__feedback ${feedback.ok ? 'rg-mission__feedback--ok' : 'rg-mission__feedback--warn'}`}
          role="status"
        >
          {feedback.ok ? '✓ ' : '— '}
          {feedback.text}
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MISSION 5 — claim-verification (Hallucination Detection)
   Select the claim believed to be unsupported, then run verification.
   ═══════════════════════════════════════════════════════════════ */
function ClaimMission({ interaction, onSolved }) {
  const claims = Array.isArray(interaction?.claims) ? interaction.claims : [];
  const evidence = Array.isArray(interaction?.evidence) ? interaction.evidence : [];

  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resolved, setResolved] = useState(false);

  const relatedEvidenceId = claims.find((c) => c.id === selectedClaimId)?.relatedEvidenceId;

  function handleRunVerification() {
    if (resolved || !selectedClaimId) return;
    const isCorrect = selectedClaimId === interaction?.correctClaimId;
    if (isCorrect) {
      setResolved(true);
      setFeedback({ ok: true, text: 'Unsupported claim confirmed against the evidence.' });
      onSolved();
    } else {
      setFeedback({ ok: false, text: 'The evidence actually supports that claim. Reinspect and try another.' });
    }
  }

  return (
    <div className="rg-mission rg-mission--claim">
      {interaction?.llmResponse && (
        <p className="rg-mission__llm-response">“{interaction.llmResponse}”</p>
      )}

      <div className="rg-claim-columns">
        <div className="rg-claim-column">
          <p className="rg-mission__console-label">Claims</p>
          <div role="group" aria-label="Decomposed claims">
            {claims.map((claim) => {
              const isSelected = selectedClaimId === claim.id;
              return (
                <button
                  key={claim.id}
                  type="button"
                  className={`rg-claim-card${isSelected ? ' rg-claim-card--selected' : ''}${
                    resolved && claim.id === interaction?.correctClaimId ? ' rg-claim-card--flagged' : ''
                  }`}
                  onClick={() => !resolved && setSelectedClaimId(claim.id)}
                  disabled={resolved}
                  aria-pressed={isSelected}
                >
                  {claim.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rg-claim-column">
          <p className="rg-mission__console-label">Evidence</p>
          <div role="group" aria-label="Evidence sources">
            {evidence.map((ev) => (
              <div
                key={ev.id}
                className={`rg-evidence-card${ev.id === relatedEvidenceId ? ' rg-evidence-card--selected' : ''}`}
              >
                <p className="rg-evidence-card__detail">{ev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!resolved && (
        <button
          type="button"
          className="rg-btn rg-btn-primary"
          onClick={handleRunVerification}
          disabled={!selectedClaimId}
        >
          Run Verification
        </button>
      )}

      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rg-mission__feedback ${feedback.ok ? 'rg-mission__feedback--ok' : 'rg-mission__feedback--warn'}`}
          role="status"
        >
          {feedback.ok ? '✓ ' : '— '}
          {feedback.text}
        </motion.p>
      )}
    </div>
  );
}

/* Maps a mission's `type` to its interactive component. Unknown or
   missing types fall through to a safe message rather than crashing. */
const MISSION_COMPONENTS = {
  'action-selection': ActionSelectionMission,
  investigation: InvestigationMission,
  'cache-interaction': CacheMission,
  'query-interaction': QueryMission,
  'claim-verification': ClaimMission,
};

/* ── Success / unlock panel, shared by every mission type ── */
function SuccessPanel({ mission, project, isLast, onViewProject, onAdvance }) {
  const isComingSoon = project?.status === 'Coming Soon';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rg-feedback rg-feedback--correct"
      role="status"
    >
      <p className="rg-feedback__title">✓ Mission Complete</p>

      <motion.p
        {...xpPulse}
        className="rg-xp-award"
      >
        +{mission?.xp ?? 0} XP
      </motion.p>

      {mission?.success?.explanation && (
        <p className="rg-feedback__explanation">{mission.success.explanation}</p>
      )}

      {project ? (
        <div className="rg-unlock">
          <p className="rg-unlock__message">
            🔓 {mission?.success?.unlockMessage || `${project.title} unlocked.`}
          </p>
          <div className="rg-unlock__project">
            <span className="rg-unlock__project-title">{project.title}</span>
            {isComingSoon && <span className="rg-badge rg-badge-coming-soon">Coming Soon</span>}
          </div>

          <div className="rg-unlock__actions">
            <button type="button" className="rg-btn rg-btn-secondary" onClick={onViewProject}>
              {isComingSoon ? 'See Planned Concept' : 'View Project'}
            </button>

            {!isComingSoon && project.liveDemo && (
              <a className="rg-btn rg-btn-ghost" href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                Live Demo
              </a>
            )}

            {!isComingSoon && project.github && (
              <a className="rg-btn rg-btn-ghost" href={project.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
          </div>
        </div>
      ) : (
        <p className="rg-unlock__message">
          Mission solved, but its project details aren&rsquo;t available right now.
        </p>
      )}

      <button type="button" className="rg-btn rg-btn-primary" onClick={onAdvance}>
        {isLast ? 'View Results' : 'Next Mission →'}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function RiddleGame() {
  /* A mission is playable only if its resolved project's status is
     Completed/Live, or its project can't be resolved at all
     (robustness fallback, degrades gracefully at render time).
     Coming Soon missions are excluded outright — never re-derived
     from a hardcoded list. */
  const playableMissions = useMemo(() => {
    return missions.filter((m) => {
      const project = projects.find((p) => p.id === m?.projectId);
      if (!project) return true;
      return PLAYABLE_STATUSES.has(project.status);
    });
  }, []);

  const totalMissions = playableMissions.length;

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [missionSolved, setMissionSolved] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [solvedMissions, setSolvedMissions] = useState([]);
  const [completed, setCompleted] = useState(false);

  const currentMission = playableMissions[currentIndex] ?? null;

  const currentProject = useMemo(() => {
    if (!currentMission?.projectId) return null;
    return projects.find((p) => p.id === currentMission.projectId) ?? null;
  }, [currentMission]);

  /* Hint visibility resets whenever the mission changes. */
  useEffect(() => {
    setHintVisible(false);
  }, [currentIndex]);

  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setMissionSolved(false);
    setHintVisible(false);
    setTotalXP(0);
    setSolvedMissions([]);
    setCompleted(false);
    setStarted(true);
  }, []);

  const handleMissionSolved = useCallback(() => {
    setMissionSolved((already) => {
      if (already) return already; // guard against double XP from re-renders
      setTotalXP((xp) => xp + (currentMission?.xp ?? 0));
      setSolvedMissions((list) => [...list, currentMission]);
      return true;
    });
  }, [currentMission]);

  const handleAdvance = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalMissions) {
      setCompleted(true);
      return;
    }
    setCurrentIndex(nextIndex);
    setMissionSolved(false);
  }, [currentIndex, totalMissions]);

  const handleRestart = useCallback(() => {
    setStarted(false);
    setCurrentIndex(0);
    setMissionSolved(false);
    setHintVisible(false);
    setTotalXP(0);
    setSolvedMissions([]);
    setCompleted(false);
  }, []);

  const handleViewProject = useCallback(() => {
    scrollToProjects();
  }, []);

  /* ── Empty state ── */
  if (totalMissions === 0) {
    return (
      <div className="rg-game rg-game--empty">
        <p className="rg-empty-text">Challenges are being prepared. Check back soon.</p>
      </div>
    );
  }

  /* ── Intro screen ── */
  if (!started) {
    return (
      <div className="rg-game rg-game--intro">
        <motion.div initial="hidden" animate="visible" variants={popIn} className="rg-intro">
          <h3 className="rg-intro__title">Challenge Mode</h3>
          <p className="rg-intro__sub">
            Think like an engineer. Operate small technical systems to unlock projects.
          </p>
          <p className="rg-intro__count">
            {totalMissions} Mission{totalMissions === 1 ? '' : 's'}
          </p>
          <button type="button" className="rg-btn rg-btn-primary" onClick={handleStart}>
            Start Challenge
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Completion screen ── */
  if (completed) {
    return (
      <div className="rg-game rg-game--complete">
        <motion.div initial="hidden" animate="visible" variants={popIn} className="rg-complete">
          <h3 className="rg-complete__title">Challenge Complete!</h3>
          <p className="rg-complete__sub">
            You solved {solvedMissions.length} / {totalMissions} engineering missions.
          </p>
          <p className="rg-complete__score">TOTAL XP: {totalXP}</p>

          <ul className="rg-unlocked-list">
            {solvedMissions.map((m) => {
              const proj = projects.find((p) => p.id === m.projectId);
              return <li key={m.id}>✓ {proj?.title ?? m.title}</li>;
            })}
          </ul>

          <div className="rg-complete__actions">
            <button type="button" className="rg-btn rg-btn-secondary" onClick={handleViewProject}>
              Explore Projects
            </button>
            <button type="button" className="rg-btn rg-btn-primary" onClick={handleRestart}>
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Malformed / missing mission guard ── */
  if (!currentMission || !currentMission.type || !currentMission.interaction) {
    return (
      <div className="rg-game rg-game--empty">
        <p className="rg-empty-text">This mission couldn't be loaded. Please try again later.</p>
      </div>
    );
  }

  const MissionComponent = MISSION_COMPONENTS[currentMission.type];
  const isLastMission = currentIndex + 1 >= totalMissions;

  return (
    <div className="rg-game rg-game--active">
      {/* Console-style header: XP, mission progress, badges */}
      <div className="rg-console-header">
        <span className="rg-challenge__progress">
          MISSION {currentIndex + 1} / {totalMissions}
        </span>
        <motion.span key={totalXP} {...xpPulse} className="rg-xp-counter">
          XP: {totalXP}
        </motion.span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMission.id ?? currentIndex}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="rg-challenge"
        >
          <div className="rg-challenge__tags">
            <DifficultyBadge difficulty={currentMission.difficulty} />
            <CategoryBadge category={currentMission.category} />
          </div>

          {currentMission.title && <h4 className="rg-mission__title">{currentMission.title}</h4>}
          {currentMission.scenario && <p className="rg-challenge__question">{currentMission.scenario}</p>}
          {currentMission.objective && <p className="rg-mission__objective">🎯 {currentMission.objective}</p>}

          {!missionSolved && MissionComponent && (
            <MissionComponent interaction={currentMission.interaction} onSolved={handleMissionSolved} />
          )}

          {!missionSolved && !MissionComponent && (
            <p className="rg-empty-text">This mission type isn't supported yet.</p>
          )}

          {!missionSolved && (
            <HintPanel
              hint={currentMission.hint}
              visible={hintVisible}
              onReveal={() => setHintVisible(true)}
            />
          )}

          {missionSolved && (
            <SuccessPanel
              mission={currentMission}
              project={currentProject}
              isLast={isLastMission}
              onViewProject={handleViewProject}
              onAdvance={handleAdvance}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <p style={srOnlyStyle} role="status" aria-live="polite">
        {missionSolved ? `Mission ${currentIndex + 1} solved.` : `Mission ${currentIndex + 1} in progress.`}
      </p>
    </div>
  );
}

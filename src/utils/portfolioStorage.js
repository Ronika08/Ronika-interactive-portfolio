// portfolioStorage.js
//
// Centralized localStorage-backed content storage for the Portfolio
// Manager (see src/pages/admin/AdminPage.jsx).
//
// ARCHITECTURE (as required by the master upgrade spec):
//
//   Original JSON (src/data/*.json)
//        |
//        v
//   getEffectiveData(domain, originalJson)   <- this file
//        |
//        v
//   localStorage override (if present + valid)
//        |
//        v
//   Portfolio sections (About/Skills/Projects/Achievements/
//   Certificates/Resume/Chatbot read through this function instead
//   of the raw import wherever the owner needs to be able to edit
//   that content locally)
//
// - If no local override exists for a domain, the original JSON
//   shipped in src/data is used, unmodified. Fresh visitors (and the
//   owner on a different browser/device) always see the normal,
//   original portfolio.
// - If a local override exists AND passes validation, it is used
//   instead. This is how the owner's edits in /admin persist across
//   refreshes, entirely client-side, with no backend.
// - "Reset to original" simply deletes the override key, which
//   makes getEffectiveData() fall back to the original JSON again.
//
// This file never mutates src/data/*.json — those files are the
// source of truth on disk and are only read.
//
// NOTE: This is intentionally a thin, swappable data-access layer.
// To move to a real backend later (e.g. Supabase), only the
// get/set/remove implementations in this file need to change —
// every consumer already goes through getEffectiveData /
// saveOverride / resetOverride rather than touching localStorage
// directly.

const STORAGE_PREFIX = "ronika-portfolio:data:";

export const DOMAINS = {
  PROFILE: "profile",
  SKILLS: "skills",
  PROJECTS: "projects",
  ACHIEVEMENTS: "achievements",
  CERTIFICATES: "certificates",
  RESUME: "resume",
};

const ALL_DOMAINS = Object.values(DOMAINS);

function storageKey(domain) {
  return `${STORAGE_PREFIX}${domain}`;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/* ── Validation ──────────────────────────────────────────────
   Deliberately conservative: arrays must stay arrays, objects must
   stay objects, and array items must carry an `id` (or `title` as a
   fallback identity) so the app never silently renders malformed
   entries. This is not full schema validation — it exists to catch
   obviously broken/incompatible data on import or corrupted
   localStorage, not to enforce every optional field. */
export function validateDomainData(domain, data) {
  if (data === null || data === undefined) return false;

  switch (domain) {
    case DOMAINS.PROFILE:
      return typeof data === "object" && !Array.isArray(data) && typeof data.name === "string";

    case DOMAINS.SKILLS:
      return (
        typeof data === "object" &&
        !Array.isArray(data) &&
        Object.values(data).every((items) => Array.isArray(items))
      );

    case DOMAINS.PROJECTS:
    case DOMAINS.ACHIEVEMENTS:
    case DOMAINS.CERTIFICATES:
      return (
        Array.isArray(data) &&
        data.every((item) => item && typeof item === "object" && (typeof item.id === "string" || typeof item.title === "string"))
      );

    case DOMAINS.RESUME:
      return typeof data === "object" && !Array.isArray(data) && typeof data.resumePath === "string";

    default:
      return false;
  }
}

/* ── Core read/write ─────────────────────────────────────────── */

export function getOverride(domain) {
  try {
    const raw = window.localStorage.getItem(storageKey(domain));
    if (!raw) return null;
    const parsed = safeParse(raw);
    if (parsed === undefined) return null;
    return validateDomainData(domain, parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOverride(domain, data) {
  if (!validateDomainData(domain, data)) {
    return { ok: false, error: `Data for "${domain}" failed validation and was not saved.` };
  }
  try {
    window.localStorage.setItem(storageKey(domain), JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not write to local storage (it may be full or disabled)." };
  }
}

export function resetOverride(domain) {
  try {
    window.localStorage.removeItem(storageKey(domain));
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not clear local storage for this section." };
  }
}

export function resetAllOverrides() {
  ALL_DOMAINS.forEach((domain) => resetOverride(domain));
}

export function hasOverride(domain) {
  try {
    return window.localStorage.getItem(storageKey(domain)) !== null;
  } catch {
    return false;
  }
}

/**
 * Resolves the data a portfolio section should actually render:
 * the local override if one exists and is valid, otherwise the
 * original JSON shipped with the app.
 */
export function getEffectiveData(domain, originalData) {
  const override = getOverride(domain);
  return override !== null ? override : originalData;
}

/* ── Export / Import ─────────────────────────────────────────── */

export function exportAllData(originals) {
  const payload = {
    __ronikaPortfolioExport: true,
    exportedAt: new Date().toISOString(),
    data: {},
  };
  ALL_DOMAINS.forEach((domain) => {
    payload.data[domain] = getEffectiveData(domain, originals[domain]);
  });
  return payload;
}

/**
 * Validates and applies an imported export payload. Never partially
 * applies — either every included domain passes validation and all
 * are saved, or nothing is written and an error is returned.
 */
export function importAllData(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "That file doesn't look like a Portfolio Manager export (not a JSON object)." };
  }
  const data = payload.data && typeof payload.data === "object" ? payload.data : payload;

  const domainsPresent = Object.keys(data).filter((key) => ALL_DOMAINS.includes(key));
  if (domainsPresent.length === 0) {
    return { ok: false, error: "No recognized portfolio sections found in this file." };
  }

  for (const domain of domainsPresent) {
    if (!validateDomainData(domain, data[domain])) {
      return { ok: false, error: `The "${domain}" section in this file has an invalid structure. Nothing was imported.` };
    }
  }

  domainsPresent.forEach((domain) => {
    saveOverride(domain, data[domain]);
  });

  return { ok: true, importedDomains: domainsPresent };
}

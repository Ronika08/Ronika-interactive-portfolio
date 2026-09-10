// adminOriginals.js
// The original, shipped JSON for every domain the Portfolio Manager
// can edit. Kept in its own module (rather than inline in
// AdminPage.jsx) purely so this file can export a plain constant
// alongside component files that only export components.

import profileJson from "../../data/profile.json";
import skillsJson from "../../data/skills.json";
import projectsJson from "../../data/projects.json";
import achievementsJson from "../../data/achievements.json";
import certificatesJson from "../../data/certificates.json";

export const ORIGINALS = {
  profile: profileJson,
  skills: skillsJson,
  projects: projectsJson,
  achievements: achievementsJson,
  certificates: certificatesJson,
  resume: { resumePath: profileJson.resume || "/resume.pdf" },
};

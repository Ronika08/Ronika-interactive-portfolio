import { useEffect, useState } from "react";
import "./App.css";

import LandingPage from "./components/landing/LandingPage";
import ExplorerModes from "./components/explorer/ExplorerModes";
import AboutSection from "./components/about/AboutSection";
import SkillsSection from "./components/skills/SkillsSection";
import ProjectsSection from "./components/projects/ProjectsSection";
import AchievementsSection from "./components/achievements/AchievementsSection";
import CertificatesSection from "./components/certificates/CertificatesSection";
import ResumeSection from "./components/resume/ResumeSection";
import ContactSection from "./components/contact/ContactSection";
import Chatbot from "./components/chatbot/Chatbot";
import ThemeToggle from "./components/theme/ThemeToggle";
import AdminPage from "./pages/admin/AdminPage";

/**
 * NOTE ON ResumeSection:
 * `src/components/resume/ResumeSection.jsx` reads profile.json
 * fields (recruiterHighlights, education, experience, skillsSnapshot)
 * defensively — every field is guarded and any card whose data is
 * missing is skipped rather than rendered blank, so it is safe to
 * mount unconditionally. It's placed after Certificates and before
 * Contact, matching the existing "Career -> Get in touch" page flow.
 *
 * ROUTING NOTE:
 * This app has no router dependency. `/admin` (the Portfolio
 * Manager / Content Manager) is resolved with a minimal manual
 * pathname check so the existing single-page structure and build
 * setup aren't disturbed. It is intentionally not linked from any
 * public UI — it's reached by typing the URL directly.
 */

function useIsAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(
    () => typeof window !== "undefined" && window.location.pathname.replace(/\/+$/, "") === "/admin"
  );

  useEffect(() => {
    const handler = () => {
      setIsAdmin(window.location.pathname.replace(/\/+$/, "") === "/admin");
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return isAdmin;
}

function App() {
  const isAdminRoute = useIsAdminRoute();

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <>
      <ThemeToggle />
      <LandingPage />
      <ExplorerModes />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <AchievementsSection />
      <CertificatesSection />
      <ResumeSection />
      <ContactSection />
      <Chatbot />
    </>
  );
}

export default App;

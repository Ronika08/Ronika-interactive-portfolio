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

function App() {
  return (
    <>
      <LandingPage />
      <ExplorerModes />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <AchievementsSection />
      <CertificatesSection />
    </>
  );
}

export default App;
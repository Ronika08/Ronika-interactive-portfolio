import "./App.css";

import LandingPage from "./components/landing/LandingPage";
import ExplorerModes from "./components/explorer/ExplorerModes";
import AboutSection from "./components/about/AboutSection";
import SkillsSection from "./components/skills/SkillsSection";

function App() {
  return (
    <>
      <LandingPage />
      <ExplorerModes />
      <AboutSection />
      <SkillsSection />
    </>
  );
}

export default App;
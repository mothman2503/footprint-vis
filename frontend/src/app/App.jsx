import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DndContext } from "@dnd-kit/core";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import VisualisationPage from "../pages/VisualisationPage";
import "../App.css";
import "../i18n";

function App() {
  return (
    <DndContext>
      <Router>
      <div className="bg-[#131818] flex flex-col min-h-dvh items-center w-full overflow-y-auto">
        <main className="w-full flex-grow flex">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/visualise" element={<VisualisationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
    </DndContext>
    
  );
}

export default App;

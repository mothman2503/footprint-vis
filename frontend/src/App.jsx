import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationMenu from "./components/NavigationMenu";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DatasetsPage from "./pages/DatasetsPage";
import VisualisationPage from "./pages/VisualisationPage";
import './App.css';
import "./i18n"; 

function App() {
  return (
    <Router>
      <div className="bg-[#131818] flex flex-col min-h-dvh items-center w-full">
        <NavigationMenu />
        <main className="w-full grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/datasets" element={<DatasetsPage />} />
            <Route path="/visualise" element={<VisualisationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

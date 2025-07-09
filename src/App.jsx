import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Datasets from "./pages/Datasets";
import Visualise from "./pages/Visualise";
import './App.css';
import "./i18n"; 

function App() {
  return (
    <Router>
      <div className="bg-[#131818] flex flex-col min-h-dvh items-center w-full">
        <main className="w-full grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/visualise" element={<Visualise />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

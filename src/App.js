import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Datasets from "./pages/Datasets";
import Visualisation from "./pages/Visualisation";
import './App.css';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/datasets" element={<Datasets />} />
        <Route path="/visualisation" element={<Visualisation />} />
      </Routes>
    </Router>
  );
}

export default App;


/**
 * 
function App() {
  
}
 */

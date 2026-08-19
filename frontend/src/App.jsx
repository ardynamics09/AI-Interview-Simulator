import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import LoadingScreen from "./pages/LoadingScreen";
import Interview from "./pages/Interview";
import DsaRound from "./pages/DsaRound";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 📊 Candidate Performance Dashboard & Test History */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🤖 AI Loading Screen */}
        <Route path="/loading" element={<LoadingScreen />} />

        {/* 🧠 Interview Page */}
        <Route path="/interview" element={<Interview />} />

        {/* 💻 Role-Based DSA & Verilog Coding Round */}
        <Route path="/dsa" element={<DsaRound />} />

        {/* 📊 Result Page */}
        <Route path="/result" element={<Result />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

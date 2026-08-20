import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import LoadingScreen from "./pages/LoadingScreen";
import Interview from "./pages/Interview";
import DsaRound from "./pages/DsaRound";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InterviewGuide from "./pages/InterviewGuide";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 📊 Candidate Performance Dashboard & Test History */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🛡️ Secure Read-Only Admin Control Center */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* 🤖 AI Loading Screen */}
        <Route path="/loading" element={<LoadingScreen />} />

        {/* 🧠 Interview Page */}
        <Route path="/interview" element={<Interview />} />

        {/* 💻 Role-Based DSA & Verilog Coding Round */}
        <Route path="/dsa" element={<DsaRound />} />

        {/* 📊 Result Page */}
        <Route path="/result" element={<Result />} />

        {/* 📖 Interview Master Guide (Hinglish) */}
        <Route path="/guide" element={<InterviewGuide />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

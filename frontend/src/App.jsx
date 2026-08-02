import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import LoadingScreen from "./pages/LoadingScreen";;
import Interview from "./pages/Interview";
import Result from "./pages/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 🤖 AI Loading Screen */}
        <Route path="/loading" element={<LoadingScreen />} />

        {/* 🧠 Interview Page */}
        <Route path="/interview" element={<Interview />} />

        {/* 📊 Result Page */}
        <Route path="/result" element={<Result />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
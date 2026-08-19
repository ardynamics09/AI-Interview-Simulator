import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dsaProblemBank, HARDWARE_BRANCHES } from "../data/dsaProblems";
import { evaluateCodeSubmission } from "../utils/codeEvaluator";
import { speakText, stopSpeech, unlockAudio } from "../utils/voiceUtils";
import ProctorCamera from "../components/ProctorCamera";

function DsaRound() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    userId = "",
    name = "Candidate",
    branch = "CSE",
    year = "3rd Year",
    role = "Software Engineer",
    skills = [],
    projects = []
  } = location.state || {};

  const isRobotics = role.toLowerCase().includes("robotics");
  const isHardware = HARDWARE_BRANCHES.includes(branch) && !isRobotics;
  const isAnalystRole = role.toLowerCase().includes("analyst");

  // Choose problem set based on branch and role
  let problemSet = dsaProblemBank.SWE;
  if (isRobotics) {
    problemSet = dsaProblemBank.ROBOTICS;
  } else if (isHardware) {
    problemSet = dsaProblemBank.HARDWARE_VERILOG;
  } else if (isAnalystRole) {
    problemSet = dsaProblemBank.ANALYST;
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(isHardware ? "verilog" : "python");
  const [userCode, setUserCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [evaluatedSubmissions, setEvaluatedSubmissions] = useState([]);

  // Integrity & Anti-cheat tracking
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusPoints, setFocusPoints] = useState(100);
  const [proctorWarning, setProctorWarning] = useState("");

  const currentProblem = problemSet[currentIdx] || problemSet[0];
  const [timeLeft, setTimeLeft] = useState(currentProblem.timeLimitMinutes * 60);

  const questionStartTime = useRef(Date.now());
  const totalRoundStartTime = useRef(Date.now());
  const hasSpokenWelcomeRef = useRef(false);

  // Spoken Welcome Announcement
  useEffect(() => {
    unlockAudio();

    const startWelcome = () => {
      if (hasSpokenWelcomeRef.current) return;
      hasSpokenWelcomeRef.current = true;
      let welcomeMsg = "Welcome to your DSA Round.";
      if (isHardware) {
        welcomeMsg = "Welcome to your Verilog RTL Interview.";
      } else if (isRobotics) {
        welcomeMsg = "Welcome to your Robotics simulation round.";
      }

      speakText(welcomeMsg, "male");
    };

    const timer = setTimeout(startWelcome, 600);

    const handleFirstInteraction = () => {
      unlockAudio();
      if (!hasSpokenWelcomeRef.current) {
        startWelcome();
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      clearTimeout(timer);
      stopSpeech();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isHardware, isRobotics]);

  // Load starter code on problem or language change
  useEffect(() => {
    if (currentProblem && currentProblem.starterCode) {
      setUserCode(currentProblem.starterCode[selectedLanguage] || "");
    }
    setTimeLeft(currentProblem.timeLimitMinutes * 60);
    setConsoleOutput(null);
    questionStartTime.current = Date.now();
  }, [currentIdx, selectedLanguage]);

  // Focus penalty callback from webcam proctoring (-2%)
  const handleFocusPenalty = (deduction = 2, reason = "") => {
    setFocusPoints((prev) => {
      const nextScore = Math.max(10, prev - deduction);
      setProctorWarning("⚠️ Focus Alert: " + reason + " (-" + deduction + "% Focus Points)");
      setTimeout(() => setProctorWarning(""), 3500);
      return nextScore;
    });
  };

  // Tab switch anti-cheating & behavioral integrity penalty
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextVal = prev + 1;
          setFocusPoints((prevScore) => Math.max(10, prevScore - 15));

          if (nextVal === 1) {
            alert("⚠️ PROCTOR WARNING: Tab Switch Detected!\n\nSwitching away from the coding environment penalizes your Focus Points (-15%). Keep your focus on the assessment.");
          } else if (nextVal >= 3) {
            alert("⚠️ CRITICAL PROCTOR ALERT: Multiple tab switches detected. Integrity penalty applied.");
          }
          return nextVal;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitCode(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle Tab key in editor (inserts 4 spaces instead of tab focus loss)
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = userCode.substring(0, start) + "    " + userCode.substring(end);
      setUserCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run Sample Test Cases
  const handleRunCode = () => {
    setIsRunningTests(true);
    setConsoleOutput({ status: "running", message: isHardware ? "Simulating Verilog RTL waveforms and clock cycles..." : "Executing sample test cases..." });

    setTimeout(() => {
      const evaluation = evaluateCodeSubmission({
        code: userCode,
        language: selectedLanguage,
        problem: currentProblem,
        timeTakenSeconds: Math.round((Date.now() - questionStartTime.current) / 1000)
      });

      setIsRunningTests(false);
      setConsoleOutput({
        status: evaluation.status === "UNATTEMPTED" ? "syntax_warning" : (evaluation.hasSyntaxError ? "syntax_warning" : (evaluation.score >= 60 ? "success" : "failed")),
        evaluation
      });
    }, 600);
  };

  const roundTitle = isRobotics
    ? "Robotics Systems & Control Simulation"
    : (isHardware ? "Verilog RTL Design & Verification Assessment" : "DSA Coding Assessment");

  const assessmentTypeLabel = isRobotics
    ? "Robotics Simulation Round"
    : (isHardware ? "Verilog RTL Design Round" : "DSA Coding Round");

  const roundIcon = isRobotics ? "🤖" : (isHardware ? "⚡" : "💻");

  // Submit Problem Code & Advance
  const handleSubmitCode = (isAutoSubmit = false) => {
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
    const evaluation = evaluateCodeSubmission({
      code: userCode,
      language: selectedLanguage,
      problem: currentProblem,
      timeTakenSeconds: timeSpent
    });

    const updatedSubmissions = [
      ...evaluatedSubmissions,
      {
        ...evaluation,
        questionNumber: currentIdx + 1,
        timeSpentFormatted: Math.floor(timeSpent / 60) + "m " + (timeSpent % 60) + "s",
        isAutoSubmit
      }
    ];

    setEvaluatedSubmissions(updatedSubmissions);

    if (currentIdx < problemSet.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed all problems -> Route to Result page
      const totalDurationMin = Math.max(1, Math.round((Date.now() - totalRoundStartTime.current) / 60000));
      
      const answersFormat = updatedSubmissions.map((sub) => ({
        questionNumber: sub.questionNumber,
        category: isHardware ? "RTL: " + sub.title : (isRobotics ? "Robotics: " + sub.title : "DSA: " + sub.title),
        question: "Implement " + sub.title + " (" + sub.difficulty + " • " + (sub.complexityDetected || "1 Clock Cycle") + ")",
        answer: "Language: " + sub.language.toUpperCase() + "\n\n" + sub.code,
        dsaEvaluation: sub
      }));

      navigate("/result", {
        state: {
          userId,
          answers: answersFormat,
          dsaSubmissions: updatedSubmissions,
          name,
          branch,
          year,
          role,
          interviewType: assessmentTypeLabel,
          skills,
          projects,
          durationMinutes: totalDurationMin,
          integrityScore: focusPoints,
          tabSwitches
        }
      });
    }
  };

  const handleSkip = () => {
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
    const updatedSubmissions = [
      ...evaluatedSubmissions,
      {
        problemId: currentProblem.id,
        title: currentProblem.title,
        difficulty: currentProblem.difficulty,
        language: selectedLanguage,
        code: "SKIPPED",
        score: 0,
        logicScore: 0,
        syntaxScore: 0,
        passedTestCases: 0,
        totalTestCases: currentProblem.testCases ? currentProblem.testCases.length : 3,
        rating: "Needs Improvement",
        feedback: "Problem was skipped.",
        questionNumber: currentIdx + 1,
        timeSpentFormatted: Math.floor(timeSpent / 60) + "m " + (timeSpent % 60) + "s"
      }
    ];

    setEvaluatedSubmissions(updatedSubmissions);

    if (currentIdx < problemSet.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const totalDurationMin = Math.max(1, Math.round((Date.now() - totalRoundStartTime.current) / 60000));
      const answersFormat = updatedSubmissions.map((sub) => ({
        questionNumber: sub.questionNumber,
        category: isHardware ? "RTL: " + sub.title : (isRobotics ? "Robotics: " + sub.title : "DSA: " + sub.title),
        question: "Implement " + sub.title + " (" + sub.difficulty + ")",
        answer: "SKIPPED",
        dsaEvaluation: sub
      }));

      navigate("/result", {
        state: {
          userId,
          answers: answersFormat,
          dsaSubmissions: updatedSubmissions,
          name,
          branch,
          year,
          role,
          interviewType: assessmentTypeLabel,
          skills,
          projects,
          durationMinutes: totalDurationMin,
          integrityScore: focusPoints,
          tabSwitches
        }
      });
    }
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const getDifficultyColor = (diff) => {
    if (diff.includes("Easy")) return "#00e676";
    if (diff.includes("Medium")) return "#ffb74d";
    return "#ff5252";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e14", color: "#fff", display: "flex", flexDirection: "column" }}>
      
      {/* TOP PROCTOR NOTIFICATION BANNER */}
      {proctorWarning && (
        <div
          style={{
            background: "rgba(255, 77, 79, 0.25)",
            borderBottom: "1px solid #ff4d4f",
            padding: "6px 16px",
            color: "#ff7875",
            fontWeight: "bold",
            fontSize: "12px",
            textAlign: "center"
          }}
        >
          {proctorWarning}
        </div>
      )}

      {/* TOP NAV BAR */}
      <header
        style={{
          background: "#13171f",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "20px" }}>{roundIcon}</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "700", textAlign: "left" }}>
              {roundTitle} • {role}
            </h1>
            <span style={{ fontSize: "12px", color: "#888" }}>
              {name} • {branch} ({year})
            </span>
          </div>
        </div>

        {/* PROCTOR INTEGRITY WIDGET */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "14px",
              background: focusPoints >= 80 ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.15)",
              border: "1px solid " + (focusPoints >= 80 ? "#00e676" : "#ff5252") + "44",
              color: focusPoints >= 80 ? "#00e676" : "#ff5252",
              fontWeight: "600"
            }}
          >
            🛡️ Focus Points: {focusPoints}% {tabSwitches > 0 && "(" + tabSwitches + " switches)"}
          </div>

          <div
            style={{
              color: timeLeft < 120 ? "#ff5252" : "#ff9800",
              fontWeight: "bold",
              fontSize: "15px",
              background: "rgba(0,0,0,0.4)",
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            ⏱ {minutes}:{seconds}
          </div>
        </div>
      </header>

      {/* QUESTION PROGRESS BAR */}
      <div style={{ background: "#161b24", padding: "8px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#90caf9" }}>
            Challenge {currentIdx + 1} of {problemSet.length}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: getDifficultyColor(currentProblem.difficulty),
              background: getDifficultyColor(currentProblem.difficulty) + "18",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid " + getDifficultyColor(currentProblem.difficulty) + "44"
            }}
          >
            {currentProblem.difficulty}
          </span>
          <span style={{ fontSize: "12px", color: "#888" }}>• {currentProblem.topic}</span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {problemSet.map((p, idx) => (
            <div
              key={idx}
              style={{
                width: "24px",
                height: "6px",
                borderRadius: "3px",
                background: idx < currentIdx ? "#00e676" : idx === currentIdx ? "#2196f3" : "rgba(255,255,255,0.1)"
              }}
            />
          ))}
        </div>
      </div>

      {/* MAIN SPLIT WORKSPACE */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexWrap: "wrap" }}>
        
        {/* LEFT PANEL: PROBLEM / RTL SPEC */}
        <div
          style={{
            flex: "1 1 380px",
            background: "#0e121a",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 18px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 120px)",
            textAlign: "left"
          }}
        >
          <h2 style={{ fontSize: "19px", margin: "0 0 12px 0", color: "#fff", fontWeight: "700" }}>
            {currentProblem.title}
          </h2>

          <div style={{ fontSize: "14px", color: "#ddd", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
            {currentProblem.description}
          </div>

          {/* EXAMPLES / TIMING */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "13px", color: "#90caf9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
              {isHardware ? "Behavioral & Clock Specifications" : "Examples"}
            </h3>
            {currentProblem.examples.map((ex, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", color: "#aaa" }}>
                  <b style={{ color: "#fff" }}>Condition / Input:</b> <code>{ex.input}</code>
                </div>
                <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>
                  <b style={{ color: "#00e676" }}>Expected Output:</b> <code>{ex.output}</code>
                </div>
                {ex.explanation && (
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    <b>Explanation:</b> {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CONSTRAINTS / RTL GUIDELINES */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "13px", color: "#ffb74d", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              {isHardware ? "Synthesis & Clock Constraints" : "Constraints & Target Complexity"}
            </h3>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#aaa", fontSize: "13px", lineHeight: "1.6" }}>
              {currentProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* EMBEDDED PROCTOR CAMERA */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
            <ProctorCamera
              onFocusPenalty={handleFocusPenalty}
              integrityScore={focusPoints}
            />
          </div>
        </div>

        {/* RIGHT PANEL: CODE EDITOR & CONSOLE */}
        <div style={{ flex: "1 1 520px", display: "flex", flexDirection: "column", background: "#11151e" }}>
          
          {/* EDITOR TOOLBAR */}
          <div style={{ background: "#161b24", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#888" }}>Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  background: "#21262d",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {isHardware ? (
                  <>
                    <option value="verilog">Verilog (IEEE 1364)</option>
                    <option value="systemverilog">SystemVerilog (IEEE 1800)</option>
                    <option value="cpp">C / Embedded Driver</option>
                    <option value="python">Python (Verification / Cocotb)</option>
                  </>
                ) : (
                  <>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ 20</option>
                    <option value="java">Java 17</option>
                    <option value="javascript">JavaScript (ES6)</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={() => setUserCode(currentProblem.starterCode[selectedLanguage] || "")}
              style={{ background: "transparent", border: "none", color: "#888", fontSize: "12px", cursor: "pointer" }}
            >
              Reset Boilerplate ↺
            </button>
          </div>

          {/* CODE TEXTAREA */}
          <div style={{ flex: 1, minHeight: "340px", position: "relative" }}>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHardware ? "// Design your synthesizable Verilog module here..." : "// Write your solution here..."}
              spellCheck="false"
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                background: "#0d1117",
                color: "#e6edf3",
                fontFamily: "Consolas, Monaco, 'Courier New', monospace",
                fontSize: "14px",
                lineHeight: "1.5",
                padding: "16px",
                border: "none",
                outline: "none",
                resize: "none"
              }}
            />
          </div>

          {/* CONSOLE OUTPUT PANEL */}
          {consoleOutput && (
            <div
              style={{
                background: "#161b22",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                padding: "12px 16px",
                maxHeight: "150px",
                overflowY: "auto",
                fontSize: "13px",
                textAlign: "left"
              }}
            >
              {consoleOutput.status === "running" && (
                <span style={{ color: "#64b5f6" }}>⏳ {consoleOutput.message}</span>
              )}

              {consoleOutput.evaluation && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: consoleOutput.evaluation.status === "UNATTEMPTED" ? "#ff5252" : (consoleOutput.evaluation.hasSyntaxError ? "#ffb74d" : "#00e676")
                      }}
                    >
                      {consoleOutput.evaluation.status === "UNATTEMPTED"
                        ? "❌ Incomplete / Unattempted Solution"
                        : (consoleOutput.evaluation.hasSyntaxError ? "⚠️ Syntax Note Detected" : "✓ Tests Executed Successfully")}
                    </span>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>
                      Score: {consoleOutput.evaluation.score}% • Passed: {consoleOutput.evaluation.passedTestCases}/{consoleOutput.evaluation.totalTestCases}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "12px", color: "#ccc", lineHeight: "1.4" }}>
                    {consoleOutput.evaluation.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTONS BAR */}
          <div
            style={{
              background: "#13171f",
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <button
              onClick={handleSkip}
              style={{
                background: "transparent",
                color: "#888",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Skip Challenge
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleRunCode}
                disabled={isRunningTests}
                style={{
                  background: "#21262d",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {isRunningTests ? "Simulating..." : (isHardware ? "▶ Simulate RTL" : "▶ Run Tests")}
              </button>

              <button
                onClick={() => handleSubmitCode(false)}
                style={{
                  background: "linear-gradient(90deg, #00e676, #00b0ff)",
                  color: "#000",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {currentIdx === problemSet.length - 1 ? "Submit & View Analytics 🏁" : "Submit Code & Next →"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default DsaRound;

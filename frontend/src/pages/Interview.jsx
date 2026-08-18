import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    name = "Candidate",
    branch = "CSE",
    year = "3rd Year",
    role = "Software Engineer",
    interviewType = "Technical Interview",
    questions = [],
    skills = [],
    projects = []
  } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [warningCount, setWarningCount] = useState(0);
  const [roundTransitionModal, setRoundTransitionModal] = useState(null);

  // Total elapsed interview time tracking
  const interviewStartTime = useRef(Date.now());

  // Adaptive Follow-Up State
  const isAdaptiveMode =
    interviewType === "AI Mock Interview" ||
    interviewType === "Full Interview Simulation";

  const [isAnalyzingResponse, setIsAnalyzingResponse] = useState(false);
  const [isFollowUpActive, setIsFollowUpActive] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [primaryAnswerSaved, setPrimaryAnswerSaved] = useState("");

  const totalQuestions = questions ? questions.length : 0;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Rounds configuration for Full Interview Simulation (20 Questions)
  const fullInterviewRounds = [
    { round: 1, name: "HR / Introduction", startQ: 0, endQ: 2, count: 3, icon: "👋" },
    { round: 2, name: "Resume & Projects", startQ: 3, endQ: 6, count: 4, icon: "📄" },
    { round: 3, name: "Technical Fundamentals", startQ: 7, endQ: 11, count: 5, icon: "⚡" },
    { round: 4, name: "Problem Solving & Debugging", startQ: 12, endQ: 14, count: 3, icon: "🧠" },
    { round: 5, name: "Behavioral & Situational", startQ: 15, endQ: 17, count: 3, icon: "🤝" },
    { round: 6, name: "Final / Role-Specific", startQ: 18, endQ: 19, count: 2, icon: "🎯" }
  ];

  // Helper to determine current round / category
  const getCurrentCategoryInfo = () => {
    if (interviewType === "Full Interview Simulation") {
      const activeRound = fullInterviewRounds.find(
        (r) => currentQuestion >= r.startQ && currentQuestion <= r.endQ
      ) || fullInterviewRounds[0];
      return {
        isFullInterview: true,
        roundNumber: activeRound.round,
        roundName: activeRound.name,
        icon: activeRound.icon,
        roundTotal: activeRound.count,
        questionInRound: currentQuestion - activeRound.startQ + 1
      };
    }

    if (interviewType === "AI Mock Interview") {
      if (currentQuestion === 0) return { name: "Introduction & Warm-up", icon: "👋", round: 1 };
      if (currentQuestion >= 1 && currentQuestion <= 2) return { name: "Resume & Skills Deep Dive", icon: "📄", round: 2 };
      if (currentQuestion >= 3 && currentQuestion <= 4) return { name: "Project Architecture & Tradeoffs", icon: "🚀", round: 3 };
      if (currentQuestion >= 5 && currentQuestion <= 6) return { name: `Branch Fundamentals (${branch})`, icon: "🏛️", round: 4 };
      if (currentQuestion === 7) return { name: `Role-Specific Knowledge (${role})`, icon: "🎯", round: 5 };
      if (currentQuestion === 8) return { name: "Practical Problem Solving", icon: "🧠", round: 6 };
      return { name: "Behavioral & Situational", icon: "🤝", round: 7 };
    }

    if (interviewType === "HR Interview") {
      return { name: "HR & Behavioral Evaluation", icon: "🤝", round: 1 };
    }

    return { name: `Technical Evaluation (${branch})`, icon: "⚡", round: 1 };
  };

  const categoryInfo = getCurrentCategoryInfo();

  // Tab switch anti-cheating detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (warningCount === 0) {
          alert("⚠️ LAST WARNING!\n\nDo not switch tabs. Next violation will auto-submit your interview.");
          setWarningCount(1);
        } else {
          alert("Interview auto submitted due to multiple tab switches.");
          const totalDurationMin = Math.max(1, Math.round((Date.now() - interviewStartTime.current) / 60000));
          navigate("/result", {
            state: {
              answers,
              name,
              branch,
              year,
              role,
              interviewType,
              skills,
              projects,
              durationMinutes: totalDurationMin
            }
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [warningCount, answers, navigate, name, branch, year, role, interviewType, skills, projects]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(180);
    setIsFollowUpActive(false);
    setFollowUpQuestion("");
    setFollowUpAnswer("");
    setPrimaryAnswerSaved("");
  }, [currentQuestion]);

  // Timer & Copy-paste prevention
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    if (timeLeft === 0) {
      if (isFollowUpActive) {
        submitFollowUp("SKIPPED");
      } else {
        handleSkip();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [timeLeft, isFollowUpActive]);

  // Client-side fallback generator for follow-ups if backend is offline
  const generateLocalFollowUp = (userAns) => {
    const ansLower = userAns.toLowerCase();
    if (ansLower.includes("random forest")) {
      return "Interesting. Why did you choose Random Forest instead of Linear Regression or XGBoost for this problem?";
    }
    if (ansLower.includes("fastapi")) {
      return "Why did you select FastAPI over Flask or Express, and how did you manage async performance?";
    }
    if (ansLower.includes("react")) {
      return "How did you manage state updates and prevent unnecessary component re-renders?";
    }
    if (ansLower.includes("sql") || ansLower.includes("database") || ansLower.includes("mongodb")) {
      return "How did you structure database indexing or schema normalization to optimize read/write latencies?";
    }
    if (ansLower.includes("jwt") || ansLower.includes("auth")) {
      return "How did you securely manage token storage on the client side and handle token expiration?";
    }
    if (ansLower.includes("array") || ansLower.includes("hashmap") || ansLower.includes("time complexity")) {
      return "What are the trade-offs of this approach in terms of auxiliary space complexity?";
    }
    if (ansLower.includes("docker") || ansLower.includes("aws") || ansLower.includes("deploy")) {
      return "How did you handle environment isolation and scalability during deployment?";
    }
    return "You highlighted a specific technical choice. What edge cases or alternative solutions did you consider during implementation?";
  };

  // Main Submit handler (Triggers adaptive follow-up if applicable)
  const handleSubmit = async () => {
    if (answer.trim() === "") {
      alert("Please enter an answer or click Skip.");
      return;
    }

    // Check if adaptive follow-up should trigger
    const shouldAskFollowUp =
      isAdaptiveMode &&
      !isFollowUpActive &&
      answer.trim().length >= 20;

    if (shouldAskFollowUp) {
      setIsAnalyzingResponse(true);
      setPrimaryAnswerSaved(answer);

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/generate-followup",
          {
            name,
            branch,
            role,
            question: questions[currentQuestion],
            answer: answer.trim(),
            category: categoryInfo.name,
            projects,
            skills
          },
          { timeout: 3000 }
        );

        if (response.data && response.data.hasFollowUp && response.data.followUpQuestion) {
          setFollowUpQuestion(response.data.followUpQuestion);
          setIsFollowUpActive(true);
          setTimeLeft(120);
          setIsAnalyzingResponse(false);
          return;
        }
      } catch (err) {
        console.warn("Backend follow-up offline, checking local rules...", err);
        const localFollowUp = generateLocalFollowUp(answer.trim());
        if (localFollowUp) {
          setFollowUpQuestion(localFollowUp);
          setIsFollowUpActive(true);
          setTimeLeft(120);
          setIsAnalyzingResponse(false);
          return;
        }
      }

      setIsAnalyzingResponse(false);
    }

    finalizeQuestionStep(answer, null);
  };

  // Submit Follow-Up Answer
  const submitFollowUp = (finalFollowUpAns) => {
    finalizeQuestionStep(primaryAnswerSaved || answer, finalFollowUpAns);
  };

  const skipFollowUp = () => {
    finalizeQuestionStep(primaryAnswerSaved || answer, "SKIPPED");
  };

  const handleSkip = () => {
    finalizeQuestionStep("SKIPPED", null);
  };

  const finalizeQuestionStep = (mainAns, followAns) => {
    const currentQText = questions[currentQuestion] || "";
    const updatedAnswers = [
      ...answers,
      {
        questionNumber: currentQuestion + 1,
        category: categoryInfo.name,
        question: currentQText,
        answer: mainAns,
        followUpQuestion: followAns !== null ? followUpQuestion : null,
        followUpAnswer: followAns
      }
    ];

    setAnswers(updatedAnswers);
    setIsFollowUpActive(false);
    setFollowUpQuestion("");
    setFollowUpAnswer("");

    if (currentQuestion < questions.length - 1) {
      const nextQIndex = currentQuestion + 1;

      // Check if crossing round boundary in Full Interview Simulation
      if (interviewType === "Full Interview Simulation") {
        const currentRoundObj = fullInterviewRounds.find(
          (r) => currentQuestion >= r.startQ && currentQuestion <= r.endQ
        );
        const nextRoundObj = fullInterviewRounds.find(
          (r) => nextQIndex >= r.startQ && nextQIndex <= r.endQ
        );

        if (currentRoundObj && nextRoundObj && currentRoundObj.round !== nextRoundObj.round) {
          setRoundTransitionModal({
            completedRound: currentRoundObj.name,
            completedRoundNum: currentRoundObj.round,
            nextRound: nextRoundObj.name,
            nextRoundNum: nextRoundObj.round,
            nextRoundIcon: nextRoundObj.icon
          });
        }
      }

      setCurrentQuestion(nextQIndex);
      setAnswer("");
    } else {
      const totalDurationMin = Math.max(1, Math.round((Date.now() - interviewStartTime.current) / 60000));
      navigate("/result", {
        state: {
          answers: updatedAnswers,
          name,
          branch,
          year,
          role,
          interviewType,
          skills,
          projects,
          durationMinutes: totalDurationMin
        }
      });
    }
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  if (!questions || questions.length === 0) {
    return (
      <div className="page">
        <div className="card">
          <h1>No Questions Generated</h1>
          <p>Could not initialize questions for this session.</p>
          <button className="start-btn" onClick={() => navigate("/")}>
            Back To Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "20px 10px" }}>
      {/* ROUND TRANSITION MODAL */}
      {roundTransitionModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "14px",
              padding: "30px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "10px" }}>🎉</div>
            <h2 style={{ color: "#00e676", margin: "0 0 10px 0", fontSize: "22px" }}>
              Round {roundTransitionModal.completedRoundNum} Completed!
            </h2>
            <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px" }}>
              You have completed <b>{roundTransitionModal.completedRound}</b>.
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "24px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <span style={{ fontSize: "12px", color: "#64b5f6", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                Next Up
              </span>
              <h3 style={{ margin: "6px 0 0 0", color: "#fff", fontSize: "18px" }}>
                {roundTransitionModal.nextRoundIcon} Round {roundTransitionModal.nextRoundNum}: {roundTransitionModal.nextRound}
              </h3>
            </div>
            <button
              className="start-btn"
              onClick={() => setRoundTransitionModal(null)}
              style={{ width: "100%", padding: "12px", fontSize: "16px" }}
            >
              Continue to Round {roundTransitionModal.nextRoundNum} 🚀
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: "780px", width: "100%" }}>
        {/* INTERVIEW HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", margin: 0, textAlign: "left" }}>
              AI Interview Simulator
            </h1>
            <p style={{ margin: "4px 0 0 0", opacity: 0.7, fontSize: "13px", textAlign: "left" }}>
              {name} • {branch} ({year}) • <span style={{ color: "#00e676", fontWeight: "bold" }}>{role}</span>
            </p>
          </div>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(79, 195, 247, 0.15)",
              color: "#4fc3f7",
              fontWeight: "600",
              fontSize: "13px",
              border: "1px solid rgba(79, 195, 247, 0.3)"
            }}
          >
            {interviewType}
          </span>
        </div>

        {/* FULL INTERVIEW ROUNDS TRACKER WIDGET */}
        {interviewType === "Full Interview Simulation" && (
          <div style={{ marginBottom: "18px", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64b5f6" }}>
                {categoryInfo.icon} Round {categoryInfo.roundNumber} of 6: {categoryInfo.roundName}
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Question {categoryInfo.questionInRound} of {categoryInfo.roundTotal}
              </span>
            </div>

            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
              {fullInterviewRounds.map((r) => {
                const isPassed = currentQuestion > r.endQ;
                const isCurrent = currentQuestion >= r.startQ && currentQuestion <= r.endQ;
                return (
                  <div
                    key={r.round}
                    style={{
                      flex: 1,
                      minWidth: "90px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      textAlign: "center",
                      fontWeight: isCurrent ? "bold" : "normal",
                      background: isPassed ? "rgba(0, 230, 118, 0.15)" : isCurrent ? "rgba(33, 150, 243, 0.25)" : "rgba(255,255,255,0.04)",
                      border: isPassed ? "1px solid #00e676" : isCurrent ? "1px solid #2196f3" : "1px solid rgba(255,255,255,0.08)",
                      color: isPassed ? "#00e676" : isCurrent ? "#90caf9" : "#666"
                    }}
                  >
                    {isPassed ? "✓ " : isCurrent ? "● " : "○ "}
                    R{r.round}: {r.name.split(" ")[0]}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI MOCK INTERVIEW CATEGORY BADGE */}
        {interviewType === "AI Mock Interview" && (
          <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(100, 181, 246, 0.08)", padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(100, 181, 246, 0.2)" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#90caf9" }}>
              {categoryInfo.icon} {categoryInfo.name}
            </span>
            <span style={{ fontSize: "12px", color: "#00e676", fontWeight: "600" }}>
              ⚡ Adaptive AI Enabled
            </span>
          </div>
        )}

        {/* PROGRESS & TIMER ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", color: "#ddd" }}>
            Question <b>{currentQuestion + 1}</b> of <b>{totalQuestions}</b>
          </span>
          <span
            style={{
              color: timeLeft < 30 ? "#ff5252" : "#ff9800",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            ⏱ {minutes}:{seconds}
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="progress-bar" style={{ height: "8px", borderRadius: "4px", background: "#222", overflow: "hidden", marginBottom: "20px" }}>
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #2196f3, #00e676)",
              transition: "width 0.3s ease"
            }}
          ></div>
        </div>

        {/* PRIMARY QUESTION DISPLAY */}
        <div
          style={{
            background: isFollowUpActive ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "16px",
            textAlign: "left",
            opacity: isFollowUpActive ? 0.7 : 1
          }}
        >
          <span style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Main Question {currentQuestion + 1}
          </span>
          <h2 style={{ fontSize: "18px", color: "#fff", lineHeight: "1.4", margin: 0, fontWeight: "600" }}>
            {questions[currentQuestion]}
          </h2>

          {isFollowUpActive && primaryAnswerSaved && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", borderLeft: "3px solid #2196f3" }}>
              <span style={{ fontSize: "12px", color: "#aaa" }}>Your Initial Answer:</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#e0e0e0", fontStyle: "italic" }}>
                "{primaryAnswerSaved.length > 140 ? primaryAnswerSaved.slice(0, 140) + "..." : primaryAnswerSaved}"
              </p>
            </div>
          )}
        </div>

        {/* ADAPTIVE FOLLOW-UP CARD */}
        {isFollowUpActive && (
          <div
            style={{
              background: "rgba(255, 152, 0, 0.08)",
              border: "1px solid rgba(255, 152, 0, 0.35)",
              borderRadius: "10px",
              padding: "18px",
              marginBottom: "18px",
              textAlign: "left",
              animation: "fadeIn 0.3s ease-in"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
              <span style={{ fontSize: "12px", color: "#ffb74d", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                AI Adaptive Follow-Up Question
              </span>
            </div>
            <h3 style={{ fontSize: "17px", color: "#fff", margin: "4px 0 0 0", lineHeight: "1.4", fontWeight: "600" }}>
              {followUpQuestion}
            </h3>
          </div>
        )}

        {/* ANALYZING LOADER STATE */}
        {isAnalyzingResponse && (
          <div style={{ padding: "16px", background: "rgba(33, 150, 243, 0.1)", borderRadius: "8px", border: "1px solid rgba(33, 150, 243, 0.3)", marginBottom: "16px", textAlign: "center" }}>
            <span style={{ color: "#64b5f6", fontSize: "14px", fontWeight: "600" }}>
              🤖 AI is analyzing your response for adaptive follow-up...
            </span>
          </div>
        )}

        {/* TEXTAREA INPUT */}
        {!isFollowUpActive ? (
          <textarea
            placeholder="Type your response here... (Structure your thoughts clearly with real project examples & trade-offs)"
            rows="7"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAnalyzingResponse}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              fontSize: "15px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(0, 0, 0, 0.4)",
              color: "#fff",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        ) : (
          <textarea
            placeholder="Answer the follow-up question directly (Explain your rationale, trade-offs or technical depth)..."
            rows="5"
            value={followUpAnswer}
            onChange={(e) => setFollowUpAnswer(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              fontSize: "15px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 152, 0, 0.4)",
              background: "rgba(0, 0, 0, 0.5)",
              color: "#fff",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        )}

        {/* BUTTON ACTIONS */}
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {!isFollowUpActive ? (
            <>
              <button
                className="start-btn"
                onClick={handleSubmit}
                disabled={isAnalyzingResponse}
                style={{ flex: 3, padding: "12px", fontSize: "16px" }}
              >
                {isAnalyzingResponse
                  ? "Evaluating..."
                  : currentQuestion === totalQuestions - 1
                  ? "Finish Interview 🏁"
                  : "Submit Answer"}
              </button>

              <button
                onClick={handleSkip}
                disabled={isAnalyzingResponse}
                style={{
                  flex: 1,
                  background: "#333",
                  color: "#aaa",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600"
                }}
              >
                Skip Question
              </button>
            </>
          ) : (
            <>
              <button
                className="start-btn"
                onClick={() => submitFollowUp(followUpAnswer.trim() || "No follow-up response provided")}
                style={{ flex: 3, padding: "12px", fontSize: "16px", background: "linear-gradient(90deg, #ff9800, #f57c00)" }}
              >
                Submit Follow-Up & Next
              </button>

              <button
                onClick={skipFollowUp}
                style={{
                  flex: 1,
                  background: "#333",
                  color: "#aaa",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600"
                }}
              >
                Skip Follow-up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;

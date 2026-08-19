import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { speakText, stopSpeech, unlockAudio, createSpeechRecognizer } from "../utils/voiceUtils";
import ProctorCamera from "../components/ProctorCamera";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    userId = "",
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
  const [roundTransitionModal, setRoundTransitionModal] = useState(null);

  // Proctoring & Focus points state
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusPoints, setFocusPoints] = useState(100);
  const [proctorWarning, setProctorWarning] = useState("");

  // Voice TTS & STT state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognizerRef = useRef(null);

  // Total elapsed interview time tracking
  const interviewStartTime = useRef(Date.now());
  const hasSpokenWelcomeRef = useRef(false);

  // Follow-up state (Restricted strictly to Full Interview Simulation!)
  const isAdaptiveMode = interviewType === "Full Interview Simulation";

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
      if (currentQuestion >= 5 && currentQuestion <= 6) return { name: "Branch Fundamentals (" + branch + ")", icon: "🏛️", round: 4 };
      if (currentQuestion === 7) return { name: "Role-Specific Knowledge (" + role + ")", icon: "🎯", round: 5 };
      if (currentQuestion === 8) return { name: "Practical Problem Solving", icon: "🧠", round: 6 };
      return { name: "Behavioral & Situational", icon: "🤝", round: 7 };
    }

    if (interviewType === "HR Interview") {
      return { name: "HR & Behavioral Evaluation", icon: "🤝", round: 1 };
    }

    return { name: "Technical Evaluation (" + branch + ")", icon: "⚡", round: 1 };
  };

  const categoryInfo = getCurrentCategoryInfo();

  // Helper to determine voice gender for question
  const getQuestionVoiceGender = (qIndex) => {
    if (interviewType === "HR Interview") return "female";
    if (interviewType === "Technical Interview") return "male";
    if (interviewType === "AI Mock Interview") return "male";
    // Full Interview Simulation: Alternating Male & Female voice per question
    return qIndex % 2 === 0 ? "male" : "female";
  };

  // Focus penalty handler from camera gaze proctoring (-2% per violation)
  const handleFocusPenalty = (deduction = 2, reason = "") => {
    setFocusPoints((prev) => {
      const nextScore = Math.max(10, prev - deduction);
      setProctorWarning("⚠️ Focus Alert: " + reason + " (-" + deduction + "% Focus Points)");
      setTimeout(() => setProctorWarning(""), 3500);
      return nextScore;
    });
  };

  // Tab switch anti-cheating detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextSwitches = prev + 1;
          setFocusPoints((prevPoints) => Math.max(10, prevPoints - 15));

          if (nextSwitches === 1) {
            alert("⚠️ PROCTOR WARNING: Tab Switch Detected!\n\nSwitching tabs or windows penalizes your Focus Points (-15%). Please stay focused on the interview window.");
          } else if (nextSwitches === 2) {
            alert("⚠️ CRITICAL PROCTOR ALERT: Second tab switch detected. Serious integrity penalty applied.");
          } else if (nextSwitches >= 3) {
            alert("🚫 INTERVIEW TERMINATED: Excessive tab switches detected (3/3).\n\nYour session is being automatically submitted with an integrity violation record.");
            const totalDurationMin = Math.max(1, Math.round((Date.now() - interviewStartTime.current) / 60000));
            navigate("/result", {
              state: {
                userId,
                answers,
                name,
                branch,
                year,
                role,
                interviewType,
                skills,
                projects,
                durationMinutes: totalDurationMin,
                integrityScore: Math.max(10, focusPoints - 30),
                tabSwitches: nextSwitches
              }
            });
          }
          return nextSwitches;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [answers, navigate, name, branch, year, role, interviewType, skills, projects, focusPoints]);

  // Initial Welcome Spoken Message & First Question
  useEffect(() => {
    unlockAudio();

    const startWelcomeAudio = () => {
      if (hasSpokenWelcomeRef.current) return;
      hasSpokenWelcomeRef.current = true;

      let welcomePhrase = "Welcome to your interview session.";
      let welcomeGender = "male";

      if (interviewType === "HR Interview") {
        welcomePhrase = "Welcome to The HR interview.";
        welcomeGender = "female";
      } else if (interviewType === "Technical Interview") {
        welcomePhrase = "Welcome to the Technical Interview.";
        welcomeGender = "male";
      } else if (interviewType === "AI Mock Interview") {
        welcomePhrase = "Welcome to the AI mock interview.";
        welcomeGender = "male";
      } else if (interviewType === "Full Interview Simulation") {
        welcomePhrase = "Welcome to the Full interview session.";
        welcomeGender = "female";
      }

      if (!isAudioMuted && questions && questions.length > 0) {
        setIsSpeaking(true);
        speakText(
          welcomePhrase,
          welcomeGender,
          () => setIsSpeaking(true),
          () => {
            // Speak the first question right after welcome
            const firstQ = questions[0];
            const voiceGen = getQuestionVoiceGender(0);
            speakText(
              firstQ,
              voiceGen,
              () => setIsSpeaking(true),
              () => setIsSpeaking(false)
            );
          }
        );
      }
    };

    // Trigger after brief timeout to let browser initialize Web Speech API
    const timer = setTimeout(startWelcomeAudio, 600);

    // Also fallback on first user interaction in case browser blocked autoplay
    const handleFirstInteraction = () => {
      unlockAudio();
      if (!hasSpokenWelcomeRef.current) {
        startWelcomeAudio();
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [questions, interviewType, isAudioMuted]);

  // Question change: reset timer, speak question if not muted
  useEffect(() => {
    setTimeLeft(180);
    setIsFollowUpActive(false);
    setFollowUpQuestion("");
    setFollowUpAnswer("");
    setPrimaryAnswerSaved("");

    if (hasSpokenWelcomeRef.current && currentQuestion > 0 && !isAudioMuted && questions[currentQuestion]) {
      const qText = questions[currentQuestion];
      const voiceGen = getQuestionVoiceGender(currentQuestion);
      speakText(
        qText,
        voiceGen,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    return () => {
      stopSpeech();
    };
  }, [currentQuestion]);

  // Timer countdown
  useEffect(() => {
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

    return () => clearTimeout(timer);
  }, [timeLeft, isFollowUpActive]);

  // Initialize Speech-to-Text Recognition Hook
  useEffect(() => {
    speechRecognizerRef.current = createSpeechRecognizer({
      onResult: ({ finalText, interimText }) => {
        if (finalText) {
          if (!isFollowUpActive) {
            setAnswer((prev) => (prev ? prev + " " + finalText : finalText));
          } else {
            setFollowUpAnswer((prev) => (prev ? prev + " " + finalText : finalText));
          }
        }
      },
      onStateChange: (listening) => {
        setIsListening(listening);
      },
      onError: (err) => {
        console.warn("STT Mic Note:", err);
      }
    });

    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
    };
  }, [isFollowUpActive]);

  // Toggle Mic Voice Input
  const toggleMicListening = () => {
    if (!speechRecognizerRef.current) return;
    if (isListening) {
      speechRecognizerRef.current.stop();
    } else {
      speechRecognizerRef.current.start();
    }
  };

  // Replay question audio
  const handleReplayAudio = () => {
    const textToSpeak = isFollowUpActive ? followUpQuestion : questions[currentQuestion];
    const voiceGen = getQuestionVoiceGender(currentQuestion);
    speakText(
      textToSpeak,
      voiceGen,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Client-side fallback generator for follow-ups in Full Interview
  const generateLocalFollowUp = (userAns) => {
    const ansLower = userAns.toLowerCase();
    if (ansLower.includes("random forest")) {
      return "You mentioned using Random Forest. Why did you choose this model specifically over XGBoost or Neural Networks, and what accuracy trade-offs did you observe?";
    }
    if (ansLower.includes("neural") || ansLower.includes("deep learning") || ansLower.includes("cnn")) {
      return "How did you prevent overfitting during neural network training, and what regularization techniques did you implement?";
    }
    if (ansLower.includes("fastapi")) {
      return "Why did you select FastAPI instead of Flask or Express, and how did you manage asynchronous event loops?";
    }
    if (ansLower.includes("react")) {
      return "How did you manage state updates and optimize re-rendering performance in your React components?";
    }
    if (ansLower.includes("sql") || ansLower.includes("database") || ansLower.includes("mongodb")) {
      return "How did you structure database indexing and schema normalization to optimize read and write latencies?";
    }
    if (ansLower.includes("jwt") || ansLower.includes("auth")) {
      return "How did you securely store authentication tokens on the client side and handle token expiration?";
    }
    if (ansLower.includes("array") || ansLower.includes("hashmap") || ansLower.includes("time complexity")) {
      return "What are the trade-offs of your chosen data structure in terms of auxiliary space complexity?";
    }
    return "You explained a specific approach. Why did you prefer this method over other viable architectural alternatives?";
  };

  // Submit Primary Question (Triggers adaptive follow-up ONLY in Full Interview)
  const handleSubmit = async () => {
    if (answer.trim() === "") {
      alert("Please enter an answer or click Skip.");
      return;
    }

    // Stop mic if active
    if (speechRecognizerRef.current && isListening) {
      speechRecognizerRef.current.stop();
    }

    // Follow-ups are strictly restricted to Full Interview Simulation
    const shouldAskFollowUp =
      isAdaptiveMode &&
      !isFollowUpActive &&
      answer.trim().length >= 18;

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
          const followQ = response.data.followUpQuestion;
          setFollowUpQuestion(followQ);
          setIsFollowUpActive(true);
          setTimeLeft(120);
          setIsAnalyzingResponse(false);

          // Speak follow-up question in alternate voice
          if (!isAudioMuted) {
            const followVoiceGen = currentQuestion % 2 === 0 ? "female" : "male";
            speakText(
              followQ,
              followVoiceGen,
              () => setIsSpeaking(true),
              () => setIsSpeaking(false)
            );
          }
          return;
        }
      } catch (err) {
        console.warn("Backend follow-up offline, using rule engine...", err);
        const localFollowUp = generateLocalFollowUp(answer.trim());
        if (localFollowUp) {
          setFollowUpQuestion(localFollowUp);
          setIsFollowUpActive(true);
          setTimeLeft(120);
          setIsAnalyzingResponse(false);

          if (!isAudioMuted) {
            const followVoiceGen = currentQuestion % 2 === 0 ? "female" : "male";
            speakText(
              localFollowUp,
              followVoiceGen,
              () => setIsSpeaking(true),
              () => setIsSpeaking(false)
            );
          }
          return;
        }
      }

      setIsAnalyzingResponse(false);
    }

    finalizeQuestionStep(answer, null);
  };

  // Submit Follow-Up Answer
  const submitFollowUp = (finalFollowUpAns) => {
    if (speechRecognizerRef.current && isListening) {
      speechRecognizerRef.current.stop();
    }
    finalizeQuestionStep(primaryAnswerSaved || answer, finalFollowUpAns);
  };

  const skipFollowUp = () => {
    if (speechRecognizerRef.current && isListening) {
      speechRecognizerRef.current.stop();
    }
    finalizeQuestionStep(primaryAnswerSaved || answer, "SKIPPED");
  };

  const handleSkip = () => {
    if (speechRecognizerRef.current && isListening) {
      speechRecognizerRef.current.stop();
    }
    finalizeQuestionStep("SKIPPED", null);
  };

  const finalizeQuestionStep = (mainAns, followAns) => {
    stopSpeech();
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
          userId,
          answers: updatedAnswers,
          name,
          branch,
          year,
          role,
          interviewType,
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
    <div className="page" style={{ padding: "20px 10px", minHeight: "100vh", boxSizing: "border-box" }}>
      
      {/* PROCTORING START & ACTIVE BANNER */}
      <div
        style={{
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto 14px auto",
          background: "linear-gradient(90deg, rgba(255, 77, 79, 0.15), rgba(255, 152, 0, 0.15))",
          border: "1px solid rgba(255, 77, 79, 0.35)",
          borderRadius: "8px",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          fontSize: "13px",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🛡️</span>
          <span>
            <b>Proctoring Active:</b> Don't switch your tabs or close window, otherwise focus points will be deducted. (Eyes allowed within 25° or down at keyboard).
          </span>
        </div>
        <span style={{ fontSize: "12px", color: focusPoints >= 80 ? "#00e676" : "#ff5252", fontWeight: "bold" }}>
          Focus Points: {focusPoints}%
        </span>
      </div>

      {/* PROCTOR NOTIFICATION TOAST */}
      {proctorWarning && (
        <div
          style={{
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto 12px auto",
            background: "rgba(255, 77, 79, 0.25)",
            border: "1.5px solid #ff4d4f",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#ff7875",
            fontWeight: "bold",
            fontSize: "13px",
            textAlign: "center",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {proctorWarning}
        </div>
      )}

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

      {/* MAIN CONTAINER SPLIT */}
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* INTERVIEW CARD */}
        <div className="card" style={{ flex: "1 1 650px", width: "100%", boxSizing: "border-box" }}>
          
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

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* VOICE STATUS & MUTE TOGGLE */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeech();
                  setIsAudioMuted(!isAudioMuted);
                }}
                style={{
                  background: isAudioMuted ? "rgba(255,255,255,0.06)" : "rgba(33,150,243,0.15)",
                  border: "1px solid " + (isAudioMuted ? "rgba(255,255,255,0.15)" : "#2196f3"),
                  color: isAudioMuted ? "#888" : "#64b5f6",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {isAudioMuted ? "🔇 Unmute AI Voice" : (isSpeaking ? "🔊 Speaking..." : "🔊 Audio On")}
              </button>

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
                🤖 Voice Question Reading Active
              </span>
            </div>
          )}

          {/* PROGRESS & TIMER ROW */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "#ddd" }}>
              Question <b>{currentQuestion + 1}</b> of <b>{totalQuestions}</b>
              <span style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>
                ({getQuestionVoiceGender(currentQuestion) === "female" ? "👩 Female Voice" : "👨 Male Voice"})
              </span>
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
                width: progress + "%",
                height: "100%",
                background: "linear-gradient(90deg, #2196f3, #00e676)",
                transition: "width 0.3s ease"
              }}
            ></div>
          </div>

          {/* PRIMARY QUESTION DISPLAY (READABLE + AUDIO CONTROLS) */}
          <div
            style={{
              background: isFollowUpActive ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "18px",
              marginBottom: "16px",
              textAlign: "left",
              opacity: isFollowUpActive ? 0.7 : 1,
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
                Main Question {currentQuestion + 1}
              </span>

              <button
                onClick={handleReplayAudio}
                title="Replay Voice Question"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#90caf9",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                🔊 Replay Voice
              </button>
            </div>

            <h2 style={{ fontSize: "18px", color: "#fff", lineHeight: "1.4", margin: 0, fontWeight: "600" }}>
              {questions[currentQuestion]}
            </h2>

            {isFollowUpActive && primaryAnswerSaved && (
              <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", borderLeft: "3px solid #2196f3" }}>
                <span style={{ fontSize: "12px", color: "#aaa" }}>Your Initial Answer:</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#e0e0e0", fontStyle: "italic" }}>
                  {primaryAnswerSaved && primaryAnswerSaved.length > 140 ? primaryAnswerSaved.slice(0, 140) + "..." : primaryAnswerSaved}
                </p>
              </div>
            )}
          </div>

          {/* ADAPTIVE FOLLOW-UP CARD (FULL INTERVIEW EXCLUSIVE) */}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>⚡</span>
                  <span style={{ fontSize: "12px", color: "#ffb74d", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AI Adaptive Follow-Up Question
                  </span>
                </div>
                <button
                  onClick={handleReplayAudio}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,152,0,0.3)",
                    color: "#ffb74d",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  🔊 Replay
                </button>
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
                🤖 AI is analyzing your response for conversational follow-up...
              </span>
            </div>
          )}

          {/* INPUT AREA WITH MIC SPEECH RECOGNITION */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            
            {/* MIC BUTTON & SPEECH STATUS HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#aaa", textAlign: "left" }}>
                Answer Input: (Type or Click Mic to Speak)
              </span>

              <button
                type="button"
                onClick={toggleMicListening}
                style={{
                  background: isListening ? "rgba(255, 77, 79, 0.2)" : "rgba(0, 230, 118, 0.15)",
                  border: "1px solid " + (isListening ? "#ff4d4f" : "#00e676"),
                  color: isListening ? "#ff7875" : "#00e676",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: isListening ? "0 0 12px rgba(255,77,79,0.5)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{isListening ? "🔴" : "🎙️"}</span>
                <span>{isListening ? "Listening... (Click to Pause)" : "Speak Your Answer (Mic)"}</span>
              </button>
            </div>

            {/* TEXTAREA (HYBRID: LIVE MIC WORDS + MANUAL TYPING) */}
            {!isFollowUpActive ? (
              <textarea
                placeholder="Type or speak your answer... (Structure your response clearly with real project context and trade-offs. You can edit any spoken words directly.)"
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
                  border: isListening ? "1.5px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.15)",
                  background: isListening ? "rgba(255, 77, 79, 0.04)" : "rgba(0, 0, 0, 0.4)",
                  color: "#fff",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            ) : (
              <textarea
                placeholder="Answer the follow-up question by typing or speaking (Explain your rationale, choices, or alternative considerations)..."
                rows="5"
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: isListening ? "1.5px solid #ff4d4f" : "1px solid rgba(255, 152, 0, 0.4)",
                  background: isListening ? "rgba(255, 77, 79, 0.04)" : "rgba(0, 0, 0, 0.5)",
                  color: "#fff",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            )}

            {isListening && (
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#ff7875", textAlign: "left", display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="loader-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff4d4f", display: "inline-block" }}></span>
                Microphone is actively transcribing words into your answer box in real-time.
              </div>
            )}
          </div>

          {/* BUTTON ACTIONS */}
          <div style={{ display: "flex", gap: "12px" }}>
            {!isFollowUpActive ? (
              <>
                <button
                  className="start-btn"
                  onClick={handleSubmit}
                  disabled={isAnalyzingResponse}
                  style={{ flex: 3, padding: "12px", fontSize: "16px" }}
                >
                  {isAnalyzingResponse
                    ? "Evaluating Response..."
                    : currentQuestion === totalQuestions - 1
                    ? "Finish Interview 🏁"
                    : "Submit Answer & Continue →"}
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
                  Submit Follow-Up & Next →
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

        {/* SIDEBAR: WEBCAM PROCTORING WIDGET */}
        <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <ProctorCamera
            onFocusPenalty={handleFocusPenalty}
            integrityScore={focusPoints}
          />

          {/* FOCUS STATS CARD */}
          <div
            style={{
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "12px",
              textAlign: "left",
              color: "#aaa"
            }}
          >
            <div style={{ color: "#fff", fontWeight: "bold", marginBottom: "6px" }}>
              Proctor Metrics
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Focus Score:</span>
              <b style={{ color: focusPoints >= 80 ? "#00e676" : "#ff5252" }}>{focusPoints}%</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Tab Switches:</span>
              <b style={{ color: tabSwitches > 0 ? "#ff5252" : "#00e676" }}>{tabSwitches}</b>
            </div>
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#777", lineHeight: "1.4" }}>
              • Allowed: ~25° head turn or looking down at keyboard.
              <br />• Violation: Looking far left/right/up (-2%).
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Interview;

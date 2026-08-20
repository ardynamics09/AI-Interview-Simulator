import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { questionBank } from "../data/questions";

function LoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const interviewData = location.state;
  const isResumeInterview =
    interviewData?.interviewType === "AI Mock Interview" ||
    interviewData?.interviewType === "Full Interview Simulation";

  const requestSent = useRef(false);
  const API_URL = "http://127.0.0.1:8000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiStatus, setAiStatus] = useState("CONNECTING");

  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const [particleArray] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
    }))
  );

  const quotes = [
    "Strategy: Structure your technical answers with STAR (Situation, Task, Action, Result).",
    "Confidence comes from preparation. Take a breath and think before you speak.",
    "Pro Tip: If you don't know an exact answer, explain your logical thought process.",
    "AI Engine is analyzing your projects to prepare adaptive follow-up questions.",
    "Practice today. Succeed tomorrow. Small improvements create massive career results.",
    "Interview Secret: Explain trade-offs between different technical approaches.",
    "Every expert was once a beginner. Believe in your preparation."
  ];

  const steps = isResumeInterview
    ? [
        "Verifying Profile & Resume",
        "Scanning Projects & Technical Stack",
        "Connecting AI Neural Engine",
        "Formulating Deep Architecture Questions",
        "Calibrating Adaptive Follow-Up Models",
        "Generating Personalized Question Rounds",
        "Optimizing Difficulty & Branch Level",
        "Preparing Live Simulation Environment",
        "Session Ready"
      ]
    : [
        "Verifying Profile Information",
        "Connecting AI Engine",
        "Analyzing Branch Fundamentals",
        "Loading Role Configuration",
        "Generating Structured Questions",
        "Optimizing Difficulty Level",
        "Preparing Interview Room",
        "Finalizing Session Parameters",
        "Session Ready"
      ];

  useEffect(() => {
    if (!interviewData) {
      navigate("/", {
        replace: true,
      });
    }
  }, [interviewData, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotate motivational tips every 3.2 seconds
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3200);

    return () => clearInterval(quoteTimer);
  }, [quotes.length]);

  // Step progression timed across ~11.5 seconds (each step takes ~1.3s)
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 1300);

    return () => clearInterval(stepTimer);
  }, [steps.length]);

  // Smooth, engaging progress bar animation paced to 12 seconds
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;

        let increment = 0;
        if (prev < 20) {
          increment = 1.8;
        } else if (prev < 50) {
          increment = 1.5;
        } else if (prev < 75) {
          increment = 1.2;
        } else if (prev < 90) {
          increment = 0.8;
        } else {
          increment = 0.3;
        }

        return Math.min(prev + increment, 94);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [loading]);

  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const estimatedTime = () => {
    if (progress >= 100) {
      return "Completed";
    }
    const remaining = Math.max(0, Math.ceil((100 - progress) / 7.5));
    return `${remaining}s remaining`;
  };

  // Highly personalized fallback generator
  const getFallbackQuestions = () => {
    const { branch, role, interviewType, skills = [], projects = [] } = interviewData || {};

    const s1 = skills[0] || "Python";
    const s2 = skills[1] || "React";
    const p1 = projects[0] || "AI Interview Simulator";
    const p2 = projects[1] || "Stock Prediction Model";

    if (interviewType === "AI Mock Interview") {
      const branchQ = branch === "MNC"
        ? [
            "What is the difference between correlation and causation in statistical modeling?",
            "Explain the time complexity of Binary Search and mathematically why it is O(log n)."
          ]
        : [
            `What are the core design principles and architectural patterns commonly used in ${branch}?`,
            "Explain the difference between process and thread with respect to memory sharing."
          ];

      const roleQ = role === "Software Engineer"
        ? "How would you design a scalable backend API for handling thousands of concurrent requests?"
        : (role.includes("Data") 
            ? "You receive a dataset containing missing values and duplicate records. How would you clean and validate it before analysis?"
            : `What are the most critical performance metrics and debugging strategies you use as a ${role}?`);

      return [
        "Tell me about yourself and briefly walk me through your technical background.",
        `You have mentioned ${s1} and ${s2} in your resume. Can you explain how you applied them in one of your practical projects?`,
        `You worked with ${s1}. Why did you choose this technology stack over alternative frameworks?`,
        `Can you explain the high-level architecture of your ${p1} and how the components communicate?`,
        `In your ${p2} project, what technical challenges or edge cases did you encounter, and how did you resolve them?`,
        branchQ[0],
        branchQ[1],
        roleQ,
        "Given an array of integers, how would you find the longest consecutive sequence in O(n) time? Explain your approach.",
        "Tell me about a time when something went wrong in one of your projects or a teammate disagreed with your approach. How did you handle it?"
      ];
    }

    if (interviewType === "Full Interview Simulation") {
      return [
        "Tell me about yourself and what led you to pursue engineering and your current field.",
        `Why are you interested in becoming a ${role} at this stage of your career?`,
        "What are your top two technical strengths and one specific area you are actively improving?",
        `Walk me through your ${p1} project and the core problem it was designed to solve.`,
        `Why did you select ${s1} and ${s2} as the foundation for your project architecture?`,
        `Explain a major technical bug or scaling challenge you faced while building ${p1} and how you fixed it.`,
        `In your ${p2} project, how did you evaluate performance and ensure reliability?`,
        "Explain the difference between method overloading and method overriding with an example.",
        "What is database normalization and why is 3NF commonly targeted in production systems?",
        "How do processes and threads differ in memory allocation and execution context?",
        "Explain the difference between Array and Linked List in terms of search, insertion, and cache locality.",
        "What is the difference between TCP and UDP, and when would you choose one over the other?",
        "Given an array of integers, describe an optimal O(n) algorithm to find the longest consecutive elements sequence.",
        "Your backend API suddenly begins throwing intermittent 500 Internal Server Errors under traffic. Walk me through your step-by-step debugging procedure.",
        "An application scales to 100,000 active users and response times degrade significantly. What system bottlenecks would you inspect first?",
        "Tell me about a time you faced a critical roadblock in a project right before a deadline. How did you resolve it?",
        "What would you do if a team member or senior engineer strongly disagreed with your technical architecture proposal?",
        "How do you balance writing clean, maintainable code versus shipping features rapidly when under pressure?",
        `How would you design a scalable, fault-tolerant backend system for a real-time ${role} platform?`,
        "If a key production metric drops unexpectedly by 20%, what framework would you use to diagnose the root cause and present a solution?"
      ];
    }

    if (interviewType === "HR Interview") {
      return [
        "Tell me about yourself and what motivates you.",
        "What are your greatest technical and non-technical strengths?",
        "Describe a situation where you had to work under pressure or meet a tight deadline.",
        "Where do you see yourself in your career 3 to 5 years from now?",
        "Why are you interested in this role and what makes you the ideal candidate?"
      ];
    }

    const branchData = questionBank[branch];
    const roleQuestions = branchData ? branchData[role] : null;
    if (roleQuestions && roleQuestions.length >= 5) {
      const shuffled = [...roleQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    }

    return [
      `Can you explain the core fundamentals and best practices in ${branch}?`,
      `What are the most important technical skills needed for a ${role}?`,
      `Describe a challenging problem you solved in one of your projects.`,
      `How do you approach debugging and optimizing performance in ${role}?`,
      `Why do you want to pursue a career as a ${role}?`
    ];
  };

  useEffect(() => {
    if (!interviewData) return;
    if (requestSent.current) return;
    requestSent.current = true;

    const startTime = Date.now();
    const MINIMUM_LOADING_MS = 12000; // 12 seconds engaging anticipation

    const generateQuestions = async () => {
      setLoading(true);
      setError("");
      setAiStatus("CONNECTING");

      let finalQuestions = [];

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(`${API_URL}/generate-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: interviewData.name,
            branch: interviewData.branch,
            year: interviewData.year,
            role: interviewData.role,
            interviewType: interviewData.interviewType,
            resumeText: interviewData.resumeText || "",
            skills: interviewData.skills || [],
            projects: interviewData.projects || []
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (
          data &&
          data.success &&
          Array.isArray(data.questions) &&
          data.questions.length > 0
        ) {
          finalQuestions = data.questions;
          setAiStatus("AI ENGINE ONLINE");
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        console.warn("Backend unavailable. Using intelligent fallback question generator.", err);
        finalQuestions = getFallbackQuestions();
        setAiStatus("KNOWLEDGE ENGINE READY");
      }

      // Calculate elapsed time to ensure user experiences 10-15s of tips & strategies
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, MINIMUM_LOADING_MS - elapsed);

      setTimeout(() => {
        setProgress(100);
        setStepIndex(steps.length - 1);

        setTimeout(() => {
          navigate("/interview", {
            replace: true,
            state: {
              name: interviewData.name,
              branch: interviewData.branch,
              year: interviewData.year,
              role: interviewData.role,
              interviewType: interviewData.interviewType,
              questions: finalQuestions,
              skills: interviewData.skills || [],
              projects: interviewData.projects || []
            },
          });
        }, 1200);
      }, remainingDelay);
    };

    generateQuestions();
  }, [interviewData, navigate, steps.length]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const retry = () => {
    requestSent.current = false;
    window.location.reload();
  };

  const goHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="loading-page">
      {/* Animated Background */}
      <div className="background-grid"></div>
      <div className="background-gradient one"></div>
      <div className="background-gradient two"></div>
      <div className="background-gradient three"></div>

      {/* Floating Particles */}
      <div className="particles">
        {particleArray.map((particle) => (
          <span
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="loading-card">
        <div className="badge">
          {isResumeInterview ? "Resume-Aware Adaptive Simulation" : "AI Powered Interview"}
        </div>

        <h1 className="title">AI Interview Simulator</h1>

        <p className="subtitle">
          {isResumeInterview
            ? "Analyzing your projects, skills & background to craft an adaptive interview..."
            : "Building your personalized interview experience..."}
        </p>

        <div className="orb-wrapper">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay"></div>
          <div className="pulse-ring delay-two"></div>

          <div className="ai-orb">
            <span className="orb-glow"></span>
            <span className="robot-icon">🤖</span>
          </div>
        </div>

        <div className="status-section">
          <h2 className="status-title">
            {progress >= 100
              ? "Interview Ready! Launching Session..."
              : "Preparing Your Personalized Simulation..."}
          </h2>

          <p className="status-description">
            {progress >= 100
              ? "Your questions and adaptive follow-up models are calibrated. Good luck!"
              : isResumeInterview
              ? `AI is tailoring questions for role '${interviewData?.role}' with project follow-up triggers.`
              : "Our AI is analyzing your profile and creating personalized questions based on your academic background."}
          </p>
        </div>

        <div className="progress-wrapper">
          <div className="progress-header">
            <span>Simulation Build Progress</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          <div className="progress-container">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>

          <div className="progress-footer">
            <span>{estimatedTime()}</span>
            <span>
              {progress >= 100 ? "Ready" : "Calibrating..."}
            </span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <span className="info-label">Elapsed Time</span>
            <h3 className="info-value">{formatTime()}</h3>
          </div>

          <div className="info-card">
            <span className="info-label">AI Engine Status</span>
            <h3
              className={`info-value ${
                aiStatus === "OFFLINE" ? "error" : "success"
              }`}
            >
              {aiStatus}
            </h3>
          </div>
        </div>

        {/* ROTATING STRATEGIES & MOTIVATIONAL TIPS */}
        <div className="quote-container" style={{ minHeight: "75px" }}>
          <div className="quote-icon">💡</div>
          <p className="quote-text">"{quotes[quoteIndex]}"</p>
        </div>

        <div className="steps-container">
          <div className="steps-header">
            <span>AI Calibration Steps</span>
            <span>
              {stepIndex + 1} / {steps.length}
            </span>
          </div>

          <div className="steps-list">
            {steps.map((step, index) => {
              const completed = index < stepIndex || progress >= 100;
              const active = index === stepIndex && progress < 100;

              return (
                <div
                  key={index}
                  className={`step-item
                    ${completed ? "completed" : ""}
                    ${active ? "active" : ""}`}
                >
                  <div className="step-left">
                    <div className="step-circle">
                      {completed ? (
                        "✓"
                      ) : active ? (
                        <span className="loader-dot"></span>
                      ) : (
                        index + 1
                      )}
                    </div>

                    <span className="step-name">{step}</span>
                  </div>

                  <div className="step-status">
                    {completed
                      ? "Done"
                      : active
                      ? "Running"
                      : "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="candidate-section">
          <div className="section-title">Candidate Profile</div>

          <div className="candidate-grid">
            <div className="candidate-card">
              <span className="candidate-label">Name</span>
              <span className="candidate-value">
                {interviewData?.name || "Candidate"}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">Branch</span>
              <span className="candidate-value">
                {interviewData?.branch}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">Academic Year</span>
              <span className="candidate-value">
                {interviewData?.year}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">Target Role</span>
              <span className="candidate-value">
                {interviewData?.role}
              </span>
            </div>
          </div>

          {interviewData?.projects && interviewData.projects.length > 0 && (
            <div style={{ marginTop: "12px", textAlign: "left", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
                Targeting Resume Projects:
              </span>
              <span style={{ fontSize: "13px", color: "#64b5f6", fontWeight: "600" }}>
                {interviewData.projects.join(" • ")}
              </span>
            </div>
          )}
        </div>

        <div className="interview-type-card">
          <span className="type-title">Interview Mode</span>
          <span className="type-badge">
            {interviewData?.interviewType}
          </span>
        </div>

        <div className="tips-section">
          <div className="tips-title">Quick AI Tips</div>

          <ul className="tips-list">
            <li>Answer confidently and walk the interviewer through your thought process.</li>
            <li>Reference real experiences and architectural decisions from your projects.</li>
            <li>Structure your technical answers clearly (Concept &rarr; Real Example &rarr; Trade-offs).</li>
            <li>Communication matters just as much as technical depth.</li>
          </ul>
        </div>

        {!loading && error && (
          <div className="error-box">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h3>AI Server Connection Issue</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="button-group">
            <button className="retry-btn" onClick={retry}>
              Retry Generation
            </button>
            <button className="home-btn" onClick={goHome}>
              Back To Home
            </button>
          </div>
        )}

        <div className="footer-section">
          <div className="footer-divider"></div>
          <p className="footer-text">
            Powered by AI • Developed by <span style={{ color: "#58a6ff", fontWeight: "bold" }}>Aniket Raj</span> • Real Interview Experience
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
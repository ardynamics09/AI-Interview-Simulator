import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


function LoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const interviewData = location.state;

  const requestSent = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    "Confidence comes from preparation.",
    "Every interview is a learning opportunity.",
    "Stay calm. Great things take time.",
    "AI is building your personalized interview.",
    "Practice today. Succeed tomorrow.",
    "Dream big. Work harder.",
    "Believe in yourself.",
    "Success loves preparation.",
    "Every expert was once a beginner.",
    "The best investment is in yourself.",
    "Your future starts today.",
    "Small improvements create big success.",
    "One interview can change your career.",
    "Knowledge builds confidence.",
    "Focus. Learn. Improve. Repeat."
  ];

  const steps = [
    "Verifying Profile",
    "Connecting AI Engine",
    "Analyzing Candidate Information",
    "Loading Interview Configuration",
    "Generating Personalized Questions",
    "Optimizing Difficulty Level",
    "Preparing AI Environment",
    "Finalizing Session",
    "Almost Ready"
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

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4500);

    return () => clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;

        let increment = 0;

        if (prev < 15) {
          increment = 2.5;
        } else if (prev < 30) {
          increment = 2;
        } else if (prev < 45) {
          increment = 1.5;
        } else if (prev < 60) {
          increment = 1;
        } else if (prev < 75) {
          increment = 0.7;
        } else if (prev < 90) {
          increment = 0.35;
        } else {
          increment = 0.15;
        }

        return Math.min(prev + increment, 95);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [loading]);

  const formatTime = () => {
    const mins = String(
      Math.floor(seconds / 60)
    ).padStart(2, "0");

    const secs = String(
      seconds % 60
    ).padStart(2, "0");

    return `${mins}:${secs}`;
  };

  const estimatedTime = () => {
    if (progress >= 100) {
      return "Completed";
    }

    const remaining = Math.max(
      0,
      Math.ceil((100 - progress) / 2.2)
    );

    return `${remaining}s remaining`;
  };
    useEffect(() => {
    if (!interviewData) return;

    if (requestSent.current) return;

    requestSent.current = true;

    const generateQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.post(
          "http://127.0.0.1:8000/generate-questions",
          {
            name: interviewData.name,
            branch: interviewData.branch,
            year: interviewData.year,
            role: interviewData.role,
            interviewType: interviewData.interviewType,
          }
        );

        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.questions)
        ) {
          setProgress(100);

          setStepIndex(steps.length - 1);

          setTimeout(() => {
            navigate("/interview", {
              replace: true,
              state: {
                interviewData,
                questions: response.data.questions,
              },
            });
          }, 1200);
        } else {
          throw new Error("Question generation failed.");
        }
      } catch (err) {
        console.error(err);

        setLoading(false);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to connect to AI Server."
        );

        requestSent.current = false;
      }
    };

    generateQuestions();
  }, [interviewData, navigate]);

  useEffect(() => {
    window.history.pushState(
      null,
      "",
      window.location.href
    );

    const handleBack = () => {
      window.history.pushState(
        null,
        "",
        window.location.href
      );
    };

    window.addEventListener(
      "popstate",
      handleBack
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handleBack
      );
  }, []);

  const retry = () => {
    requestSent.current = false;
    window.location.reload();
  };

  const goHome = () => {
    navigate("/", {
      replace: true,
    });
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
          AI Powered Interview
        </div>

        <h1 className="title">
          AI Interview Simulator
        </h1>

        <p className="subtitle">
          Building your personalized interview
          experience...
        </p>

        <div className="orb-wrapper">

          <div className="pulse-ring"></div>

          <div className="pulse-ring delay"></div>

          <div className="pulse-ring delay-two"></div>

          <div className="ai-orb">

            <span className="orb-glow"></span>

            <span className="robot-icon">
              🤖
            </span>

          </div>

        </div>
                <div className="status-section">

          <h2 className="status-title">
            {loading
              ? "Preparing Your Interview..."
              : "Generation Failed"}
          </h2>

          <p className="status-description">
            {loading
              ? "Our AI is analyzing your profile and creating personalized interview questions based on your role, branch and academic year."
              : "Something went wrong while connecting to the AI server."}
          </p>

        </div>

        <div className="progress-wrapper">

          <div className="progress-header">

            <span>Interview Progress</span>

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

            <span>
              {estimatedTime()}
            </span>

            <span>
              {loading
                ? "Generating..."
                : "Stopped"}
            </span>

          </div>

        </div>

        <div className="info-grid">

          <div className="info-card">

            <span className="info-label">
              Elapsed Time
            </span>

            <h3 className="info-value">
              {formatTime()}
            </h3>

          </div>

          <div className="info-card">

            <span className="info-label">
              AI Status
            </span>

            <h3 className="info-value success">
              {loading
                ? "ONLINE"
                : "OFFLINE"}
            </h3>

          </div>

        </div>

        <div className="quote-container">

          <div className="quote-icon">
            💡
          </div>

          <p className="quote-text">
            "{quotes[quoteIndex]}"
          </p>

        </div>

        <div className="steps-container">

          <div className="steps-header">

            <span>
              Processing Steps
            </span>

            <span>
              {stepIndex + 1} / {steps.length}
            </span>

          </div>

          <div className="steps-list">

            {steps.map((step, index) => {

              const completed =
                index < stepIndex;

              const active =
                index === stepIndex;

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

                    <span className="step-name">
                      {step}
                    </span>

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

          <div className="section-title">
            Candidate Profile
          </div>

          <div className="candidate-grid">

            <div className="candidate-card">
              <span className="candidate-label">
                Name
              </span>

              <span className="candidate-value">
                {interviewData?.name || "Candidate"}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">
                Branch
              </span>

              <span className="candidate-value">
                {interviewData?.branch}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">
                Academic Year
              </span>

              <span className="candidate-value">
                {interviewData?.year}
              </span>
            </div>

            <div className="candidate-card">
              <span className="candidate-label">
                Target Role
              </span>

              <span className="candidate-value">
                {interviewData?.role}
              </span>
            </div>

          </div>

        </div>

        <div className="interview-type-card">

          <span className="type-title">
            Interview Type
          </span>

          <span className="type-badge">
            {interviewData?.interviewType}
          </span>

        </div>

        <div className="tips-section">

          <div className="tips-title">
            Quick AI Tips
          </div>

          <ul className="tips-list">

            <li>
              Answer confidently and avoid rushing.
            </li>

            <li>
              Think for a few seconds before speaking.
            </li>

            <li>
              Support answers with real examples whenever possible.
            </li>

            <li>
              If you don't know something, explain your thought process.
            </li>

            <li>
              Communication matters as much as technical knowledge.
            </li>

          </ul>

        </div>

        {!loading && error && (

          <div className="error-box">

            <div className="error-icon">
              ⚠️
            </div>

            <div className="error-content">

              <h3>
                AI Server Connection Failed
              </h3>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}

        {!loading && (

          <div className="button-group">

            <button
              className="retry-btn"
              onClick={retry}
            >
              Retry Generation
            </button>

            <button
              className="home-btn"
              onClick={goHome}
            >
              Back To Home
            </button>

          </div>

        )}

        <div className="footer-section">

          <div className="footer-divider"></div>

          <p className="footer-text">

            Powered by AI • Personalized Questions •
            Real Interview Experience

          </p>

        </div>

      </div>
          </div>

  );
}

export default LoadingScreen;
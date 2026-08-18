import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    answers = [],
    name = "Candidate",
    branch = "CSE",
    year = "3rd Year",
    role = "Software Engineer",
    interviewType = "Technical Interview"
  } = location.state || {};

  const total = answers.length;
  const attempted = answers.filter((a) => a.answer !== "SKIPPED").length;
  const skipped = answers.filter((a) => a.answer === "SKIPPED").length;

  // Compute title dynamically based on interview type
  const getInterviewTitle = () => {
    if (interviewType === "HR Interview") return "🎉 HR Interview Completed";
    if (interviewType === "Technical Interview") return "🎉 Technical Interview Completed";
    if (interviewType === "AI Mock Interview") return "🎉 AI Mock Interview Completed";
    if (interviewType === "Full Interview Simulation") return "🎉 Full Interview Simulation Completed";
    return `🎉 ${interviewType} Completed`;
  };

  const fullInterviewRounds = [
    { round: 1, name: "HR / Introduction", count: 3, icon: "👋" },
    { round: 2, name: "Resume & Projects", count: 4, icon: "📄" },
    { round: 3, name: "Technical Fundamentals", count: 5, icon: "⚡" },
    { round: 4, name: "Problem Solving & Debugging", count: 3, icon: "🧠" },
    { round: 5, name: "Behavioral & Situational", count: 3, icon: "🤝" },
    { round: 6, name: "Final / Role-Specific", count: 2, icon: "🎯" }
  ];

  const aiMockCategories = [
    "Introduction & Warm-up (1 Q)",
    "Resume & Skills Verification (2 Qs)",
    "Project Architecture (2 Qs)",
    "Branch Fundamentals (2 Qs)",
    "Role-Specific Evaluation (1 Q)",
    "Problem Solving (1 Q)",
    "Behavioral & Situational (1 Q)"
  ];

  return (
    <div className="page" style={{ padding: "24px 12px" }}>
      <div className="card" style={{ maxWidth: "800px", width: "100%" }}>
        {/* HEADER */}
        <h1 style={{ fontSize: "26px", color: "#00e676", marginBottom: "8px" }}>
          {getInterviewTitle()}
        </h1>

        {/* CANDIDATE DETAILS */}
        <p style={{ opacity: 0.8, fontSize: "14px", margin: "4px 0" }}>
          <b>{name}</b> • {branch} ({year})
        </p>

        <p style={{ color: "#4fc3f7", fontWeight: "bold", margin: "4px 0", fontSize: "15px" }}>
          Target Role: {role}
        </p>

        <p style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>
          Mode: <span style={{ color: "#fff", fontWeight: "600" }}>{interviewType}</span>
        </p>

        {/* PERFORMANCE SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginTop: "20px",
            marginBottom: "20px"
          }}
        >
          <div style={{ background: "#1e1e1e", padding: "14px", borderRadius: "8px", border: "1px solid #333" }}>
            <span style={{ fontSize: "12px", color: "#888" }}>Total Questions</span>
            <h3 style={{ margin: "6px 0 0 0", fontSize: "22px", color: "#fff" }}>{total}</h3>
          </div>

          <div style={{ background: "#1e1e1e", padding: "14px", borderRadius: "8px", border: "1px solid #333" }}>
            <span style={{ fontSize: "12px", color: "#888" }}>Attempted</span>
            <h3 style={{ margin: "6px 0 0 0", fontSize: "22px", color: "#00e676" }}>{attempted}</h3>
          </div>

          <div style={{ background: "#1e1e1e", padding: "14px", borderRadius: "8px", border: "1px solid #333" }}>
            <span style={{ fontSize: "12px", color: "#888" }}>Skipped</span>
            <h3 style={{ margin: "6px 0 0 0", fontSize: "22px", color: "#ff9800" }}>{skipped}</h3>
          </div>
        </div>

        {/* FULL INTERVIEW ROUNDS BREAKDOWN */}
        {interviewType === "Full Interview Simulation" && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #30363d",
              background: "#161b22",
              textAlign: "left"
            }}
          >
            <h3 style={{ color: "#64b5f6", margin: "0 0 12px 0", fontSize: "16px" }}>
              🎯 Full Interview Rounds Completed:
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {fullInterviewRounds.map((r) => (
                <div
                  key={r.round}
                  style={{
                    background: "rgba(0, 230, 118, 0.08)",
                    border: "1px solid rgba(0, 230, 118, 0.3)",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#e0e0e0" }}>
                    {r.icon} <b>Round {r.round}:</b> {r.name}
                  </span>
                  <span style={{ color: "#00e676", fontSize: "12px", fontWeight: "bold" }}>
                    ✓ {r.count} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI MOCK INTERVIEW CATEGORIES BREAKDOWN */}
        {interviewType === "AI Mock Interview" && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #30363d",
              background: "#161b22",
              textAlign: "left"
            }}
          >
            <h3 style={{ color: "#64b5f6", margin: "0 0 10px 0", fontSize: "16px" }}>
              🤖 AI Mock Evaluation Coverage:
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {aiMockCategories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "rgba(100, 181, 246, 0.12)",
                    border: "1px solid rgba(100, 181, 246, 0.3)",
                    color: "#90caf9",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                >
                  ✓ {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI EVALUATION PREVIEW SECTION */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#1e1e1e",
            textAlign: "left"
          }}
        >
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#fff" }}>
            AI Performance & Detailed Scoring
          </h3>

          <p style={{ color: "#ff9800", margin: "4px 0", fontSize: "13px" }}>
            🚀 Phase 2 Adaptive AI Feedback coming next!
          </p>

          <p style={{ fontSize: "13px", color: "#aaa", margin: "8px 0" }}>
            Phase 2 will analyze your exact responses to evaluate:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginTop: "8px" }}>
            <span style={{ fontSize: "12px", color: "#ddd", background: "#252525", padding: "6px 10px", borderRadius: "4px" }}>
              • Technical Accuracy & Depth
            </span>
            <span style={{ fontSize: "12px", color: "#ddd", background: "#252525", padding: "6px 10px", borderRadius: "4px" }}>
              • System Design & Architecture
            </span>
            <span style={{ fontSize: "12px", color: "#ddd", background: "#252525", padding: "6px 10px", borderRadius: "4px" }}>
              • Communication & Clarity
            </span>
            <span style={{ fontSize: "12px", color: "#ddd", background: "#252525", padding: "6px 10px", borderRadius: "4px" }}>
              • Problem Solving Structure
            </span>
          </div>
        </div>

        {/* REVIEW ANSWERS */}
        <div style={{ marginTop: "25px", textAlign: "left" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
            Review Your Responses ({answers.length})
          </h2>

          {answers.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No answers recorded.</p>
          ) : (
            answers.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#1e1e1e",
                  padding: "14px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #333"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64b5f6" }}>
                    Q{index + 1}
                  </span>
                  {item.category && (
                    <span style={{ fontSize: "11px", color: "#aaa", background: "#2a2a2a", padding: "2px 8px", borderRadius: "4px" }}>
                      {item.category}
                    </span>
                  )}
                </div>

                <p style={{ margin: "4px 0 8px 0", fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                  {item.question}
                </p>

                <div style={{ background: "#141414", padding: "10px", borderRadius: "6px", border: "1px solid #2a2a2a" }}>
                  <span style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
                    Your Answer:
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: item.answer === "SKIPPED" ? "#ff9800" : "#00e676",
                      fontWeight: item.answer === "SKIPPED" ? "bold" : "normal",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {item.answer}
                  </span>
                </div>

                {/* ADAPTIVE FOLLOW-UP REVIEW */}
                {item.followUpQuestion && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "rgba(255, 152, 0, 0.06)",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 152, 0, 0.25)"
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#ffb74d", fontWeight: "bold", textTransform: "uppercase" }}>
                      ⚡ Adaptive Follow-Up Question:
                    </span>
                    <p style={{ margin: "3px 0 8px 0", fontSize: "13px", color: "#fff", fontWeight: "500" }}>
                      {item.followUpQuestion}
                    </p>
                    <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 10px", borderRadius: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "2px" }}>
                        Follow-Up Answer:
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: item.followUpAnswer === "SKIPPED" ? "#ff9800" : "#64b5f6",
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {item.followUpAnswer || "No answer recorded"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ marginTop: "24px" }}>
          <button
            className="start-btn"
            onClick={() => navigate("/")}
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          >
            Start Another Interview 🔄
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Result;
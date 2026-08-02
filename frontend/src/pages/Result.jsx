import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    answers = [],
    name,
    branch,
    year,
    role,
    interviewType
  } = location.state || {};

  const total = answers.length;

  const attempted = answers.filter(
    (a) => a.answer !== "SKIPPED"
  ).length;

  const skipped = answers.filter(
    (a) => a.answer === "SKIPPED"
  ).length;

  return (
    <div className="page">
      <div className="card">

        {/* HEADER */}

        <h1>🎉 Phase 1 Interview Completed</h1>

        {/* USER DETAILS */}

        <p style={{ opacity: 0.7 }}>
          {name} | {branch} | {year}
        </p>

        <p
          style={{
            color: "#00e676",
            fontWeight: "bold"
          }}
        >
          {role}
        </p>

        <p
          style={{
            color: "#4fc3f7",
            fontWeight: "bold"
          }}
        >
          {interviewType}
        </p>

        {/* PERFORMANCE SUMMARY */}

        <div style={{ marginTop: "20px" }}>
          <h2>Performance Summary</h2>

          <p>
            <b>Total Questions:</b> {total}
          </p>

          <p>
            <b>Attempted:</b> {attempted}
          </p>

          <p>
            <b>Skipped:</b> {skipped}
          </p>
        </div>

        {/* FUTURE AI SCORE SECTION */}

        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#1e1e1e"
          }}
        >
          <h2>AI Evaluation</h2>

          <p style={{ color: "#ff9800" }}>
            Coming Soon with Gemini AI Integration 🚀
          </p>

          <p>
            Future versions will evaluate:
          </p>

          <ul
            style={{
              textAlign: "left",
              marginTop: "10px"
            }}
          >
            <li>Technical Knowledge</li>
            <li>Communication Skills</li>
            <li>Confidence Score</li>
            <li>Answer Quality</li>
            <li>Overall Interview Score</li>
          </ul>
        </div>

        {/* REVIEW ANSWERS */}

        <div style={{ marginTop: "25px" }}>
          <h2>Review Your Answers</h2>

          {answers.length === 0 ? (
            <p style={{ opacity: 0.6 }}>
              No answers found.
            </p>
          ) : (
            answers.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#1e1e1e",
                  padding: "12px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #333"
                }}
              >
                <p>
                  <b>Q{index + 1}:</b>{" "}
                  {item.question}
                </p>

                <p>
                  <b>Answer:</b>{" "}
                  <span
                    style={{
                      color:
                        item.answer === "SKIPPED"
                          ? "#ff9800"
                          : "#00e676"
                    }}
                  >
                    {item.answer}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>

        {/* BUTTON */}

        <button
          style={{
            marginTop: "25px",
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#00c853",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold"
          }}
          onClick={() => navigate("/")}
        >
          Start New Interview
        </button>

      </div>
    </div>
  );
}

export default Result;
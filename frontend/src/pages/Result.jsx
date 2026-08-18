import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import RadarChart from "../components/RadarChart";
import { computeInterviewAnalytics } from "../utils/interviewAnalytics";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    answers = [],
    name = "Candidate",
    branch = "CSE",
    year = "3rd Year",
    role = "Software Engineer",
    interviewType = "AI Mock Interview",
    skills = [],
    projects = [],
    durationMinutes = 18
  } = location.state || {};

  // Compute rich deterministic and ML-extracted analytics
  const analytics = useMemo(() => {
    return computeInterviewAnalytics({
      answers,
      name,
      branch,
      year,
      role,
      interviewType,
      skills,
      projects,
      durationMinutes
    });
  }, [answers, name, branch, year, role, interviewType, skills, projects, durationMinutes]);

  // Accordion open/close state for Question-by-Question analysis
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0);

  const toggleAccordion = (index) => {
    setOpenQuestionIdx((prev) => (prev === index ? null : index));
  };

  // Performance Color Helper
  const getScoreColor = (score) => {
    if (score >= 85) return "#00e676";
    if (score >= 75) return "#2196f3";
    if (score >= 60) return "#ffb74d";
    return "#ff5252";
  };

  const scoreColor = getScoreColor(analytics.overallScore);

  return (
    <div className="page" style={{ padding: "30px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "880px", width: "100%" }}>
        
        {/* ========================================= */}
        {/* 1. HERO: OVERALL INTERVIEW PERFORMANCE    */}
        {/* ========================================= */}
        <div
          style={{
            background: "linear-gradient(145deg, #13171f, #0d1117)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "36px 24px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "260px",
              height: "140px",
              background: scoreColor,
              filter: "blur(90px)",
              opacity: 0.25,
              pointerEvents: "none"
            }}
          />

          <span
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              color: "#90caf9",
              fontWeight: "700"
            }}
          >
            INTERVIEW PERFORMANCE REPORT
          </span>

          <div style={{ margin: "20px 0 14px 0" }}>
            <div style={{ fontSize: "64px", fontWeight: "900", color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>
              {analytics.overallScore} <span style={{ fontSize: "28px", color: "#777", fontWeight: "500" }}>/ 100</span>
            </div>
            
            <div style={{ marginTop: "12px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: "30px",
                  background: `${scoreColor}18`,
                  color: scoreColor,
                  fontWeight: "800",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  border: `1px solid ${scoreColor}44`
                }}
              >
                {analytics.performanceBadge}
              </span>
            </div>
          </div>

          {/* Progress Bar in Hero */}
          <div style={{ maxWidth: "420px", margin: "0 auto 20px auto" }}>
            <div style={{ height: "10px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${analytics.overallScore}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, #2196f3, ${scoreColor})`,
                  borderRadius: "6px",
                  transition: "width 1s ease"
                }}
              />
            </div>
          </div>

          {/* Meta Information Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "16px",
              fontSize: "13px",
              color: "#aaa",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "18px"
            }}
          >
            <span>👤 <b>{name}</b></span>
            <span>•</span>
            <span>🎯 <b>{role}</b> ({branch})</span>
            <span>•</span>
            <span>⚡ <b>{interviewType}</b></span>
            <span>•</span>
            <span>⏱ <b>{analytics.durationMinutes} min</b></span>
            <span>•</span>
            <span>📝 <b>{analytics.answeredCount}/{analytics.totalQuestions} Answered</b></span>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. SKILL PERFORMANCE — RADAR CHART & SCORES */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "20px" }}>📊</span>
            <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
              Skill Competency Profile
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
            {/* SVG Radar Chart */}
            <div>
              <RadarChart skills={analytics.radarSkills} size={320} />
            </div>

            {/* Side-by-side Competency Score Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analytics.radarSkills.map((item, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ color: "#e0e0e0", fontWeight: "500" }}>{item.skill}</span>
                    <span style={{ color: getScoreColor(item.score), fontWeight: "700" }}>{item.score}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(0,0,0,0.4)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${item.score}%`,
                        height: "100%",
                        background: getScoreColor(item.score),
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 3. AI INTERVIEW ANALYSIS (Gemini Feedback) */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "20px" }}>🧠</span>
            <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
              AI Interview Analysis & Qualitative Feedback
            </h2>
          </div>

          <p style={{ fontSize: "14px", color: "#cfd8dc", lineHeight: "1.6", background: "rgba(33, 150, 243, 0.06)", padding: "14px 18px", borderRadius: "10px", borderLeft: "4px solid #2196f3", margin: "0 0 20px 0" }}>
            "{analytics.aiAnalysis.summary}"
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {/* Strengths */}
            <div style={{ background: "rgba(0, 230, 118, 0.05)", border: "1px solid rgba(0, 230, 118, 0.2)", borderRadius: "10px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#00e676", display: "block", marginBottom: "10px", textTransform: "uppercase" }}>
                ✓ Key Strengths Observed
              </span>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#ddd", fontSize: "13px", lineHeight: "1.6" }}>
                {analytics.aiAnalysis.strengths.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Growth */}
            <div style={{ background: "rgba(255, 152, 0, 0.05)", border: "1px solid rgba(255, 152, 0, 0.2)", borderRadius: "10px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ffb74d", display: "block", marginBottom: "10px", textTransform: "uppercase" }}>
                ⚠ Growth & Improvement Areas
              </span>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#ddd", fontSize: "13px", lineHeight: "1.6" }}>
                {analytics.aiAnalysis.weaknesses.map((wk, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{wk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 4. COMMUNICATION ANALYSIS                 */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🗣️</span>
              <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
                Communication & Response Structure
              </h2>
            </div>
            <span style={{ fontSize: "12px", color: "#888", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "12px" }}>
              Text NLP Metrics
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            {Object.entries(analytics.communicationAnalysis).map(([key, val]) => (
              <div key={key} style={{ background: "rgba(255,255,255,0.03)", padding: "14px 12px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  {key}
                </span>
                <span style={{ fontSize: "22px", fontWeight: "bold", color: getScoreColor(val) }}>
                  {val}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px 14px", borderRadius: "8px", fontSize: "12px", color: "#888" }}>
            💡 <b>Voice & Speech Analytics</b> (Speaking pace, pitch modulation, and filler word detection) will unlock in the upcoming voice interaction update.
          </div>
        </div>

        {/* ========================================= */}
        {/* 5. TECHNICAL PROFICIENCY & TOPICS TO REVISE */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "20px" }}>📚</span>
            <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
              Technical Proficiency & Domain Breakdown
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {analytics.technicalProficiency.map((tech, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                  <span style={{ color: "#ddd" }}>{tech.topic}</span>
                  <span style={{ color: getScoreColor(tech.score), fontWeight: "bold" }}>{tech.score}%</span>
                </div>
                <div style={{ height: "6px", background: "#222", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${tech.score}%`, height: "100%", background: getScoreColor(tech.score), borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Topics to Revise */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ffb74d", display: "block", marginBottom: "8px" }}>
              📖 Priority Topics to Revise Before Next Interview:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {analytics.topicsToRevise.map((top, idx) => (
                <div key={idx} style={{ fontSize: "13px", color: "#bbb" }}>
                  <span style={{ color: "#ff9800", marginRight: "6px" }}>•</span> {top}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 6. PROJECT & RESUME EVALUATION           */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "20px" }}>💻</span>
            <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
              Project & Resume Evaluation
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "18px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Resume Alignment</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00e676" }}>{analytics.projectEvaluation.resumeUnderstanding}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Skill Application</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#2196f3" }}>{analytics.projectEvaluation.skillProficiency}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Project Depth</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00e676" }}>{analytics.projectEvaluation.projectUnderstanding}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Technical Rigor</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ffb74d" }}>{analytics.projectEvaluation.technicalDepth}%</span>
            </div>
          </div>

          {/* Project-Wise Scores */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {analytics.projectEvaluation.projectScores.map((proj, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", color: "#fff" }}>{proj.name}</h4>
                  <span style={{ fontSize: "12px", color: "#888" }}>{proj.depth}</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#64b5f6" }}>
                  {proj.score} <span style={{ fontSize: "12px", color: "#777" }}>/ 10</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic", margin: 0 }}>
            "{analytics.projectEvaluation.feedback}"
          </p>
        </div>

        {/* ========================================= */}
        {/* 7. QUESTION-BY-QUESTION INTERACTIVE REVIEW */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>📈</span>
              <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
                Question-by-Question Detailed Review
              </h2>
            </div>
            <span style={{ fontSize: "12px", color: "#888" }}>
              Click any question to inspect evaluation & model answer
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {analytics.evaluatedQuestions.map((item, idx) => {
              const isOpen = openQuestionIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: isOpen ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
                    borderRadius: "10px",
                    border: isOpen ? "1px solid rgba(100, 181, 246, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                    overflow: "hidden",
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleAccordion(idx)}
                    style={{
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64b5f6",
                          background: "rgba(33, 150, 243, 0.15)",
                          padding: "3px 8px",
                          borderRadius: "4px"
                        }}
                      >
                        Q{item.questionNumber}
                      </span>
                      <span style={{ fontSize: "14px", color: "#fff", fontWeight: "600" }}>
                        {item.question.length > 75 ? item.question.slice(0, 75) + "..." : item.question}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: getScoreColor(item.score * 10) }}>
                        {item.scoreOutOfTen} <span style={{ fontSize: "11px", color: "#777" }}>/ 10</span>
                      </span>
                      <span style={{ color: "#888", fontSize: "14px" }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 18px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      {/* Full Question Text */}
                      <p style={{ fontSize: "14px", color: "#90caf9", margin: "14px 0 10px 0", fontWeight: "500" }}>
                        {item.question}
                      </p>

                      {/* Candidate Answer */}
                      <div style={{ background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
                          Your Answer:
                        </span>
                        <p style={{ margin: 0, fontSize: "13px", color: item.answer === "SKIPPED" ? "#ff9800" : "#00e676", whiteSpace: "pre-wrap" }}>
                          {item.answer}
                        </p>
                      </div>

                      {/* Follow-up Question and Answer if present */}
                      {item.followUpQuestion && (
                        <div style={{ background: "rgba(255, 152, 0, 0.06)", padding: "12px", borderRadius: "6px", marginBottom: "10px", border: "1px solid rgba(255, 152, 0, 0.2)" }}>
                          <span style={{ fontSize: "11px", color: "#ffb74d", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                            ⚡ Adaptive Follow-Up Question:
                          </span>
                          <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#fff" }}>
                            {item.followUpQuestion}
                          </p>
                          <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "2px" }}>
                            Your Follow-Up Response:
                          </span>
                          <p style={{ margin: 0, fontSize: "13px", color: "#64b5f6" }}>
                            {item.followUpAnswer || "No answer recorded"}
                          </p>
                        </div>
                      )}

                      {/* Score Rationale */}
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#aaa", fontWeight: "bold", display: "block", marginBottom: "2px" }}>
                          💡 Why this score?
                        </span>
                        <p style={{ margin: 0, fontSize: "13px", color: "#ccc" }}>
                          {item.whyScore}
                        </p>
                      </div>

                      {/* Suggested Model Answer */}
                      <div style={{ background: "rgba(0, 230, 118, 0.04)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(0, 230, 118, 0.15)" }}>
                        <span style={{ fontSize: "11px", color: "#00e676", fontWeight: "bold", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
                          ✨ Recommended Model Answer:
                        </span>
                        <p style={{ margin: 0, fontSize: "13px", color: "#e0e0e0", lineHeight: "1.5" }}>
                          {item.suggestedAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================= */}
        {/* 8. ML INTERVIEW READINESS PIPELINE       */}
        {/* ========================================= */}
        <div
          style={{
            background: "#13171f",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "26px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
                ML Interview Readiness Classification
              </h2>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#00e676",
                background: "rgba(0, 230, 118, 0.1)",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(0, 230, 118, 0.3)"
              }}
            >
              {analytics.mlReadiness.status}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Readiness Score</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: getScoreColor(analytics.mlReadiness.score) }}>
                {analytics.mlReadiness.score}%
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Avg Words/Ans</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#64b5f6" }}>
                {analytics.mlReadiness.features.avgWordsPerAnswer}
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Tech Keywords</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00e676" }}>
                {analytics.mlReadiness.features.totalTechnicalTerms}
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Structure Index</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ffb74d" }}>
                {analytics.mlReadiness.features.structureCompliance}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 9. AI CAREER ACTION PLAN & RECOMMENDATIONS */}
        {/* ========================================= */}
        <div
          style={{
            background: "linear-gradient(145deg, #161c26, #10141c)",
            borderRadius: "14px",
            border: "1px solid rgba(100, 181, 246, 0.25)",
            padding: "28px 22px",
            marginBottom: "28px",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "22px" }}>🎯</span>
            <h2 style={{ fontSize: "20px", margin: 0, color: "#fff", fontWeight: "700" }}>
              Your Personalized AI Action Plan
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {/* Priority 1 */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #ff5252" }}>
              <span style={{ fontSize: "11px", color: "#ff5252", fontWeight: "bold", textTransform: "uppercase" }}>
                {analytics.actionPlan.priority1.priority}
              </span>
              <h4 style={{ margin: "4px 0 6px 0", color: "#fff", fontSize: "15px" }}>
                {analytics.actionPlan.priority1.topic}
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: "1.4" }}>
                {analytics.actionPlan.priority1.action}
              </p>
            </div>

            {/* Priority 2 */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #ffb74d" }}>
              <span style={{ fontSize: "11px", color: "#ffb74d", fontWeight: "bold", textTransform: "uppercase" }}>
                {analytics.actionPlan.priority2.priority}
              </span>
              <h4 style={{ margin: "4px 0 6px 0", color: "#fff", fontSize: "15px" }}>
                {analytics.actionPlan.priority2.topic}
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: "1.4" }}>
                {analytics.actionPlan.priority2.action}
              </p>
            </div>

            {/* Priority 3 */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #2196f3" }}>
              <span style={{ fontSize: "11px", color: "#64b5f6", fontWeight: "bold", textTransform: "uppercase" }}>
                {analytics.actionPlan.priority3.priority}
              </span>
              <h4 style={{ margin: "4px 0 6px 0", color: "#fff", fontSize: "15px" }}>
                {analytics.actionPlan.priority3.topic}
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#aaa", lineHeight: "1.4" }}>
                {analytics.actionPlan.priority3.action}
              </p>
            </div>
          </div>

          <div style={{ background: "rgba(33, 150, 243, 0.1)", padding: "14px 18px", borderRadius: "8px", border: "1px solid rgba(33, 150, 243, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "#90caf9", display: "block" }}>Recommended Next Step</span>
              <strong style={{ fontSize: "14px", color: "#fff" }}>{analytics.actionPlan.recommendedNextInterview}</strong>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              Start Next Session 🚀
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "30px" }}>
          <button
            className="start-btn"
            onClick={() => navigate("/")}
            style={{ flex: 1, padding: "14px", fontSize: "16px" }}
          >
            Start Another Simulation 🔄
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Result;
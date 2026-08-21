import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import RadarChart from "../components/RadarChart";
import { computeInterviewAnalytics } from "../utils/interviewAnalytics";
import { saveTestResult, getActiveUser } from "../utils/profileStorage";
import { useEffect, useRef } from "react";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    userId = "",
    answers = [],
    dsaSubmissions = [],
    name = "Candidate",
    branch = "CSE",
    year = "3rd Year",
    role = "Software Engineer",
    interviewType = "HR Interview",
    skills = [],
    projects = [],
    durationMinutes = 18,
    integrityScore = 100,
    tabSwitches = 0
  } = location.state || {};

  // Compute rich deterministic and ML-extracted analytics
  const analytics = useMemo(() => {
    return computeInterviewAnalytics({
      answers,
      dsaSubmissions,
      name,
      branch,
      year,
      role,
      interviewType,
      skills,
      projects,
      durationMinutes,
      integrityScore,
      tabSwitches
    });
  }, [answers, dsaSubmissions, name, branch, year, role, interviewType, skills, projects, durationMinutes, integrityScore, tabSwitches]);

  
  const hasSavedRef = useRef(false);
  const effectiveUserId = userId || getActiveUser() || ((name.toLowerCase().replace(/[^a-z0-9]/g, "") || "candidate") + "_" + (branch.toLowerCase() || "cse"));

  useEffect(() => {
    if (!hasSavedRef.current && analytics && analytics.overallScore !== undefined) {
      hasSavedRef.current = true;
      saveTestResult(effectiveUserId, {
        ...analytics,
        name,
        branch,
        year,
        role,
        interviewType,
        durationMinutes,
        integrityScore,
        tabSwitches
      });
    }
  }, [analytics, effectiveUserId, name, branch, year, role, interviewType, durationMinutes, integrityScore, tabSwitches]);

  // Accordion open/close state for Question-by-Question analysis
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0);

  const toggleAccordion = (index) => {
    setOpenQuestionIdx((prev) => (prev === index ? null : index));
  };

  // Performance Color Helper
  const getScoreColor = (score) => {
    if (score >= 85) return "#00e676";
    if (score >= 75) return "#2196f3";
    if (score >= 55) return "#ffb74d";
    return "#ff5252";
  };

  const scoreColor = getScoreColor(analytics.overallScore);

  const handleDownloadPdf = () => {
    window.print();
  };

  const isRoboticsRound = interviewType.toLowerCase().includes("robotics");
  const isVerilogRound = interviewType.toLowerCase().includes("verilog") || interviewType.toLowerCase().includes("rtl");
  const isCodingRound = analytics.isDsaRound || isRoboticsRound || isVerilogRound;

  const reportCategoryTitle = isRoboticsRound
    ? "ROBOTICS SIMULATION & CONTROL REPORT"
    : (isVerilogRound ? "VERILOG RTL HARDWARE PERFORMANCE REPORT" : (isCodingRound ? "DSA CODING ASSESSMENT REPORT" : "INTERVIEW PERFORMANCE REPORT"));

  const breakdownSectionTitle = isRoboticsRound
    ? "Robotics Simulation & Control Logic Breakdown"
    : (isVerilogRound ? "Verilog RTL Synthesis & Verification Breakdown" : "DSA Execution & Code Quality Breakdown");

  const breakdownIcon = isRoboticsRound ? "🤖" : (isVerilogRound ? "⚡" : "💻");

  const radarTitle = isRoboticsRound
    ? "Robotics Control & Logic Competency Radar"
    : (isVerilogRound ? "Verilog Hardware & RTL Competency Radar" : (isCodingRound ? "DSA Problem-Solving Competency Radar" : "Skill Competency Profile"));

  return (
    <div className="page" style={{ padding: "30px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "880px", width: "100%" }}>
        
        {/* TOP ACTION BAR WITH PDF DOWNLOAD BUTTON */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              color: "#aaa",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            ← Back to Home
          </button>

          <button
            onClick={() => navigate("/dashboard", { state: { userId: effectiveUserId } })}
            style={{
              background: "rgba(33, 150, 243, 0.2)",
              color: "#64b5f6",
              border: "1px solid #2196f3",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>📊</span> Performance Dashboard
          </button>

          <button
            onClick={handleDownloadPdf}
            style={{
              background: "linear-gradient(90deg, #2196f3, #00e676)",
              color: "#000",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(0, 230, 118, 0.25)"
            }}
          >
            <span>⬇️</span> Download Result (PDF)
          </button>
        </div>

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
            {reportCategoryTitle}
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
                  width: `${Math.max(3, analytics.overallScore)}%`,
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
            <span>📝 <b>{analytics.answeredCount}/{analytics.totalQuestions} Completed</b></span>
            <span>•</span>
            <span style={{ color: analytics.integrityScore >= 80 ? "#00e676" : "#ff5252", fontWeight: "600" }}>
              🛡️ Integrity: <b>{analytics.integrityScore}%</b> {analytics.tabSwitches > 0 && `(${analytics.tabSwitches} switches)`}
            </span>
          </div>
        </div>


        {/* ========================================= */}
        {/* INTERVIEW READINESS & DIAGNOSTIC VERDICT */}
        {/* ========================================= */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(22, 27, 34, 0.95), rgba(14, 18, 26, 0.98))",
            borderRadius: "16px",
            border: `1px solid ${analytics.interviewReadiness?.badgeColor || scoreColor}55`,
            padding: "24px 22px",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            textAlign: "left",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🎯</span>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                Interview Readiness Assessment
              </h2>
            </div>
            
            <div
              style={{
                background: `${analytics.interviewReadiness?.badgeColor || scoreColor}18`,
                border: `1px solid ${analytics.interviewReadiness?.badgeColor || scoreColor}`,
                color: analytics.interviewReadiness?.badgeColor || scoreColor,
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: `0 2px 10px ${analytics.interviewReadiness?.badgeColor || scoreColor}22`
              }}
            >
              {analytics.interviewReadiness?.headline || `You are ${analytics.overallScore}% ready for the interview`}
            </div>
          </div>

          {/* Readiness Percentage Bar */}
          <div style={{ margin: "14px 0 16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: "6px" }}>
              <span>Readiness Gauge</span>
              <span style={{ fontWeight: "bold", color: analytics.interviewReadiness?.badgeColor || scoreColor }}>
                {analytics.interviewReadiness?.readinessPercentage || analytics.overallScore}%
              </span>
            </div>
            <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max(5, analytics.interviewReadiness?.readinessPercentage || analytics.overallScore)}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, #2196f3, ${analytics.interviewReadiness?.badgeColor || scoreColor})`,
                  borderRadius: "4px"
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px 18px"
            }}
          >
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#e0e0e0", lineHeight: "1.6" }}>
              💬 <b>Diagnostic Feedback:</b> {analytics.interviewReadiness?.diagnosticReason || (analytics.overallScore === 0 ? "No meaningful responses were submitted. Type or speak structured answers to evaluate your readiness." : "Answers lacked technical depth or structured examples. Review core fundamentals.")}
            </p>

            {(analytics.interviewReadiness?.actionRecommendation || "Prepare more to increase your chance.") && (
              <p style={{ margin: 0, fontSize: "13px", color: "#64b5f6", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🚀</span> <span><b>Recommendation:</b> {analytics.interviewReadiness?.actionRecommendation || "Practice mock sessions and revise core topics to increase your selection chance."}</span>
              </p>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* DSA / VERILOG / ROBOTICS SUMMARY METRICS */}
        {/* ========================================= */}
        {analytics.isDsaRound && analytics.dsaSummary && (
          <div
            style={{
              background: "#13171f",
              borderRadius: "14px",
              border: "1px solid rgba(0, 230, 118, 0.25)",
              padding: "24px 20px",
              marginBottom: "24px",
              textAlign: "left"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>{breakdownIcon}</span>
              <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
                {breakdownSectionTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Solved</span>
                <span style={{ fontSize: "19px", fontWeight: "bold", color: "#00e676" }}>{analytics.dsaSummary.questionsSolved}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Test Cases</span>
                <span style={{ fontSize: "19px", fontWeight: "bold", color: "#2196f3" }}>{analytics.dsaSummary.testCasesPassed}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Logic Accuracy</span>
                <span style={{ fontSize: "19px", fontWeight: "bold", color: getScoreColor(analytics.dsaSummary.logicAccuracy) }}>
                  {analytics.dsaSummary.logicAccuracy}%
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Syntax Accuracy</span>
                <span style={{ fontSize: "19px", fontWeight: "bold", color: getScoreColor(analytics.dsaSummary.syntaxAccuracy) }}>
                  {analytics.dsaSummary.syntaxAccuracy}%
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Time Efficiency</span>
                <span style={{ fontSize: "19px", fontWeight: "bold", color: "#ffb74d" }}>{analytics.dsaSummary.timeEfficiency}%</span>
              </div>
            </div>
          </div>
        )}

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
              {radarTitle}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
            <div>
              <RadarChart skills={analytics.radarSkills} size={320} />
            </div>

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
        {/* 3. AI INTERVIEW / CODING ANALYSIS         */}
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
              {analytics.isDsaRound ? "AI Code Review & Algorithmic Feedback" : "AI Interview Analysis & Qualitative Feedback"}
            </h2>
          </div>

          <p style={{ fontSize: "14px", color: "#cfd8dc", lineHeight: "1.6", background: "rgba(33, 150, 243, 0.06)", padding: "14px 18px", borderRadius: "10px", borderLeft: "4px solid #2196f3", margin: "0 0 20px 0" }}>
            "{analytics.aiAnalysis.summary}"
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
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
        {/* 4. TECHNICAL DOMAIN BREAKDOWN (If present) */}
        {/* ========================================= */}
        {analytics.technicalProficiency && analytics.technicalProficiency.length > 0 && (
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
              <span style={{ fontSize: "20px" }}>{analytics.isVerilogRound ? "⚡" : (analytics.isRoboticsRound ? "🤖" : "📚")}</span>
              <h2 style={{ fontSize: "19px", margin: 0, color: "#fff", fontWeight: "700" }}>
                {analytics.isVerilogRound
                  ? "RTL Architecture & Digital Hardware Proficiency"
                  : (analytics.isRoboticsRound
                    ? "Robotics Systems & Control Proficiency"
                    : (analytics.isDsaRound ? "Algorithmic Pattern Proficiency" : "Technical Proficiency & Domain Breakdown"))}
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

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ffb74d", display: "block", marginBottom: "8px" }}>
                📖 Priority Topics to Revise:
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
        )}

        {/* ========================================= */}
        {/* 5. PROJECT & RESUME EVALUATION (If valid) */}
        {/* ========================================= */}
        {analytics.projectEvaluation && (
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
        )}

        {/* ========================================= */}
        {/* 6. QUESTION-BY-QUESTION / PROBLEM REVIEW  */}
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
                {analytics.isDsaRound ? "Problem-by-Problem Code Analysis" : "Question-by-Question Detailed Review"}
              </h2>
            </div>
            <span style={{ fontSize: "12px", color: "#888" }}>
              Click to inspect evaluation, test cases & model solution
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
                  {/* Header */}
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
                        {analytics.isDsaRound ? `Problem ${item.questionNumber}` : `Q${item.questionNumber}`}
                      </span>
                      <span style={{ fontSize: "14px", color: "#fff", fontWeight: "600" }}>
                        {item.title || (item.question.length > 75 ? item.question.slice(0, 75) + "..." : item.question)}
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

                  {/* Body */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 18px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      
                      {/* DSA Specific Badges */}
                      {item.dsaDetails && (
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "12px 0 10px 0" }}>
                          <span style={{ fontSize: "12px", background: "rgba(0,230,118,0.15)", color: "#00e676", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                            🟢 Logic: {item.dsaDetails.logicScore}%
                          </span>
                          <span style={{ fontSize: "12px", background: item.dsaDetails.hasSyntaxError ? "rgba(255,183,77,0.15)" : "rgba(33,150,243,0.15)", color: item.dsaDetails.hasSyntaxError ? "#ffb74d" : "#64b5f6", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                            {item.dsaDetails.hasSyntaxError ? "🟡 Syntax Note: " : "🔵 Syntax: "} {item.dsaDetails.syntaxScore}%
                          </span>
                          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", color: "#aaa", padding: "3px 8px", borderRadius: "4px" }}>
                            ⏱ Time: {item.dsaDetails.timeSpent}
                          </span>
                          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", color: "#aaa", padding: "3px 8px", borderRadius: "4px" }}>
                            Complexity: {item.dsaDetails.complexity}
                          </span>
                        </div>
                      )}

                      {/* Candidate Code or Answer */}
                      <div style={{ background: "#0d1117", padding: "12px", borderRadius: "6px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                          {analytics.isDsaRound ? `Submitted ${item.dsaDetails?.language.toUpperCase()} Solution:` : "Your Answer:"}
                        </span>
                        <pre style={{ margin: 0, fontSize: "13px", color: item.answer === "SKIPPED" ? "#ff9800" : "#00e676", whiteSpace: "pre-wrap", fontFamily: "Consolas, Monaco, monospace" }}>
                          {item.answer}
                        </pre>
                      </div>

                      {/* Evaluation Feedback */}
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#aaa", fontWeight: "bold", display: "block", marginBottom: "2px" }}>
                          💡 AI Evaluation & Rationale:
                        </span>
                        <p style={{ margin: 0, fontSize: "13px", color: "#ccc", lineHeight: "1.5" }}>
                          {item.whyScore}
                        </p>
                      </div>

                      {/* Model Answer / Solution Note */}
                      <div style={{ background: "rgba(0, 230, 118, 0.04)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(0, 230, 118, 0.15)" }}>
                        <span style={{ fontSize: "11px", color: "#00e676", fontWeight: "bold", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
                          ✨ Recommended Optimal Strategy:
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
        {/* 7. ACTION PLAN & RECOMMENDATIONS          */}
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
              Your Personalized Action Plan
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "20px" }}>
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
              <span style={{ fontSize: "12px", color: "#90caf9", display: "block" }}>Recommended Next Session</span>
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

        {/* BOTTOM INSPIRATIONAL MESSAGE & ACTION BUTTONS */}
        <div style={{ margin: "24px 0 30px 0", textAlign: "center" }}>
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(0, 230, 118, 0.08)",
              border: "1px solid rgba(0, 230, 118, 0.25)",
              borderRadius: "12px",
              marginBottom: "20px"
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#00e676", fontSize: "17px", fontWeight: "700" }}>
              🚀 Best of luck for your future interviews! ✨
            </h3>
            <p style={{ margin: 0, color: "#bbb", fontSize: "13px" }}>
              Consistent preparation, structured communication, and continuous learning turn ambitions into job offers.
            </p>
          </div>

          <div className="no-print" style={{ display: "flex", gap: "14px" }}>
            <button
              onClick={() => navigate("/dashboard", { state: { userId: effectiveUserId } })}
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #2196f3, #00e676)",
                color: "#000",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              📊 View Dashboard & Test Comparisons
            </button>

            <button
              className="start-btn"
              onClick={() => navigate("/")}
              style={{ flex: 1, padding: "14px", fontSize: "15px" }}
            >
              Start Another Simulation 🔄
            </button>

            <button
              onClick={handleDownloadPdf}
              style={{
                flex: 1,
                background: "#21262d",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              ⬇️ Save Result (PDF)
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Result;
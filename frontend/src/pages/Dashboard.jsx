import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import RadarChart from "../components/RadarChart";
import {
  getAllProfiles,
  getProfile,
  getActiveUser,
  setActiveUser,
  saveProfile,
  getUserHistory,
  deleteTest,
  clearUserHistory,
  computeAggregatedStats,
  compareTwoTests,
  MAX_HISTORY_LIMIT
} from "../utils/profileStorage";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active User ID resolution
  const initialUserId = location.state?.userId || getActiveUser() || "";
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [allProfilesMap, setAllProfilesMap] = useState({});

  // History & Aggregates State
  const [history, setHistory] = useState([]);
  const [inspectedTest, setInspectedTest] = useState(null);

  // Comparison State
  const [compareIdA, setCompareIdA] = useState("");
  const [compareIdB, setCompareIdB] = useState("");

  // Confirmation Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load profiles and user history
  useEffect(() => {
    const profiles = getAllProfiles();
    setAllProfilesMap(profiles);

    const profileKeys = Object.keys(profiles);
    let effectiveId = selectedUserId;

    if (!effectiveId && profileKeys.length > 0) {
      effectiveId = profileKeys[0];
      setSelectedUserId(effectiveId);
      setActiveUser(effectiveId);
    }

    if (effectiveId) {
      const userTests = getUserHistory(effectiveId);
      setHistory(userTests);

      if (userTests.length >= 2) {
        setCompareIdA(userTests[0].id);
        setCompareIdB(userTests[userTests.length - 1].id);
      } else if (userTests.length === 1) {
        setCompareIdA(userTests[0].id);
        setCompareIdB(userTests[0].id);
      }
    }
  }, [selectedUserId]);

  const activeProfile = useMemo(() => {
    return getProfile(selectedUserId) || {
      userId: selectedUserId || "candidate",
      name: "Candidate",
      branch: "CSE",
      year: "3rd Year",
      role: "Software Engineer"
    };
  }, [selectedUserId, allProfilesMap]);

  const aggregatedStats = useMemo(() => {
    return computeAggregatedStats(history);
  }, [history]);

  // Comparison calculation
  const comparisonResult = useMemo(() => {
    if (!compareIdA || !compareIdB || history.length === 0) return null;
    const testA = history.find((t) => t.id === compareIdA);
    const testB = history.find((t) => t.id === compareIdB);
    return compareTwoTests(testA, testB);
  }, [compareIdA, compareIdB, history]);

  // Handle switching active profile
  const handleProfileSwitch = (newUserId) => {
    setSelectedUserId(newUserId);
    setActiveUser(newUserId);
    const userTests = getUserHistory(newUserId);
    setHistory(userTests);
    if (userTests.length >= 2) {
      setCompareIdA(userTests[0].id);
      setCompareIdB(userTests[userTests.length - 1].id);
    }
  };

  // Handle individual test deletion
  const handleDeleteTest = (testId) => {
    if (window.confirm("Are you sure you want to delete this test record?")) {
      deleteTest(selectedUserId, testId);
      const updated = getUserHistory(selectedUserId);
      setHistory(updated);
      setAllProfilesMap(getAllProfiles());
    }
  };

  // Handle clear entire history
  const handleClearHistory = () => {
    clearUserHistory(selectedUserId);
    setHistory([]);
    setAllProfilesMap(getAllProfiles());
    setShowClearConfirm(false);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#00e676";
    if (score >= 70) return "#2196f3";
    if (score >= 50) return "#ffb74d";
    return "#ff5252";
  };

  return (
    <div className="page" style={{ padding: "24px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "1040px", width: "100%" }}>
        
        {/* TOP BAR: NAVIGATION & PROFILE PICKER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              color: "#aaa",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>←</span> Back to Simulator Home
          </button>

          {/* ACTIVE PROFILE SELECTOR */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>Active Profile:</span>
            <select
              value={selectedUserId}
              onChange={(e) => handleProfileSwitch(e.target.value)}
              style={{
                background: "#161b22",
                color: "#fff",
                border: "1px solid rgba(33, 150, 243, 0.4)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {Object.keys(allProfilesMap).map((uId) => (
                <option key={uId} value={uId}>
                  @{uId} ({allProfilesMap[uId]?.name || "Candidate"})
                </option>
              ))}
              {selectedUserId && !allProfilesMap[selectedUserId] && (
                <option value={selectedUserId}>@{selectedUserId}</option>
              )}
            </select>

            <button
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(90deg, #2196f3, #00e676)",
                color: "#000",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              + Start New Test
            </button>
          </div>
        </div>

        {/* 1. CANDIDATE PROFILE HEADER BANNER */}
        <div
          style={{
            background: "linear-gradient(135deg, #13171f, #0d1117)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "24px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2196f3, #00e676)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                color: "#000",
                fontWeight: "bold",
                boxShadow: "0 4px 16px rgba(0,230,118,0.3)"
              }}
            >
              {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : "C"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", margin: 0, color: "#fff", fontWeight: "700" }}>
                  {activeProfile.name}
                </h1>
                <span
                  style={{
                    background: "rgba(33, 150, 243, 0.15)",
                    border: "1px solid rgba(33, 150, 243, 0.3)",
                    color: "#64b5f6",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  @{activeProfile.userId}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#aaa", fontSize: "13px" }}>
                {activeProfile.branch} • {activeProfile.year} • <span style={{ color: "#00e676", fontWeight: "600" }}>{activeProfile.role}</span>
              </p>
            </div>
          </div>

          {/* QUICK METRICS PILLS */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Tests Taken</span>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
                {history.length} <span style={{ fontSize: "12px", color: "#666" }}>/ {MAX_HISTORY_LIMIT} Max</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Average Score</span>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: getScoreColor(aggregatedStats.averageScore) }}>
                {aggregatedStats.averageScore}%
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>Growth Trajectory</span>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: aggregatedStats.scoreImprovement >= 0 ? "#00e676" : "#ff5252" }}>
                {aggregatedStats.scoreImprovement >= 0 ? "+" : ""}{aggregatedStats.scoreImprovement}%
              </div>
            </div>
          </div>
        </div>

        {/* 2. NO HISTORY ZERO STATE */}
        {history.length === 0 ? (
          <div
            style={{
              background: "#161b22",
              borderRadius: "14px",
              border: "1px dashed rgba(255,255,255,0.15)",
              padding: "50px 20px",
              textAlign: "center",
              marginBottom: "24px"
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
            <h2 style={{ color: "#fff", fontSize: "20px", margin: "0 0 8px 0" }}>No Test Records Found</h2>
            <p style={{ color: "#888", fontSize: "14px", maxWidth: "460px", margin: "0 auto 20px auto" }}>
              You haven't completed any interview assessments yet under handle <b>@{selectedUserId}</b>. Complete a simulation to unlock score analytics, weakness tracking, and test comparisons.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(90deg, #2196f3, #00e676)",
                color: "#000",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Start Your First Interview Simulation 🚀
            </button>
          </div>
        ) : (
          <>
            {/* 3. SCORE PROGRESSION EVOLUTION CHART */}
            <div
              style={{
                background: "#13171f",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "22px",
                marginBottom: "24px",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "17px", color: "#fff", margin: 0, fontWeight: "700" }}>
                    📈 Score Progression Timeline ({history.length} Tests)
                  </h2>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Chronological performance progression from Test 1 to latest session
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#00e676", fontWeight: "bold" }}>
                    Highest: {aggregatedStats.highestScore}%
                  </span>
                  <span style={{ fontSize: "12px", color: "#ffb74d" }}>
                    Lowest: {aggregatedStats.lowestScore}%
                  </span>
                </div>
              </div>

              {/* PROGRESSION BARS VISUALIZER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  height: "160px",
                  padding: "12px 10px 24px 10px",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  overflowX: "auto"
                }}
              >
                {history.map((test, idx) => {
                  const score = test.overallScore || 0;
                  const barColor = getScoreColor(score);
                  const isRecent = idx === history.length - 1;

                  return (
                    <div
                      key={test.id}
                      onClick={() => setInspectedTest(test)}
                      title={"Test " + (idx + 1) + ": " + score + "% (" + test.interviewType + " on " + test.dateString + ")"}
                      style={{
                        flex: "1 1 32px",
                        minWidth: "32px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      <span style={{ fontSize: "11px", color: barColor, fontWeight: "bold", marginBottom: "4px" }}>
                        {score}%
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: Math.max(8, (score / 100) * 110) + "px",
                          background: isRecent
                            ? "linear-gradient(180deg, #00e676, #2196f3)"
                            : barColor + "cc",
                          borderRadius: "4px 4px 0 0",
                          border: isRecent ? "1.5px solid #fff" : "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-20px",
                          fontSize: "10px",
                          color: isRecent ? "#00e676" : "#777",
                          fontWeight: isRecent ? "bold" : "normal"
                        }}
                      >
                        T{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. AGGREGATED RADAR & PERSISTENT WEAKNESSES GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              
              {/* RADAR COMPETENCY AVERAGE */}
              <div
                style={{
                  background: "#13171f",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "20px",
                  textAlign: "left"
                }}
              >
                <h2 style={{ fontSize: "16px", color: "#fff", margin: "0 0 4px 0", fontWeight: "700" }}>
                  🎯 Cumulative Competency Profile
                </h2>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#888" }}>
                  Averaged across all {history.length} assessments
                </p>

                {aggregatedStats.aggregatedRadar.length > 0 ? (
                  <RadarChart skills={aggregatedStats.aggregatedRadar} />
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#666" }}>
                    No radar skill metrics available.
                  </div>
                )}
              </div>

              {/* PERSISTENT WEAKNESSES & MISTAKES TRACKER */}
              <div
                style={{
                  background: "#13171f",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "20px",
                  textAlign: "left"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h2 style={{ fontSize: "16px", color: "#fff", margin: 0, fontWeight: "700" }}>
                    ⚠️ Recurring Weaknesses & Revision Topics
                  </h2>
                  <span style={{ fontSize: "11px", color: "#ff7875", background: "rgba(255,77,79,0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                    High Priority
                  </span>
                </div>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#888" }}>
                  Concepts where marks were repeatedly deducted across sessions
                </p>

                {aggregatedStats.topWeaknesses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {aggregatedStats.topWeaknesses.map((w, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255, 77, 79, 0.06)",
                          border: "1px solid rgba(255, 77, 79, 0.25)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#ffcdd2", fontWeight: "500", lineHeight: "1.4" }}>
                          {w.topic}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#ff5252",
                            background: "rgba(255, 82, 82, 0.18)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            whiteSpace: "nowrap",
                            marginLeft: "8px"
                          }}
                        >
                          {w.count}x Detected
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#00e676" }}>
                    ✓ No recurring weaknesses identified yet!
                  </div>
                )}
              </div>

            </div>

            {/* 5. SIDE-BY-SIDE TEST COMPARISON TOOL */}
            <div
              style={{
                background: "linear-gradient(145deg, #161b24, #10141d)",
                borderRadius: "14px",
                border: "1px solid rgba(33, 150, 243, 0.3)",
                padding: "22px",
                marginBottom: "24px",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "17px", color: "#64b5f6", margin: 0, fontWeight: "700" }}>
                    🔀 Side-by-Side Test Comparison Tool
                  </h2>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Compare two historical tests to evaluate growth, skill shifts, and resolved weaknesses
                  </span>
                </div>

                {/* SELECTORS FOR TEST A & TEST B */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#ff9800", fontWeight: "bold" }}>Test A (Base):</span>
                    <select
                      value={compareIdA}
                      onChange={(e) => setCompareIdA(e.target.value)}
                      style={{
                        background: "#0d1117",
                        color: "#fff",
                        border: "1px solid #ff9800",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "12px"
                      }}
                    >
                      {history.map((t, idx) => (
                        <option key={t.id} value={t.id}>
                          T{idx + 1}: {t.overallScore}% ({t.dateString})
                        </option>
                      ))}
                    </select>
                  </div>

                  <span style={{ color: "#666" }}>vs</span>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#00e676", fontWeight: "bold" }}>Test B (Compare):</span>
                    <select
                      value={compareIdB}
                      onChange={(e) => setCompareIdB(e.target.value)}
                      style={{
                        background: "#0d1117",
                        color: "#fff",
                        border: "1px solid #00e676",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "12px"
                      }}
                    >
                      {history.map((t, idx) => (
                        <option key={t.id} value={t.id}>
                          T{idx + 1}: {t.overallScore}% ({t.dateString})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* COMPARISON RESULT METRIC CARDS */}
              {comparisonResult && (
                <div>
                  {/* OVERALL SCORE DELTA BANNER */}
                  <div
                    style={{
                      background: comparisonResult.scoreDiff >= 0 ? "rgba(0, 230, 118, 0.12)" : "rgba(255, 82, 82, 0.12)",
                      border: "1px solid " + (comparisonResult.scoreDiff >= 0 ? "#00e676" : "#ff5252"),
                      borderRadius: "10px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "12px", color: "#aaa" }}>Comparison Score Shift:</span>
                      <h3 style={{ margin: "2px 0 0 0", color: "#fff", fontSize: "18px" }}>
                        <span style={{ color: "#ffb74d" }}>Test A: {comparisonResult.testA.overallScore}%</span> ➔{" "}
                        <span style={{ color: "#00e676" }}>Test B: {comparisonResult.testB.overallScore}%</span>
                      </h3>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: comparisonResult.scoreDiff >= 0 ? "#00e676" : "#ff5252",
                          background: "rgba(0,0,0,0.3)",
                          padding: "6px 14px",
                          borderRadius: "14px",
                          border: "1px solid " + (comparisonResult.scoreDiff >= 0 ? "#00e676" : "#ff5252")
                        }}
                      >
                        {comparisonResult.scoreDiff >= 0 ? "▲ +" : "▼ "}
                        {comparisonResult.scoreDiff}% {comparisonResult.scoreDiff >= 0 ? "Improvement 🚀" : "Drop"}
                      </span>
                    </div>
                  </div>

                  {/* RADAR DELTA COMPARISON */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                    {comparisonResult.radarDiff.map((diff, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>{diff.skill}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "#fff" }}>
                            {diff.scoreA !== null ? diff.scoreA + "%" : "N/A"} ➔ {diff.scoreB}%
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: diff.delta >= 0 ? "#00e676" : "#ff5252"
                            }}
                          >
                            {diff.delta >= 0 ? "+" : ""}{diff.delta}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WEAKNESS TRANSITION ANALYSIS */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                    {/* RESOLVED WEAKNESSES */}
                    <div style={{ background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "8px", padding: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#00e676", fontWeight: "bold" }}>
                        ✓ Overcome Weaknesses (Resolved in Test B):
                      </span>
                      {comparisonResult.resolvedWeaknesses.length > 0 ? (
                        <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", fontSize: "12px", color: "#ccc" }}>
                          {comparisonResult.resolvedWeaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#777" }}>None identified between these tests.</p>
                      )}
                    </div>

                    {/* PERSISTENT WEAKNESSES */}
                    <div style={{ background: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.2)", borderRadius: "8px", padding: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#ffb74d", fontWeight: "bold" }}>
                        ⚠️ Persistent Weaknesses (Still Present):
                      </span>
                      {comparisonResult.persistentWeaknesses.length > 0 ? (
                        <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", fontSize: "12px", color: "#ccc" }}>
                          {comparisonResult.persistentWeaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#777" }}>No overlapping weaknesses found.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 6. HISTORICAL TESTS ARCHIVE (CARDS / TABLE) */}
            <div
              style={{
                background: "#13171f",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "22px",
                marginBottom: "24px",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "17px", color: "#fff", margin: 0, fontWeight: "700" }}>
                    📚 Complete Assessment History ({history.length} of {MAX_HISTORY_LIMIT} Tests Saved)
                  </h2>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Click "Inspect Review" to view question-by-question candidate answers and AI rationale
                  </span>
                </div>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255, 77, 79, 0.3)",
                    color: "#ff7875",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Clear History 🗑️
                </button>
              </div>

              {/* TESTS LIST */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {history.slice().reverse().map((test, revIdx) => {
                  const originalIndex = history.length - 1 - revIdx;
                  const score = test.overallScore || 0;
                  const color = getScoreColor(score);

                  return (
                    <div
                      key={test.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            background: color + "22",
                            border: "1px solid " + color + "66",
                            color: color,
                            fontWeight: "bold",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            minWidth: "48px",
                            textAlign: "center"
                          }}
                        >
                          {score}%
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>
                              {test.interviewType}
                            </span>
                            <span style={{ fontSize: "11px", color: "#aaa", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                              Test #{originalIndex + 1}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>
                            {test.dateString} at {test.timeString} • Duration: {test.durationMinutes}m • Focus: {test.integrityScore}%
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => setInspectedTest(test)}
                          style={{
                            background: "rgba(33, 150, 243, 0.15)",
                            border: "1px solid #2196f3",
                            color: "#64b5f6",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          Inspect Review 🔍
                        </button>

                        <button
                          onClick={() => {
                            setCompareIdA(history[0].id);
                            setCompareIdB(test.id);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#aaa",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Compare 🔀
                        </button>

                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          title="Delete this test record"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ff5252",
                            fontSize: "14px",
                            cursor: "pointer",
                            padding: "4px"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </>
        )}

        {/* 7. QUESTION-BY-QUESTION INSPECTION MODAL */}
        {inspectedTest && (
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
                padding: "24px",
                maxWidth: "780px",
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                textAlign: "left",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                <div>
                  <h2 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
                    🔍 Detailed Inspection: {inspectedTest.interviewType}
                  </h2>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Completed on {inspectedTest.dateString} • Overall Score:{" "}
                    <b style={{ color: getScoreColor(inspectedTest.overallScore) }}>{inspectedTest.overallScore}%</b>
                  </span>
                </div>

                <button
                  onClick={() => setInspectedTest(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#aaa",
                    fontSize: "20px",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* QUESTIONS LIST */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {inspectedTest.evaluatedQuestions && inspectedTest.evaluatedQuestions.length > 0 ? (
                  inspectedTest.evaluatedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        padding: "14px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#64b5f6", fontWeight: "bold" }}>
                          Q{idx + 1}: {q.category || "General"}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: getScoreColor(q.score * 10) }}>
                          Score: {q.scoreOutOfTen || q.score || 0}/10
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 8px 0", color: "#fff", fontSize: "14px", lineHeight: "1.4" }}>
                        {q.question}
                      </h4>

                      <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px", borderRadius: "6px", marginBottom: "8px", fontSize: "13px", color: "#ddd" }}>
                        <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "2px" }}>Your Answer:</span>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: q.dsaDetails ? "monospace" : "inherit" }}>
                          {q.answer || "(No answer recorded)"}
                        </p>
                      </div>

                      {q.whyScore && (
                        <div style={{ fontSize: "12px", color: "#ffb74d", marginBottom: "6px" }}>
                          💡 <b>AI Evaluation:</b> {q.whyScore}
                        </div>
                      )}

                      {q.suggestedAnswer && (
                        <div style={{ fontSize: "12px", color: "#a5d6a7", background: "rgba(0, 230, 118, 0.05)", padding: "8px", borderRadius: "6px" }}>
                          ✨ <b>Recommended Approach:</b> {q.suggestedAnswer}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#888", fontSize: "13px" }}>No question-level breakdown found for this session.</p>
                )}
              </div>

              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <button
                  onClick={() => setInspectedTest(null)}
                  style={{
                    background: "#21262d",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. CLEAR CONFIRMATION MODAL */}
        {showClearConfirm && (
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
                border: "1px solid #ff4d4f",
                borderRadius: "14px",
                padding: "24px",
                maxWidth: "420px",
                width: "100%",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚠️</div>
              <h3 style={{ color: "#ff7875", margin: "0 0 8px 0" }}>Clear All Test History?</h3>
              <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "20px" }}>
                This will permanently delete all {history.length} saved interview records for candidate handle <b>@{selectedUserId}</b>.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1,
                    background: "#333",
                    color: "#aaa",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  style={{
                    flex: 1,
                    background: "#ff4d4f",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;

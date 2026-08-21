import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  verifyAdminSession,
  clearAdminSession,
  fetchOverviewAnalytics,
  fetchUserAnalytics,
  fetchInterviewAnalytics,
  fetchScoreAnalytics,
  fetchBranchAnalytics,
  fetchRoleAnalytics,
  fetchPerformanceTrend,
  fetchDsaAnalytics,
  fetchVerilogAnalytics,
  fetchCommunicationAnalytics,
  fetchCameraAnalytics,
  fetchRecentActivity,
  fetchRecentTests
} from "../services/adminApi";

function AdminDashboard() {
  const navigate = useNavigate();

  // Authentication state
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Analytics Data States
  const [overview, setOverview] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);
  const [scoreStats, setScoreStats] = useState(null);
  const [branchStats, setBranchStats] = useState(null);
  const [roleStats, setRoleStats] = useState(null);
  const [trendStats, setTrendStats] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState("all");
  const [dsaStats, setDsaStats] = useState(null);
  const [verilogStats, setVerilogStats] = useState(null);
  const [commStats, setCommStats] = useState(null);
  const [cameraStats, setCameraStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  // Filters for Recent Tests Table
  const [filterBranch, setFilterBranch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMinScore, setFilterMinScore] = useState("");

  // Inactivity Auto-Logout Watchdog (15 Minutes)
  useEffect(() => {
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("🔒 Security Lockout: You have been logged out due to 15 minutes of inactivity.");
        clearAdminSession();
        navigate("/admin/login", { replace: true });
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [navigate]);

  // Load and verify Admin authorization
  useEffect(() => {
    async function initDashboard() {
      try {
        const session = await verifyAdminSession();
        if (!session.authenticated) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdminUser(session.admin);
        await loadAllAnalytics();
      } catch (err) {
        console.error("Dashboard auth check:", err);
        navigate("/admin/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [navigate]);

  // Fetch all analytics from backend SQLite
  const loadAllAnalytics = async () => {
    setRefreshing(true);
    setError("");
    try {
      const [
        ov,
        us,
        is,
        sc,
        br,
        ro,
        tr,
        dsa,
        ver,
        comm,
        cam,
        act,
        tst
      ] = await Promise.all([
        fetchOverviewAnalytics(),
        fetchUserAnalytics(),
        fetchInterviewAnalytics(),
        fetchScoreAnalytics(),
        fetchBranchAnalytics(),
        fetchRoleAnalytics(),
        fetchPerformanceTrend(trendPeriod),
        fetchDsaAnalytics(),
        fetchVerilogAnalytics(),
        fetchCommunicationAnalytics(),
        fetchCameraAnalytics(),
        fetchRecentActivity(),
        fetchRecentTests({
          branch: filterBranch,
          role: filterRole,
          interviewType: filterType,
          minScore: filterMinScore
        })
      ]);

      setOverview(ov);
      setUserStats(us);
      setInterviewStats(is);
      setScoreStats(sc);
      setBranchStats(br);
      setRoleStats(ro);
      setTrendStats(tr);
      setDsaStats(dsa);
      setVerilogStats(ver);
      setCommStats(comm);
      setCameraStats(cam);
      setRecentActivity(act?.activities || (Array.isArray(act) ? act : []));
      setRecentTests(tst?.tests || (Array.isArray(tst) ? tst : []));
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login", { replace: true });
      } else {
        console.warn("Analytics fetch note:", err);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Reload trend when period changes
  const handlePeriodChange = async (period) => {
    setTrendPeriod(period);
    try {
      const tr = await fetchPerformanceTrend(period);
      setTrendStats(tr);
    } catch (err) {
      console.warn("Trend period fetch:", err);
    }
  };

  const applyTableFilters = async () => {
    try {
      const tst = await fetchRecentTests({
        branch: filterBranch,
        role: filterRole,
        interviewType: filterType,
        minScore: filterMinScore
      });
      setRecentTests(tst?.tests || (Array.isArray(tst) ? tst : []));
    } catch (err) {
      console.warn("Filtered tests fetch:", err);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#00e676";
    if (score >= 70) return "#2196f3";
    if (score >= 50) return "#ffb74d";
    return "#ff5252";
  };

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "#64b5f6", fontSize: "16px", fontWeight: "600" }}>
          🛡️ Loading Secure Read-Only Admin Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "24px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "1120px", width: "100%" }}>
        
        {/* ========================================= */}
        {/* TOP HEADER: ADMIN IDENTITY & ACTION BAR   */}
        {/* ========================================= */}
        <div
          style={{
            background: "linear-gradient(135deg, #13171f, #0a0d14)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "18px 24px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", textAlign: "left" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2196f3, #9c27b0)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(33,150,243,0.3)"
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "18px", margin: 0, color: "#fff", fontWeight: "700" }}>
                  ADMIN CONTROL CENTER
                </h1>
                <span style={{ fontSize: "11px", color: "#00e676", background: "rgba(0,230,118,0.15)", border: "1px solid #00e67644", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                  READ-ONLY SECURE ACCESS
                </span>
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#aaa" }}>
                Platform Owner: <b style={{ color: "#64b5f6" }}>{adminUser?.email || "admin@owner"}</b> • Database: SQLite Live Real Analytics
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={loadAllAnalytics}
              disabled={refreshing}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#90caf9",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>🔄</span> {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#ccc",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Candidate Portal
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: "rgba(255,77,79,0.15)",
                border: "1px solid #ff4d4f",
                color: "#ff7875",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Logout 🔒
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255, 77, 79, 0.2)", border: "1px solid #ff4d4f", borderRadius: "8px", padding: "10px 14px", color: "#ff7875", fontSize: "13px", marginBottom: "16px", textAlign: "left" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ========================================= */}
        {/* SECTION 1: TOP PLATFORM OVERVIEW 8 CARDS  */}
        {/* ========================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {/* Card 1: Total Users */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Total Users</span>
              <span>👥</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginTop: "6px" }}>
              {overview ? overview.totalUsers : 0}
            </div>
            <div style={{ fontSize: "11px", color: "#64b5f6", marginTop: "4px" }}>
              {userStats?.newUsers?.last7Days || 0} joined in last 7 days
            </div>
          </div>

          {/* Card 2: Total Interviews */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Total Interviews</span>
              <span>🎯</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginTop: "6px" }}>
              {overview ? overview.totalInterviews : 0}
            </div>
            <div style={{ fontSize: "11px", color: "#00e676", marginTop: "4px" }}>
              Across all 6 simulation formats
            </div>
          </div>

          {/* Card 3: Interviews Today */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Interviews Today</span>
              <span>⚡</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00e676", marginTop: "6px" }}>
              {overview ? overview.interviewsToday : 0}
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              {overview ? overview.interviewsThisWeek : 0} completed this week
            </div>
          </div>

          {/* Card 4: Average Overall Score */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Avg Overall Score</span>
              <span>📊</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: getScoreColor(overview?.averageOverallScore || 0), marginTop: "6px" }}>
              {overview ? overview.averageOverallScore : 0}%
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Platform benchmark average
            </div>
          </div>

          {/* Card 5: Highest Score */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Highest Score</span>
              <span>🏆</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00e676", marginTop: "6px" }}>
              {overview ? overview.highestScore : 0}%
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Top candidate performance
            </div>
          </div>

          {/* Card 6: Average Duration */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Avg Duration</span>
              <span>⏱</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginTop: "6px" }}>
              {overview ? overview.averageInterviewDuration : 15} <span style={{ fontSize: "14px", color: "#888" }}>min</span>
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Pacing across sessions
            </div>
          </div>

          {/* Card 7: Completion Rate */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Completion Rate</span>
              <span>📈</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#64b5f6", marginTop: "6px" }}>
              {overview ? overview.completionRate : 0}%
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Submissions evaluated
            </div>
          </div>

          {/* Card 8: Active 7 Days */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", textTransform: "uppercase" }}>
              <span>Active Candidates</span>
              <span>🚀</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#9c27b0", marginTop: "6px" }}>
              {userStats?.activeUsers?.last7Days || 0}
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Active in last 7 days
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SECTION 2: USER GROWTH & INTERVIEW SPLIT  */}
        {/* ========================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          
          {/* USER GROWTH & ACTIVITY BOX */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: "700" }}>
                👥 User Growth & Active Candidates
              </h2>
              <span style={{ fontSize: "11px", color: "#64b5f6" }}>Real-time Database Count</span>
            </div>

            {/* Time Breakdown Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Today</span>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginTop: "2px" }}>
                  +{userStats?.newUsers?.today || 0}
                </div>
                <span style={{ fontSize: "10px", color: "#00e676" }}>{userStats?.activeUsers?.today || 0} active</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Last 7 Days</span>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginTop: "2px" }}>
                  +{userStats?.newUsers?.last7Days || 0}
                </div>
                <span style={{ fontSize: "10px", color: "#64b5f6" }}>{userStats?.activeUsers?.last7Days || 0} active</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#888", textTransform: "uppercase" }}>Last 30 Days</span>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginTop: "2px" }}>
                  +{userStats?.newUsers?.last30Days || 0}
                </div>
                <span style={{ fontSize: "10px", color: "#9c27b0" }}>{userStats?.activeUsers?.last30Days || 0} active</span>
              </div>
            </div>

            {/* Growth Visualizer Bar */}
            <span style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>
              14-Day Cumulative Candidate Growth:
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "8px" }}>
              {userStats?.userGrowthTimeline?.map((item, idx) => (
                <div key={idx} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }} title={item.date + ": " + item.users + " Users"}>
                  <div style={{ width: "100%", height: Math.max(8, (item.users / Math.max(1, userStats.totalRegisteredUsers)) * 60) + "px", background: "linear-gradient(180deg, #2196f3, #673ab7)", borderRadius: "3px 3px 0 0" }} />
                </div>
              ))}
            </div>
          </div>

          {/* INTERVIEW TYPE DISTRIBUTION */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: "0 0 14px 0", fontWeight: "700" }}>
              🎯 Interview Type Distribution ({interviewStats?.totalInterviews || 0} Tests)
            </h2>

            {interviewStats && interviewStats.distribution && interviewStats.distribution.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {interviewStats.distribution.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "#fff", fontWeight: "500" }}>{item.type}</span>
                      <span style={{ color: "#aaa" }}>
                        <b style={{ color: "#64b5f6" }}>{item.count}</b> ({item.percentage}%) • Avg: <b style={{ color: getScoreColor(item.avgScore) }}>{item.avgScore}%</b>
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: item.percentage + "%",
                          height: "100%",
                          background: idx === 0 ? "#00e676" : idx === 1 ? "#2196f3" : idx === 2 ? "#ff9800" : "#9c27b0"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#777", fontSize: "13px" }}>
                No interview sessions recorded in database yet.
              </div>
            )}
          </div>

        </div>

        {/* ========================================= */}
        {/* SECTION 3: PERFORMANCE TREND & SCORES    */}
        {/* ========================================= */}
        <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: "700" }}>
                📈 Average Interview Score Over Time
              </h2>
              <span style={{ fontSize: "12px", color: "#888" }}>
                Historical average score trajectory calculated from live submissions
              </span>
            </div>

            {/* Time Filter Pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {["7d", "30d", "3m", "all"].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  style={{
                    background: trendPeriod === p ? "rgba(33,150,243,0.25)" : "rgba(255,255,255,0.04)",
                    border: "1px solid " + (trendPeriod === p ? "#2196f3" : "rgba(255,255,255,0.1)"),
                    color: trendPeriod === p ? "#64b5f6" : "#888",
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {p === "7d" ? "Last 7 Days" : p === "30d" ? "Last 30 Days" : p === "3m" ? "Last 3 Months" : "All Time"}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Bar Visualizer */}
          {trendStats && trendStats.trend && trendStats.trend.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "130px", background: "rgba(0,0,0,0.3)", padding: "12px 10px 24px 10px", borderRadius: "8px", overflowX: "auto" }}>
              {trendStats.trend.map((pt, i) => (
                <div key={i} style={{ flex: "1 1 36px", minWidth: "36px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative" }} title={pt.date + ": " + pt.avgScore + "% (" + pt.count + " tests)"}>
                  <span style={{ fontSize: "10px", color: getScoreColor(pt.avgScore), fontWeight: "bold", marginBottom: "2px" }}>
                    {pt.avgScore}%
                  </span>
                  <div style={{ width: "100%", height: Math.max(6, (pt.avgScore / 100) * 85) + "px", background: "linear-gradient(180deg, #00e676, #2196f3)", borderRadius: "3px 3px 0 0" }} />
                  <span style={{ position: "absolute", bottom: "-18px", fontSize: "9px", color: "#777", whiteSpace: "nowrap" }}>
                    {pt.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "#777", fontSize: "13px" }}>
              No score records found for this time period.
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* SECTION 4: BRANCH & ROLE ANALYTICS GRID   */}
        {/* ========================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          
          {/* BRANCH ANALYTICS */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: "0 0 14px 0", fontWeight: "700" }}>
              🏛️ Engineering Branch Breakdown & Average Scores
            </h2>

            {branchStats && branchStats.branches && branchStats.branches.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {branchStats.branches.map((b, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "#fff", fontWeight: "600", fontSize: "13px" }}>{b.branch}</span>
                      <span style={{ fontSize: "11px", color: "#888", marginLeft: "8px" }}>({b.interviewCount} tests • {b.uniqueUsers} users)</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: getScoreColor(b.avgScore) }}>
                      {b.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "13px" }}>
                No branch data recorded yet.
              </div>
            )}
          </div>

          {/* ROLE POPULARITY ANALYTICS */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
            <h2 style={{ fontSize: "15px", color: "#fff", margin: "0 0 14px 0", fontWeight: "700" }}>
              🎯 Target Job Roles (Ranked by Popularity)
            </h2>

            {roleStats && roleStats.roles && roleStats.roles.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                {roleStats.roles.map((r, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "#64b5f6", fontWeight: "600", fontSize: "13px" }}>{r.role}</span>
                      <span style={{ fontSize: "11px", color: "#888", marginLeft: "8px" }}>({r.interviewCount} tests)</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: getScoreColor(r.avgScore) }}>
                      {r.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "13px" }}>
                No job roles recorded yet.
              </div>
            )}
          </div>

        </div>

        {/* ========================================= */}
        {/* SECTION 5: TECHNICAL DEEP DIVE (DSA/VERILOG/VOICE/PROCTOR) */}
        {/* ========================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          
          {/* DSA ANALYTICS CARD */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <h3 style={{ fontSize: "13px", color: "#00e676", margin: "0 0 10px 0", textTransform: "uppercase" }}>
              💻 DSA Coding Analytics
            </h3>
            <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.8" }}>
              <div>Total Attempts: <b style={{ color: "#fff" }}>{dsaStats?.totalAttempts || 0}</b></div>
              <div>Avg Score: <b style={{ color: getScoreColor(dsaStats?.avgScore || 0) }}>{dsaStats?.avgScore || 0}%</b></div>
              <div>Test Cases Passed: <b style={{ color: "#64b5f6" }}>{dsaStats?.avgTestCasesPassed || 0}%</b></div>
              <div>Code Quality: <b style={{ color: "#a5d6a7" }}>{dsaStats?.avgCodeQuality || 0}%</b></div>
            </div>
          </div>

          {/* VERILOG RTL CARD */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <h3 style={{ fontSize: "13px", color: "#ff9800", margin: "0 0 10px 0", textTransform: "uppercase" }}>
              ⚡ Verilog RTL Analytics
            </h3>
            <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.8" }}>
              <div>Total Attempts: <b style={{ color: "#fff" }}>{verilogStats?.totalAttempts || 0}</b></div>
              <div>Avg RTL Score: <b style={{ color: getScoreColor(verilogStats?.avgScore || 0) }}>{verilogStats?.avgScore || 0}%</b></div>
              <div>Syntax Accuracy: <b style={{ color: "#ffb74d" }}>{verilogStats?.avgSyntaxScore || 0}%</b></div>
              <div>Logic Precision: <b style={{ color: "#00e676" }}>{verilogStats?.avgLogicScore || 0}%</b></div>
            </div>
          </div>

          {/* COMMUNICATION & NLP CARD */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <h3 style={{ fontSize: "13px", color: "#64b5f6", margin: "0 0 10px 0", textTransform: "uppercase" }}>
              🎙️ Communication & NLP
            </h3>
            <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.8" }}>
              <div>Overall Clarity: <b style={{ color: "#fff" }}>{commStats?.clarity || 0}%</b></div>
              <div>Content Relevance: <b style={{ color: "#64b5f6" }}>{commStats?.relevance || 0}%</b></div>
              <div>Sentence Structure: <b style={{ color: "#a5d6a7" }}>{commStats?.structure || 0}%</b></div>
              <div>Technical Vocab: <b style={{ color: "#ffb74d" }}>{commStats?.vocabulary || 0}%</b></div>
            </div>
          </div>

          {/* CAMERA & PROCTORING INTEGRITY CARD */}
          <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", textAlign: "left" }}>
            <h3 style={{ fontSize: "13px", color: "#e91e63", margin: "0 0 10px 0", textTransform: "uppercase" }}>
              🛡️ Proctor & Focus Metrics
            </h3>
            <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.8" }}>
              <div>Camera Availability: <b style={{ color: "#fff" }}>{cameraStats?.cameraAvailabilityRate || 100}%</b></div>
              <div>Avg Focus Score: <b style={{ color: "#00e676" }}>{cameraStats?.averageFocusScore || 100}%</b></div>
              <div>Gaze Compliance: <b style={{ color: "#64b5f6" }}>{cameraStats?.gazeComplianceRate || 100}%</b></div>
              <div>Tab Switches Detected: <b style={{ color: "#ff7875" }}>{cameraStats?.totalTabSwitchesDetected || 0}</b></div>
            </div>
          </div>

        </div>

        {/* ========================================= */}
        {/* SECTION 6: RECENT ACTIVITY & RECENT TESTS */}
        {/* ========================================= */}
        <div style={{ background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
          
          {/* ACTIVITY FEED HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "16px", color: "#fff", margin: 0, fontWeight: "700" }}>
              ⚡ Live Platform Activity Stream
            </h2>
            <span style={{ fontSize: "11px", color: "#00e676", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e676" }}></span>
              Live Feed
            </span>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "20px" }}>
              {recentActivity.map((act, idx) => (
                <div key={idx} style={{ flex: "0 0 240px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", fontSize: "12px" }}>
                  <div style={{ color: "#fff", fontWeight: "500", marginBottom: "4px" }}>{act.message}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "11px" }}>
                    <span>{act.type}</span>
                    <span style={{ color: "#64b5f6" }}>{act.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#777", fontSize: "12px", margin: "0 0 16px 0" }}>No recent events recorded.</p>
          )}

          {/* ========================================= */}
          {/* READ-ONLY RECENT TESTS TABLE WITH FILTERS */}
          {/* ========================================= */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: "700" }}>
                📋 Filterable Candidate Submissions (Read-Only)
              </h3>
              <span style={{ fontSize: "11px", color: "#888" }}>
                Total Filtered: <b>{recentTests.length}</b> records
              </span>
            </div>

            {/* FILTER CONTROLS */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                style={{ background: "#161b24", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" }}
              >
                <option value="">All Branches</option>
                <option>CSE</option>
                <option>IT</option>
                <option>MNC</option>
                <option>CS Design</option>
                <option>ECE</option>
                <option>EV</option>
                <option>Mechanical</option>
                <option>Chemical</option>
                <option>Petroleum</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ background: "#161b24", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" }}
              >
                <option value="">All Formats</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="AI Mock Interview">AI Mock Interview</option>
                <option value="Full Interview Simulation">Full Interview</option>
                <option value="DSA Coding Round">DSA Coding</option>
                <option value="Verilog RTL">Verilog RTL</option>
              </select>

              <input
                type="number"
                placeholder="Min Score (e.g. 70)"
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(e.target.value)}
                style={{ background: "#161b24", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", width: "130px" }}
              />

              <button
                type="button"
                onClick={applyTableFilters}
                style={{ background: "#2196f3", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
              >
                Apply Filters 🔍
              </button>

              {(filterBranch || filterType || filterMinScore) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterBranch("");
                    setFilterType("");
                    setFilterMinScore("");
                    fetchRecentTests().then((t) => setRecentTests(t?.tests || []));
                  }}
                  style={{ background: "transparent", color: "#aaa", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                >
                  Reset ↺
                </button>
              )}
            </div>

            {/* TABLE */}
            {recentTests && recentTests.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#888", textTransform: "uppercase" }}>
                      <th style={{ padding: "10px 8px" }}>Candidate ID</th>
                      <th style={{ padding: "10px 8px" }}>Interview Format</th>
                      <th style={{ padding: "10px 8px" }}>Branch</th>
                      <th style={{ padding: "10px 8px" }}>Target Role</th>
                      <th style={{ padding: "10px 8px" }}>Score</th>
                      <th style={{ padding: "10px 8px" }}>Date</th>
                      <th style={{ padding: "10px 8px" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 8px", color: "#64b5f6", fontWeight: "bold" }}>
                          @{t.userId}
                        </td>
                        <td style={{ padding: "10px 8px", color: "#fff" }}>
                          {t.interviewType}
                        </td>
                        <td style={{ padding: "10px 8px", color: "#aaa" }}>
                          {t.branch} ({t.year})
                        </td>
                        <td style={{ padding: "10px 8px", color: "#ddd" }}>
                          {t.role}
                        </td>
                        <td style={{ padding: "10px 8px", color: getScoreColor(t.overallScore), fontWeight: "bold" }}>
                          {t.overallScore}%
                        </td>
                        <td style={{ padding: "10px 8px", color: "#888" }}>
                          {t.dateFormatted}
                        </td>
                        <td style={{ padding: "10px 8px", color: "#888" }}>
                          {t.durationMinutes} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#777", fontSize: "13px" }}>
                No candidate test records matching filter criteria.
              </div>
            )}

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;

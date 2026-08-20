import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  checkAdminStatus,
  setupAdmin,
  loginAdmin,
  resetPasswordWithSecurityAnswer,
  verifyAdminSession
} from "../services/adminApi";

function AdminLogin() {
  const navigate = useNavigate();

  // Mode: "login" | "setup" | "forgot_security"
  const [mode, setMode] = useState("login");
  const [hasAdminAccount, setHasAdminAccount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityDob, setSecurityDob] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Check if already logged in or if admin needs initial setup
  useEffect(() => {
    async function initCheck() {
      try {
        const session = await verifyAdminSession();
        if (session.authenticated) {
          navigate("/admin", { replace: true });
          return;
        }

        const status = await checkAdminStatus();
        setHasAdminAccount(status.hasAdmin);
        if (!status.hasAdmin) {
          setMode("setup");
        }
      } catch (err) {
        console.warn("Admin status check:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    initCheck();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await loginAdmin({ email, password, remember: rememberMe });
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || (err.code === "ERR_NETWORK" ? "Cannot connect to Backend Server (Port 8000). Please start the backend using start_backend.bat!" : "Invalid admin credentials or unauthorized.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !username || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await setupAdmin({ email, username, password });
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not complete admin setup.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !securityDob || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithSecurityAnswer({
        email,
        security_answer: securityDob,
        new_password: password
      });
      setSuccessMsg(res.message || "Password reset successfully. You can now login with your new password.");
      setPassword("");
      setConfirmPassword("");
      setSecurityDob("");
      setMode("login");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to reset password. Check your security answer.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "#64b5f6", fontSize: "16px", fontWeight: "600" }}>
          🛡️ Verifying Admin Security Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "30px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* TOP ESCAPE BUTTON */}
      <div style={{ maxWidth: "460px", width: "100%", margin: "0 auto 16px auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            color: "#aaa",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          ← Return to Candidate Simulator
        </button>

        <span style={{ fontSize: "11px", color: "#00e676", fontWeight: "bold", background: "rgba(0,230,118,0.1)", padding: "3px 8px", borderRadius: "10px" }}>
          🔒 Restricted Area
        </span>
      </div>

      <div
        className="card"
        style={{
          maxWidth: "460px",
          width: "100%",
          margin: "0 auto",
          background: "linear-gradient(145deg, #161b24, #0e121a)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "30px 24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          textAlign: "left"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2196f3, #9c27b0)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
              margin: "0 auto 12px auto",
              boxShadow: "0 6px 20px rgba(33,150,243,0.3)"
            }}
          >
            🛡️
          </div>

          <h1 style={{ fontSize: "22px", margin: "0 0 6px 0", color: "#fff", fontWeight: "700" }}>
            {mode === "setup"
              ? "Project Owner Admin Setup"
              : mode === "forgot_security"
              ? "Admin Password Recovery"
              : "Admin Portal Sign-In"}
          </h1>

          <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>
            {mode === "setup"
              ? "Create your unique Owner Admin credentials (One-time registration)."
              : mode === "forgot_security"
              ? "Verify your security key to instantly set a new master password."
              : "Read-Only Platform Analytics & Monitoring Dashboard."}
          </p>
        </div>

        {/* NOTIFICATIONS */}
        {error && (
          <div
            style={{
              background: "rgba(255, 77, 79, 0.15)",
              border: "1px solid #ff4d4f",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#ff7875",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px"
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "rgba(0, 230, 118, 0.12)",
              border: "1px solid #00e676",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#a5d6a7",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px"
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* 1. REGULAR ADMIN LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Admin Email
              </label>
              <input
                type="email"
                autoComplete="off"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setMode("forgot_security");
                  }}
                  style={{ background: "transparent", border: "none", color: "#64b5f6", fontSize: "12px", cursor: "pointer", padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="remember" style={{ fontSize: "13px", color: "#ccc", cursor: "pointer" }}>
                Remember this device for 7 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #2196f3, #9c27b0)",
                color: "#fff",
                border: "none",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(33,150,243,0.3)"
              }}
            >
              {loading ? "Authenticating Admin..." : "Unlock Admin Dashboard 🔓"}
            </button>
          </form>
        )}

        {/* 2. ONE-TIME OWNER ADMIN SETUP FORM */}
        {mode === "setup" && (
          <form onSubmit={handleSetup}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Admin Email Address
              </label>
              <input
                type="email"
                autoComplete="off"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Admin Username / Unique Handle
              </label>
              <input
                type="text"
                autoComplete="off"
                placeholder="e.g. aniket"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Set Master Password (Min 6 chars)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Confirm Master Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #00e676, #2196f3)",
                color: "#000",
                border: "none",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,230,118,0.3)"
              }}
            >
              {loading ? "Creating Admin Account..." : "Create Owner Admin Account 🛡️"}
            </button>
          </form>
        )}

        {/* 3. SECURITY QUESTION FORGOT PASSWORD RESET FORM */}
        {mode === "forgot_security" && (
          <form onSubmit={handleSecurityReset}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Registered Admin Email
              </label>
              <input
                type="email"
                autoComplete="off"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#64b5f6", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                Enter your brother's DOB to reset your password:
              </label>
              <input
                type="text"
                autoComplete="off"
                placeholder="DD/MM/YYYY"
                value={securityDob}
                onChange={(e) => setSecurityDob(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid #64b5f6",
                  color: "#64b5f6",
                  fontSize: "15px",
                  fontWeight: "bold",
                  letterSpacing: "1px"
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Set New Master Password (Min 6 chars)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "14px"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #00e676, #2196f3)",
                color: "#000",
                border: "none",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "10px",
                boxShadow: "0 4px 16px rgba(0,230,118,0.3)"
              }}
            >
              {loading ? "Verifying Security Key..." : "Reset Password & Login ✓"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccessMsg("");
                setMode("login");
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#aaa",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Cancel & Back to Login
            </button>
          </form>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default AdminLogin;

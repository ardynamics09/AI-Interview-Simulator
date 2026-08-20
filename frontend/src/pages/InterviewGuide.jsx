import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function InterviewGuide() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ padding: "30px 14px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "860px", width: "100%", textAlign: "left" }}>
        
        {/* TOP ACTION BAR */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
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
            ← Back to Candidate Portal
          </button>

          <button
            onClick={() => window.print()}
            style={{
              background: "linear-gradient(90deg, #2196f3, #00e676)",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0, 230, 118, 0.25)"
            }}
          >
            <span>🖨️</span> Print / Save as PDF
          </button>
        </div>

        {/* GUIDE CONTAINER */}
        <div
          className="card"
          style={{
            background: "#13171f",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "36px 30px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
            color: "#e0e0e0",
            lineHeight: "1.7"
          }}
        >
          <div style={{ borderBottom: "2px solid rgba(33, 150, 243, 0.4)", paddingBottom: "16px", marginBottom: "24px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", color: "#00e676", fontWeight: "bold" }}>
              Comprehensive Project Master Guide (Hinglish)
            </span>
            <h1 style={{ fontSize: "28px", color: "#fff", margin: "8px 0 6px 0", fontWeight: "800" }}>
              🎓 AI Interview Simulator — Technical & Architecture Guide
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
              Author: <b>Aniket Raj</b> • Stack: React 18, Vite, FastAPI (Python), SQLite WAL, Web Speech AI, Gemini AI
            </p>
          </div>

          {/* SECTION 1: 30-SEC ELEVATOR PITCH */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              📌 1. Project Introduction (Interviewer ke samne 30-Second Elevator Pitch)
            </h2>
            <div style={{ background: "rgba(33, 150, 243, 0.08)", borderLeft: "4px solid #2196f3", padding: "14px 18px", borderRadius: "0 8px 8px 0", marginTop: "12px" }}>
              <p style={{ margin: 0, fontSize: "15px", color: "#fff", fontStyle: "italic" }}>
                "Sir/Ma'am, maine <b>AI Interview Simulator</b> ek production-grade, AI-driven assessment platform ke roop me build kiya hai jo engineering students aur candidates ko real-world technical, behavioral (HR), coding (DSA), aur hardware (Verilog RTL) interviews ke liye prepare karta hai."
              </p>
            </div>
            <ul style={{ paddingLeft: "20px", marginTop: "14px", fontSize: "14px", color: "#ccc" }}>
              <li><b>Dual-Channel Voice AI:</b> AI interviewer questions naturally bolta hai (HR me Female voice, Technical me Male voice, Full simulation me Alternate voices) aur candidate live mic se bol kar answer de sakta hai.</li>
              <li><b>AI WebCam & Integrity Proctoring:</b> Computer Vision luminance algorithms se 25° gaze angle, lens blocking (thumb cover), aur tab-switching track hota hai with low-light room support.</li>
              <li><b>Live Coding & Hardware RTL Evaluation:</b> Software engineers ke liye DSA test runner aur ECE/EV engineers ke liye synthesizable <b>Verilog HDL simulation engine</b>.</li>
              <li><b>Candidate History & Secure Read-Only Admin Dashboard:</b> Candidates ke liye 25-Test FIFO LocalStorage dashboard hai, aur platform owner ke liye backend SQLite database aur PBKDF2 encryption se secured <b>Read-Only Admin Analytics Center</b> hai.</li>
            </ul>
          </div>

          {/* SECTION 2: ARCHITECTURE */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              🏗️ 2. High-Level Architecture & Tech Stack
            </h2>
            <div style={{ background: "#0a0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px", fontFamily: "monospace", fontSize: "13px", color: "#00e676", overflowX: "auto" }}>
              <pre style={{ margin: 0 }}>
Frontend (React 18 + Vite) &lt;--- REST API ---&gt; Backend (FastAPI Python)
• Web Speech Synthesis (TTS/STT)               • Google Gemini AI Engine
• WebCam 25° Proctoring HUD & Lens Blocking    • PBKDF2-HMAC-SHA256 Auth
• 25-Test LocalStorage FIFO                    • SQLite DB (WAL Mode)
              </pre>
            </div>
          </div>

          {/* SECTION 3: FRONTEND DEEP DIVE */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              💻 3. Frontend Architecture Deep-Dive
            </h2>
            <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "14px" }}>A. Voice AI Engine</h3>
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Browser ki native <code>window.speechSynthesis</code> aur <code>webkitSpeechRecognition</code> use ki gayi hai jisse <b>zero latency</b> aur <b>zero API billing</b> hoti hai. High-definition neural voices (Microsoft Jenny/Aria Natural, Google UK/US English) connect kiye gaye hain with natural human pacing (0.96 rate).
            </p>

            <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "14px" }}>B. AI WebCam Gaze & Lens-Blocking Proctoring</h3>
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Canvas Optical Center-of-Mass luminance algorithms use kiye gaye hain. Center circle reticle ke andar face containment verify hota hai. Agar user camera lens par thumb lagata hai ya side me shift hota hai, to <b>🚫 Camera Blocked</b> ya <b>🔴 Face Not in Circle</b> detect hota hai aur -2% points deduct hote hain. Coding ke dauran keyboard par dekh kar type karna explicitly allowed hai.
            </p>

            <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "14px" }}>C. 25-Test FIFO LocalStorage System</h3>
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Candidate bina account banaye instant preparation start kar sake isliye Unique Handle (e.g. <code>@rahul_01</code>) ke sath 25-test FIFO circular history maintain hoti hai with side-by-side comparison tool.
            </p>
          </div>

          {/* SECTION 4: BACKEND & DATABASE */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              ⚙️ 4. Backend & Database Architecture
            </h2>
            <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "14px" }}>A. FastAPI Framework</h3>
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Python ka modern ASGI asynchronous framework use kiya hai jo high concurrency aur automatic Pydantic request validation provide karta hai.
            </p>

            <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "14px" }}>B. SQLite in WAL Mode (Write-Ahead Logging)</h3>
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Lightweight self-contained <code>simulator.db</code> use kiya gaya hai. Multi-threading lock error se bachne ke liye <b>WAL Mode (<code>PRAGMA journal_mode=WAL;</code>)</b> aur <code>timeout=30.0</code> enable kiya gaya hai, jisse concurrent background writes bina database lock ke execute hote hain.
            </p>
          </div>

          {/* SECTION 5: SECURITY & AUTHENTICATION */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              🔒 5. Security & Admin Authentication
            </h2>
            <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#ccc" }}>
              <li><b>PBKDF2-HMAC-SHA256 Encryption:</b> Passwords 16-byte cryptographic random salt aur <b>100,000 hashing iterations</b> ke sath secure rehte hain (GPU brute-force proof).</li>
              <li><b>Role-Based Token Auth:</b> HMAC-SHA256 se signed 7-day Bearer Token (<code>role: "admin"</code>) verify hota hai. Non-admin users ko backend 403 Forbidden return karta hai.</li>
              <li><b>Master Security Key Recovery:</b> Password reset ke liye Master Security Answer (Brother's DOB) configure hai.</li>
              <li><b>100% Read-Only Admin Dashboard:</b> Platform owner ke liye dashboard strictly read-only hai taaki candidate data integrity secure rahe.</li>
            </ul>
          </div>

          {/* SECTION 6: TOP 5 INTERVIEW Q&A */}
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", color: "#64b5f6", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              💡 6. Top Technical Interview Q&A (Hinglish)
            </h2>

            <div style={{ marginBottom: "16px", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
                Q1: LocalStorage aur Database dono kyu use kiye?
              </div>
              <div style={{ color: "#aaa", fontSize: "14px" }}>
                <b>Ans:</b> Candidate ke liye instant speed aur zero-friction experience ke liye LocalStorage me 25-Test FIFO history rakhi gayi hai, jabki platform owner ke global metrics aur aggregated analytics ke liye backend SQLite database sync kiya gaya hai.
              </div>
            </div>

            <div style={{ marginBottom: "16px", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
                Q2: Password hashing ke liye PBKDF2 kyu use kiya?
              </div>
              <div style={{ color: "#aaa", fontSize: "14px" }}>
                <b>Ans:</b> Standard SHA-256 bahut fast hota hai jisse brute force attack ho sakta hai. PBKDF2 100,000 iterations aur random salt ke sath GPU attacks ko completely eliminate kar deta hai.
              </div>
            </div>

            <div style={{ marginBottom: "16px", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
                Q3: SQLite me database lock issue kaise solve kiya?
              </div>
              <div style={{ color: "#aaa", fontSize: "14px" }}>
                <b>Ans:</b> WAL Mode (Write-Ahead Logging) enable karke solve kiya jisme concurrent readers aur writers ek doosre ko block nahi karte.
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
                Q4: WebCam tracking bina heavy TensorFlow library ke kaise kiya?
              </div>
              <div style={{ color: "#aaa", fontSize: "14px" }}>
                <b>Ans:</b> Heavy 60MB library ke bajaye Canvas Optical Center-of-Mass skin ratio heuristic use kiya, jisse CPU usage sirf 2% rehta hai aur page fast load hota hai.
              </div>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}

export default InterviewGuide;

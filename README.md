# 🚀 AI Interview Simulator — Next-Gen AI Technical, Behavioral, RTL & Coding Assessment Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Voice AI](https://img.shields.io/badge/Voice%20AI-Neural%20TTS%20%2B%20STT-FF6F00)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Proctoring](https://img.shields.io/badge/Anti--Cheating-25°%20Gaze%20%26%20Lens%20Proctoring-E91E63)](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
[![Security](https://img.shields.io/badge/Auth-PBKDF2--HMAC--SHA256-4CAF50)](https://docs.python.org/3/library/hashlib.html)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An intelligent, production-grade **AI Interview Simulator** designed to replicate realistic technical, behavioural, coding (DSA), and hardware (Verilog RTL) engineering interviews. 

Featuring **bidirectional human voice interaction**, **real-time webcam gaze & lens-blocking proctoring**, **synthesizable Verilog & live code execution**, **resume name verification**, a **25-Test Candidate Growth Dashboard**, and a **Secure Read-Only Admin Analytics Center**.

---

## 🌟 Core System Highlights

### 1. 🎙️ Ultra-Realistic Human Voice AI (TTS & STT)
- **Natural Conversational Delivery**: Uses high-fidelity Neural and Natural browser voice synthesis with human cadence and pitch calibration:
  - **HR / Behavioral Round**: Professional, warm Female AI voice.
  - **Technical & Mock Rounds**: Articulate, grounded Male AI voice.
  - **Full Interview Simulation**: **Alternating Male & Female interviewer voices** across rounds.
  - **DSA & Hardware RTL Rounds**: Role-specific audio welcome announcements.
- **Speech-to-Text Mic Input (STT)**: Candidates can click **🎙️ Speak Your Answer** to transcribe live speech directly into the response box, with real-time manual editing capabilities.

---

### 2. 🛡️ AI WebCam Gaze, Focus & Lens-Blocking Proctoring
- **Real-Time Video Feed**: Live mirrored camera preview with proctor HUD overlay.
- **Natural Gaze Geometry**:
  - Head turn and gaze allowed within **~25 degrees** left, right, and upward.
  - **Looking down at the keyboard is explicitly allowed** for typing and code writing without penalty.
  - **Lens Blocking Detection**: Real-time optical variance algorithms detect if the camera lens is covered by a thumb, blocked, or pointed away from the user, triggering immediate HUD warnings and focus score deductions.
- **Tab & Window Anti-Cheating**: Multi-tier integrity warnings and penalty (-15% focus points) upon switching tabs.

---

### 3. 🎯 Interview Readiness Assessment & Strategic Diagnostic Verdict
- **Readiness Percentage Gauge**: Dynamic readiness metric (e.g. `You are 80% ready for the interview`, `50%`, `75%`, `90%`).
- **AI Diagnostic Feedback**: Analyzes the ratio of verbal communication vs core technical depth to give precise, actionable feedback:
  - *Example:* *"You have good communication skill but lack of depth in your core topics. Prepare more to increase your chance."*
  - *Recommendation:* *"Focus on revising fundamental branch concepts and practice technical problem explanations."*
- **Strict Anti-Gibberish Zero-Point Enforcement**: Submitting random keyboard mashes or unattempted responses yields **0% score** across all radar skills (Communication, Behavioral, Cultural Fit, Technical Depth).

---

### 4. 📄 Resume Parsing & Name Consistency Verification
- **Smart Resume Parser**: Extracts skills, technologies, and projects from uploaded PDF or TXT resumes.
- **Name Mismatch Protection**: Validates the candidate's typed name against the name detected at the top of the resume. If mismatched, alerts the candidate with a 1-click name synchronization button before starting the interview.

---

### 5. 💻 Role-Based Coding & Verilog RTL Simulation Round
- **Branch & Role Tailored Challenges**:
  - **SWE & IT**: Dynamic Programming, Hash Tables, Two Pointers, Trees & Graphs.
  - **ECE & EV**: Synthesizable **Verilog HDL / SystemVerilog** (D Flip-Flop with Enable/Reset, 4-Bit Up/Down Counter, Sequence Detectors, FSMs).
  - **Data Analyst & MNC**: SQL Queries, Pandas, and Statistical Variance calculations.
  - **Robotics**: Kinematics, PID Controllers, and Path Planning.
- **Live Test Runner & Accurate Evaluation**: Clean starter boilerplates with TODO templates. Submitting empty starter templates yields **0% score** and `UNATTEMPTED` status, preventing false high scores.

---

### 6. 📊 Candidate Performance Dashboard & Test History (25-Test FIFO)
- **Unique Handle Profile System**: Zero forced email logins. Candidates use unique handles (e.g. `@rahul_01`, `@aniket_cse`), preventing any result merging between candidates with the same name.
- **25-Test Circular Retention**: Automatically retains up to **25 historical tests** in browser `localStorage` via FIFO auto-pruning.
- **Visual Score Progression Timeline**: Interactive timeline chart tracing score growth from Test 1 to Test 25.
- **Aggregated Competency Radar**: 6-axis cumulative competency radar across Communication, Technical Depth, Problem Solving, and Proctor Focus.
- **🔀 Side-by-Side Test Comparison Tool**: Select any two tests (e.g. **Test 3 vs Test 12**) to view score delta (`+24% Improvement 🚀`), skill jumps, and resolved vs persistent weaknesses.

---

### 7. 🔒 Secure Read-Only Admin Analytics & Monitoring Portal
- **Enterprise-Grade Security**: PBKDF2-HMAC-SHA256 password hashing with unique 16-byte cryptographic salts (100,000 iterations) and 7-day HMAC-signed Bearer Tokens (`role: "admin"`).
- **Master Security Key Recovery**: Secure password recovery via Master Security Answer (Brother's DOB).
- **100% Read-Only Architecture**: Displays platform telemetry, candidate test distribution, score averages, branch/role breakdowns, and test summaries without destructive edit/delete permissions.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Interview Simulator                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       Frontend (Vite)        │        │       Backend (FastAPI)      │
│  • React 18 & React Router   │◄──────►│  • FastAPI REST APIs         │
│  • Web Speech (TTS & STT)    │        │  • Google Gemini GenAI Engine│
│  • Proctor WebCam HUD        │        │  • PBKDF2 & Token Security   │
│  • LocalStorage 25-Test FIFO │        │  • SQLite DB (WAL Mode)      │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18+ ([Download Node.js](https://nodejs.org/))
- **Python**: v3.9+ ([Download Python](https://www.python.org/))

---

### 1. Clone the Repository
```bash
git clone https://github.com/ardynamics09/AI-Interview-Simulator.git
cd AI-Interview-Simulator
```

---

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be running at `http://localhost:8000`.

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser (Google Chrome or Microsoft Edge recommended for Web Speech & WebCam features).

---

## 🌐 Live Deployment Guide

### Option 1: Deploy Frontend on Vercel (Recommended & 100% Free)
1. Push this repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `AI-Interview-Simulator` GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset: **Vite**.
6. Set Environment Variable: `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com`
7. Click **Deploy**.

---

### Option 2: Deploy Backend (FastAPI) on Render / Railway
1. Go to [Render](https://render.com/) or [Railway](https://railway.app/).
2. Create a new **Web Service** and link your GitHub repository.
3. Set **Root Directory** to `backend`.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set Environment Variables:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `ADMIN_JWT_SECRET` = `ai_simulator_super_secret_admin_key_2026_x99`
7. Copy your live backend URL into your frontend configuration.

---

## 📁 Repository Directory Structure

```
AI-Interview-Simulator/
├── backend/
│   ├── main.py                  # FastAPI application with endpoints
│   ├── admin_routes.py          # Admin authentication & aggregate analytics
│   ├── database.py              # SQLite WAL mode database manager & PBKDF2 hashing
│   ├── requirements.txt         # Python dependencies
│   └── start_backend.bat        # 1-Click Windows backend launcher
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProctorCamera.jsx# WebCam proctoring & 25° gaze/lens tracking
│   │   │   ├── RadarChart.jsx   # Interactive 6-axis SVG competency radar
│   │   │   └── Footer.jsx       # Global footer
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Profile handle setup, role config, resume parser
│   │   │   ├── Interview.jsx    # Spoken voice interview & adaptive follow-ups
│   │   │   ├── DsaRound.jsx     # Live code/Verilog editor & test runner
│   │   │   ├── Result.jsx       # Detailed report, readiness gauge & printable PDF
│   │   │   ├── Dashboard.jsx    # 25-Test FIFO history & comparison tool
│   │   │   ├── AdminLogin.jsx   # Admin authentication & Master Key recovery
│   │   │   └── AdminDashboard.jsx # 100% Read-Only platform analytics
│   │   └── utils/
│   │       ├── codeEvaluator.js # Boilerplate detection & test runner
│   │       ├── interviewAnalytics.js # ML feature extractor & scoring engine
│   │       ├── profileStorage.js# LocalStorage profile & comparison manager
│   │       ├── resumeParser.js  # PDF/TXT skill, project & name extractor
│   │       └── voiceUtils.js    # TTS speech synthesis & STT mic recognition
│   ├── package.json
│   └── vite.config.js
├── INTERVIEW_PROJECT_GUIDE.html # 1-Click Printable PDF Interview Guide (Hinglish)
├── INTERVIEW_PROJECT_GUIDE.md   # Markdown Interview Master Guide
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **Aniket Raj** ([ardynamics09](https://github.com/ardynamics09))

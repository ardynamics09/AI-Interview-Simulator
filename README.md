# AI Interview Simulator

A full-stack, AI-driven assessment platform built to simulate realistic technical, behavioral (HR), coding (DSA), and hardware (Verilog RTL) engineering interviews.

Designed with real-time speech interaction, computer vision proctoring, role-specific code execution, and candidate performance analytics.

---

## Key Features

### 🎙️ Bidirectional Voice Interaction
- **Dual-Voice Interviewers**: Real-time text-to-speech with natural cadence and calibrated acoustics (Female interviewer for Behavioral/HR, Male interviewer for Technical/Mock rounds, alternating voices for Full Mock).
- **Speech Recognition**: Direct voice input transcription with live editing capabilities.
- **Phonetic Clarity**: Built-in phonetic normalization for acronyms (DSA, DBMS, OOP, SQL, RTL, API, etc.) to ensure clear question delivery.

### 🛡️ Real-Time Proctoring & Focus Tracking
- **Center-Reticle Gaze Tracking**: Optical center-of-mass algorithms verify candidate presence within a 25° natural gaze zone.
- **Lens & Obstruction Detection**: Optical variance monitoring detects camera blocking or intentional lens coverage.
- **Keyboard-Safe Calibration**: Looking down to type code or notes is explicitly permitted without false violation penalties.
- **Window & Tab Integrity**: Tracks focus loss and window switches during the interview session.

### 💻 Multi-Track Technical & Hardware Rounds
- **Software & DSA Track**: Dynamic programming, graph algorithms, hash maps, and pointer problems with automated test case evaluation.
- **Hardware & RTL Track (ECE / EV)**: Synthesizable Verilog HDL challenges (FSMs, counters, sequence detectors, flip-flops).
- **Data & Analytics Track**: SQL query challenges, pandas manipulations, and statistical problems.
- **Robotics Track**: Kinematics, PID controllers, and path planning.

### 📊 Performance Analytics & Historical Growth
- **Interview Readiness Score**: Dynamic percentage indicator with diagnostic feedback identifying communication vs. technical depth trade-offs.
- **6-Axis Competency Radar**: Detailed evaluation across Communication, Technical Depth, Problem Solving, Behavioral Alignment, Cultural Fit, and Focus Integrity.
- **25-Test FIFO History**: Profile-based historical test retention with side-by-side test comparisons and growth tracking.

### 🔒 Platform Telemetry & Analytics
- **Secure Control Center**: PBKDF2-HMAC-SHA256 authenticated dashboard for platform usage statistics, role distributions, and performance trends.
- **Session Security**: Automated 15-minute inactivity timeout and token verification.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router, Web Speech API (TTS & STT), HTML5 Canvas |
| **Backend** | FastAPI (Python 3.9+), Uvicorn, Pydantic |
| **Database** | SQLite (WAL Mode for high-concurrency read/write operations) |
| **AI Engine** | Google Gemini Generative AI API |
| **Security** | PBKDF2-HMAC-SHA256 (100k iterations), HMAC Bearer Tokens |

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/ardynamics09/AI-Interview-Simulator.git
cd AI-Interview-Simulator
```

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

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and connect to the backend at `http://localhost:8000`.

---

## Project Structure

```
AI-Interview-Simulator/
├── backend/
│   ├── main.py              # FastAPI application endpoints
│   ├── admin_routes.py      # Admin authentication & analytics
│   ├── database.py          # SQLite database layer & PBKDF2 hashing
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Proctor camera, radar charts, navigation
│   │   ├── pages/           # Home, Interview, DSA Round, Results, Dashboard, Admin
│   │   └── utils/           # Voice synthesis, code evaluator, resume parser, analytics
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Developed by **Aniket Raj** ([@ardynamics09](https://github.com/ardynamics09))

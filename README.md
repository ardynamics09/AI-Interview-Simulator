<div align="center">

# 🤖 AI Interview Simulator

**An Intelligent, Resume-Aware & Adaptive AI Technical Interview Platform**

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Interview Modes](#-interview-modes) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Author](#-author)

</div>

---

## 📖 Overview

**AI Interview Simulator** is a full-stack, realistic interview platform designed to simulate actual technical, HR, and MNC hiring rounds. Powered by **Google Gemini AI**, the system parses a candidate's uploaded resume (PDF/TXT), analyzes their specific projects, skills, academic branch, and target role, and dynamically generates tailored questions with **real-time adaptive follow-ups**.

---

## ✨ Key Features

- 📄 **Resume-Aware Question Generation**: Parses uploaded resumes to extract actual projects (e.g. *AI Interview Simulator*, *Stock Prediction*) and skills (e.g. *Python, FastAPI, React, SQL, ML*) for hyper-relevant questioning.
- ⚡ **Adaptive AI Follow-Ups**: Dynamically analyzes the candidate's submitted responses. When technical decisions, frameworks, or ML models are detected, the AI interviewer probes deeper with context-aware follow-up challenges.
- 🎯 **Full Interview Simulation (6 Rounds • 20 Questions)**:
  - `Round 1: HR & Introduction` (3 Questions)
  - `Round 2: Resume & Projects Deep Dive` (4 Questions)
  - `Round 3: Technical Fundamentals` (5 Questions)
  - `Round 4: Problem Solving & Debugging` (3 Questions)
  - `Round 5: Behavioral & Situational` (3 Questions)
  - `Round 6: Final Role-Specific Strategy` (2 Questions)
- 🛡️ **Anti-Cheating & Integrity Monitoring**: Built-in tab-switch detection with multi-level warnings and auto-submission on violation.
- 🧠 **Dual Engine Architecture (AI + Knowledge Base Fallback)**: If the backend or AI API is offline, an intelligent local question engine automatically steps in—guaranteeing 100% uptime with zero freezes.
- 📱 **Modern Glassmorphism UI**: Responsive design tailored for desktops, tablets, and mobile devices.

---

## 📊 Interview Modes

| Mode | Questions | Resume Required | Purpose & Structure |
| :--- | :---: | :---: | :--- |
| **HR Interview** | 5 | Optional | Warm-up, behavioral, situational, and cultural fit. |
| **Technical Interview** | 5 | Optional | Core branch fundamentals and technical problem solving. |
| **AI Mock Interview** | 10 | **Mandatory** | Structured 7-stage evaluation (HR &rarr; Skills &rarr; Projects &rarr; Branch &rarr; Role &rarr; Problem Solving &rarr; Behavioral). |
| **Full Interview Simulation** | 20 | **Mandatory** | Complete corporate hiring simulation across 6 distinct rounds with live round tracking. |

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js (Vite)** — Fast, component-driven UI
- **Vanilla CSS (Glassmorphism)** — Modern dark aesthetic with smooth micro-interactions
- **Axios** — Fast async API communication
- **React Router Dom** — Seamless SPA route navigation

### **Backend**
- **FastAPI** — High-performance Python async backend
- **Google GenAI SDK** — Powered by Google Gemini 2.5 Flash / 2.0 Flash
- **PyPDF** — Automated PDF resume text extraction
- **Uvicorn** — Lightning-fast ASGI server

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ardynamics09/AI-Interview-Simulator.git
cd AI-Interview-Simulator
```

---

### 2️⃣ Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Gemini API Key
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Start the Backend Server
python main.py
```
*Backend will run at `http://127.0.0.1:8000`*

---

### 3️⃣ Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
*Frontend will run at `http://localhost:5173`*

---

## 📁 Project Structure

```
AI-Interview-Simulator/
├── backend/
│   ├── main.py              # FastAPI server & Gemini integration
│   ├── requirements.txt     # Python dependencies
│   ├── start_backend.bat    # 1-Click backend launcher
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Footer.jsx   # Sleek glassmorphism footer
│   │   ├── data/
│   │   │   └── questions.js # Offline question bank
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Interview setup & resume upload
│   │   │   ├── LoadingScreen.jsx  # 12s AI calibration & strategies
│   │   │   ├── Interview.jsx      # Live interview room with adaptive follow-ups
│   │   │   └── Result.jsx         # Performance summary & review
│   │   ├── utils/
│   │   │   └── resumeParser.js    # Client-side resume analyzer
│   │   ├── App.css          # Core styles & responsive design
│   │   └── App.jsx          # Route declarations
│   └── package.json
├── .gitignore
└── README.md
```

---

## 👨‍💻 Author

**Aniket Raj**

- 🐙 **GitHub**: [@ardynamics09](https://github.com/ardynamics09)
- 💼 **LinkedIn**: [Aniket Raj](https://www.linkedin.com/in/aniket-raj-22b84840b)

---

<div align="center">
  <sub>Built with ❤️ by Aniket Raj • Empowering Candidate Interview Success</sub>
</div>

# 🎓 AI Interview Simulator — Comprehensive Interview Master Guide (Hinglish)
> **Author & Developer:** Aniket Raj  
> **Project:** Full-Stack AI Technical, Behavioral, RTL & Coding Interview Assessment Platform  
> **Tech Stack:** React 18, Vite, FastAPI (Python 3.12), SQLite (WAL Mode), Web Speech API, Google Gemini AI, PBKDF2 Hashing  

---

## 📌 1. Project Introduction (Interviewer ke samne 30-Second Elevator Pitch)

### ❓ Question: *"Tell me about your project AI Interview Simulator. Why did you build it?"*
### 🗣️ Perfect Hinglish Answer:
> *"Sir/Ma'am, maine **AI Interview Simulator** ek production-grade, AI-driven assessment platform ke roop me build kiya hai jo engineering students aur job candidates ko real-world technical, behavioral (HR), coding (DSA), aur hardware (Verilog RTL) interviews ke liye prepare karta hai.*
>
> *Is project me 4 core pillars hain:*
> 1. **Dual-Channel Voice AI**: AI interviewer naturally questions bolta hai (HR round me female voice, Technical round me male voice, aur Full simulation me alternate voices) aur candidate live mic se bol kar ya type karke answer de sakta hai.
> 2. **AI WebCam & Integrity Proctoring**: Computer Vision luminance algorithms se candidate ka 25° gaze angle aur tab-switching track hota hai, jisme low-light / dim room support bhi hai.
> 3. **Live Coding & Hardware RTL Evaluation**: Software engineers ke liye DSA test runner aur ECE/EV engineers ke liye synthesizable **Verilog HDL simulation engine** jo starter code aur actual logic accuracy ko evaluate karta hai.
> 4. **Candidate History & Secure Read-Only Admin Dashboard**: Candidates ke liye 25-Test FIFO LocalStorage dashboard hai, aur platform owner ke liye backend SQLite database aur PBKDF2 encryption se secured ek **Read-Only Admin Analytics Center** hai jisme real-time platform statistics calculate hote hain."*

---

## 🏗️ 2. High-Level Architecture (Frontend + Backend + AI)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AI INTERVIEW SIMULATOR                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     Frontend (React + Vite)     │             │       Backend (FastAPI)         │
│  • React Router DOM             │◄─── REST ──►│  • FastAPI High-Speed Async API │
│  • Web Speech (TTS & STT)       │             │  • Google Gemini GenAI Engine   │
│  • Proctor WebCam HUD (25° Gaze)│             │  • Adaptive Follow-Up Engine    │
│  • Monaco Code & Verilog Editor │             │  • Token Auth & OTP Security    │
│  • 25-Test LocalStorage FIFO    │             │  • SQLite DB (WAL Mode)         │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 💻 3. Frontend Architecture Deep-Dive

### 🔹 A. Voice AI Engine (Text-to-Speech & Speech-to-Text)
- **Kyu use kiya:** Real human interviewer jaisa conversational feel dene ke liye.
- **Implementation:** Browser ki native `window.speechSynthesis` (TTS) aur `webkitSpeechRecognition` (STT) use ki gayi hai, jisse zero external latency aur zero paid API billing hoti hai.
- **Voice Logic:**
  - **HR / Behavioral Round:** Professional Female Voice.
  - **Technical & Mock Round:** Articulate Male Voice.
  - **Full Simulation:** Round-wise **Alternating Male & Female voices** switch hoti hain.
  - **Autoplay Audio Context Unlock:** Browsers user interaction ke bina speech block karte hain, isliye `unlockAudio()` trigger lagaya hai jo first click par audio context activate kar deta hai.

### 🔹 B. AI WebCam Gaze & Proctoring System
- **Kyu use kiya:** Cheating rokne aur candidate ka focus evaluate karne ke liye.
- **Mathematical Geometry:**
  - Standard Center: `(x: 0.5, y: 0.5)`.
  - Allowed turn tolerance: **~25 degrees** (`deltaX > 0.28`).
  - **Typing Safe Mode:** Keyboard par dekh kar type karna (`faceY > 0.60`) explicitly allow hai taaki coding ke waqt false penalty na lage.
  - **Dim-Light Resilience:** Low-light setups ke liye multi-tier skin luminance heuristic (`r > 18, g > 12, b > 8`) aur **3.5s position retention grace period** lagaya gaya hai.
  - **Debounced Penalty:** False alarm se bachne ke liye 5 consecutive violations (~4.0s) ke baad hi -2% points deduct hote hain.

### 🔹 C. 25-Test FIFO LocalStorage System
- **Kyu banaya:** Candidate apna score improvement track kar sake bina account registration ke dar ke.
- **Implementation:** Har candidate ka Unique Handle hota hai (e.g. `@rahul_01`), aur `MAX_HISTORY_LIMIT = 25` rakha gaya hai. 26th test aate hi oldest test auto-prune (FIFO) ho jata hai.

---

## ⚙️ 4. Backend & Database Architecture Deep-Dive

### 🔹 A. FastAPI Framework Kyu Choose Kiya?
- **Kyu choose kiya:** Flask ya Django ke mukable FastAPI Python ka sabse fast, async-ready web framework hai (built on Starlette & Pydantic).
- Automatic OpenAPI/Swagger documentation (`/docs`) provide karta hai aur request validation automatic hoti hai.

### 🔹 B. Database Choice: SQLite in WAL Mode
- **Kyu SQLite choose kiya:** Lightweight, self-contained, zero-configuration file database (`simulator.db`). Isme extra database server (jaise PostgreSQL ya MySQL) deploy karne ki zaroorat nahi padti, jisse project 100% portable rehta hai.
- **WAL Mode (Write-Ahead Logging):** SQLite me default lock issue se bachne ke liye `PRAGMA journal_mode=WAL;` aur `timeout=30.0` lagaya gaya hai. Isse ek hi waqt me multiple reads aur background writes bina locking error ke execute hote hain.
- **Database Tables:**
  1. `users`: Candidate handle, name, branch, year, role, timestamps.
  2. `admin_users`: Owner email, username, salted password hash, role (`admin`).
  3. `interviews`: Complete test telemetry (overall score, duration, radar skills, NLP clarity, proctor focus, DSA/Verilog stats).
  4. `otp_codes`: 6-digit password reset OTPs with 10-minute expiry and single-use flags.

---

## 🔒 5. Security & Admin Authentication Deep-Dive

### 🔹 A. Password Encryption (PBKDF2-HMAC-SHA256)
- **Kyu plain-text nahi store kiya:** Plain-text passwords store karna critical security vulnerability hai.
- **Algorithm:** **PBKDF2 (Password-Based Key Derivation Function 2)** with HMAC-SHA256 and **100,000 hashing iterations**.
- **Cryptographic Salt:** Har password ke sath `secrets.token_hex(16)` se ek unique 16-byte random salt generate hota hai. Isse **Rainbow Table attacks** aur brute-force attacks 100% fail ho jate hain.

### 🔹 B. Role-Based Token Authorization
- Admin login hone par backend HMAC-SHA256 se signed ek **7-day Bearer Token** (`role: "admin"`) issue karta hai.
- Har `/admin/analytics/*` endpoint par `Depends(get_current_admin)` middleware token ko cryptographically verify karta hai.
- Agar koi normal user ya hacker direct `/admin` URL hit karega to backend use direct **`403 Forbidden`** return karega aur frontend candidate portal par redirect kar dega.

### 🔹 C. Admin Read-Only Architecture
- Admin dashboard platform owner ke liye strictly **READ-ONLY** hai (No Edit / No Delete buttons).
- All analytics (Overview cards, User growth, Branch/Role scores, DSA test cases, Proctor rates) real SQLite database se live dynamically aggregate hote hain.

### 🔹 D. OTP Password Recovery Flow
- Agar admin password bhool jata hai, to registered email par **6-digit random cryptographic OTP** generate hota hai jo 10 minutes ke liye valid rehta hai.
- SMTP Dispatcher (`smtplib`) real email dispatch support karta hai, aur security ke liye OTP code frontend screen par bilkul leak nahi hota.

---

## 💡 6. Top 20 Technical Interview Questions & Perfect Answers (Hinglish)

### Q1: *"Aapne client-side storage aur backend database dono kyu use kiye?"*
**Answer:** *"Candidate ke perspective se instant UI speed aur zero login friction ke liye LocalStorage me 25-Test FIFO history rakhi gayi hai. Aur platform owner/admin ke perspective se global analytics, score aggregation, aur cross-device auditing ke liye backend SQLite database me asynchronous background synchronization implement kiya hai."*

---

### Q2: *"Password hashing ke liye PBKDF2 kyu use kiya, MD5 ya simple SHA-256 kyu nahi?"*
**Answer:** *"MD5 aur standard SHA-256 general-purpose hashing functions hain jo cryptographic password storage ke liye bahut fast hain (GPU brute-force vulnerable). PBKDF2 purposefully slow aur computationally heavy hai (100,000 iterations + unique salt), jo dictionary aur rainbow table attacks ko impossible bana deta hai."*

---

### Q3: *"SQLite me 'database is locked' error kyu aata hai aur aapne ise kaise solve kiya?"*
**Answer:** *"SQLite default rollback journal mode me simultaneous write aur read requests par whole-database lock laga deta hai. Humne ise **WAL Mode (`PRAGMA journal_mode=WAL;`)** enable karke solve kiya, jisme readers writers ko block nahi karte aur writers readers ko block nahi karte, sath me `timeout=30.0` lagaya."*

---

### Q4: *"WebCam gaze tracking bina heavy Machine Learning library (jaise TensorFlow.js) ke kaise implement kiya?"*
**Answer:** *"60MB ki heavy TensorFlow library load karne ke bajaye humne **Canvas Optical Center-of-Mass Luminance & Skin Ratio Algorithms** use kiye. Isse page 50x fast load hota hai, CPU usage 2% rehta hai, aur standard 25° head turn aur keyboard typing accurate detect hoti hai."*

---

### Q5: *"DSA aur Verilog evaluation me candidate cheating ya empty starter code kaise handle kiya?"*
**Answer:** *"Pehle starter boilerplate submit karne par bhi full score aa jata tha. Humne **Code Evaluator Engine** build kiya jo submission ko original starter template se compare karta hai. Agar code unmodified hai to 0% score aur `UNATTEMPTED` status mark hota hai."*

---

### Q6: *"FastAPI vs Flask — Aapne FastAPI kyu choose kiya?"*
**Answer:** *"FastAPI Asynchronous Server Gateway Interface (ASGI) based hai jo asynchronous concurrency handle karta hai. Isme Pydantic type-safety, automatic JSON serialization, aur automated Swagger docs milti hain jo modern AI products ke liye standard hain."*

---

## 🎯 7. Conclusion & Project Highlights for Resume
- **Full-Stack Architecture**: React 18, Vite, FastAPI, SQLite WAL.
- **AI Integrations**: Gemini LLM, Web Speech API (TTS/STT), Vision Gaze Tracking.
- **Enterprise Security**: PBKDF2-HMAC-SHA256 salted hashing, Role-Based Access Control (RBAC), OTP recovery.
- **Domain Specialization**: Tailored DSA algorithms for Software Engineers, Synthesizable Verilog HDL for ECE/EV engineers.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
import database
from admin_routes import router as admin_router
import os
import random

# ==============================
# Load Environment Variables
# ==============================

load_dotenv()

# ==============================
# Initialize Google GenAI Client
# ==============================

gemini_client = None
try:
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        gemini_client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Warning: Could not initialize Google GenAI client: {e}")

# ==============================
# FastAPI App
# ==============================

app = FastAPI(
    title="AI Interview Simulator Backend",
    version="4.6"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize SQLite database
database.init_db()

# Mount Admin Routes
app.include_router(admin_router)

# ==============================
# Public Data Sync Endpoints (Sync candidate test records to DB)
# ==============================

class UserProfileSync(BaseModel):
    userId: str
    name: str
    branch: Optional[str] = "CSE"
    year: Optional[str] = "3rd Year"
    role: Optional[str] = "Software Engineer"

class InterviewRecordSync(BaseModel):
    id: Optional[str] = None
    userId: Optional[str] = None
    user_id: Optional[str] = None
    name: Optional[str] = "Candidate"
    branch: Optional[str] = "CSE"
    year: Optional[str] = "3rd Year"
    role: Optional[str] = "Software Engineer"
    interviewType: Optional[str] = "Technical Interview"
    overallScore: Optional[float] = 0.0
    overall_score: Optional[float] = None
    performanceLevel: Optional[str] = "Developing"
    durationMinutes: Optional[int] = 15
    integrityScore: Optional[float] = 100.0
    tabSwitches: Optional[int] = 0
    radarSkills: Optional[List[Any]] = []
    communicationAnalysis: Optional[Dict[str, Any]] = {}
    aiAnalysis: Optional[Dict[str, Any]] = {}
    topicsToRevise: Optional[List[str]] = []
    evaluatedQuestions: Optional[List[Any]] = []
    dsaSummary: Optional[Dict[str, Any]] = {}
    dateIso: Optional[str] = None

@app.post("/api/users/profile")
def sync_user_profile(data: UserProfileSync):
    res = database.upsert_user(data.userId, data.name, data.branch, data.year, data.role)
    return {"success": True, "user": res}

@app.post("/api/interviews/record")
def sync_interview_record(data: InterviewRecordSync):
    test_id = database.insert_interview_record(data.model_dump())
    return {"success": True, "testId": test_id}


# ==============================
# Request Models
# ==============================

class InterviewRequest(BaseModel):
    name: str = "Candidate"
    branch: str = "CSE"
    year: str = "3rd Year"
    role: str = "Software Engineer"
    interviewType: str = "HR Interview"
    resumeText: Optional[str] = ""
    skills: Optional[List[str]] = []
    projects: Optional[List[str]] = []

class FollowUpRequest(BaseModel):
    name: str = "Candidate"
    branch: str = "CSE"
    role: str = "Software Engineer"
    question: str
    answer: str
    category: Optional[str] = "Technical"
    projects: Optional[List[str]] = []
    skills: Optional[List[str]] = []


# ==============================
# Branch Topics
# ==============================

BRANCH_TOPICS = {
    "CSE": [
        "Data Structures and Algorithms", "Object-Oriented Programming", "DBMS & SQL",
        "Operating Systems", "Computer Networks", "System Architecture"
    ],
    "IT": [
        "Data Structures", "Web Development", "REST APIs", "DBMS", "Operating Systems",
        "Cloud Computing", "Network Security"
    ],
    "MNC": [
        "Probability & Statistics", "Linear Algebra", "Data Structures & Algorithms",
        "Machine Learning", "DBMS", "Discrete Mathematics", "Numerical Methods"
    ],
    "CS Design": [
        "UI/UX Design Principles", "Design Systems & Figma", "Frontend Architecture",
        "React & DOM Manipulation", "User Research & Usability Testing", "Responsive Web Design"
    ],
    "ECE": [
        "Digital Electronics", "Microprocessors & Microcontrollers", "Embedded C & RTOS",
        "Signals & Systems", "Communication Protocols (UART, SPI, I2C)", "VLSI & FPGA"
    ],
    "EV": [
        "Battery Management Systems (BMS)", "Electric Powertrain", "Power Electronics",
        "Thermal Management", "Regenerative Braking", "CAN Protocol"
    ],
    "Mechanical": [
        "Thermodynamics", "Fluid Mechanics", "Strength of Materials",
        "CAD & 3D Modeling", "Finite Element Analysis (FEA)", "GD&T and Manufacturing"
    ],
    "Chemical": [
        "Unit Operations", "Heat & Mass Transfer", "Chemical Reaction Engineering",
        "Process Dynamics & Control", "Distillation & Separation Processes"
    ],
    "Petroleum": [
        "Reservoir Engineering", "Drilling Operations & Mud", "Production Engineering",
        "Enhanced Oil Recovery (EOR)", "Well Logging & Formation Evaluation"
    ]
}

# ==============================
# Gemini Prompt Builders
# ==============================

def build_prompt(data: InterviewRequest):
    topics = ", ".join(BRANCH_TOPICS.get(data.branch, ["Core Fundamentals"]))
    skills_str = ", ".join(data.skills) if data.skills else "General technical skills"
    projects_str = ", ".join(data.projects) if data.projects else "Relevant domain projects"
    resume_context = f"\nResume Text Snippet:\n{data.resumeText[:1200]}\n" if data.resumeText else ""

    if data.interviewType == "HR Interview":
        return f"""You are a senior Human Resources Director conducting an HR and behavioral interview.

Candidate Profile:
- Name: {data.name}
- Target Role: {data.role}
- Academic Year: {data.year}
- Academic Branch: {data.branch}

Task:
Generate EXACTLY 5 high-impact HR, behavioral, situational, and cultural fit interview questions.
Focus strictly on:
1. Candidate's introduction, career motivations, and passion for the {data.role} position.
2. Greatest personal and professional strengths and one area of active improvement.
3. Handling work pressure, tight project deadlines, or unexpected roadblocks.
4. Career vision and professional aspirations for the next 3 to 5 years.
5. Why they want this specific role and what makes them an exceptional team player.

DO NOT ask resume-specific technical framework questions or mention unprovided projects.
Output EXACTLY 5 questions, one per line. No numbering, no bullets, no headers.
"""

    elif data.interviewType == "Technical Interview":
        return f"""You are a senior technical interviewer conducting a technical assessment.

Candidate Profile:
- Name: {data.name}
- Branch: {data.branch} (Core Topics: {topics})
- Academic Year: {data.year}
- Target Role: {data.role}

Task:
Generate EXACTLY 5 rigorous technical questions covering core {data.branch} fundamentals, data handling, algorithmic thinking, and {data.role} concepts.

Output EXACTLY 5 questions, one per line. No numbering, no bullets, no headers.
"""

    elif data.interviewType == "AI Mock Interview":
        return f"""You are a senior technical & hiring interviewer conducting a personalized 10-Question AI Mock Interview.

Candidate Profile:
- Name: {data.name}
- Branch: {data.branch} (Topics: {topics})
- Academic Year: {data.year}
- Target Role: {data.role}
- Candidate Skills from Resume: {skills_str}
- Candidate Projects from Resume: {projects_str}
{resume_context}

Generate EXACTLY 10 structured, personalized questions in this exact order:
Q1: Introduction / HR warm-up
Q2-Q3: Resume & Skills (2 Questions probing specific skills mentioned in their resume like {skills_str})
Q4-Q5: Projects (2 Questions deep-diving into the architecture, stack, and challenges of their actual projects like {projects_str})
Q6-Q7: Branch Fundamentals (2 Questions covering core {data.branch} concepts at a {data.year} level)
Q8: Role-specific Knowledge (1 Question specific to being a {data.role})
Q9: Practical Problem Solving (1 Scenario or algorithmic problem)
Q10: Behavioral / Situational (1 Question about handling technical conflicts or tight deadlines)

Output EXACTLY 10 questions, one question per line. No numbering, bullets, labels, or explanatory text.
"""

    elif data.interviewType == "Full Interview Simulation":
        return f"""You are an executive interviewer conducting a comprehensive 20-Question Full Interview Simulation across 6 structured rounds.

Candidate Profile:
- Name: {data.name}
- Branch: {data.branch} (Topics: {topics})
- Academic Year: {data.year}
- Target Role: {data.role}
- Candidate Skills: {skills_str}
- Candidate Projects: {projects_str}
{resume_context}

Generate EXACTLY 20 questions corresponding to these 6 rounds:
[Round 1: HR & Intro - 3 Questions]
[Round 2: Resume & Projects - 4 Questions referencing {projects_str} and {skills_str}]
[Round 3: Technical Fundamentals - 5 Questions covering {data.branch}]
[Round 4: Problem Solving & Debugging - 3 Questions]
[Round 5: Behavioral & Situational - 3 Questions]
[Round 6: Final Role-Specific - 2 Questions for a {data.role}]

Output EXACTLY 20 questions, one per line. No round labels, headers, numbers, bullets, or explanations.
"""

    else:
        return f"""You are an interviewer.
Generate 5 interview questions for {data.name} applying for {data.role} in {data.branch}.
Output one question per line without numbers or bullets.
"""

def build_followup_prompt(data: FollowUpRequest):
    return f"""You are an elite, perceptive technical interviewer conducting an adaptive interview.

Candidate: {data.name} ({data.branch} • Target Role: {data.role})
Current Question: "{data.question}"
Candidate's Given Answer: "{data.answer}"
Category: {data.category}

Task:
Analyze what the candidate wrote.
Pick an interesting technical point, architectural decision, machine learning model, algorithm, tool, or claim from their answer.
Ask ONE sharp, challenging, natural follow-up question.

Rules:
1. Output EXACTLY ONE follow-up question.
2. Do NOT write greetings, prefixes like 'Follow-up:', quotes, or explanations.
3. Keep it direct and conversational.
"""

# ==============================
# Gemini Helper
# ==============================

def ask_gemini(prompt: str):
    if not gemini_client:
        return None

    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for model_name in models:
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"Model {model_name} attempt failed: {e}")
            continue

    return None

# ==============================
# Question Parser
# ==============================

def extract_questions(text: str):
    if not text:
        return []

    questions = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        line = line.lstrip("1234567890.-•*#) ").replace("**", "").strip()
        if len(line) > 10 and not line.lower().startswith("round"):
            questions.append(line)

    return questions

# ==============================
# Dedicated Fallback Generators
# ==============================

def get_hr_fallback(data: InterviewRequest):
    return [
        "Tell me about yourself, your background, and what drives your passion in this field.",
        "What are your greatest strengths and one specific area you are actively working to improve?",
        "Describe a situation where you had to work under tight deadlines or manage conflicting priorities. How did you handle it?",
        "Where do you see yourself in your career 3 to 5 years from now?",
        f"Why are you interested in becoming a {data.role} and what unique value do you bring to our team?"
    ]

def get_technical_fallback(data: InterviewRequest):
    branch_q = {
        "CSE": [
            "What is the difference between a process and a thread in Operating Systems?",
            "Explain the four pillars of Object-Oriented Programming with a practical software example.",
            "What is database normalization and why is 3NF commonly targeted?",
            "Explain the difference between Array and Linked List in terms of search, insertion, and cache locality.",
            "What is the difference between TCP and UDP, and when would you choose one over the other?"
        ],
        "IT": [
            "Explain how JWT authentication works in modern web applications.",
            "What is the difference between SQL indexing and full table scans?",
            "How do RESTful APIs differ from GraphQL in data fetching and bandwidth efficiency?",
            "Explain the concept of microservices architecture versus a monolithic architecture.",
            "What security measures do you implement to protect web applications against Cross-Site Scripting (XSS) and SQL Injection?"
        ],
        "MNC": [
            "What is the difference between correlation and causation in statistical modeling?",
            "Explain the time complexity of Binary Search and mathematically why it is O(log n).",
            "What is the Central Limit Theorem and why is it important in hypothesis testing?",
            "Explain the difference between overfitting and underfitting in Machine Learning models.",
            "How does gradient descent optimize weights in predictive modeling?"
        ],
        "ECE": [
            "What is the difference between a microprocessor and a microcontroller?",
            "Explain the working principle of pulse width modulation (PWM).",
            "Describe the difference between synchronous and asynchronous communication protocols.",
            "What is an interrupt in embedded systems and how does the CPU handle interrupt service routines (ISR)?",
            "Explain the Nyquist-Shannon sampling theorem and its significance in digital signal processing."
        ]
    }

    # Role-specific overrides for high-precision technical questioning
    role_lower = data.role.lower()
    if "robotics" in role_lower:
        return [
            "Explain the working principle of a PID controller in robotic joint position control and how tuning Kp, Ki, and Kd affects overshoot and settling time.",
            "What is the fundamental difference between Forward Kinematics and Inverse Kinematics in a multi-axis robotic arm manipulator?",
            "How does ROS (Robot Operating System) handle inter-node communication using publishers, subscribers, and service calls?",
            "Describe how sensor fusion (e.g. Complementary Filter or Extended Kalman Filter) combines accelerometer and gyroscope data from an IMU.",
            "Explain how Path Planning algorithms like A* or RRT (Rapidly-exploring Random Tree) find collision-free trajectories for mobile robots."
        ]
    elif "vlsi" in role_lower:
        return [
            "Explain the concepts of Setup Time and Hold Time violations in sequential digital circuits and how to fix them.",
            "What is Metastability in digital systems and how do Multi-Flop Synchronizers mitigate Clock Domain Crossing (CDC) issues?",
            "Explain the difference between blocking (=) and non-blocking (<=) assignments in Verilog and their impact on hardware synthesis.",
            "What is Static Timing Analysis (STA) and how does Clock Skew affect maximum operating frequency?",
            "Describe the CMOS inverter voltage transfer characteristic (VTC) and noise margins."
        ]
    elif "embedded" in role_lower:
        return [
            "What is Priority Inversion in an RTOS and how does Priority Inheritance Protocol resolve it?",
            "Explain the working mechanism of an Interrupt Service Routine (ISR) and why blocking functions or delays should never be called inside an ISR.",
            "Compare SPI, I2C, and UART protocols in terms of speed, pin count, master-slave architecture, and clock synchronization.",
            "What is Direct Memory Access (DMA) and how does it offload data transfers from the CPU in embedded systems?",
            "Explain memory layout of a C program in an embedded microcontroller (Text, Data, BSS, Heap, Stack)."
        ]
    elif "battery" in role_lower or "ev" in role_lower:
        return [
            "How does a Battery Management System (BMS) estimate State of Charge (SoC) using Coulomb Counting and Kalman Filtering?",
            "Explain the difference between Passive Cell Balancing and Active Cell Balancing in Lithium-ion battery packs.",
            "What mechanisms prevent thermal runaway in high-voltage electric vehicle battery packs?",
            "Explain the role of the CAN Bus protocol in powertrain electronic control units (ECUs).",
            "How does a 3-Phase Inverter use Pulse Width Modulation (PWM) to control traction motor torque and speed?"
        ]

    return branch_q.get(data.branch, [
        f"Can you explain the core fundamentals and design principles in {data.branch}?",
        f"What are the most important technical skills needed for a {data.role}?",
        "Describe a challenging technical problem you solved and your step-by-step approach.",
        f"How do you approach debugging and optimizing performance in {data.role}?",
        "What data structure would you choose for frequent search operations and why?"
    ])

def get_ai_mock_fallback(data: InterviewRequest):
    skills = data.skills if data.skills and len(data.skills) > 0 else ["Python", "FastAPI", "React", "SQL"]
    projects = data.projects if data.projects and len(data.projects) > 0 else ["AI Interview Simulator", "Stock Prediction Model"]
    
    p1 = projects[0] if len(projects) > 0 else "AI Interview Simulator"
    p2 = projects[1] if len(projects) > 1 else p1
    s1 = skills[0] if len(skills) > 0 else "Python"
    s2 = skills[1] if len(skills) > 1 else "React"

    branch_q = {
        "MNC": [
            "What is the difference between correlation and causation in statistical modeling?",
            "Explain the time complexity of Binary Search and mathematically why it is O(log n)."
        ],
        "CSE": [
            "What is the difference between a process and a thread in Operating Systems?",
            "Explain the four pillars of Object-Oriented Programming with a practical software example."
        ]
    }
    b_questions = branch_q.get(data.branch, [
        f"Explain the core fundamentals and design principles in {data.branch}.",
        f"What data structure would you choose for frequent search operations and why?"
    ])

    role_q = f"How would you design a scalable architecture for a high-traffic {data.role} service?"

    return [
        "Tell me about yourself and briefly walk me through your technical background.",
        f"You have mentioned {s1} and {s2} in your resume. Can you explain how you applied them in your practical projects?",
        f"Why did you choose {s1} for your recent implementation instead of alternative technologies?",
        f"Can you explain the high-level architecture of your {p1} and how components communicate?",
        f"What was the most challenging technical roadblock you encountered while developing {p2}, and how did you resolve it?",
        b_questions[0],
        b_questions[1],
        role_q,
        "Given an array of integers, how would you find the longest consecutive sequence in O(n) time? Explain your approach.",
        "Tell me about a time when something went wrong in one of your projects or a teammate disagreed with your approach. How did you handle it?"
    ]

def get_full_interview_fallback(data: InterviewRequest):
    skills = data.skills if data.skills and len(data.skills) > 0 else ["Python", "FastAPI", "React", "SQL"]
    projects = data.projects if data.projects and len(data.projects) > 0 else ["AI Interview Simulator", "Stock Prediction Model"]

    p1 = projects[0] if len(projects) > 0 else "AI Interview Simulator"
    p2 = projects[1] if len(projects) > 1 else p1
    s1 = skills[0] if len(skills) > 0 else "Python"
    s2 = skills[1] if len(skills) > 1 else "FastAPI"

    return [
        # Round 1: HR & Intro (3 Qs)
        "Tell me about yourself and what led you to pursue engineering and your current field.",
        f"Why are you interested in becoming a {data.role} at this stage of your career?",
        "What are your top two technical strengths and one specific technical area you are actively improving?",

        # Round 2: Resume & Projects (4 Qs)
        f"Walk me through your {p1} project and the problem it was designed to solve.",
        f"Why did you select {s1} and {s2} as the core technology stack for your project?",
        f"Explain one major technical challenge or bug you faced while building {p1} and how you fixed it.",
        f"In your {p2} project, what metrics or validation steps did you use to evaluate performance?",

        # Round 3: Technical Fundamentals (5 Qs)
        "Explain the difference between method overloading and method overriding with an example.",
        "What is normalization in relational databases and why is 3NF commonly targeted?",
        "How do processes and threads differ in memory allocation and execution context?",
        "Explain the difference between Array and Linked List in terms of search, insertion, and cache locality.",
        "What is the difference between TCP and UDP, and when would you choose one over the other?",

        # Round 4: Problem Solving & Debugging (3 Qs)
        "Given an array of integers, describe an optimal O(n) algorithm to find the longest consecutive elements sequence.",
        "Your backend API suddenly begins throwing intermittent 500 Internal Server Errors under traffic. Walk me through your step-by-step debugging procedure.",
        "An application scales to 100,000 active users and response times degrade significantly. What system bottlenecks would you inspect first?",

        # Round 5: Behavioral & Situational (3 Qs)
        "Tell me about a time you faced a critical roadblock in a project right before a deadline. How did you resolve it?",
        "What would you do if a team member or senior engineer strongly disagreed with your technical proposal?",
        "How do you balance writing clean, maintainable code versus shipping features rapidly when under pressure?",

        # Round 6: Final Role-Specific (2 Qs)
        f"How would you design a scalable, fault-tolerant backend system for a real-time {data.role} platform?",
        f"If a key production metric drops unexpectedly by 20%, what framework would you use to diagnose the root cause and present a solution?"
    ]

def get_adaptive_followup_fallback(data: FollowUpRequest):
    ans_lower = data.answer.lower()
    
    if "random forest" in ans_lower:
        return "Why did you choose Random Forest instead of Linear Regression or XGBoost for your dataset?"
    if "neural network" in ans_lower or "deep learning" in ans_lower or "cnn" in ans_lower:
        return "How did you prevent overfitting during training, and what regularization techniques did you use?"
    if "fastapi" in ans_lower:
        return "Why did you choose FastAPI over Flask or Django, and how did you handle async event loops?"
    if "react" in ans_lower:
        return "How did you handle component re-rendering and state management efficiency in React?"
    if "sql" in ans_lower or "database" in ans_lower or "query" in ans_lower:
        return "What indexing strategy did you use in your database to ensure fast query response times under high read loads?"
    if "jwt" in ans_lower or "auth" in ans_lower:
        return "How did you handle token expiration and secure storage on the client side?"
    if "docker" in ans_lower or "cloud" in ans_lower or "deploy" in ans_lower:
        return "How do you manage container orchestration and environment variable security in production?"
    if "array" in ans_lower or "hashmap" in ans_lower or "time complexity" in ans_lower:
        return "What are the trade-offs of this approach in terms of auxiliary space complexity?"
    
    return "You mentioned key design choices in your response. What alternative approaches did you consider before settling on this solution?"

# ==============================
# Routes
# ==============================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI Interview Simulator Engine",
        "version": "4.6",
        "features": ["Adaptive AI Follow-ups", "Resume Aware", "Multi-Round Simulation"]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "gemini_configured": bool(gemini_client)}

@app.post("/generate-questions")
def generate_questions(data: InterviewRequest):
    target_count = 5
    if data.interviewType == "AI Mock Interview":
        target_count = 10
    elif data.interviewType == "Full Interview Simulation":
        target_count = 20

    gemini_text = None
    if gemini_client:
        try:
            prompt = build_prompt(data)
            gemini_text = ask_gemini(prompt)
        except Exception as e:
            print(f"Gemini API error: {e}")

    questions = []
    if gemini_text:
        questions = extract_questions(gemini_text)

    min_required = 8 if target_count == 10 else (16 if target_count == 20 else 4)
    if len(questions) < min_required:
        if data.interviewType == "AI Mock Interview":
            questions = get_ai_mock_fallback(data)
        elif data.interviewType == "Full Interview Simulation":
            questions = get_full_interview_fallback(data)
        elif data.interviewType == "HR Interview":
            questions = get_hr_fallback(data)
        else:
            questions = get_technical_fallback(data)

    questions = questions[:target_count]
    return {
        "success": True,
        "questions": questions,
        "totalQuestions": len(questions),
        "interviewType": data.interviewType,
        "source": "gemini_ai" if gemini_text else "knowledge_engine"
    }

@app.post("/generate-followup")
def generate_followup(data: FollowUpRequest):
    if len(data.answer.strip()) < 15 or data.answer.strip() == "SKIPPED":
        return {"hasFollowUp": False, "followUpQuestion": None}

    gemini_followup = None
    if gemini_client:
        try:
            prompt = build_followup_prompt(data)
            gemini_response = ask_gemini(prompt)
            if gemini_response:
                lines = [l.strip().lstrip("1234567890.-*#) \"").rstrip("\"") for l in gemini_response.split("\n") if l.strip()]
                if len(lines) > 0 and len(lines[0]) > 10:
                    gemini_followup = lines[0]
        except Exception as e:
            print(f"Gemini follow-up error: {e}")

    final_followup = gemini_followup if gemini_followup else get_adaptive_followup_fallback(data)

    return {
        "hasFollowUp": True,
        "followUpQuestion": final_followup,
        "source": "gemini_ai" if gemini_followup else "adaptive_rule_engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

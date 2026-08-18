from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
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
    version="4.5"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Request Models
# ==============================

class InterviewRequest(BaseModel):
    name: str = "Candidate"
    branch: str = "CSE"
    year: str = "3rd Year"
    role: str = "Software Engineer"
    interviewType: str = "AI Mock Interview"
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

    if data.interviewType == "AI Mock Interview":
        return f"""You are a senior technical & hiring interviewer conducting a highly personalized 10-Question AI Mock Interview.

Candidate Profile:
- Name: {data.name}
- Branch: {data.branch} (Topics: {topics})
- Academic Year: {data.year}
- Target Role: {data.role}
- Candidate Skills from Resume: {skills_str}
- Candidate Projects from Resume: {projects_str}
{resume_context}

Generate EXACTLY 10 structured, personalized questions in this exact order:
Q1: Introduction / HR warm-up (e.g. Tell me about yourself and briefly walk me through your technical background)
Q2-Q3: Resume & Skills (2 Questions probing specific skills mentioned in their resume like {skills_str} and how they applied them)
Q4-Q5: Projects (2 Questions deep-diving into the architecture, tech stack, tradeoffs, and challenges of their actual projects like {projects_str})
Q6-Q7: Branch Fundamentals (2 Questions covering core {data.branch} concepts at a {data.year} level)
Q8: Role-specific Knowledge (1 Question specific to being a {data.role})
Q9: Practical Problem Solving (1 Scenario or algorithmic problem e.g. data structures / debugging / system behavior)
Q10: Behavioral / Situational (1 Question about handling technical conflicts, tight deadlines, or project roadblocks)

Rules:
1. Generate EXACTLY 10 questions.
2. Incorporate candidate's actual projects and skills into questions 2, 3, 4, and 5.
3. Only output the questions, one question per line.
4. No numbering, bullets, labels, or explanatory text.
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
Q1-Q3: Personal introduction, passion for {data.role}, technical strengths & areas of growth.

[Round 2: Resume & Projects - 4 Questions]
Q4-Q7: Deep dive into candidate's actual projects ({projects_str}) and technical skills ({skills_str}), covering architecture, tech choices, Gemini/API integration hurdles, and scalability.

[Round 3: Technical Fundamentals - 5 Questions]
Q8-Q12: Core {data.branch} fundamentals and {data.role} technical questions tailored to a {data.year} student.

[Round 4: Problem Solving & Debugging - 3 Questions]
Q13-Q15: Practical coding approach, production debugging (e.g. API 500 errors), and performance optimization bottlenecks under load.

[Round 5: Behavioral & Situational - 3 Questions]
Q16-Q18: Project roadblocks, team technical disagreements, and managing tight release deadlines.

[Round 6: Final Role-Specific - 2 Questions]
Q19-Q20: Advanced high-level architecture / business metrics for a {data.role}.

Rules:
1. Output EXACTLY 20 questions, one per line.
2. No round labels, headers, numbers, bullets, or explanations in the response.
3. Ensure questions directly reference the candidate's actual projects ({projects_str}) and skills ({skills_str}).
"""

    elif data.interviewType == "HR Interview":
        return f"""You are a senior HR director.
Candidate Name: {data.name} | Branch: {data.branch} | Year: {data.year} | Target Role: {data.role}

Generate EXACTLY 5 HR & behavioral interview questions matching a {data.year} student.
Rules:
- One question per line.
- No numbering or bullets.
- No answers or explanations.
"""

    else:
        return f"""You are a senior technical interviewer.
Candidate Name: {data.name} | Branch: {data.branch} | Year: {data.year} | Target Role: {data.role}
Topics: {topics}

Generate EXACTLY 5 technical interview questions for a {data.year} student.
Rules:
- One question per line.
- No numbering or bullets.
- No answers or explanations.
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
Examples:
- If they mentioned Random Forest: "Why did you choose Random Forest instead of Linear Regression or XGBoost for this dataset?"
- If they mentioned FastAPI/React: "How did you manage asynchronous request handling and state updates under high traffic?"
- If they gave an algorithmic approach: "What is the space complexity of that approach and how would you optimize it if memory was constrained?"

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
# Intelligent Fallback Generators
# ==============================

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
        ],
        "IT": [
            "Explain how JWT authentication works in modern web applications.",
            "What is the difference between SQL indexing and full table scans?"
        ]
    }
    b_questions = branch_q.get(data.branch, [
        f"Explain the core fundamentals and design principles in {data.branch}.",
        f"What data structure would you choose for frequent search operations and why?"
    ])

    role_q = f"How would you design a scalable architecture for a high-traffic {data.role} service?"
    if "data" in data.role.lower():
        role_q = "You receive a dataset containing missing values and duplicate records. How would you clean and validate it before analysis?"
    elif "frontend" in data.role.lower() or "design" in data.role.lower():
        role_q = "How do you optimize frontend rendering performance and reduce layout shifts?"

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
    
    # Contextual generic follow-up
    return f"You mentioned key design choices in your response. What alternative approaches did you consider before settling on this solution?"

# ==============================
# Routes
# ==============================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI Interview Simulator Engine",
        "version": "4.5",
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
        else:
            questions = get_ai_mock_fallback(data)[:target_count]

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
    print("\n==========================================")
    print("NEW ADAPTIVE FOLLOW-UP REQUEST")
    print(f"Candidate: {data.name} | Question: {data.question[:50]}...")
    print(f"Answer: {data.answer[:80]}...")
    print("==========================================")

    # If answer is too short or skipped, no follow up
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

    print(f"Follow-up Generated: {final_followup}")
    return {
        "hasFollowUp": True,
        "followUpQuestion": final_followup,
        "source": "gemini_ai" if gemini_followup else "adaptive_rule_engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

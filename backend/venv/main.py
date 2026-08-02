from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os
import time

# ==============================
# Load Environment Variables
# ==============================

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ==============================
# FastAPI App
# ==============================

app = FastAPI(
    title="AI Interview Simulator",
    version="3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Request Model
# ==============================

class InterviewRequest(BaseModel):
    branch: str
    year: str
    role: str
    interviewType: str


# ==============================
# Branch Topics
# ==============================

BRANCH_TOPICS = {

    "CSE": [
        "C Programming",
        "C++",
        "Java",
        "Python",
        "DSA",
        "OOPS",
        "DBMS",
        "Operating System",
        "Computer Networks",
        "SQL"
    ],

    "IT": [
        "C++",
        "Python",
        "DSA",
        "DBMS",
        "Operating System",
        "Computer Networks",
        "SQL",
        "Web Development"
    ],

    "MNC": [
        "C++",
        "Python",
        "DSA",
        "Probability",
        "Statistics",
        "Linear Algebra",
        "Machine Learning",
        "SQL",
        "DBMS"
    ],

    "CS Design": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "UI",
        "UX",
        "Figma"
    ],

    "ECE": [
        "Digital Electronics",
        "Analog Electronics",
        "Signals and Systems",
        "Communication",
        "Microprocessor",
        "Embedded Systems"
    ],

    "EV": [
        "Battery Technology",
        "Electric Machines",
        "Power Electronics",
        "Embedded Systems"
    ],

    "Mechanical": [
        "Thermodynamics",
        "Fluid Mechanics",
        "Strength of Materials",
        "Manufacturing",
        "CAD"
    ],

    "Chemical": [
        "Mass Transfer",
        "Heat Transfer",
        "Reaction Engineering",
        "Process Control"
    ],

    "Petroleum": [
        "Reservoir Engineering",
        "Production Engineering",
        "Drilling",
        "Well Logging",
        "Petroleum Geology"
    ]
}


# ==============================
# Difficulty Level
# ==============================

def get_difficulty(year):

    if year == "1st Year":
        return """
Difficulty : Beginner

Ask only very basic questions.

Questions should come from:

- Basics
- First year subjects
- Introductory Programming

Do NOT ask placement level questions.
"""

    elif year == "2nd Year":
        return """
Difficulty : Easy to Medium

Ask conceptual questions.

Avoid advanced interview questions.

Focus on college syllabus.
"""

    elif year == "3rd Year":
        return """
Difficulty : Medium

Ask placement preparation level questions.

Questions should be suitable for internships
and campus placements.

Avoid expert level questions.
"""

    else:

        return """
Difficulty : Medium to Hard

Ask final year placement level questions.

Mix conceptual and practical questions.

Avoid industry expert level questions.
"""


# ==============================
# Build Prompt
# ==============================

def build_prompt(data):

    topics = ", ".join(
        BRANCH_TOPICS.get(data.branch, [])
    )

    difficulty = get_difficulty(data.year)

    if data.interviewType == "HR Interview":

        return f"""
You are a senior HR interviewer.

Candidate:

Branch : {data.branch}

Year : {data.year}

Target Role : {data.role}

Generate exactly FIVE HR interview questions.

The questions should match
the maturity of a {data.year} college student.

Rules:

- Friendly
- Placement level
- No stress interview
- No explanation
- No answers
- One question per line
"""

    return f"""
You are a senior technical interviewer.

Candidate Details

Branch : {data.branch}

Year : {data.year}

Role : {data.role}

Topics :

{topics}

{difficulty}

Generate EXACTLY FIVE technical interview questions.

Rules:

1. Questions should match the student's year.

2. Questions should be based on the listed topics.

3. Questions should match the target role.

4. Do NOT ask industry expert questions.

5. Do NOT ask research level questions.

6. Ask placement/interview level questions.

7. Only questions.

8. One question per line.

9. No numbering.

10. No explanation.
"""

# ==============================
# Gemini Helper
# ==============================

def ask_gemini(prompt):

    retries = 3

    for attempt in range(retries):

        try:

            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt
            )

            return response.text

        except Exception as e:

            print(f"\nAttempt {attempt + 1} Failed")
            print(e)

            if attempt < retries - 1:
                time.sleep(2)

    return None


# ==============================
# Parse Questions
# ==============================

def extract_questions(text):

    if text is None:
        return []

    questions = []

    for line in text.split("\n"):

        line = line.strip()

        if not line:
            continue

        line = line.lstrip(
            "1234567890.-•) "
        ).strip()

        if len(line) > 5:
            questions.append(line)

    return questions


# ==============================
# Home Route
# ==============================

@app.get("/")
def home():

    return {

        "status": "Backend Working",

        "version": "3.0"

    }


# ==============================
# Test Gemini
# ==============================

@app.get("/test-gemini")
def test_gemini():

    prompt = """
Generate five easy interview questions for a
3rd Year CSE student.

Only questions.

One question per line.
"""

    result = ask_gemini(prompt)

    if result is None:

        return {

            "error": "Gemini is busy."

        }

    return {

        "questions": extract_questions(result)

    }

# ==============================
# Generate Interview Questions
# ==============================

@app.post("/generate-questions")
def generate_questions(data: InterviewRequest):

    try:

        prompt = build_prompt(data)

        print("\n==========================================")
        print("NEW INTERVIEW REQUEST")
        print("------------------------------------------")
        print(f"Branch         : {data.branch}")
        print(f"Year           : {data.year}")
        print(f"Role           : {data.role}")
        print(f"Interview Type : {data.interviewType}")
        print("==========================================\n")

        gemini_response = ask_gemini(prompt)

        if gemini_response is None:

            return {
                "success": False,
                "message": "Gemini is currently busy. Please try again.",
                "questions": []
            }

        print("========== GEMINI RESPONSE ==========\n")
        print(gemini_response)
        print("\n=====================================\n")

        questions = extract_questions(gemini_response)

        if len(questions) == 0:

            return {
                "success": False,
                "message": "No questions generated.",
                "questions": []
            }

        if len(questions) > 5:
            questions = questions[:5]

        print("Questions Sent To Frontend :")
        print(questions)

        return {

            "success": True,

            "questions": questions,

            "totalQuestions": len(questions)

        }

    except Exception as e:

        print("\n========== BACKEND ERROR ==========")
        print(str(e))
        print("===================================\n")

        return {

            "success": False,

            "message": str(e),

            "questions": []

        }
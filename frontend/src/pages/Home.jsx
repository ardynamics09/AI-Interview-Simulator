import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";

function Home() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [resumeOption, setResumeOption] = useState("no");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleOptions = {
    CSE: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "AI Engineer",
      "ML Engineer",
      "Data Scientist"
    ],

    IT: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "AI Engineer",
      "ML Engineer"
    ],

    MNC: [
      "Software Engineer",
      "Data Scientist",
      "ML Engineer",
      "AI Engineer",
      "Quant Developer",
      "Quant Analyst"
    ],

    "CS Design": [
      "UI/UX Designer",
      "Product Designer",
      "Frontend Developer"
    ],

    ECE: [
      "Embedded Engineer",
      "Firmware Engineer",
      "VLSI Engineer",
      "Electronics Engineer"
    ],

    EV: [
      "EV Engineer",
      "Battery Engineer",
      "Embedded Engineer"
    ],

    Mechanical: [
      "Design Engineer",
      "CAD Engineer",
      "Production Engineer"
    ],

    Chemical: [
      "Process Engineer",
      "Plant Engineer",
      "Safety Engineer"
    ],

    Petroleum: [
      "Reservoir Engineer",
      "Production Engineer",
      "Drilling Engineer"
    ]
  };

    const handleStartInterview = () => {
  if (
    !name ||
    !branch ||
    !year ||
    !role ||
    !interviewType
  ) {
    setError("Please fill all required fields.");
    return;
  }

  // 🔒 Coming Soon Features
  if (
    interviewType === "AI Mock Interview" ||
    interviewType === "Full Interview Simulation"
  ) {
    alert(
      "This feature is coming soon and will be available after Gemini AI integration."
    );
    return;
  }

  setError("");

  if (loading) return;

  setLoading(true);

  navigate("/loading", {
    state: {
      name,
      branch,
      year,
      role,
      interviewType
    }
  });
};

  return (
    <div className="page">
      <div className="card">

        <h1>WELCOME TO AI INTERVIEW SIMULATOR</h1>

        <p className="subtitle">
          Practice interviews and get AI-powered feedback.
        </p>

        {/* NAME */}

        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value.toUpperCase())
          }
          style={{
            fontSize: "18px",
            padding: "12px 14px",
            borderRadius: "8px",
            width: "100%"
          }}
        />

        {/* BRANCH */}

        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setRole("");
          }}
        >
          <option value="">
            Select Your Branch
          </option>

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

        {/* YEAR */}

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">
            Select Current Year
          </option>

          <option>1st Year</option>
          <option>2nd Year</option>
          <option>3rd Year</option>
          <option>4th Year</option>
        </select>

        {/* ROLE */}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">
            Select Target Role
          </option>

          {branch &&
            roleOptions[branch]?.map((item, index) => (
              <option
                key={index}
                value={item}
              >
                {item}
              </option>
            ))}
        </select>

        {/* INTERVIEW TYPE */}

        <select
          value={interviewType}
          onChange={(e) =>
            setInterviewType(e.target.value)
          }
        >
          <option value="">
            Select Interview Type 
          </option>

          <option value="HR Interview">
            HR Interview
          </option>

          <option value="Technical Interview">
            Technical Interview
          </option>

          <option value="AI Mock Interview">
            AI Mock Interview
          </option>

          <option value="Full Interview Simulation">
            Full Interview Simulation
          </option>
        </select>

        {/* RESUME */}

        <div className="resume-section">
          <h3>Resume (Optional)</h3>

          <label>
            <input
              type="radio"
              name="resume"
              value="no"
              checked={resumeOption === "no"}
              onChange={() =>
                setResumeOption("no")
              }
            />
            No Resume
          </label>

          <label>
            <input
              type="radio"
              name="resume"
              value="upload"
              checked={resumeOption === "upload"}
              onChange={() =>
                setResumeOption("upload")
              }
            />
            Upload Resume
          </label>

          {resumeOption === "upload" && (
            <input
              type="file"
              accept=".pdf"
            />
          )}
        </div>

        {/* ERROR */}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {/* BUTTON */}

        <button
          className="start-btn"
          onClick={handleStartInterview}
          disabled={loading}
        >
          {loading ? "Opening AI Engine..." : "Start Interview"}

        </button>

      </div>
    </div>
  );
}

export default Home;
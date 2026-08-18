import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractResumeText, analyzeResumeData } from "../utils/resumeParser";
import Footer from "../components/Footer";
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
  const [resumeFile, setResumeFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);

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

  const handleInterviewTypeChange = (type) => {
    setInterviewType(type);
    setError("");

    // Automatically prompt for resume upload if AI Mock or Full Interview
    if (type === "AI Mock Interview" || type === "Full Interview Simulation") {
      setResumeOption("upload");
    }
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setResumeFile(null);
      setParsedData(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".txt")) {
      setError("Please upload a PDF or TXT resume only.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume size must be less than 5 MB.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }

    setError("");
    setResumeFile(file);
    setIsParsingResume(true);

    try {
      const rawText = await extractResumeText(file);
      const analyzed = analyzeResumeData(rawText, name);
      setParsedData(analyzed);
      console.log("Parsed Resume Info:", analyzed);
    } catch (err) {
      console.warn("Resume parsing issue:", err);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleStartInterview = () => {
    if (!name || !branch || !year || !role || !interviewType) {
      setError("Please fill all required fields.");
      return;
    }

    const isResumeRequired =
      interviewType === "AI Mock Interview" ||
      interviewType === "Full Interview Simulation";

    if (isResumeRequired && (!resumeFile || resumeOption === "no")) {
      setError("Please upload your resume to continue this interview.");
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
        interviewType,
        resumeName: resumeFile?.name || null,
        resumeText: parsedData?.rawText || "",
        skills: parsedData?.skills || [],
        projects: parsedData?.projects || []
      }
    });
  };

  const isResumeRequired =
    interviewType === "AI Mock Interview" ||
    interviewType === "Full Interview Simulation";

  return (
    <div className="page">
      <div className="card">
        <h1>WELCOME TO AI INTERVIEW SIMULATOR</h1>

        <p className="subtitle">
          Practice interviews with AI-generated, personalized questions and deep project evaluation.
        </p>

        {/* NAME */}
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
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
          <option value="">Select Your Branch</option>
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
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Current Year</option>
          <option>1st Year</option>
          <option>2nd Year</option>
          <option>3rd Year</option>
          <option>4th Year</option>
        </select>

        {/* ROLE */}
        <select
          value={role}
          disabled={!branch}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Target Role</option>
          {branch &&
            roleOptions[branch]?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
        </select>

        {/* INTERVIEW TYPE */}
        <select
          value={interviewType}
          onChange={(e) => handleInterviewTypeChange(e.target.value)}
        >
          <option value="">Select Interview Type</option>
          <option value="HR Interview">HR Interview (5 Questions)</option>
          <option value="Technical Interview">Technical Interview (5 Questions)</option>
          <option value="AI Mock Interview">AI Mock Interview (10 Questions • Resume Aware 🤖)</option>
          <option value="Full Interview Simulation">Full Interview Simulation (20 Questions • 6 Rounds 🎯)</option>
        </select>

        {/* RESUME SECTION */}
        <div
          className="resume-section"
          style={{
            border: isResumeRequired ? "1px solid rgba(255, 75, 75, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
            background: isResumeRequired ? "rgba(255, 75, 75, 0.04)" : "rgba(255, 255, 255, 0.02)",
            borderRadius: "10px",
            padding: "16px",
            marginTop: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>
              Resume{" "}
              {isResumeRequired ? (
                <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>(Required ⚠️)</span>
              ) : (
                <span style={{ color: "#888", fontWeight: "normal" }}>(Optional)</span>
              )}
            </h3>
            {isResumeRequired && (
              <span style={{ fontSize: "12px", color: "#ff7875", background: "rgba(255, 77, 79, 0.15)", padding: "3px 8px", borderRadius: "12px" }}>
                Mandatory for {interviewType}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
            {!isResumeRequired && (
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="resume"
                  value="no"
                  checked={resumeOption === "no"}
                  onChange={() => {
                    setResumeOption("no");
                    setResumeFile(null);
                    setParsedData(null);
                  }}
                />
                No Resume
              </label>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input
                type="radio"
                name="resume"
                value="upload"
                checked={resumeOption === "upload"}
                onChange={() => setResumeOption("upload")}
              />
              Upload Resume
            </label>
          </div>

          {resumeOption === "upload" && (
            <div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleResumeFileChange}
                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.3)", borderRadius: "6px" }}
              />

              {isParsingResume && (
                <p style={{ marginTop: "8px", color: "#64b5f6", fontSize: "13px" }}>
                  ⏳ Analyzing resume skills and projects...
                </p>
              )}

              {resumeFile && !isParsingResume && (
                <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(76, 175, 80, 0.12)", borderRadius: "6px", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                  <p style={{ margin: 0, color: "#4CAF50", fontSize: "14px", fontWeight: "600" }}>
                    ✅ {resumeFile.name}
                  </p>
                  {parsedData && parsedData.skills.length > 0 && (
                    <p style={{ margin: "4px 0 0 0", color: "#a5d6a7", fontSize: "12px" }}>
                      Detected Skills: {parsedData.skills.slice(0, 5).join(", ")}
                      {parsedData.projects.length > 0 && ` • Projects: ${parsedData.projects.join(", ")}`}
                    </p>
                  )}
                </div>
              )}

              <p style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
                Accepted format: PDF or TXT • Maximum size: 5 MB
              </p>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <p
            className="error"
            style={{
              color: "#ff4d4f",
              fontWeight: "600",
              marginTop: "14px",
              background: "rgba(255, 77, 79, 0.1)",
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 77, 79, 0.3)"
            }}
          >
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          className="start-btn"
          onClick={handleStartInterview}
          disabled={loading || isParsingResume}
          style={{ marginTop: "18px" }}
        >
          {loading ? "Preparing Interview..." : "Start Interview 🚀"}
        </button>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;
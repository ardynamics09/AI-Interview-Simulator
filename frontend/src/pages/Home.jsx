import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { extractResumeText, analyzeResumeData, extractCandidateNameFromResume, validateCandidateNameWithResume } from "../utils/resumeParser";
import { TECH_BRANCHES } from "../data/dsaProblems";
import {
  getProfile,
  saveProfile,
  getActiveUser,
  setActiveUser,
  generateSuggestedUserIds,
  getAllProfiles,
  MAX_HISTORY_LIMIT
} from "../utils/profileStorage";

function Home() {
  const navigate = useNavigate();

  // Profile & Unique ID state
  const [userId, setUserId] = useState("");
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState([]);

  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [resumeOption, setResumeOption] = useState("no");
  const [resumeFile, setResumeFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [resumeExtractedName, setResumeExtractedName] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isTechBranch = TECH_BRANCHES.includes(branch);

  // Load last active user profile on mount
  useEffect(() => {
    const lastActiveId = getActiveUser();
    if (lastActiveId) {
      const prof = getProfile(lastActiveId);
      if (prof) {
        setUserId(prof.userId);
        setName(prof.name || "");
        setBranch(prof.branch || "");
        setYear(prof.year || "");
        setRole(prof.role || "");
        setIsExistingProfile(true);
      }
    }
  }, []);

  // Update handle suggestions when name or branch changes
  useEffect(() => {
    if (name.trim().length >= 2) {
      const suggestions = generateSuggestedUserIds(name, branch || "tech");
      setSuggestedIds(suggestions);
    } else {
      setSuggestedIds([]);
    }
  }, [name, branch]);

  // Handle User ID / Handle input change
  const handleUserIdChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUserId(clean);

    if (!clean) {
      setIsExistingProfile(false);
      return;
    }

    const existingProfile = getProfile(clean);
    if (existingProfile) {
      setIsExistingProfile(true);
      setName(existingProfile.name || "");
      if (existingProfile.branch) setBranch(existingProfile.branch);
      if (existingProfile.year) setYear(existingProfile.year);
      if (existingProfile.role) setRole(existingProfile.role);
    } else {
      setIsExistingProfile(false);
    }
  };

  const selectSuggestedId = (suggestedId) => {
    handleUserIdChange(suggestedId);
  };

  const roleOptions = {
    CSE: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Data Analyst",
      "Data Scientist",
      "AI / ML Engineer",
      "Cloud / DevOps Engineer",
      "Cybersecurity Analyst"
    ],
    IT: [
      "Software Engineer",
      "Web Developer",
      "Cloud / DevOps Engineer",
      "Network Engineer",
      "Database Administrator",
      "IT Consultant",
      "Information Security Analyst"
    ],
    MNC: [
      "Data Analyst",
      "Data Scientist",
      "Quantitative Analyst",
      "Financial Engineer",
      "Software Development Engineer",
      "Business Intelligence Analyst",
      "Operations Research Analyst"
    ],
    "CS Design": [
      "UI/UX Designer",
      "Product Designer",
      "Design Systems Engineer",
      "Frontend UX Developer",
      "Interaction Designer",
      "Design Technologist",
      "AR / VR Experience Designer"
    ],
    ECE: [
      "Embedded Systems Engineer",
      "VLSI Design Engineer",
      "IoT Solutions Architect",
      "Robotics Engineer",
      "Hardware Design Engineer",
      "Telecom Network Engineer"
    ],
    EV: [
      "Battery Management Systems Engineer",
      "EV Powertrain Engineer",
      "Power Electronics Engineer",
      "Thermal Systems Engineer",
      "Vehicle Integration Engineer",
      "Automotive Embedded Engineer"
    ],
    Mechanical: [
      "Mechanical Design Engineer",
      "CAD / CAM Engineer",
      "Automotive Engineer",
      "Thermal Systems Engineer",
      "Manufacturing Engineer",
      "Robotics Engineer"
    ],
    Chemical: [
      "Process Engineer",
      "Plant Operations Engineer",
      "Quality Control Specialist",
      "Petrochemical Engineer",
      "Environmental Safety Engineer",
      "Process Safety Specialist"
    ],
    Petroleum: [
      "Petroleum Production Engineer",
      "Reservoir Engineer",
      "Drilling Operations Engineer",
      "Well Logging Specialist",
      "Offshore Operations Engineer",
      "Energy Resource Analyst"
    ]
  };

  const handleBranchChange = (value) => {
    setBranch(value);
    setRole("");
  };

  const handleInterviewTypeChange = (type) => {
    setInterviewType(type);
    if (type === "AI Mock Interview" || type === "Full Interview Simulation") {
      setResumeOption("yes");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "txt"].includes(ext)) {
      setError("Please upload a PDF or TXT resume file.");
      return;
    }

    setError("");
    setResumeFile(file);
    setIsParsingResume(true);

    try {
      const rawText = await extractResumeText(file);
      const analyzed = analyzeResumeData(rawText, name);
      const detectedName = extractCandidateNameFromResume(rawText);
      setParsedData(analyzed);
      setResumeExtractedName(detectedName);
    } catch (err) {
      console.warn("Resume parsing issue:", err);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleStartInterview = () => {
    if (!name.trim() || !branch || !year || !role || !interviewType) {
      setError("Please fill all required fields before proceeding.");
      return;
    }

    // Auto-generate userId if left empty
    let effectiveUserId = userId.trim().toLowerCase();
    if (!effectiveUserId) {
      effectiveUserId = (name.toLowerCase().replace(/[^a-z0-9]/g, "") || "candidate") + "_" + (branch.toLowerCase() || "cse");
      setUserId(effectiveUserId);
    }

    // Save/Update candidate profile in localStorage
    saveProfile({
      userId: effectiveUserId,
      name,
      branch,
      year,
      role
    });

    const isResumeRequired =
      interviewType === "AI Mock Interview" ||
      interviewType === "Full Interview Simulation";

    // Strict validation: If resume option is selected OR required, resume file must be present
    if (resumeOption === "yes" && !resumeFile) {
      setError("You have not uploaded your resume yet. Please upload your resume to continue.");
      return;
    }

    if (isResumeRequired && (!resumeFile || resumeOption === "no")) {
      setError("You have not uploaded your resume yet. Please upload your resume to continue.");
      return;
    }

    setError("");
    if (loading) return;
    setLoading(true);

// Strict Resume Name Consistency Validation
    if ((resumeOption === "yes" || isResumeRequired) && resumeFile && parsedData?.rawText) {
      const nameCheck = validateCandidateNameWithResume(name, parsedData.rawText, resumeExtractedName);
      if (!nameCheck.isMatch && nameCheck.resumeName) {
        setError(`Sorry, but your name ("${name}") does not match with your resume ("${nameCheck.resumeName}"). Please correct your name as per your resume to continue.`);
        return;
      }
    }

    // Direct routing for DSA Coding Round
    if (interviewType === "DSA Coding Round") {
      navigate("/dsa", {
        state: {
          userId: effectiveUserId,
          name,
          branch,
          year,
          role,
          interviewType,
          skills: parsedData?.skills || [],
          projects: parsedData?.projects || []
        }
      });
      return;
    }

    navigate("/loading", {
      state: {
        userId: effectiveUserId,
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

  const handleNameChange = (val) => {
    const words = val.split(" ");
    const formatted = words.map((w) => {
      if (w.length === 0) return "";
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
    setName(formatted);
  };

  return (
    <div className="page" style={{ padding: "20px 10px", minHeight: "100vh" }}>
      
      {/* TOP SHORTCUT HEADER (CANDIDATE DASHBOARD & ADMIN PORTAL) */}
      <div style={{ maxWidth: "560px", width: "100%", margin: "0 auto 16px auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/dashboard", { state: { userId: userId || getActiveUser() } })}
          style={{
            background: "rgba(33, 150, 243, 0.15)",
            border: "1px solid rgba(33, 150, 243, 0.4)",
            color: "#64b5f6",
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)"
          }}
        >
          <span>📊</span>
          <span>Performance Dashboard ({MAX_HISTORY_LIMIT} Tests)</span>
        </button>

        <button
          onClick={() => navigate("/admin/login")}
          style={{
            background: "rgba(156, 39, 176, 0.15)",
            border: "1px solid rgba(156, 39, 176, 0.4)",
            color: "#ce93d8",
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(156, 39, 176, 0.15)"
          }}
        >
          <span>🛡️</span>
          <span>Admin Portal</span>
        </button>
      </div>

      <div className="card" style={{ maxWidth: "560px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>AI INTERVIEW SIMULATOR</h1>

        <p className="subtitle" style={{ fontSize: "14px", marginBottom: "20px" }}>
          Practice interviews with voice AI, proctor gaze tracking, code execution, and persistent candidate analytics.
        </p>

        {/* CANDIDATE UNIQUE HANDLE / ID SECTION */}
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Candidate Unique ID / Handle
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "14px", color: "#888", fontSize: "16px", fontWeight: "bold" }}>
              @
            </span>
            <input
              type="text"
              placeholder="e.g. rahul_01, aniket_cse (keeps results separate & auto-loads profile)"
              value={userId}
              onChange={(e) => handleUserIdChange(e.target.value)}
              style={{
                fontSize: "15px",
                padding: "14px 14px 14px 34px",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(0,0,0,0.4)",
                color: "#fff",
                border: isExistingProfile ? "1.5px solid #00e676" : "1px solid rgba(255,255,255,0.15)",
                outline: "none"
              }}
            />
          </div>

          {/* STATUS NOTIFICATION & SUGGESTIONS */}
          {userId && (
            <div style={{ marginTop: "6px", fontSize: "12px" }}>
              {isExistingProfile ? (
                <span style={{ color: "#00e676", fontWeight: "600" }}>
                  ✅ Welcome back! Profile preferences auto-loaded.
                </span>
              ) : (
                <span style={{ color: "#64b5f6" }}>
                  ✨ New candidate profile will be created for <b>@{userId}</b>.
                </span>
              )}
            </div>
          )}

          {/* AUTO-SUGGESTIONS PILLS */}
          {!isExistingProfile && suggestedIds.length > 0 && (
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#888" }}>Suggestions:</span>
              {suggestedIds.map((sId) => (
                <button
                  key={sId}
                  type="button"
                  onClick={() => selectSuggestedId(sId)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#90caf9",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  @{sId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FULL NAME INPUT */}
        <div style={{ marginBottom: "14px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Candidate Full Name
          </label>
          <input
            type="text"
            className="name-input"
            placeholder="Enter Your Full Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            autoComplete="name"
            style={{
              fontSize: "15px",
              padding: "14px",
              borderRadius: "10px",
              width: "100%",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* BRANCH */}
        <div style={{ marginBottom: "14px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Engineering Branch
          </label>
          <select
            value={branch}
            onChange={(e) => handleBranchChange(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", fontSize: "14px" }}
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
        </div>

        {/* YEAR */}
        <div style={{ marginBottom: "14px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Current Academic Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="">Select Current Year</option>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>
        </div>

        {/* TARGET ROLE */}
        <div style={{ marginBottom: "14px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Target Job Role
          </label>
          <select
            value={role}
            disabled={!branch}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="">Select Target Role</option>
            {branch &&
              roleOptions[branch]?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
          </select>
        </div>

        {/* INTERVIEW TYPE */}
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ fontSize: "12px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            Interview Assessment Format
          </label>
          <select
            value={interviewType}
            onChange={(e) => handleInterviewTypeChange(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="">Select Interview Type</option>
            <option value="HR Interview">HR Interview (5 Questions • Female AI Voice)</option>
            <option value="Technical Interview">Technical Interview (5 Questions • Male AI Voice)</option>
            <option value="AI Mock Interview">AI Mock Interview (10 Questions • Resume Aware 🤖)</option>
            <option value="Full Interview Simulation">Full Interview Simulation (20 Questions • 6 Rounds • Adaptive Follow-ups 🎯)</option>
            {isTechBranch && (
              <option value="DSA Coding Round">
                {branch === "ECE" || branch === "EV"
                  ? "⚡ Verilog RTL & Verification Round (VLSI / Embedded 🔌)"
                  : "💻 DSA Coding Round (Role-Based Assessment 🔥)"}
              </option>
            )}
          </select>
        </div>

        {/* RESUME UPLOAD SECTION */}
        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <label style={{ fontSize: "13px", color: "#ccc", display: "block", marginBottom: "8px" }}>
            Do you want to upload a resume? {isResumeRequired && <span style={{ color: "#ff9800", fontWeight: "bold" }}>(Required for this round)</span>}
          </label>

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => setResumeOption("yes")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: resumeOption === "yes" ? "1.5px solid #2196f3" : "1px solid rgba(255,255,255,0.15)",
                background: resumeOption === "yes" ? "rgba(33, 150, 243, 0.2)" : "rgba(0,0,0,0.3)",
                color: resumeOption === "yes" ? "#64b5f6" : "#aaa",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px"
              }}
            >
              📄 Upload Resume
            </button>

            <button
              type="button"
              onClick={() => {
                if (isResumeRequired) {
                  setError("Resume upload is required for " + interviewType + ".");
                  return;
                }
                setResumeOption("no");
                setResumeFile(null);
                setParsedData(null);
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: resumeOption === "no" ? "1.5px solid #666" : "1px solid rgba(255,255,255,0.1)",
                background: resumeOption === "no" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.3)",
                color: resumeOption === "no" ? "#fff" : "#777",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              Skip Resume
            </button>
          </div>

          {resumeOption === "yes" && (
            <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.2)" }}>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                style={{ color: "#ccc", fontSize: "13px" }}
              />
              {isParsingResume && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#64b5f6" }}>
                  ⏳ Parsing resume text and technical skills...
                </div>
              )}
              {parsedData && (
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#00e676" }}>
                  ✓ Resume parsed! Detected {parsedData.skills?.length || 0} skills and {parsedData.projects?.length || 0} projects.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ERROR WARNING BANNER */}
        {error && (
          <div
            style={{
              background: "rgba(255, 77, 79, 0.2)",
              border: "1.5px solid #ff4d4f",
              borderRadius: "8px",
              padding: "12px",
              color: "#ff7875",
              fontWeight: "bold",
              fontSize: "13px",
              marginBottom: "18px",
              textAlign: "left"
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* START BUTTON */}
        <button
          className="start-btn"
          onClick={handleStartInterview}
          disabled={loading || isParsingResume}
          style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: "bold" }}
        >
          {loading ? "Initializing Interview Environment..." : "Start Interview Simulation 🚀"}
        </button>

      </div>

      <Footer />
    </div>
  );
}

export default Home;

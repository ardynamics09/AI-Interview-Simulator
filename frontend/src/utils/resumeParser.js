/**
 * Resume Parser Utility
 * Extracts text, detected skills, and detected projects from uploaded resumes.
 */

// Popular technical skills dictionary for fast, high-accuracy matching
const SKILL_KEYWORDS = [
  "Python", "C++", "C", "Java", "JavaScript", "TypeScript", "HTML", "CSS", "SQL",
  "React", "React.js", "Node.js", "Express", "FastAPI", "Flask", "Django",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch",
  "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Matplotlib", "Seaborn",
  "Git", "GitHub", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "Figma", "Tailwind CSS", "Bootstrap", "Redux", "GraphQL", "REST API",
  "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks",
  "Embedded C", "Microcontrollers", "Arduino", "Raspberry Pi", "RTOS", "Verilog", "VLSI",
  "AutoCAD", "SolidWorks", "CATIA", "Ansys", "MATLAB", "Simulink"
];

/**
 * Extract raw text from a File (supports text files and PDF byte scanning / reading)
 */
export async function extractResumeText(file) {
  if (!file) return "";

  return new Promise((resolve) => {
    const reader = new FileReader();

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = () => resolve("");
      reader.readAsText(file);
      return;
    }

    // For PDF files, extract visible ASCII / Unicode text strings from binary stream
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const uint8Array = new Uint8Array(buffer);
        let text = "";
        
        // Quick readable character extraction from PDF stream
        for (let i = 0; i < uint8Array.length; i++) {
          const charCode = uint8Array[i];
          // Keep readable ascii and newlines
          if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
            text += String.fromCharCode(charCode);
          } else if (text.length > 0 && text[text.length - 1] !== " ") {
            text += " ";
          }
        }

        // Clean up PDF markers and repetitive whitespace
        const cleaned = text
          .replace(/stream[\s\S]*?endstream/g, "")
          .replace(/obj[\s\S]*?endobj/g, "")
          .replace(/xref[\s\S]*?trailer/g, "")
          .replace(/%PDF-[\d.]+/g, "")
          .replace(/\s+/g, " ")
          .trim();

        // If binary stream extraction yielded good text, return it
        if (cleaned.length > 50) {
          resolve(cleaned);
        } else {
          // Fallback: use filename and basic hints
          resolve(`Resume file: ${file.name}`);
        }
      } catch (err) {
        console.warn("Resume text extraction fallback:", err);
        resolve(`Resume file: ${file.name}`);
      }
    };

    reader.onerror = () => resolve(`Resume file: ${file.name}`);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse skills and projects from resume text
 */
export function analyzeResumeData(rawText, candidateName = "") {
  if (!rawText) {
    return {
      skills: ["Data Structures", "Algorithms", "Problem Solving", "Web Development"],
      projects: ["AI Interview Simulator", "Smart Web Application"],
      rawText: ""
    };
  }

  const detectedSkills = [];
  const textLower = rawText.toLowerCase();

  // 1. Detect Skills
  SKILL_KEYWORDS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(rawText)) {
      if (!detectedSkills.includes(skill)) {
        detectedSkills.push(skill);
      }
    }
  });

  // 2. Detect Projects
  const detectedProjects = [];
  
  // Look for project title patterns
  const projectPatterns = [
    /(?:project[s]?\s*[:\-]\s*|\b(?:built|developed|created|implemented)\s+)([A-Z][A-Za-z0-9\s]{3,35})/gi,
    /(?:title\s*[:\-]\s*)([A-Z][A-Za-z0-9\s]{3,30})/gi,
    /([A-Z][A-Za-z0-9\s]{3,25}(?:Simulator|Prediction|Predictor|Analyzer|System|Portal|App|Application|Platform|Bot|Engine|Detection|Classifier|Dashboard))/g
  ];

  projectPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(rawText)) !== null) {
      const proj = match[1] ? match[1].trim() : match[0].trim();
      if (
        proj.length > 3 &&
        proj.length < 40 &&
        !detectedProjects.includes(proj) &&
        !SKILL_KEYWORDS.some(s => s.toLowerCase() === proj.toLowerCase())
      ) {
        detectedProjects.push(proj);
      }
    }
  });

  // Fallback defaults if resume is brief
  const finalSkills = detectedSkills.length > 0 
    ? detectedSkills.slice(0, 8)
    : ["Python", "JavaScript", "SQL", "React", "FastAPI"];

  const finalProjects = detectedProjects.length > 0
    ? detectedProjects.slice(0, 3)
    : ["AI Interview Simulator", "Stock Prediction Model", "Student Performance Analyzer"];

  return {
    skills: finalSkills,
    projects: finalProjects,
    rawText: rawText.slice(0, 3000) // bounded text
  };
}

/**
 * Extract Candidate Name from Resume Text
 */
export function extractCandidateNameFromResume(rawText) {
  if (!rawText || rawText.trim().length === 0) return null;

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const noisePattern = /^(curriculum\s+vitae|resume|cv|biodata|contact|email|phone|address|education|skills|experience|summary|profile|about\s+me)/i;

  for (let i = 0; i < Math.min(12, lines.length); i++) {
    const line = lines[i];
    if (noisePattern.test(line)) continue;
    if (line.includes("@") || line.includes("http") || line.includes("www.") || /\d{5,}/.test(line)) continue;

    const namePrefixMatch = line.match(/(?:name|candidate\s*name)\s*[:\-]\s*([A-Za-z\s]{2,30})/i);
    if (namePrefixMatch && namePrefixMatch[1]) {
      const clean = namePrefixMatch[1].trim();
      if (clean.split(/\s+/).length <= 4) return clean;
    }

    const words = line.split(/\s+/).filter(w => /^[A-Za-z.]+$/.test(w));
    if (words.length >= 1 && words.length <= 4 && line.length <= 35) {
      const candidateStr = words.join(" ");
      if (!/^(software\s+engineer|web\s+developer|student|b\.?tech|computer\s+science|fresher)/i.test(candidateStr)) {
        return candidateStr;
      }
    }
  }

  return null;
}

/**
 * Validates if the entered name matches the name found in the resume
 */
export function validateCandidateNameWithResume(enteredName, rawResumeText, extractedResumeName) {
  if (!enteredName || !rawResumeText) {
    return { isMatch: true, resumeName: null, warningMessage: "" };
  }

  const resumeName = extractedResumeName || extractCandidateNameFromResume(rawResumeText);
  if (!resumeName) {
    return { isMatch: true, resumeName: null, warningMessage: "" };
  }

  const enteredTokens = enteredName.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const resumeTokens = resumeName.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const rawLower = rawResumeText.toLowerCase();

  const tokenOverlap = enteredTokens.some(token => token.length >= 2 && resumeTokens.some(rt => rt.includes(token) || token.includes(rt)));
  const topText = rawLower.slice(0, 800);
  const existsInTopResume = enteredTokens.some(token => token.length >= 2 && topText.includes(token));

  if (tokenOverlap || existsInTopResume) {
    return {
      isMatch: true,
      resumeName,
      warningMessage: ""
    };
  }

  return {
    isMatch: false,
    resumeName,
    warningMessage: `Sorry, but your name does not match with your resume ("${resumeName}"). Please correct your name as per your resume to continue.`
  };
}

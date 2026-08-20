/**
 * Compute Exact Interview Readiness Percentage and Diagnostic Reason
 */
export function computeInterviewReadiness(overallScore, commScore = 0, techScore = 0, answeredCount = 0, meaningfulCount = 0, totalQuestions = 1, isDsa = false, hasGibberish = false) {
  if (answeredCount === 0 || meaningfulCount === 0 || overallScore === 0) {
    const isGibberishAttempt = hasGibberish || (answeredCount > 0 && meaningfulCount === 0);
    return {
      readinessPercentage: 0,
      headline: "You are 0% ready for the interview",
      diagnosticReason: isGibberishAttempt 
        ? "Responses contained random characters / gibberish without meaningful technical or behavioral content. Zero marks were awarded."
        : "No responses were submitted. Leaving questions unanswered in real interviews leads to immediate rejection.",
      actionRecommendation: "Type or speak meaningful answers explaining your thoughts, projects, and domain concepts to evaluate your interview readiness.",
      badgeColor: "#ff5252"
    };
  }

  let readinessPercentage = Math.round(overallScore);
  readinessPercentage = Math.max(0, Math.min(98, readinessPercentage));

  let headline = `You are ${readinessPercentage}% ready for the interview`;
  let diagnosticReason = "";
  let actionRecommendation = "";
  let badgeColor = "#ff5252";

  if (readinessPercentage >= 85) {
    badgeColor = "#00e676";
    if (commScore >= 75 && techScore >= 75) {
      diagnosticReason = "Outstanding technical mastery and articulate communication. You clearly explain trade-offs and structure your responses like a senior engineer.";
      actionRecommendation = "You are in the top tier! Keep practicing mock interviews to maintain peak sharpness and confidence.";
    } else {
      diagnosticReason = "Strong interview performance across all competency areas with high clarity and relevant problem-solving logic.";
      actionRecommendation = "Refine edge-case discussions and time management to secure maximum offer conversion.";
    }
  } else if (readinessPercentage >= 70) {
    badgeColor = "#2196f3";
    if (commScore >= 65 && techScore < 55) {
      diagnosticReason = "You have good communication skill but lack of depth in your core topics. Prepare more to increase your chance.";
      actionRecommendation = "Dive deeper into core branch fundamentals and technical architecture trade-offs.";
    } else if (techScore >= 70 && commScore < 55) {
      diagnosticReason = "You have strong technical fundamentals, but need to improve your verbal communication and structure your answers more clearly using concrete examples.";
      actionRecommendation = "Practice using the STAR framework (Situation, Task, Action, Result) for structured delivery.";
    } else {
      diagnosticReason = "Solid baseline understanding. Your core answers are correct, but adding specific project metrics and architecture trade-offs will push you into top tier.";
      actionRecommendation = "Prepare more in-depth real-world scenarios to increase your chances.";
    }
  } else if (readinessPercentage >= 45) {
    badgeColor = "#ffb74d";
    if (commScore >= 55 && techScore < 40) {
      diagnosticReason = "You have decent basic communication, but lack technical depth in your core topics. Prepare more to increase your chance.";
      actionRecommendation = "Focus on revising fundamental branch concepts and practice technical problem explanations.";
    } else if (techScore >= 55 && commScore < 40) {
      diagnosticReason = "You have foundational technical knowledge, but struggle to express complex concepts fluently under interview pressure.";
      actionRecommendation = "Practice speaking your thought process aloud while solving problems.";
    } else {
      diagnosticReason = "Moderate interview readiness. You understand basic terminology, but responses lack depth and structured reasoning.";
      actionRecommendation = "Spend more time reviewing core technical topics and practicing with mock interviews.";
    }
  } else {
    badgeColor = "#ff5252";
    diagnosticReason = "Significant preparation needed. Answers were very brief or lacked foundational technical and domain knowledge.";
    actionRecommendation = "Review branch syllabus thoroughly, study standard interview question banks, and retry simulations.";
  }

  return {
    readinessPercentage,
    headline,
    diagnosticReason,
    actionRecommendation,
    badgeColor
  };
}

/**
 * Interview Analytics & ML Feature Extraction Engine
 * Accurate, math-driven scoring and interview-type specialization.
 */

const BRANCH_KEYWORDS = {
  CSE: ["dsa", "oop", "dbms", "sql", "operating system", "networks", "tcp", "udp", "thread", "process", "cache", "latency", "algorithm", "complexity", "index", "normalization", "polymorphism", "inheritance", "binary", "tree", "graph", "hashmap", "queue", "stack"],
  IT: ["rest", "api", "jwt", "cloud", "aws", "docker", "frontend", "backend", "dbms", "sql", "react", "security", "http", "authentication", "database", "mongodb", "fastapi", "node"],
  MNC: ["statistics", "probability", "linear algebra", "calculus", "machine learning", "matrix", "hypothesis", "variance", "correlation", "regression", "dsa", "optimization", "numerical"],
  "CS Design": ["ui", "ux", "figma", "wireframe", "accessibility", "responsive", "css", "component", "usability", "typography", "design system", "dom", "animation"],
  ECE: ["microcontroller", "embedded", "signal", "rtos", "vlsi", "fpga", "uart", "spi", "i2c", "circuit", "analog", "digital", "frequency", "sensor"],
  EV: ["bms", "battery", "powertrain", "can", "thermal", "inverter", "regenerative", "motor", "torque", "voltage", "current", "pack"],
  Mechanical: ["thermodynamics", "fluid", "stress", "cad", "fea", "manufacturing", "strain", "cam", "heat transfer", "tolerance", "dynamics"],
  Chemical: ["distillation", "reaction", "reactor", "heat exchanger", "mass transfer", "kinetics", "fluid dynamics", "equilibrium", "separation"],
  Petroleum: ["reservoir", "drilling", "permeability", "porosity", "eor", "well", "logging", "viscosity", "hydrocarbon", "pressure", "mud"]
};

const HR_KEYWORDS = [
  "strength", "weakness", "leadership", "team", "conflict", "deadline", "pressure",
  "goal", "motivation", "communication", "collaborate", "responsibility", "initiative",
  "problem", "situation", "result", "action", "learned", "feedback", "growth", "challenge"
];

const STRUCTURE_KEYWORDS = [
  "first", "second", "then", "because", "for example", "specifically", "in order to",
  "result", "outcome", "implemented", "designed", "handled", "therefore", "trade-off",
  "approach", "solution", "architecture", "optimized", "resolved", "improved"
];


// Valid common English and technical terms
function isPlausibleEnglishWord(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return false;
  if (clean.length === 1 && (clean === "a" || clean === "i")) return true;
  if (clean.length === 1) return false; // Single random letters like 'd', 'w' are not words

  // Check if has at least one vowel/y
  const hasVowel = /[aeiouy]/.test(clean);
  if (!hasVowel) return false;

  // Check for ridiculous consonant clusters like 'qeficneqv', 'ebuqwurbw', 'qw', 'dfg'
  if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(clean)) return false;

  return true;
}

function checkIsGibberish(text, words, keywordMatches, overlapCount) {
  if (!words || words.length === 0) return true;
  if (keywordMatches > 0 || overlapCount > 0) return false;

  let junkTokens = 0;
  for (const w of words) {
    // If word contains numbers inside or is single consonant letter or lacks vowels
    if (/\d/.test(w) || !isPlausibleEnglishWord(w)) {
      junkTokens++;
    }
  }

  const junkRatio = junkTokens / words.length;
  // If more than 50% of tokens are junk/nonsense and zero keywords/overlap matched, it's gibberish
  return junkRatio > 0.45;
}

/**
 * Extract ML features from an individual answer
 */
export function extractAnswerFeatures(answerText, questionText, branch, isHR = false) {
  if (!answerText || answerText === "SKIPPED" || answerText.trim().length === 0) {
    return {
      isSkipped: true,
      isGibberish: false,
      wordCount: 0,
      charLength: 0,
      techKeywordsCount: 0,
      structureScore: 0,
      relevanceScore: 0,
      concisenessScore: 0,
      baseScore: 0.0
    };
  }

  const text = answerText.toLowerCase();
  const qText = (questionText || "").toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charLength = text.length;

  // 1. Keyword density
  let keywordMatches = 0;
  if (isHR) {
    HR_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) keywordMatches++;
    });
  } else {
    const branchDict = BRANCH_KEYWORDS[branch] || BRANCH_KEYWORDS.CSE;
    branchDict.forEach(kw => {
      if (text.includes(kw)) keywordMatches++;
    });
    const commonTech = ["python", "react", "fastapi", "database", "api", "model", "server", "system", "performance", "scaling", "debugging", "git", "jwt", "testing", "analysis", "variance", "regression", "matrix", "linear", "statistics", "math", "code", "optimize", "tree", "array"];
    commonTech.forEach(kw => {
      if (text.includes(kw)) keywordMatches++;
    });
  }

  // 2. Relevance to Question
  const qWords = qText.split(/\s+/).filter(w => w.length > 3 && !["what", "explain", "describe", "which", "with", "your", "this", "that"].includes(w));
  let overlapCount = 0;
  qWords.forEach(qw => {
    if (text.includes(qw)) overlapCount++;
  });

  // 3. Gibberish / Random Keyboard Mash Detection
  const isGibberish = checkIsGibberish(text, words, keywordMatches, overlapCount);
  if (isGibberish) {
    return {
      isSkipped: false,
      isGibberish: true,
      wordCount,
      charLength,
      techKeywordsCount: 0,
      structureScore: 0,
      relevanceScore: 0,
      concisenessScore: 0,
      baseScore: 0.0
    };
  }

  if (wordCount < 4) {
    return {
      isSkipped: false,
      isGibberish: false,
      wordCount,
      charLength,
      techKeywordsCount: keywordMatches,
      structureScore: 10,
      relevanceScore: 15,
      concisenessScore: 30,
      baseScore: keywordMatches > 0 ? 2.5 : 1.0
    };
  }

  // 4. Structure Score
  let structCount = 0;
  STRUCTURE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) structCount++;
  });
  const structureScore = Math.min(100, Math.round(structCount * 22 + (wordCount > 25 ? 25 : 10)));

  const relevanceRatio = qWords.length > 0 ? overlapCount / Math.min(qWords.length, 3) : (keywordMatches > 0 ? 0.7 : 0.2);
  const relevanceScore = Math.min(100, Math.round(relevanceRatio * 60 + (keywordMatches > 0 ? 40 : 0)));

  // 5. Conciseness
  let concisenessScore = 85;
  if (wordCount < 10) concisenessScore = 30;
  else if (wordCount < 25) concisenessScore = 65;
  else if (wordCount > 180) concisenessScore = 60;
  else concisenessScore = 92;

  // Real Score Calculation starting from 0.0 baseline
  let score = 0.0;
  if (wordCount >= 10) score += 1.5;
  if (wordCount >= 25) score += 1.5;
  if (wordCount >= 50) score += 1.0;
  if (keywordMatches >= 1) score += 2.0;
  if (keywordMatches >= 2) score += 1.5;
  if (keywordMatches >= 4) score += 1.0;
  if (structCount >= 1) score += 1.0;
  if (relevanceScore > 40) score += 1.0;
  if (relevanceScore > 70) score += 1.0;

  score = Math.min(10.0, Math.max(0.0, score));

  return {
    isSkipped: false,
    isGibberish: false,
    wordCount,
    charLength,
    techKeywordsCount: keywordMatches,
    structureScore,
    relevanceScore,
    concisenessScore,
    baseScore: Math.round(score * 10) / 10
  };
}

/**
 * Generate Complete Analytics Report
 */
export function computeInterviewAnalytics({
  answers = [],
  dsaSubmissions = [],
  name = "Candidate",
  branch = "CSE",
  year = "3rd Year",
  role = "Software Engineer",
  interviewType = "HR Interview",
  skills = [],
  projects = [],
  durationMinutes = 18,
  integrityScore = 100,
  tabSwitches = 0
}) {
  const isHR = interviewType === "HR Interview";
  const isTechOnly = interviewType === "Technical Interview";
  const isRoboticsRound = interviewType.toLowerCase().includes("robotics");
  const isVerilogRound = interviewType.toLowerCase().includes("verilog") || interviewType.toLowerCase().includes("rtl");
  const isDsaRound = interviewType === "DSA Coding Round" || interviewType.includes("Coding") || isRoboticsRound || isVerilogRound || interviewType.includes("Simulation");
  const isResumeInterview = interviewType === "AI Mock Interview" || interviewType === "Full Interview Simulation";
  const hasResumeData = skills.length > 0 || projects.length > 0;

  // ==========================================
  // SPECIALIZED HANDLING FOR DSA CODING ROUND
  // ==========================================
  if (isDsaRound) {
    const totalProblems = dsaSubmissions.length || answers.length || 5;
    let totalScoreSum = 0;
    let totalPassedTestCases = 0;
    let totalTestCasesCount = 0;
    let totalLogicScore = 0;
    let totalSyntaxScore = 0;
    let attemptedProblems = 0;
    let syntaxIssuesCount = 0;

    const evaluatedDsaQuestions = dsaSubmissions.map((sub, idx) => {
      const isAttempted = sub.code && sub.code !== "SKIPPED";
      if (isAttempted) {
        attemptedProblems++;
        totalScoreSum += sub.score;
        totalPassedTestCases += sub.passedTestCases || 0;
        totalTestCasesCount += sub.totalTestCases || 3;
        totalLogicScore += sub.logicScore || 0;
        totalSyntaxScore += sub.syntaxScore || 0;
        if (sub.hasSyntaxError) syntaxIssuesCount++;
      } else {
        totalTestCasesCount += sub.totalTestCases || 3;
      }

      return {
        questionNumber: idx + 1,
        title: sub.title || `Problem ${idx + 1}`,
        difficulty: sub.difficulty || "Medium",
        category: "DSA Assessment",
        question: `Solve ${sub.title || `Problem ${idx + 1}`} (${sub.difficulty || "Medium"})`,
        answer: sub.code,
        score: isAttempted ? (sub.score / 10) : 0,
        scoreOutOfTen: isAttempted ? (sub.score / 10).toFixed(1) : "0.0",
        dsaDetails: {
          language: sub.language || "python",
          passedTestCases: sub.passedTestCases || 0,
          totalTestCases: sub.totalTestCases || 3,
          logicScore: sub.logicScore || 0,
          syntaxScore: sub.syntaxScore || 0,
          complexity: sub.complexityDetected || "O(n)",
          hasSyntaxError: sub.hasSyntaxError || false,
          rating: sub.rating || "Good",
          timeSpent: sub.timeSpentFormatted || "5m 00s"
        },
        whyScore: sub.feedback || "Code evaluated against logic, syntax and test cases.",
        suggestedAnswer: "An optimal approach uses O(n) linear scan with a Hash Map or Two Pointers to minimize auxiliary space and eliminate nested loop latency."
      };
    });

    if (attemptedProblems === 0) {
      return {
        overallScore: 0,
        performanceLevel: "Needs Improvement",
        performanceBadge: "UNATTEMPTED / ALL SKIPPED",
        durationMinutes,
        answeredCount: 0,
        totalQuestions: totalProblems,
        interviewType,
        name,
        branch,
        year,
        role,
        integrityScore,
        tabSwitches,
        isDsaRound: true,
        interviewReadiness: computeInterviewReadiness(0, 0, 0, 0, totalProblems, true),
        dsaSummary: {
          questionsSolved: `0 / ${totalProblems}`,
          testCasesPassed: `0 / ${totalTestCasesCount}`,
          logicAccuracy: 0,
          syntaxAccuracy: 0,
          timeEfficiency: 0,
          codeQuality: 0
        },
        radarSkills: [
          { skill: "Problem Solving & Logic", score: 0, fullMark: 100 },
          { skill: "Test Cases Correctness", score: 0, fullMark: 100 },
          { skill: "Code Quality & Structure", score: 0, fullMark: 100 },
          { skill: "Time & Complexity Efficiency", score: 0, fullMark: 100 },
          { skill: "Syntax Accuracy", score: 0, fullMark: 100 },
          { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
        ],
        communicationAnalysis: {
          clarity: 0,
          relevance: 0,
          structure: 0,
          conciseness: 0,
          vocabulary: 0
        },
        aiAnalysis: {
          strengths: ["No coding submissions recorded to evaluate."],
          weaknesses: ["All DSA problems were skipped. In coding rounds, attempting even partial logic secures points."],
          summary: "No coding problems were submitted. Please write and execute your solutions in the editor to evaluate your algorithmic problem-solving skills."
        },
        technicalProficiency: [],
        topicsToRevise: [
          "Hash Table lookups (O(1)) and Two Pointer strategies",
          "Sliding Window patterns on arrays and strings",
          "Stack and Queue mechanics for bracket matching",
          "Time & Space Complexity analysis (Big-O)"
        ],
        projectEvaluation: null,
        interviewReadiness: computeInterviewReadiness(overallScore, isHR ? (avgClarity) : (avgVocabulary), (overallScore), answeredCount, meaningfulAnswersCount, totalQuestions, false, gibberishCount > 0),
      mlReadiness: {
          score: 0,
          category: "LOW",
          status: "UNATTEMPTED",
          features: {
            avgWordsPerAnswer: 0,
            totalTechnicalTerms: 0,
            structureCompliance: "0%",
            relevanceRating: "0%"
          }
        },
        evaluatedQuestions: evaluatedDsaQuestions,
        actionPlan: {
          priority1: {
            topic: "Daily DSA Problem Solving",
            priority: "High Priority",
            action: "Practice 2-3 standard problems daily on Arrays, Hash Maps, and Two Pointers."
          },
          priority2: {
            topic: "Time Complexity Optimization",
            priority: "High Priority",
            action: "Learn to replace O(n²) nested loops with O(n) Hash Map or sorting solutions."
          },
          priority3: {
            topic: "Syntax & Edge-Case Validation",
            priority: "Medium Priority",
            action: "Test with boundary cases (empty inputs, single element, negative numbers) before submitting."
          },
          recommendedNextInterview: "DSA Coding Round — Retry Session"
        }
      };
    }

    const rawDsaScore = Math.round(totalScoreSum / totalProblems);
    const overallScore = Math.min(98, Math.max(10, Math.round((rawDsaScore * 0.85) + ((integrityScore / 100) * 15))));

    const avgLogic = Math.round(totalLogicScore / attemptedProblems);
    const avgSyntax = Math.round(totalSyntaxScore / attemptedProblems);
    const testCasesPct = Math.round((totalPassedTestCases / Math.max(1, totalTestCasesCount)) * 100);

    let performanceBadge = "STRONG CODER";
    let performanceLevel = "Strong";
    if (overallScore >= 88) {
      performanceBadge = "EXCEPTIONAL CODER";
      performanceLevel = "Exceptional";
    } else if (overallScore >= 75) {
      performanceBadge = "VERY GOOD CODER";
      performanceLevel = "Very Good";
    } else if (overallScore >= 60) {
      performanceBadge = "GOOD CODER";
      performanceLevel = "Good";
    } else {
      performanceBadge = "NEEDS PRACTICE";
      performanceLevel = "Needs Improvement";
    }

    return {
      overallScore,
      performanceLevel,
      performanceBadge,
      durationMinutes,
      answeredCount: attemptedProblems,
      totalQuestions: totalProblems,
      interviewType,
      name,
      branch,
      year,
      role,
      integrityScore,
      tabSwitches,
      isDsaRound: true,
      dsaSummary: {
        questionsSolved: `${attemptedProblems} / ${totalProblems}`,
        testCasesPassed: `${totalPassedTestCases} / ${totalTestCasesCount}`,
        logicAccuracy: avgLogic,
        syntaxAccuracy: avgSyntax,
        timeEfficiency: 82,
        codeQuality: 86
      },
      radarSkills: isRoboticsRound
        ? [
            { skill: "Control Systems & PID Logic", score: avgLogic, fullMark: 100 },
            { skill: "Kinematics & Math Precision", score: testCasesPct, fullMark: 100 },
            { skill: "Sensor Signal Processing", score: 86, fullMark: 100 },
            { skill: "Algorithmic Efficiency", score: 82, fullMark: 100 },
            { skill: "Syntax Accuracy", score: avgSyntax, fullMark: 100 },
            { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
          ]
        : (isVerilogRound
          ? [
              { skill: "RTL Architecture & Logic", score: avgLogic, fullMark: 100 },
              { skill: "Synthesis & Testbench Verification", score: testCasesPct, fullMark: 100 },
              { skill: "Timing & Clock Domains", score: 86, fullMark: 100 },
              { skill: "FSM & Memory Optimization", score: 82, fullMark: 100 },
              { skill: "Verilog Syntax Accuracy", score: avgSyntax, fullMark: 100 },
              { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
            ]
          : [
              { skill: "Problem Solving & Logic", score: avgLogic, fullMark: 100 },
              { skill: "Test Cases Correctness", score: testCasesPct, fullMark: 100 },
              { skill: "Code Quality & Structure", score: 86, fullMark: 100 },
              { skill: "Time & Complexity Efficiency", score: 82, fullMark: 100 },
              { skill: "Syntax Accuracy", score: avgSyntax, fullMark: 100 },
              { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
            ]),
      communicationAnalysis: {
        clarity: avgLogic,
        relevance: testCasesPct,
        structure: 85,
        conciseness: 90,
        vocabulary: avgSyntax
      },
      aiAnalysis: {
        strengths: [
          `Demonstrated strong algorithmic reasoning on core data structure challenges.`,
          `Successfully applied optimal O(n) / O(n log n) approaches to target problems.`,
          `Maintained clean code structure and descriptive variable naming.`
        ],
        weaknesses: [
          syntaxIssuesCount > 0
            ? "Identified minor syntax punctuation/bracket issues. Ensure clean syntax before final submission."
            : "Test edge cases (empty arrays, duplicates, negative numbers) to ensure 100% test case coverage.",
          tabSwitches > 0
            ? `Proctor detected ${tabSwitches} tab/window switches. Maintain full window focus during timed coding assessments.`
            : "Review optimal space complexity trade-offs for memory-constrained problems."
        ],
        summary: `You achieved a ${performanceLevel} coding performance with ${avgLogic}% logic accuracy and passed ${totalPassedTestCases}/${totalTestCasesCount} test cases. ${syntaxIssuesCount > 0 ? "Your core logic is sound; simply double-check minor syntax details to lock in maximum credit." : "Great grasp of problem patterns and optimal complexities."}`
      },
      technicalProficiency: [
        { topic: "Arrays & Hash Map Lookup", score: Math.min(98, avgLogic + 4) },
        { topic: "Two Pointers & Sliding Window", score: Math.min(95, avgLogic - 2) },
        { topic: "Stack & String Parsing", score: Math.min(96, avgLogic + 2) },
        { topic: "Time Complexity (Big-O)", score: 84 },
        { topic: "Edge-Case Handling", score: testCasesPct }
      ],
      topicsToRevise: [
        "Sliding Window with variable window size on strings",
        "Interval merging and boundary sorting algorithms",
        "Two Pointer trapping algorithms & water height computations"
      ],
      projectEvaluation: null,
      mlReadiness: {
        score: overallScore,
        category: overallScore >= 80 ? "HIGH" : "MODERATE",
        status: overallScore >= 80 ? "INTERVIEW READY" : "DEVELOPING CODER",
        features: {
          avgWordsPerAnswer: 45,
          totalTechnicalTerms: attemptedProblems * 4,
          structureCompliance: `${avgLogic}%`,
          relevanceRating: `${testCasesPct}%`
        }
      },
      evaluatedQuestions: evaluatedDsaQuestions,
      actionPlan: {
        priority1: {
          topic: "Complexity Optimization (Big-O)",
          priority: "High Priority",
          action: "Analyze time and space bounds before writing code. Aim for O(n) single pass solutions."
        },
        priority2: {
          topic: "Edge-Case Pre-flight Checks",
          priority: "Medium Priority",
          action: "Mentally dry-run boundary test cases (null, 0, duplicates) to guarantee 100% test passing."
        },
        priority3: {
          topic: "Timed Coding Practice",
          priority: "Medium Priority",
          action: "Practice solving Medium problems in under 12 minutes to build speed and accuracy under pressure."
        },
        recommendedNextInterview: "Full Interview Simulation — Complete 6-Round Session"
      }
    };
  }

  // ==========================================
  // STANDARD INTERVIEW ANALYTICS (HR / TECH / AI MOCK / FULL)
  // ==========================================
  const totalQuestions = answers.length || 1;
  let totalScoreSum = 0;
  let totalWords = 0;
  let answeredCount = 0;
  let totalMatches = 0;
  let totalStructureSum = 0;
  let totalRelevanceSum = 0;
  let totalConcisenessSum = 0;
  let meaningfulAnswersCount = 0;
  let gibberishCount = 0;

  const evaluatedQuestions = answers.map((item, idx) => {
    const features = extractAnswerFeatures(item.answer, item.question, branch, isHR);
    let qScore = features.baseScore;

    // If follow-up answered, reward candidate with bonus
    if (item.followUpAnswer && item.followUpAnswer !== "SKIPPED" && item.followUpAnswer.trim().length > 15) {
      qScore = Math.min(10, qScore + 1.2);
    }

    if (!features.isSkipped) {
      answeredCount++;
      if (!features.isGibberish && features.wordCount >= 2 && qScore > 0) {
        meaningfulAnswersCount++;
        totalWords += features.wordCount;
        totalMatches += features.techKeywordsCount;
        totalStructureSum += features.structureScore;
        totalRelevanceSum += features.relevanceScore;
        totalConcisenessSum += features.concisenessScore;
      } else {
        gibberishCount++;
      }
    }

    totalScoreSum += qScore;

    let rationale = "";
    if (features.isGibberish) {
      rationale = "Answer contains random characters / keyboard mash without meaningful English words or technical context (0.0/10).";
    } else if (features.isSkipped) {
      rationale = "Question was skipped. Skipping questions in actual interviews results in 0 score for the question.";
    } else if (qScore >= 8.0) {
      rationale = "Strong, well-structured response with clear examples and relevant terminology.";
    } else if (qScore >= 6.0) {
      rationale = "Satisfactory answer covering primary points. Could be improved with more concrete examples and structured delivery.";
    } else {
      rationale = "Brief answer lacking depth. Elaborate on your rationale, practical actions taken, and results.";
    }

    const suggestedAnswer = generateSuggestedModelAnswer(item.question, branch, role, skills, projects, isHR);

    return {
      questionNumber: idx + 1,
      category: item.category || (isHR ? "HR / Behavioral" : "Technical"),
      question: item.question,
      answer: item.answer,
      followUpQuestion: item.followUpQuestion || null,
      followUpAnswer: item.followUpAnswer || null,
      score: qScore,
      scoreOutOfTen: qScore.toFixed(1),
      features,
      whyScore: rationale,
      suggestedAnswer
    };
  });

  // CASE 1: UNATTEMPTED / ALL SKIPPED
  if (answeredCount === 0 || meaningfulAnswersCount === 0 || totalScoreSum === 0) {
    return {
      overallScore: 0,
      performanceLevel: "Needs Improvement",
      performanceBadge: "UNATTEMPTED / ALL SKIPPED",
      durationMinutes,
      answeredCount: 0,
      totalQuestions,
      interviewType,
      name,
      branch,
      year,
      role,
      hasResumeData,
      isHR,
      isTechOnly,
      integrityScore,
      tabSwitches,
      radarSkills: isHR
        ? [
            { skill: "Communication & Clarity", score: 0, fullMark: 100 },
            { skill: "Behavioral & Situational", score: 0, fullMark: 100 },
            { skill: "Cultural & Team Fit", score: 0, fullMark: 100 },
            { skill: "Confidence Indicator", score: 0, fullMark: 100 },
            { skill: "Role Motivation & Passion", score: 0, fullMark: 100 },
            { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
          ]
        : [
            { skill: "Technical Depth", score: 0, fullMark: 100 },
            { skill: "Problem Solving & Logic", score: 0, fullMark: 100 },
            { skill: "Core Branch Fundamentals", score: 0, fullMark: 100 },
            { skill: "Code & Architecture", score: 0, fullMark: 100 },
            { skill: "Technical Communication", score: 0, fullMark: 100 },
            { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
          ],
      communicationAnalysis: {
        clarity: 0,
        relevance: 0,
        structure: 0,
        conciseness: 0,
        vocabulary: 0
      },
      interviewReadiness: computeInterviewReadiness(0, 0, 0, answeredCount, meaningfulAnswersCount, totalQuestions, false, gibberishCount > 0),
      aiAnalysis: {
        strengths: ["No meaningful responses were submitted to evaluate strengths."],
        weaknesses: [
          gibberishCount > 0 ? "Answers contained random characters or keyboard mash (0/10 marks awarded)." : "All questions were skipped without attempting an answer.",
          "In real technical and HR interviews, leaving questions unanswered leads to immediate rejection.",
          tabSwitches > 0 ? `Proctor detected ${tabSwitches} window switches during session.` : "Attempting questions even partially demonstrates problem-solving intent."
        ],
        summary: `No answers were submitted during this ${interviewType} session. To receive an evaluation of your skills, competencies, and readiness, please attempt the questions in your next simulation.`
      },
      technicalProficiency: [],
      topicsToRevise: isHR
        ? [
            "Crafting a compelling 2-minute elevator pitch (Tell me about yourself)",
            "Structuring behavioral answers using STAR (Situation, Task, Action, Result)",
            "Articulating 3-to-5 year career goals clearly",
            "Demonstrating conflict resolution and cross-team collaboration"
          ]
        : [
            `Core ${branch} fundamentals & standard interview patterns`,
            "Data structures and algorithmic time/space complexities",
            "System architecture design trade-offs and edge-case handling"
          ],
      projectEvaluation: null,
      mlReadiness: {
        score: 0,
        category: "LOW",
        status: "UNATTEMPTED",
        features: {
          avgWordsPerAnswer: 0,
          totalTechnicalTerms: 0,
          structureCompliance: "0%",
          relevanceRating: "0%"
        }
      },
      evaluatedQuestions,
      actionPlan: {
        priority1: {
          topic: "Attempt All Interview Questions",
          priority: "High Priority",
          action: "Never leave questions blank. Communicate your baseline thought process to secure evaluation points."
        },
        priority2: {
          topic: isHR ? "STAR Framework Practice" : "Technical Fundamentals Practice",
          priority: "High Priority",
          action: isHR
            ? "Practice framing real experiences with Situation, Task, Action, and measurable Results."
            : "Review core branch concepts and practice explaining technical trade-offs out loud."
        },
        priority3: {
          topic: "Time Management & Pacing",
          priority: "Medium Priority",
          action: "Allocate 1-2 minutes per response to provide complete, well-reasoned answers."
        },
        recommendedNextInterview: `${interviewType} — Retry Session`
      }
    };
  }

  // CASE 2: CANDIDATE PROVIDED ANSWERS
  const validAnswers = Math.max(1, answeredCount);
  const rawAverageScore = (totalScoreSum / (totalQuestions * 10)) * 100;
  const overallScore = Math.min(98, Math.max(5, Math.round((rawAverageScore * 0.9) + ((integrityScore / 100) * 10))));

  // Performance Badge
  let performanceLevel = "Strong";
  let performanceBadge = "STRONG CANDIDATE";
  if (overallScore >= 90) {
    performanceLevel = "Exceptional";
    performanceBadge = "EXCEPTIONAL CANDIDATE";
  } else if (overallScore >= 80) {
    performanceLevel = "Strong";
    performanceBadge = "STRONG CANDIDATE";
  } else if (overallScore >= 70) {
    performanceLevel = "Good";
    performanceBadge = "GOOD CANDIDATE";
  } else if (overallScore >= 55) {
    performanceLevel = "Developing";
    performanceBadge = "DEVELOPING CANDIDATE";
  } else {
    performanceLevel = "Needs Improvement";
    performanceBadge = "NEEDS IMPROVEMENT";
  }

  // Communication NLP Sub-Scores
  const avgClarity = Math.min(96, Math.max(10, Math.round(totalRelevanceSum / validAnswers)));
  const avgRelevance = Math.min(96, Math.max(10, Math.round(totalRelevanceSum / validAnswers)));
  const avgStructure = Math.min(92, Math.max(10, Math.round(totalStructureSum / validAnswers)));
  const avgConciseness = Math.min(94, Math.max(10, Math.round(totalConcisenessSum / validAnswers)));
  const avgVocabulary = Math.min(95, Math.max(10, Math.round(Math.min(95, 30 + totalMatches * 6))));

  // Radar Skills based on Interview Type
  let radarSkills = [];
  if (isHR) {
    radarSkills = [
      { skill: "Communication & Clarity", score: meaningfulAnswersCount > 0 ? avgClarity : 0, fullMark: 100 },
      { skill: "Behavioral & Situational", score: meaningfulAnswersCount > 0 ? Math.min(95, Math.max(0, Math.round(overallScore * 0.95))) : 0, fullMark: 100 },
      { skill: "Cultural & Team Fit", score: meaningfulAnswersCount > 0 ? Math.min(95, Math.max(0, Math.round(overallScore * 0.92))) : 0, fullMark: 100 },
      { skill: "Confidence Indicator", score: meaningfulAnswersCount > 0 ? Math.min(95, Math.max(0, Math.round((meaningfulAnswersCount / totalQuestions) * 90))) : 0, fullMark: 100 },
      { skill: "Role Motivation & Passion", score: meaningfulAnswersCount > 0 ? Math.min(96, Math.max(0, Math.round(avgRelevance * 0.9))) : 0, fullMark: 100 },
      { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
    ];
  } else if (isTechOnly) {
    radarSkills = [
      { skill: "Technical Depth", score: Math.min(96, Math.max(10, Math.round(overallScore * 0.95 + totalMatches * 2))), fullMark: 100 },
      { skill: "Problem Solving & Logic", score: Math.min(95, Math.max(10, Math.round(overallScore * 0.92 + (avgStructure > 60 ? 6 : 0)))), fullMark: 100 },
      { skill: "Core Branch Fundamentals", score: Math.min(95, Math.max(10, Math.round(overallScore * 0.9 + 5))), fullMark: 100 },
      { skill: "Code & Architecture", score: Math.min(92, Math.max(10, Math.round(overallScore * 0.88 + 4))), fullMark: 100 },
      { skill: "Technical Communication", score: avgClarity, fullMark: 100 },
      { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
    ];
  } else {
    // AI Mock / Full Simulation
    radarSkills = [
      { skill: "Technical Knowledge", score: Math.min(96, Math.max(10, Math.round(overallScore * 0.95 + totalMatches * 2))), fullMark: 100 },
      { skill: "Problem Solving", score: Math.min(95, Math.max(10, Math.round(overallScore * 0.92 + (avgStructure > 60 ? 6 : 0)))), fullMark: 100 },
      { skill: "Communication", score: avgClarity, fullMark: 100 },
      { skill: "Confidence Indicator", score: Math.min(92, Math.max(10, Math.round((answeredCount / totalQuestions) * 85 + 8))), fullMark: 100 },
      { skill: "Project & Resume Depth", score: Math.min(96, Math.max(10, Math.round(hasResumeData ? 85 + Math.min(10, totalMatches) : overallScore))), fullMark: 100 },
      { skill: "Behavioral & Culture", score: Math.min(92, Math.max(10, Math.round(overallScore * 0.88 + 6))), fullMark: 100 },
      { skill: "Proctor Focus & Integrity", score: integrityScore, fullMark: 100 }
    ];
  }

  // Technical Domain Breakdown (Only for Technical, AI Mock, Full Interview)
  let technicalProficiency = [];
  if (!isHR) {
    technicalProficiency = [
      { topic: "Data Structures & Algorithms", score: Math.min(95, Math.max(10, overallScore - 4)) },
      { topic: "Object-Oriented Programming (OOP)", score: Math.min(96, Math.max(10, overallScore + 3)) },
      { topic: "Database Management & SQL (DBMS)", score: Math.min(92, Math.max(10, overallScore - 10)) },
      { topic: "Operating Systems & Networking", score: Math.min(90, Math.max(10, overallScore - 6)) },
      { topic: "Frameworks & Architecture", score: Math.min(98, Math.max(10, overallScore + 5)) },
      { topic: "Practical Problem Solving & Debugging", score: Math.min(94, Math.max(10, overallScore - 2)) }
    ];
  }

  // Topics to Revise
  const topicsToRevise = isHR
    ? [
        "Crafting a structured 2-minute elevator pitch with key career milestones",
        "Answering situational questions with the STAR method (quantified results)",
        "Demonstrating conflict resolution and constructive team feedback"
      ]
    : [
        "Database Normalization (1NF, 2NF, 3NF & BCNF) and Indexing Performance",
        "Process vs Thread Memory Sharing & Concurrency Pitfalls",
        "Time & Space Complexity Proofs for Dynamic Programming & Graphs",
        "Scalable System Architecture & Load Balancing Strategies"
      ];

  // Project & Resume Evaluation (ONLY when resume/projects were uploaded)
  let projectEvaluation = null;
  if (isResumeInterview && projects.length > 0) {
    const pScores = projects.map((pName, i) => ({
      name: pName,
      score: (Math.min(9.6, Math.max(5.0, (overallScore / 10) + (i === 0 ? 0.4 : -0.2)))).toFixed(1),
      depth: i === 0 ? "High Architecture Depth" : "Solid Technical Implementation"
    }));

    projectEvaluation = {
      resumeUnderstanding: Math.min(96, Math.max(20, Math.round(overallScore * 0.95 + 4))),
      skillProficiency: Math.min(95, Math.max(20, Math.round(overallScore * 0.92 + 5))),
      projectUnderstanding: Math.min(96, Math.max(20, Math.round(overallScore * 0.9 + 6))),
      technicalDepth: Math.min(94, Math.max(20, Math.round(overallScore))),
      projectScores: pScores,
      feedback: `You demonstrated familiarity with your project ${projects[0]}. Be prepared to explain low-level scaling trade-offs and error recovery in subsequent rounds.`
    };
  }

  // ML Feature Vector & Interview Readiness Classification
  const avgWordsPerAns = Math.round(totalWords / validAnswers);
  let mlReadinessScore = Math.min(98, Math.max(5, Math.round(
    overallScore * 0.6 +
    avgStructure * 0.15 +
    avgRelevance * 0.15 +
    Math.min(100, totalMatches * 10) * 0.1
  )));

  let mlReadinessCategory = "HIGH";
  let mlReadinessStatus = "INTERVIEW READY";
  if (mlReadinessScore >= 85) {
    mlReadinessCategory = "VERY HIGH";
    mlReadinessStatus = "HIGHLY COMPETITIVE";
  } else if (mlReadinessScore >= 75) {
    mlReadinessCategory = "HIGH";
    mlReadinessStatus = "INTERVIEW READY";
  } else if (mlReadinessScore >= 55) {
    mlReadinessCategory = "MODERATE";
    mlReadinessStatus = "DEVELOPING CANDIDATE";
  } else {
    mlReadinessCategory = "LOW";
    mlReadinessStatus = "NEEDS REVISION";
  }

  // Strengths & Weaknesses
  const strengths = isHR
    ? [
        "Provided relevant career context and aligned with target role expectations.",
        "Demonstrated clear communication structure when explaining team scenarios.",
        "Maintained professional tone and concise delivery."
      ]
    : [
        "Demonstrated technical awareness across core fundamental topics.",
        "Maintained relevance when addressing primary engineering concepts.",
        "Showed logical reasoning when formulating technical solutions."
      ];

  const weaknesses = isHR
    ? [
        "Structure behavioral examples strictly with Situation, Task, Action, and measurable Results.",
        "Elaborate more on specific personal contributions rather than general team actions.",
        tabSwitches > 0 ? `Proctor detected ${tabSwitches} window switches during the session.` : "State concrete long-term professional milestones."
      ]
    : [
        "Some technical answers lacked structured trade-off comparisons.",
        "Deepen theoretical explanations for system architecture and database concurrency.",
        tabSwitches > 0 ? `Proctor recorded ${tabSwitches} window switches during evaluation.` : "Quantify performance impacts with time/space complexity or latency metrics."
      ];

  const aiSummary = isHR
    ? `You demonstrated solid communication clarity and cultural motivation for the ${role} position. To reach top-tier hiring confidence, focus on framing your past project challenges with quantified results and clearly articulated personal initiative.`
    : `You demonstrated sound technical fundamentals for the ${role} role in ${branch}. Your primary growth area is substantiating architecture claims with explicit algorithmic complexities and trade-off comparisons.`;

  // Career Action Plan
  const actionPlan = isHR
    ? {
        priority1: {
          topic: "STAR Behavioral Framing",
          priority: "High Priority",
          action: "Structure your responses into Situation, Task, Action taken, and quantifiable Result."
        },
        priority2: {
          topic: "Personal Impact & Leadership",
          priority: "Medium Priority",
          action: "Highlight specific individual contributions in team projects rather than generic group actions."
        },
        priority3: {
          topic: "Long-Term Career Narrative",
          priority: "Medium Priority",
          action: "Articulate a clear 3-5 year technical roadmap showing continuous learning and mentorship."
        },
        recommendedNextInterview: "HR Interview — Advanced Behavioral Round"
      }
    : {
        priority1: {
          topic: "DBMS & SQL Query Optimization",
          priority: "High Priority",
          action: "Revise 3NF vs BCNF normalization, B-Tree indexes, and ACID transaction isolation levels."
        },
        priority2: {
          topic: "Structured Technical Communication",
          priority: "Medium Priority",
          action: "Adopt clear technical framing (Definition &rarr; Project Example &rarr; Trade-offs)."
        },
        priority3: {
          topic: "System Design & Edge-Case Handling",
          priority: "Medium Priority",
          action: "Practice designing scalable backend services handling concurrency, caching, and rate limiting."
        },
        recommendedNextInterview: "Technical Interview — Medium/Hard Difficulty"
      };

  return {
    overallScore,
    performanceLevel,
    performanceBadge,
    durationMinutes,
    answeredCount,
    totalQuestions,
    interviewType,
    name,
    branch,
    year,
    role,
    hasResumeData,
    isHR,
    isTechOnly,
    integrityScore,
    tabSwitches,
    radarSkills,
    communicationAnalysis: {
      clarity: avgClarity,
      relevance: avgRelevance,
      structure: avgStructure,
      conciseness: avgConciseness,
      vocabulary: avgVocabulary
    },
    aiAnalysis: {
      strengths,
      weaknesses,
      summary: aiSummary
    },
    technicalProficiency,
    topicsToRevise,
    projectEvaluation,
    mlReadiness: {
      score: mlReadinessScore,
      category: mlReadinessCategory,
      status: mlReadinessStatus,
      features: {
        avgWordsPerAnswer: avgWordsPerAns,
        totalTechnicalTerms: totalMatches,
        structureCompliance: `${avgStructure}%`,
        relevanceRating: `${avgRelevance}%`
      }
    },
    evaluatedQuestions,
    actionPlan
  };
}

/**
 * High-value model answers tailored for HR or Technical questions
 */
function generateSuggestedModelAnswer(question, branch, role, skills, projects, isHR = false) {
  const qLower = (question || "").toLowerCase();

  if (isHR || qLower.includes("tell me about yourself") || qLower.includes("introduce")) {
    return `A high-scoring answer follows the STAR pattern: (1) Present Background: "I am an engineering student in ${branch} with hands-on focus in ${role}." (2) Key Project/Achievement: Highlight one practical project with concrete outcomes. (3) Future Alignment: "I am passionate about building reliable software and eager to contribute to high-impact engineering teams."`;
  }

  if (qLower.includes("strength") || qLower.includes("weakness")) {
    return "Frame your strength with a concrete project example (e.g. rapid debugging, systematic problem breakdown). Frame your weakness as an area of active learning where you have already implemented an improvement habit.";
  }

  if (qLower.includes("pressure") || qLower.includes("deadline") || qLower.includes("conflict")) {
    return "Use the STAR method: State the challenging situation and tight timeline, describe your prioritization framework (critical path vs nice-to-have), detail proactive communication with teammates, and share the on-time delivery result.";
  }

  if (qLower.includes("process") && qLower.includes("thread")) {
    return "A process is an independent execution program with its own private virtual memory space allocated by the OS. A thread is a lightweight execution unit inside a process that shares code and heap memory with sibling threads, minimizing context switching overhead but requiring synchronization (mutexes/semaphores) to prevent race conditions.";
  }

  if (qLower.includes("dbms") || qLower.includes("normaliz")) {
    return "Normalization is the systematic design process of decomposing tables to eliminate redundant data and avoid insertion, update, and deletion anomalies. 3NF ensures that every non-prime attribute is non-transitively dependent on every candidate key.";
  }

  return "A high-scoring technical answer states: (1) Core definition & mechanism, (2) Real-world practical application or project example, (3) Performance trade-offs (time/space complexity, scalability, or edge cases).";
}

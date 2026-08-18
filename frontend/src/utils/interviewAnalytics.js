/**
 * Interview Analytics & ML Feature Extraction Engine
 * Extracts technical features from candidate answers and performs
 * deterministic scoring & qualitative feedback generation.
 */

// Technical dictionary per branch
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

const STRUCTURE_KEYWORDS = [
  "first", "second", "then", "because", "for example", "specifically", "in order to",
  "result", "outcome", "implemented", "designed", "handled", "therefore", "trade-off",
  "approach", "solution", "architecture", "optimized", "resolved", "improved"
];

/**
 * Extract ML features from an individual answer
 */
export function extractAnswerFeatures(answerText, questionText, branch) {
  if (!answerText || answerText === "SKIPPED" || answerText.trim().length === 0) {
    return {
      isSkipped: true,
      wordCount: 0,
      charLength: 0,
      techKeywordsCount: 0,
      structureScore: 0,
      relevanceScore: 0,
      concisenessScore: 0,
      baseScore: 2.0
    };
  }

  const text = answerText.toLowerCase();
  const qText = (questionText || "").toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charLength = text.length;

  // 1. Technical Keyword Density
  const branchDict = BRANCH_KEYWORDS[branch] || BRANCH_KEYWORDS.CSE;
  let techCount = 0;
  branchDict.forEach(kw => {
    if (text.includes(kw)) techCount++;
  });

  // Additional general tech terms
  const commonTech = ["python", "react", "fastapi", "database", "api", "model", "server", "system", "performance", "scaling", "debugging", "git", "jwt", "testing"];
  commonTech.forEach(kw => {
    if (text.includes(kw)) techCount++;
  });

  // 2. Structure & Organization
  let structCount = 0;
  STRUCTURE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) structCount++;
  });
  const structureScore = Math.min(100, Math.round(structCount * 18 + (wordCount > 30 ? 30 : 15)));

  // 3. Relevance to Question
  const qWords = qText.split(/\s+/).filter(w => w.length > 3);
  let overlapCount = 0;
  qWords.forEach(qw => {
    if (text.includes(qw)) overlapCount++;
  });
  const relevanceRatio = qWords.length > 0 ? overlapCount / Math.min(qWords.length, 6) : 0.6;
  const relevanceScore = Math.min(100, Math.round(relevanceRatio * 70 + (techCount > 0 ? 30 : 10)));

  // 4. Conciseness (penalize extremely short <10 words or rambling >180 words)
  let concisenessScore = 85;
  if (wordCount < 15) concisenessScore = 45;
  else if (wordCount < 30) concisenessScore = 72;
  else if (wordCount > 150) concisenessScore = 68;
  else concisenessScore = 92;

  // Calculate Base Score (0 to 10 scale)
  let score = 5.0;
  if (wordCount >= 20) score += 1.5;
  if (wordCount >= 50) score += 1.0;
  if (techCount >= 1) score += 1.0;
  if (techCount >= 3) score += 1.0;
  if (structCount >= 2) score += 0.8;
  if (relevanceScore > 70) score += 0.7;

  score = Math.min(10, Math.max(3.0, score));

  return {
    isSkipped: false,
    wordCount,
    charLength,
    techKeywordsCount: techCount,
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
  name = "Candidate",
  branch = "CSE",
  year = "3rd Year",
  role = "Software Engineer",
  interviewType = "AI Mock Interview",
  skills = [],
  projects = [],
  durationMinutes = 18
}) {
  const totalQuestions = answers.length || 1;
  let totalScoreSum = 0;
  let totalWords = 0;
  let answeredCount = 0;
  let totalTechMatches = 0;
  let totalStructureSum = 0;
  let totalRelevanceSum = 0;
  let totalConcisenessSum = 0;

  const evaluatedQuestions = answers.map((item, idx) => {
    const features = extractAnswerFeatures(item.answer, item.question, branch);
    let qScore = features.baseScore;

    // If follow-up answered, reward candidate with bonus
    if (item.followUpAnswer && item.followUpAnswer !== "SKIPPED" && item.followUpAnswer.trim().length > 15) {
      qScore = Math.min(10, qScore + 1.2);
    }

    if (!features.isSkipped) {
      answeredCount++;
      totalWords += features.wordCount;
      totalTechMatches += features.techKeywordsCount;
      totalStructureSum += features.structureScore;
      totalRelevanceSum += features.relevanceScore;
      totalConcisenessSum += features.concisenessScore;
    }

    totalScoreSum += qScore;

    // Generate score rationale and model answer
    let rationale = "";
    if (features.isSkipped) {
      rationale = "Question was skipped. Providing even a partial or structured logical attempt will secure baseline credit in actual interviews.";
    } else if (qScore >= 8.5) {
      rationale = "Exceptional response. Strong technical clarity, practical trade-offs mentioned, and confident delivery.";
    } else if (qScore >= 7.0) {
      rationale = "Solid answer covering core concepts. Adding specific metrics or architectural decisions would elevate it to top-tier.";
    } else {
      rationale = "Basic answer. Needs deeper technical grounding, specific terminology, and concrete examples from projects.";
    }

    const suggestedAnswer = generateSuggestedModelAnswer(item.question, branch, role, skills, projects);

    return {
      questionNumber: idx + 1,
      category: item.category || "General",
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

  // Overall Score (0-100)
  const rawAverageScore = (totalScoreSum / totalQuestions) * 10;
  const overallScore = Math.min(98, Math.max(35, Math.round(rawAverageScore)));

  // Performance Level
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
  } else if (overallScore >= 60) {
    performanceLevel = "Developing";
    performanceBadge = "DEVELOPING CANDIDATE";
  } else {
    performanceLevel = "Needs Improvement";
    performanceBadge = "NEEDS IMPROVEMENT";
  }

  // Communication Sub-Scores
  const validAnswers = Math.max(1, answeredCount);
  const avgClarity = Math.min(95, Math.max(50, Math.round((totalRelevanceSum / validAnswers) * 0.95 + 5)));
  const avgRelevance = Math.min(96, Math.max(55, Math.round(totalRelevanceSum / validAnswers)));
  const avgStructure = Math.min(92, Math.max(45, Math.round(totalStructureSum / validAnswers)));
  const avgConciseness = Math.min(94, Math.max(50, Math.round(totalConcisenessSum / validAnswers)));
  const avgVocabulary = Math.min(95, Math.max(55, Math.round(60 + totalTechMatches * 4)));

  // Radar Skill Competencies (0 - 100)
  const technicalKnowledge = Math.min(96, Math.max(50, Math.round(overallScore * 0.95 + totalTechMatches * 2)));
  const problemSolving = Math.min(95, Math.max(48, Math.round(overallScore * 0.92 + (avgStructure > 70 ? 6 : 0))));
  const communication = Math.min(95, Math.max(52, Math.round((avgClarity + avgStructure + avgRelevance) / 3)));
  const confidenceIndicator = Math.min(92, Math.max(45, Math.round(answeredCount >= totalQuestions * 0.8 ? 82 : 64)));
  const projectKnowledge = Math.min(96, Math.max(55, Math.round(skills.length > 0 ? 88 + Math.min(8, totalTechMatches) : 78)));
  const behavioral = Math.min(92, Math.max(60, Math.round(overallScore * 0.88 + 8)));
  const roleProficiency = Math.min(95, Math.max(50, Math.round(technicalKnowledge * 0.9 + communication * 0.1)));

  // Technical Breakdown & Topics to Revise
  const technicalProficiency = [
    { topic: "Data Structures & Algorithms", score: Math.min(95, Math.max(55, overallScore - 4)) },
    { topic: "Object-Oriented Programming (OOP)", score: Math.min(96, Math.max(60, overallScore + 3)) },
    { topic: "Database Management & SQL (DBMS)", score: Math.min(92, Math.max(50, overallScore - 12)) },
    { topic: "Operating Systems & Networking", score: Math.min(90, Math.max(52, overallScore - 6)) },
    { topic: "Frameworks & Architecture", score: Math.min(98, Math.max(65, overallScore + 5)) },
    { topic: "Practical Problem Solving & Debugging", score: Math.min(94, Math.max(58, overallScore - 2)) }
  ];

  const topicsToRevise = [
    "Database Normalization (1NF, 2NF, 3NF & BCNF) and Indexing Performance",
    "Process vs Thread Memory Sharing & Concurrency Pitfalls",
    "Time & Space Complexity Proofs for Dynamic Programming & Graphs",
    "Scalable System Architecture & Load Balancing Strategies"
  ];

  // Project & Resume Evaluation
  const p1 = projects[0] || "AI Interview Simulator";
  const p2 = projects[1] || "Stock Prediction Model";
  const p3 = projects[2] || "Student Performance Analyzer";

  const projectScores = [
    { name: p1, score: (Math.min(9.6, Math.max(7.2, overallScore / 10 + 0.5))).toFixed(1), depth: "High Architecture Depth" },
    { name: p2, score: (Math.min(9.4, Math.max(6.8, overallScore / 10 - 0.2))).toFixed(1), depth: "Solid Technical Implementation" }
  ];
  if (projects.length > 2) {
    projectScores.push({ name: p3, score: (Math.min(9.5, Math.max(7.0, overallScore / 10 + 0.1))).toFixed(1), depth: "Good Domain Application" });
  }

  // ML Feature Vector & Interview Readiness Classification
  const avgWordsPerAns = Math.round(totalWords / validAnswers);
  let mlReadinessScore = Math.min(98, Math.max(30, Math.round(
    overallScore * 0.6 +
    avgStructure * 0.15 +
    avgRelevance * 0.15 +
    Math.min(100, totalTechMatches * 10) * 0.1
  )));

  let mlReadinessCategory = "HIGH";
  let mlReadinessStatus = "INTERVIEW READY";
  if (mlReadinessScore >= 85) {
    mlReadinessCategory = "VERY HIGH";
    mlReadinessStatus = "HIGHLY COMPETITIVE";
  } else if (mlReadinessScore >= 75) {
    mlReadinessCategory = "HIGH";
    mlReadinessStatus = "INTERVIEW READY";
  } else if (mlReadinessScore >= 60) {
    mlReadinessCategory = "MODERATE";
    mlReadinessStatus = "DEVELOPING CANDIDATE";
  } else {
    mlReadinessCategory = "LOW";
    mlReadinessStatus = "NEEDS REVISION";
  }

  // Strengths & Weaknesses
  const strengths = [
    `Demonstrated clear familiarity with core projects (${p1}) and key stack tools.`,
    "Maintained good technical relevance across primary conceptual questions.",
    "Showed structured logical reasoning when addressing practical implementation scenarios."
  ];

  const weaknesses = [
    "Some technical answers could be more structured using the STAR (Situation, Task, Action, Result) framework.",
    "System-level DBMS and concurrency topics need deeper theoretical justification.",
    "Avoid brief single-sentence replies; substantiate claims with architectural trade-offs."
  ];

  const aiSummary = `You demonstrated solid project knowledge and sound fundamentals for the ${role} position. Your key strength lies in articulating practical implementation choices for ${p1}. To reach the top 5% of candidate rankings, focus on reinforcing database normalization principles and framing your problem-solving approaches with explicit algorithmic complexity bounds.`;

  // Career Action Plan
  const actionPlan = {
    priority1: {
      topic: "DBMS & SQL Query Optimization",
      priority: "High Priority",
      action: "Revise 3NF vs BCNF normalization, B-Tree indexes, and ACID transaction isolation levels."
    },
    priority2: {
      topic: "Structured Technical Communication",
      priority: "Medium Priority",
      action: "Adopt the STAR method for behavioral & system architecture explanations to eliminate fluff."
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
    radarSkills: [
      { skill: "Technical Knowledge", score: technicalKnowledge, fullMark: 100 },
      { skill: "Problem Solving", score: problemSolving, fullMark: 100 },
      { skill: "Communication", score: communication, fullMark: 100 },
      { skill: "Confidence Indicator", score: confidenceIndicator, fullMark: 100 },
      { skill: "Project & Resume Depth", score: projectKnowledge, fullMark: 100 },
      { skill: "Behavioral & Culture", score: behavioral, fullMark: 100 },
      { skill: "Role Proficiency", score: roleProficiency, fullMark: 100 }
    ],
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
    projectEvaluation: {
      resumeUnderstanding: 92,
      skillProficiency: technicalKnowledge,
      projectUnderstanding: projectKnowledge,
      technicalDepth: Math.min(94, overallScore + 2),
      projectScores,
      feedback: `You explained the architecture of ${p1} clearly. In future rounds, be prepared to dive deeper into database query scaling and fallback error handling.`
    },
    mlReadiness: {
      score: mlReadinessScore,
      category: mlReadinessCategory,
      status: mlReadinessStatus,
      features: {
        avgWordsPerAnswer: avgWordsPerAns,
        totalTechnicalTerms: totalTechMatches,
        structureCompliance: `${avgStructure}%`,
        relevanceRating: `${avgRelevance}%`
      }
    },
    evaluatedQuestions,
    actionPlan
  };
}

/**
 * Helper to produce high-value model answers for any question
 */
function generateSuggestedModelAnswer(question, branch, role, skills, projects) {
  const qLower = (question || "").toLowerCase();
  
  if (qLower.includes("tell me about yourself") || qLower.includes("introduce")) {
    return "I am a dedicated software engineer with a strong foundation in " + branch + " and practical experience in " + (skills[0] || "Python & React") + ". I recently developed projects like " + (projects[0] || "AI Interview Simulator") + " where I focused on scalable architecture and reliable user experience. I am eager to apply my technical curiosity and problem-solving skills to real-world engineering challenges.";
  }

  if (qLower.includes("random forest") || qLower.includes("linear regression")) {
    return "I selected Random Forest because it is an ensemble of decision trees that captures non-linear relationships and feature interactions effectively while mitigating overfitting via bagging. In comparison, Linear Regression assumes a strictly linear relationship and is sensitive to outliers and collinearity.";
  }

  if (qLower.includes("process") && qLower.includes("thread")) {
    return "A process is an independent execution unit with its own dedicated virtual address space and resources allocated by the OS. A thread is a lightweight execution path within a process that shares code, data, and open files with sibling threads, reducing context switching overhead but requiring synchronization (mutexes/semaphores) to prevent race conditions.";
  }

  if (qLower.includes("dbms") || qLower.includes("normaliz")) {
    return "Normalization is the systematic process of organizing relational database schemas to eliminate redundant data and avoid insertion, update, and deletion anomalies. 3NF ensures that every non-prime attribute is non-transitively dependent on every candidate key, striking an optimal balance between data integrity and join performance.";
  }

  if (qLower.includes("architecture") || qLower.includes("scalable")) {
    return "For high scalability, I design modular decoupled microservices communicating asynchronously via message brokers (Kafka/RabbitMQ) with stateless REST/FastAPI endpoints behind load balancers. I implement Redis caching for hot reads and read-replicas for database query scaling.";
  }

  return "A strong answer follows the STAR pattern: (1) Clearly state the technical definition or core concept. (2) Provide a concrete example from your practical projects. (3) Address trade-offs, edge-cases, and performance metrics (time/space complexity or latency).";
}

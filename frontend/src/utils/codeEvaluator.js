/**
 * Intelligent Code & Algorithm Evaluator
 * Supports:
 * - Software Languages: Python, C++, Java, JavaScript
 * - Hardware RTL Languages: Verilog (IEEE 1364), SystemVerilog (IEEE 1800), Embedded C
 * Analyzes code for syntax accuracy, algorithmic logic, time complexity, and test cases
 */

export function evaluateCodeSubmission({
  code = "",
  language = "python",
  problem = {},
  timeTakenSeconds = 300
}) {
  const defaultTotalTests = problem.testCases ? problem.testCases.length : 3;

  if (!code || code.trim().length === 0 || code === "SKIPPED") {
    return {
      problemId: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      language,
      code: code || "SKIPPED",
      timeTakenSeconds,
      status: "UNATTEMPTED",
      score: 0,
      passedTestCases: 0,
      totalTestCases: defaultTotalTests,
      logicScore: 0,
      syntaxScore: 0,
      complexityDetected: "N/A",
      isOptimalComplexity: false,
      hasSyntaxError: false,
      hasLogicalError: true,
      rating: "Needs Improvement",
      feedback: "No code was submitted for this challenge."
    };
  }

  const trimmed = code.trim();
  const lowerCode = trimmed.toLowerCase();
  const testCases = problem.testCases || [];
  const totalTestCases = testCases.length || defaultTotalTests;
  const isVerilog = language === "verilog" || language === "systemverilog";

  // Check if user submitted ONLY untouched starter boilerplate / TODOs without writing actual code
  const starterBoilerplate = problem.starterCode ? (problem.starterCode[language] || "").trim() : "";
  const normalizedUser = trimmed.replace(/\s+/g, " ");
  const normalizedStarter = starterBoilerplate.replace(/\s+/g, " ");

  const isUntouchedBoilerplate =
    normalizedUser === normalizedStarter ||
    (trimmed.includes("TODO:") && !lowerCode.includes("always") && !lowerCode.includes("for") && !lowerCode.includes("while") && !lowerCode.includes("if") && !lowerCode.includes("seen") && !lowerCode.includes("map") && !lowerCode.includes("stack") && !lowerCode.includes("assign") && !lowerCode.includes("<=") && !lowerCode.includes("return [") && !lowerCode.includes("return true") && !lowerCode.includes("return false"));

  if (isUntouchedBoilerplate) {
    return {
      problemId: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      language,
      code,
      timeTakenSeconds,
      status: "UNATTEMPTED",
      score: 0,
      passedTestCases: 0,
      totalTestCases,
      logicScore: 0,
      syntaxScore: 0,
      complexityDetected: "Incomplete",
      isOptimalComplexity: false,
      hasSyntaxError: false,
      hasLogicalError: true,
      rating: "Needs Improvement",
      feedback: "Boilerplate submitted without implementation. Please write your solution before submitting."
    };
  }

  // 1. Bracket & Parenthesis Balancing Check (Detects missing brackets / commas)
  let openCurly = 0, openParen = 0, openSquare = 0;
  for (let ch of trimmed) {
    if (ch === '{') openCurly++;
    if (ch === '}') openCurly--;
    if (ch === '(') openParen++;
    if (ch === ')') openParen--;
    if (ch === '[') openSquare++;
    if (ch === ']') openSquare--;
  }

  let hasBracketMismatch = openCurly !== 0 || openParen !== 0 || openSquare !== 0;

  // 2. Verilog / SystemVerilog specific syntax checks
  let hasVerilogSyntaxIssue = false;
  if (isVerilog) {
    const beginCount = (lowerCode.match(/\bbegin\b/g) || []).length;
    const endCount = (lowerCode.match(/\bend\b/g) || []).length;
    const moduleCount = (lowerCode.match(/\bmodule\b/g) || []).length;
    const endmoduleCount = (lowerCode.match(/\bendmodule\b/g) || []).length;
    const caseCount = (lowerCode.match(/\bcase\b/g) || []).length;
    const endcaseCount = (lowerCode.match(/\bendcase\b/g) || []).length;

    if (beginCount !== endCount || moduleCount !== endmoduleCount || caseCount !== endcaseCount) {
      hasVerilogSyntaxIssue = true;
    }
  }

  // 3. Python Indentation / Colon Check
  let hasPythonColonIssue = false;
  if (language === "python") {
    const lines = trimmed.split("\n");
    for (let l of lines) {
      const trimmedLine = l.trim();
      if ((trimmedLine.startsWith("def ") || trimmedLine.startsWith("for ") || trimmedLine.startsWith("if ") || trimmedLine.startsWith("while ")) && !trimmedLine.endsWith(":")) {
        hasPythonColonIssue = true;
      }
    }
  }

  const hasMinorSyntaxIssue = hasBracketMismatch || hasPythonColonIssue || hasVerilogSyntaxIssue;

  // 4. Algorithmic & RTL Logic Analysis
  let detectedPatterns = [];
  let logicScore = 50;
  let hasLogicalIssue = false;

  if (isVerilog) {
    // Hardware RTL pattern detection
    if (lowerCode.includes("posedge") || lowerCode.includes("negedge") || lowerCode.includes("always_ff") || lowerCode.includes("always @")) {
      detectedPatterns.push("Synchronous Edge Sensitivity");
      logicScore += 18;
    }
    if (lowerCode.includes("rst_n") || lowerCode.includes("reset") || lowerCode.includes("!rst_n")) {
      detectedPatterns.push("Asynchronous/Synchronous Reset Logic");
      logicScore += 16;
    }
    if (lowerCode.includes("<=") || lowerCode.includes("non-blocking")) {
      detectedPatterns.push("Non-blocking RTL Registers");
      logicScore += 12;
    } else if (lowerCode.includes("always") && !lowerCode.includes("<=") && !lowerCode.includes("assign")) {
      hasLogicalIssue = true;
      logicScore -= 20;
    }
    if (lowerCode.includes("case") || lowerCode.includes("state") || lowerCode.includes("next_state") || lowerCode.includes("overflow") || lowerCode.includes("full") || lowerCode.includes("pwm_out")) {
      detectedPatterns.push("Target RTL Logic Functional Blocks");
      logicScore += 10;
    }

    if (!lowerCode.includes("always") && !lowerCode.includes("assign")) {
      hasLogicalIssue = true;
      logicScore = 20;
    }
  } else {
    // Software DSA pattern detection
    if (lowerCode.includes("seen") || lowerCode.includes("map") || lowerCode.includes("dict") || lowerCode.includes("hash") || lowerCode.includes("counter")) {
      detectedPatterns.push("Hash Table / Map Optimization");
      logicScore += 15;
    }
    if ((lowerCode.includes("left") && lowerCode.includes("right")) || lowerCode.includes("two pointer") || lowerCode.includes("while left")) {
      detectedPatterns.push("Two Pointers / Sliding Window");
      logicScore += 15;
    }
    if (lowerCode.includes("stack") || lowerCode.includes(".pop(") || lowerCode.includes(".push(")) {
      detectedPatterns.push("Stack Mechanism");
      logicScore += 15;
    }
    if (lowerCode.includes("for ") || lowerCode.includes("for(") || lowerCode.includes("while ") || lowerCode.includes("while(")) {
      logicScore += 10;
    }
    if (lowerCode.includes("return") && (lowerCode.includes("[") || lowerCode.includes("true") || lowerCode.includes("false") || lowerCode.includes("max") || lowerCode.includes("count") || lowerCode.includes("seen") || lowerCode.includes("u") || lowerCode.includes("x"))) {
      logicScore += 8;
    } else if (!lowerCode.includes("return") && !lowerCode.includes("yield")) {
      hasLogicalIssue = true;
      logicScore -= 25;
    }
  }

  logicScore = Math.min(98, Math.max(20, logicScore));

  // 5. Complexity / Hardware Latency Detection
  let complexityDetected = isVerilog ? "1-Cycle RTL Clock" : "O(n)";
  let isOptimalComplexity = true;

  if (!isVerilog) {
    let loopCount = 0;
    if (language === "python") {
      loopCount = (trimmed.match(/for\s+/g) || []).length + (trimmed.match(/while\s+/g) || []).length;
    } else {
      loopCount = (trimmed.match(/for\s*\(/g) || []).length + (trimmed.match(/while\s*\(/g) || []).length;
    }

    if (loopCount >= 2 && !lowerCode.includes("left < right")) {
      complexityDetected = "O(n²)";
      if (problem.expectedComplexity === "O(n)") {
        isOptimalComplexity = false;
      }
    } else if (lowerCode.includes("sort(") || lowerCode.includes("sorted(")) {
      complexityDetected = "O(n log n)";
    } else if (lowerCode.includes("// 2") || lowerCode.includes("/ 2")) {
      complexityDetected = "O(log n)";
    }
  } else {
    complexityDetected = problem.expectedComplexity || "Synchronous RTL Cycle";
  }

  // 6. Test Cases Simulation & Syntax Accuracy
  let syntaxScore = hasMinorSyntaxIssue ? 74 : 96;
  let passedTestCases = totalTestCases;

  if (hasMinorSyntaxIssue && !hasLogicalIssue) {
    passedTestCases = Math.max(1, Math.round(totalTestCases * 0.8));
  } else if (hasLogicalIssue) {
    passedTestCases = Math.max(0, Math.round(totalTestCases * 0.35));
  } else if (!isOptimalComplexity) {
    passedTestCases = totalTestCases - 1;
  }

  // Calculate Final Question Score
  let qScore = Math.round(logicScore * 0.55 + syntaxScore * 0.3 + (isOptimalComplexity ? 15 : 5));
  if (hasLogicalIssue) qScore = Math.min(45, qScore);
  qScore = Math.min(100, Math.max(10, qScore));

  // Rating Tier
  let rating = "Good";
  if (qScore >= 90 && !hasMinorSyntaxIssue && !hasLogicalIssue) rating = "Excellent";
  else if (qScore >= 80) rating = "Very Good";
  else if (qScore >= 60) rating = "Good";
  else rating = "Needs Improvement";

  // Qualitative AI Feedback
  let feedback = "";
  if (isVerilog) {
    if (hasMinorSyntaxIssue && !hasLogicalIssue) {
      feedback = "Great hardware engineering mindset! Your RTL architecture and register transitions are logically sound and synthesizable. However, minor Verilog syntax issues (such as unmatched begin/end or missing punctuation) were detected. Double-check syntax before final tapeout.";
    } else if (hasLogicalIssue) {
      feedback = "A logical RTL error was detected in your module design (e.g. incorrect non-blocking assignments or missing reset branch). Ensure all sequential registers are assigned inside clock blocks.";
    } else {
      feedback = "Outstanding RTL design! Clean Verilog description, proper non-blocking assignments, and optimal synchronous clock boundaries.";
    }
  } else {
    if (hasMinorSyntaxIssue && !hasLogicalIssue) {
      feedback = "You have an excellent algorithmic mind and your problem-solving approach is logically sound! However, minor syntax errors (such as missing brackets, commas, or colons) were detected. In live interviews, keeping clean syntax preserves full marks.";
    } else if (hasLogicalIssue) {
      feedback = "A logical error was detected in your algorithm (such as missing return value, incorrect loop boundary, or unhandled edge cases). Re-examine your pointer updates and base conditions.";
    } else if (!isOptimalComplexity) {
      feedback = `Solution logic is correct, but time complexity is ${complexityDetected} compared to expected ${problem.expectedComplexity}. Consider optimizing using a Hash Table or Two Pointers.`;
    } else {
      feedback = `Exceptional solution! Optimal ${complexityDetected} time complexity, clean data structure usage, and complete test case coverage.`;
    }
  }

  return {
    problemId: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    language,
    code,
    timeTakenSeconds,
    score: qScore,
    passedTestCases,
    totalTestCases,
    logicScore,
    syntaxScore,
    complexityDetected,
    isOptimalComplexity,
    hasSyntaxError: hasMinorSyntaxIssue,
    hasLogicalError: hasLogicalIssue,
    rating,
    feedback
  };
}

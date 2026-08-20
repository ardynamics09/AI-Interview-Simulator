/**
 * Candidate Profile & Test History Storage Manager
 * Uses browser localStorage with zero-friction unique handle management.
 * Enforces a strict 25-test FIFO circular history per candidate profile.
 */

export const MAX_HISTORY_LIMIT = 25;

const PROFILES_KEY = "ai_interview_profiles";
const ACTIVE_USER_KEY = "ai_interview_active_user";
const HISTORY_PREFIX = "ai_interview_history_";

/**
 * Get all stored profiles
 * @returns {Record<string, { userId: string, name: string, branch: string, year: string, role: string, lastActive: string, totalTests: number, averageScore: number }>}
 */
export function getAllProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error reading profiles from localStorage:", err);
    return {};
  }
}

/**
 * Get a specific profile by handle/userId
 * @param {string} userId
 */
export function getProfile(userId) {
  if (!userId) return null;
  const cleanId = userId.toLowerCase().trim().replace(/^@/, "");
  const profiles = getAllProfiles();
  return profiles[cleanId] || null;
}

/**
 * Save or update a profile
 * @param {{ userId: string, name: string, branch?: string, year?: string, role?: string }} profileData
 */
export function saveProfile(profileData) {
  if (!profileData || !profileData.userId) return null;

  const cleanId = profileData.userId.toLowerCase().trim().replace(/^@/, "");
  const profiles = getAllProfiles();

  const existing = profiles[cleanId] || {};
  const updatedProfile = {
    userId: cleanId,
    name: profileData.name || existing.name || "Candidate",
    branch: profileData.branch || existing.branch || "CSE",
    year: profileData.year || existing.year || "3rd Year",
    role: profileData.role || existing.role || "Software Engineer",
    lastActive: new Date().toISOString(),
    totalTests: existing.totalTests || 0,
    averageScore: existing.averageScore || 0
  };

  profiles[cleanId] = updatedProfile;

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    setActiveUser(cleanId);
  } catch (err) {
    console.error("Error saving profile:", err);
  }

    // Async sync to backend SQLite database
  try {
    fetch("http://localhost:8000/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: cleanId,
        name: updatedProfile.name,
        branch: updatedProfile.branch,
        year: updatedProfile.year,
        role: updatedProfile.role
      })
    }).catch(() => {});
  } catch (e) {}

  return updatedProfile;
}

/**
 * Get active user handle from current session
 */
export function getActiveUser() {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY) || "";
  } catch (e) {
    return "";
  }
}

/**
 * Set active user handle
 * @param {string} userId
 */
export function setActiveUser(userId) {
  try {
    if (userId) {
      const cleanId = userId.toLowerCase().trim().replace(/^@/, "");
      localStorage.setItem(ACTIVE_USER_KEY, cleanId);
    }
  } catch (e) {}
}

/**
 * Generate 3 clean suggested user handles based on Name and Branch
 * @param {string} name
 * @param {string} branch
 * @returns {string[]}
 */
export function generateSuggestedUserIds(name = "candidate", branch = "cse") {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "user";
  const cleanBranch = branch.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "tech";
  const randomNum1 = Math.floor(10 + Math.random() * 89);
  const randomNum2 = Math.floor(100 + Math.random() * 899);
  const yearSuffix = new Date().getFullYear().toString().slice(-2);

  const candidate1 = `${cleanName}_${cleanBranch}`;
  const candidate2 = `${cleanName}_${randomNum1}`;
  const candidate3 = `${cleanName}_${cleanBranch}_${randomNum2}`;
  const candidate4 = `${cleanName}_${yearSuffix}`;

  const profiles = getAllProfiles();
  const suggestions = [candidate1, candidate2, candidate3, candidate4].filter(
    (id) => !profiles[id]
  );

  return suggestions.slice(0, 3);
}

/**
 * Get test history array for a user (Max 25 tests)
 * @param {string} userId
 * @returns {Array<any>}
 */
export function getUserHistory(userId) {
  if (!userId) return [];
  const cleanId = userId.toLowerCase().trim().replace(/^@/, "");
  try {
    const raw = localStorage.getItem(`${HISTORY_PREFIX}${cleanId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading history for user:", cleanId, err);
    return [];
  }
}

/**
 * Save a completed test result into candidate's history
 * Automatically enforces FIFO max 25 tests limit
 * @param {string} userId
 * @param {object} testPayload
 */
export function saveTestResult(userId, testPayload) {
  if (!userId || !testPayload) return null;
  const cleanId = userId.toLowerCase().trim().replace(/^@/, "");

  const history = getUserHistory(cleanId);
  const testId = "test_" + Date.now();
  const now = new Date();

  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const newTestRecord = {
    id: testId,
    timestamp: now.getTime(),
    dateString: formattedDate,
    timeString: formattedTime,
    interviewType: testPayload.interviewType || "Interview",
    role: testPayload.role || "Candidate",
    branch: testPayload.branch || "General",
    year: testPayload.year || "3rd Year",
    overallScore: testPayload.overallScore !== undefined ? testPayload.overallScore : 0,
    performanceLevel: testPayload.performanceLevel || "Developing",
    performanceBadge: testPayload.performanceBadge || "COMPLETED",
    durationMinutes: testPayload.durationMinutes || 15,
    integrityScore: testPayload.integrityScore !== undefined ? testPayload.integrityScore : 100,
    tabSwitches: testPayload.tabSwitches || 0,
    radarSkills: testPayload.radarSkills || [],
    communicationAnalysis: testPayload.communicationAnalysis || {},
    aiAnalysis: testPayload.aiAnalysis || {},
    topicsToRevise: testPayload.topicsToRevise || [],
    evaluatedQuestions: testPayload.evaluatedQuestions || [],
    dsaSummary: testPayload.dsaSummary || null,
    technicalProficiency: testPayload.technicalProficiency || []
  };

  // Append new test
  history.push(newTestRecord);

  // Enforce Max 25 FIFO Limit (Retain latest 25 tests)
  let trimmedHistory = history;
  if (trimmedHistory.length > MAX_HISTORY_LIMIT) {
    trimmedHistory = trimmedHistory.slice(-MAX_HISTORY_LIMIT);
  }

  try {
    localStorage.setItem(`${HISTORY_PREFIX}${cleanId}`, JSON.stringify(trimmedHistory));

    // Update profile aggregates
    const scores = trimmedHistory.map((t) => t.overallScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const profile = getProfile(cleanId) || {
      userId: cleanId,
      name: testPayload.name || "Candidate",
      branch: testPayload.branch,
      year: testPayload.year,
      role: testPayload.role
    };

    profile.totalTests = trimmedHistory.length;
    profile.averageScore = avgScore;
    profile.lastActive = new Date().toISOString();

    const allProfiles = getAllProfiles();
    allProfiles[cleanId] = profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
  } catch (err) {
    console.error("Error saving test result to localStorage:", err);
  }

    // Async sync interview result to backend SQLite database
  try {
    fetch("http://localhost:8000/api/interviews/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newTestRecord,
        userId: cleanId,
        name: testPayload.name || "Candidate",
        branch: testPayload.branch || "CSE",
        year: testPayload.year || "3rd Year",
        role: testPayload.role || "Software Engineer",
        interviewType: testPayload.interviewType || "Interview",
        overallScore: testPayload.overallScore !== undefined ? testPayload.overallScore : 0,
        performanceLevel: testPayload.performanceLevel || "Developing",
        durationMinutes: testPayload.durationMinutes || 15,
        integrityScore: testPayload.integrityScore !== undefined ? testPayload.integrityScore : 100,
        tabSwitches: testPayload.tabSwitches || 0
      })
    }).catch(() => {});
  } catch (e) {}

  return newTestRecord;
}

/**
 * Delete a specific test from user history
 * @param {string} userId
 * @param {string} testId
 */
export function deleteTest(userId, testId) {
  if (!userId || !testId) return false;
  const cleanId = userId.toLowerCase().trim().replace(/^@/, "");
  const history = getUserHistory(cleanId);
  const updatedHistory = history.filter((t) => t.id !== testId);

  try {
    localStorage.setItem(`${HISTORY_PREFIX}${cleanId}`, JSON.stringify(updatedHistory));

    // Update profile aggregates
    const scores = updatedHistory.map((t) => t.overallScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const profile = getProfile(cleanId);
    if (profile) {
      profile.totalTests = updatedHistory.length;
      profile.averageScore = avgScore;
      saveProfile(profile);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Clear all test history for a candidate
 * @param {string} userId
 */
export function clearUserHistory(userId) {
  if (!userId) return false;
  const cleanId = userId.toLowerCase().trim().replace(/^@/, "");
  try {
    localStorage.removeItem(`${HISTORY_PREFIX}${cleanId}`);
    const profile = getProfile(cleanId);
    if (profile) {
      profile.totalTests = 0;
      profile.averageScore = 0;
      saveProfile(profile);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Compute aggregated dashboard metrics across all saved tests
 * @param {Array<any>} history
 */
export function computeAggregatedStats(history = []) {
  if (!history || history.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      recentScore: 0,
      scoreImprovement: 0,
      avgCommunication: { clarity: 0, relevance: 0, structure: 0, conciseness: 0, vocabulary: 0 },
      topWeaknesses: [],
      aggregatedRadar: []
    };
  }

  const scores = history.map((t) => t.overallScore || 0);
  const totalTests = history.length;
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalTests);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const recentScore = scores[scores.length - 1];
  const firstScore = scores[0];
  const scoreImprovement = totalTests > 1 ? recentScore - firstScore : 0;

  // Communication averages
  const commKeys = ["clarity", "relevance", "structure", "conciseness", "vocabulary"];
  const avgComm = {};
  commKeys.forEach((k) => {
    const vals = history
      .map((t) => (t.communicationAnalysis && t.communicationAnalysis[k]) || 0)
      .filter((v) => v > 0);
    avgComm[k] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  });

  // Weaknesses aggregator (frequency counter across all tests)
  const weaknessFreq = {};
  history.forEach((t) => {
    if (t.topicsToRevise && Array.isArray(t.topicsToRevise)) {
      t.topicsToRevise.forEach((topic) => {
        const clean = topic.trim();
        if (clean) {
          weaknessFreq[clean] = (weaknessFreq[clean] || 0) + 1;
        }
      });
    }
    if (t.aiAnalysis && t.aiAnalysis.weaknesses && Array.isArray(t.aiAnalysis.weaknesses)) {
      t.aiAnalysis.weaknesses.forEach((w) => {
        const clean = w.trim();
        if (clean && !clean.includes("Proctor detected")) {
          weaknessFreq[clean] = (weaknessFreq[clean] || 0) + 1;
        }
      });
    }
  });

  const sortedWeaknesses = Object.entries(weaknessFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }))
    .slice(0, 6);

  // Aggregated Skills Radar
  const skillSums = {};
  const skillCounts = {};
  history.forEach((t) => {
    if (t.radarSkills && Array.isArray(t.radarSkills)) {
      t.radarSkills.forEach((s) => {
        if (s.skill && s.score !== undefined) {
          skillSums[s.skill] = (skillSums[s.skill] || 0) + s.score;
          skillCounts[s.skill] = (skillCounts[s.skill] || 0) + 1;
        }
      });
    }
  });

  const aggregatedRadar = Object.keys(skillSums).map((skillName) => ({
    skill: skillName,
    score: Math.round(skillSums[skillName] / skillCounts[skillName]),
    fullMark: 100
  }));

  return {
    totalTests,
    averageScore,
    highestScore,
    lowestScore,
    recentScore,
    scoreImprovement,
    avgCommunication: avgComm,
    topWeaknesses: sortedWeaknesses,
    aggregatedRadar
  };
}

/**
 * Generate side-by-side comparison between Test A and Test B
 * @param {object} testA - Earlier test
 * @param {object} testB - Later test
 */
export function compareTwoTests(testA, testB) {
  if (!testA || !testB) return null;

  const scoreDiff = (testB.overallScore || 0) - (testA.overallScore || 0);

  // Radar skills delta
  const radarDiff = [];
  const skillsMapA = {};
  (testA.radarSkills || []).forEach((s) => {
    skillsMapA[s.skill] = s.score;
  });

  (testB.radarSkills || []).forEach((sB) => {
    const scoreA = skillsMapA[sB.skill] !== undefined ? skillsMapA[sB.skill] : null;
    radarDiff.push({
      skill: sB.skill,
      scoreA: scoreA,
      scoreB: sB.score,
      delta: scoreA !== null ? sB.score - scoreA : 0
    });
  });

  // Communication delta
  const commKeys = ["clarity", "relevance", "structure", "conciseness", "vocabulary"];
  const commDiff = {};
  commKeys.forEach((k) => {
    const valA = (testA.communicationAnalysis && testA.communicationAnalysis[k]) || 0;
    const valB = (testB.communicationAnalysis && testB.communicationAnalysis[k]) || 0;
    commDiff[k] = {
      valA,
      valB,
      delta: valB - valA
    };
  });

  // Weakness resolved vs persistent
  const weaknessesA = new Set(testA.topicsToRevise || []);
  const weaknessesB = new Set(testB.topicsToRevise || []);

  const resolvedWeaknesses = [...weaknessesA].filter((w) => !weaknessesB.has(w));
  const persistentWeaknesses = [...weaknessesA].filter((w) => weaknessesB.has(w));
  const newWeaknesses = [...weaknessesB].filter((w) => !weaknessesA.has(w));

  return {
    testA,
    testB,
    scoreDiff,
    isImproved: scoreDiff > 0,
    radarDiff,
    commDiff,
    resolvedWeaknesses,
    persistentWeaknesses,
    newWeaknesses
  };
}

/**
 * Auto-syncs all existing localStorage candidate records to the backend database
 */
export function syncAllLocalDataToBackend() {
  try {
    const profiles = getAllProfiles();
    Object.values(profiles).forEach((p) => {
      fetch("http://localhost:8000/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: p.userId,
          name: p.name,
          branch: p.branch,
          year: p.year,
          role: p.role
        })
      }).catch(() => {});

      const tests = getUserHistory(p.userId);
      tests.forEach((t) => {
        fetch("http://localhost:8000/api/interviews/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...t,
            userId: p.userId,
            name: p.name,
            branch: t.branch || p.branch,
            year: t.year || p.year,
            role: t.role || p.role
          })
        }).catch(() => {});
      });
    });
  } catch (e) {}
}

if (typeof window !== "undefined") {
  setTimeout(syncAllLocalDataToBackend, 1500);
}

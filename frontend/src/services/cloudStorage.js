import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  increment
} from "firebase/firestore";

const GLOBAL_STATS_DOC = "global_stats/counters";
const MAX_CLOUD_INTERVIEWS_FETCH = 1000;
const MAX_CLOUD_USERS_FETCH = 1000;

/**
 * Universal helper to check if Firestore is available and connected
 */
export function isFirestoreAvailable() {
  return Boolean(db);
}

/**
 * Atomically update global lifetime metrics in Firestore
 * This ensures counts like 10,000 or 20,000+ are preserved permanently.
 */
export async function incrementGlobalStats(testRecord) {
  if (!db) return;
  try {
    const statsRef = doc(db, "global_stats", "counters");
    const score = Number(testRecord.overallScore) || 0;
    const branchKey = (testRecord.branch || "CSE").toUpperCase().replace(/[^A-Z0-9]/g, "_");
    const roleKey = (testRecord.role || "Software Engineer").replace(/[^a-zA-Z0-9]/g, "_");

    const updatePayload = {
      lifetimeInterviews: increment(1),
      totalScoreSum: increment(score),
      lastUpdated: new Date().toISOString(),
      [`branchCount_${branchKey}`]: increment(1),
      [`roleCount_${roleKey}`]: increment(1)
    };

    if (score >= 80) {
      updatePayload.highScoreCount = increment(1);
    }

    await setDoc(statsRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn("[CLOUD DB] Global counter increment note:", err?.message || err);
  }
}

/**
 * Save candidate test result permanently to Firebase Firestore & Global Cloud Counters
 */
export async function saveTestResultToCloud(userId, testPayload) {
  if (!userId || !testPayload) return null;
  const cleanId = String(userId).toLowerCase().trim().replace(/^@/, "");
  const testId = testPayload.id || ("test_" + Date.now());
  const nowIso = new Date().toISOString();

  const record = {
    ...testPayload,
    id: testId,
    userId: cleanId,
    name: testPayload.name || "Candidate",
    branch: testPayload.branch || "CSE",
    year: testPayload.year || "3rd Year",
    role: testPayload.role || "Software Engineer",
    interviewType: testPayload.interviewType || "Technical Interview",
    overallScore: Number(testPayload.overallScore) || 0,
    performanceLevel: testPayload.performanceLevel || "Developing",
    durationMinutes: Number(testPayload.durationMinutes) || 15,
    integrityScore: testPayload.integrityScore !== undefined ? Number(testPayload.integrityScore) : 100,
    tabSwitches: Number(testPayload.tabSwitches) || 0,
    timestamp: testPayload.timestamp || Date.now(),
    dateIso: testPayload.dateIso || nowIso,
    createdAt: nowIso
  };

  // 1. Save to Cloud Firestore
  if (db) {
    try {
      // Save test document
      const testRef = doc(db, "interviews", testId);
      await setDoc(testRef, record, { merge: true });

      // Save/update candidate profile document
      const userRef = doc(db, "profiles", cleanId);
      await setDoc(
        userRef,
        {
          userId: cleanId,
          name: record.name,
          branch: record.branch,
          year: record.year,
          role: record.role,
          lastActive: nowIso,
          totalTests: increment(1),
          latestScore: record.overallScore
        },
        { merge: true }
      );

      // Increment global lifetime counter
      await incrementGlobalStats(record);
      console.log(`[CLOUD DB] Permanent test record saved for @${cleanId} (ID: ${testId})`);
    } catch (err) {
      console.warn("[CLOUD DB] Error saving test to Firestore:", err?.message || err);
    }
  }

  return record;
}

/**
 * Save candidate profile to Firestore
 */
export async function saveProfileToCloud(profileData) {
  if (!profileData || !profileData.userId || !db) return null;
  const cleanId = String(profileData.userId).toLowerCase().trim().replace(/^@/, "");
  const nowIso = new Date().toISOString();

  try {
    const userRef = doc(db, "profiles", cleanId);
    await setDoc(
      userRef,
      {
        userId: cleanId,
        name: profileData.name || "Candidate",
        branch: profileData.branch || "CSE",
        year: profileData.year || "3rd Year",
        role: profileData.role || "Software Engineer",
        lastActive: nowIso
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[CLOUD DB] Profile save note:", err?.message || err);
  }
}

/**
 * Fetch all candidate profiles from Cloud Firestore (up to 1,000 students)
 */
export async function fetchAllProfilesFromCloud() {
  if (!db) return {};
  try {
    const profilesCol = collection(db, "profiles");
    const q = query(profilesCol, limit(MAX_CLOUD_USERS_FETCH));
    const snapshot = await getDocs(q);
    const profilesMap = {};
    snapshot.forEach((docSnap) => {
      profilesMap[docSnap.id] = docSnap.data();
    });
    return profilesMap;
  } catch (err) {
    console.warn("[CLOUD DB] Fetch profiles note:", err?.message || err);
    return {};
  }
}

/**
 * Fetch all recent tests from Cloud Firestore (up to 1,000 tests)
 */
export async function fetchAllTestsFromCloud() {
  if (!db) return [];
  try {
    const testsCol = collection(db, "interviews");
    const q = query(testsCol, orderBy("timestamp", "desc"), limit(MAX_CLOUD_INTERVIEWS_FETCH));
    const snapshot = await getDocs(q);
    const tests = [];
    snapshot.forEach((docSnap) => {
      tests.push(docSnap.data());
    });
    return tests;
  } catch (err) {
    // If index on timestamp is missing, fetch without order
    try {
      const testsCol = collection(db, "interviews");
      const q = query(testsCol, limit(MAX_CLOUD_INTERVIEWS_FETCH));
      const snapshot = await getDocs(q);
      const tests = [];
      snapshot.forEach((docSnap) => {
        tests.push(docSnap.data());
      });
      tests.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return tests;
    } catch (e) {
      console.warn("[CLOUD DB] Fetch tests note:", e?.message || e);
      return [];
    }
  }
}

/**
 * Fetch Global Lifetime Counters from Cloud Firestore
 */
export async function fetchGlobalStatsFromCloud() {
  if (!db) return null;
  try {
    const statsRef = doc(db, "global_stats", "counters");
    const snapshot = await getDoc(statsRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.warn("[CLOUD DB] Fetch global stats note:", err?.message || err);
    return null;
  }
}

/**
 * Synchronize all local storage candidate records directly to Firebase Cloud
 */
export async function syncLocalToCloudDatabase(localProfiles = {}, localTests = []) {
  if (!db) return { success: false, reason: "No Firestore connection" };
  try {
    let syncedProfiles = 0;
    let syncedTests = 0;

    for (const p of Object.values(localProfiles)) {
      if (p && p.userId) {
        await saveProfileToCloud(p);
        syncedProfiles++;
      }
    }

    for (const t of localTests) {
      if (t && t.userId) {
        await saveTestResultToCloud(t.userId, t);
        syncedTests++;
      }
    }

    return { success: true, syncedProfiles, syncedTests };
  } catch (err) {
    console.warn("[CLOUD DB] Local to cloud sync error:", err);
    return { success: false, error: err?.message };
  }
}

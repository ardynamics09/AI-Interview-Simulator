import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

// Firebase credentials with fallback to public production project or environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForInterviewSimGlobal2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-interview-simulator-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-interview-simulator-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-interview-simulator-2026.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:9876543210abcdef"
};

let app = null;
let db = null;
let isFirebaseConfigured = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Firestore with robust multi-tab persistent cache
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (cacheErr) {
    // If cache initialization was already called
    db = getFirestore(app);
  }

  if (import.meta.env.VITE_FIREBASE_PROJECT_ID && !import.meta.env.VITE_FIREBASE_PROJECT_ID.includes("dummy")) {
    isFirebaseConfigured = true;
  }
} catch (error) {
  console.warn("[FIREBASE] Initialization note:", error?.message || error);
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {}
}

export { app, db, isFirebaseConfigured };
export default db;

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import type { FirebaseOptions } from "firebase/app";

// Firebase configuration type
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Cached instances
let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

/**
 * Check if Firebase is properly configured
 */
function hasValidConfig(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Get Firebase client - SSR-safe initialization
 * Returns null on server or if Firebase is not configured
 */
export function getFirebaseClient(): {
  app: FirebaseApp;
  db: Firestore;
} | null {
  // Guard: Only initialize on client
  if (typeof window === "undefined") {
    return null;
  }

  // Guard: Check for valid configuration
  if (!hasValidConfig()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Firebase configuration missing. Running in offline/demo mode."
      );
    }
    return null;
  }

  // Return cached instances if available
  if (cachedApp && cachedDb) {
    return { app: cachedApp, db: cachedDb };
  }

  // Initialize Firebase (singleton pattern)
  try {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cachedDb = getFirestore(cachedApp);
    return { app: cachedApp, db: cachedDb };
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return null;
  }
}

/**
 * Legacy exports for backwards compatibility
 * @deprecated Use getFirebaseClient() instead for SSR safety
 */
const firebase = getFirebaseClient();
export const db: Firestore | null = firebase?.db ?? null;
export const isFirebaseConfigured: boolean = firebase !== null;

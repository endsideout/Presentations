"use client";

import { useEffect, useCallback, useRef } from "react";
import { getFirebaseClient } from "../../lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { WellnessData } from "../../lib/types/firebase";

const WELLNESS_STORAGE_KEY = "wellness_data";

/**
 * Hook to sync wellness data to Firebase
 */
export function useWellnessSync(
  userData: {
    name: string;
    totalPoints: number;
    dimensions: Record<string, { progress: number; points: number }>;
    completedQuests: number[];
    earnedBadgeIndices: number[];
    streakDays: number;
  },
  studentEmail: string | null
) {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncToFirebase = useCallback(
    async (wellnessData: WellnessData) => {
      if (!studentEmail) {
        // Save to localStorage for later sync
        try {
          localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellnessData));
        } catch (e) {
          console.warn("Failed to save wellness data to localStorage:", e);
        }
        return;
      }

      const firebase = getFirebaseClient();
      if (!firebase) {
        // Offline mode - save to localStorage
        try {
          localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellnessData));
        } catch (e) {
          console.warn("Failed to save wellness data to localStorage:", e);
        }
        return;
      }

      try {
        const studentRef = doc(firebase.db, "students", studentEmail);
        
        // Update the student document with wellness data
        await setDoc(
          studentRef,
          {
            email: studentEmail,
            name: userData.name, // Store student name for teacher view
            wellness: {
              ...wellnessData,
              lastActiveAt: Timestamp.now(),
            },
            lastActiveAt: Timestamp.now(),
          },
          { merge: true }
        );

        // Clear localStorage after successful sync
        try {
          localStorage.removeItem(WELLNESS_STORAGE_KEY);
        } catch (e) {
          // Ignore localStorage errors
        }
      } catch (error) {
        console.error("Failed to sync wellness data to Firebase:", error);
        // Save to localStorage for retry
        try {
          localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellnessData));
        } catch (e) {
          console.warn("Failed to save wellness data to localStorage:", e);
        }
      }
    },
    [studentEmail]
  );

  // Debounced sync function
  const debouncedSync = useCallback(
    (wellnessData: WellnessData) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncToFirebase(wellnessData);
      }, 1000); // Wait 1 second after last change
    },
    [syncToFirebase]
  );

  // Sync when userData changes
  useEffect(() => {
    const wellnessData: WellnessData = {
      totalPoints: userData.totalPoints,
      dimensions: userData.dimensions,
      completedQuests: userData.completedQuests,
      earnedBadgeIndices: userData.earnedBadgeIndices,
      streakDays: userData.streakDays,
    };

    debouncedSync(wellnessData);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    userData.totalPoints,
    JSON.stringify(userData.dimensions),
    JSON.stringify(userData.completedQuests),
    JSON.stringify(userData.earnedBadgeIndices),
    userData.streakDays,
    debouncedSync,
  ]);

  // Try to sync any pending data from localStorage when email becomes available
  useEffect(() => {
    if (!studentEmail) return;

    try {
      const stored = localStorage.getItem(WELLNESS_STORAGE_KEY);
      if (stored) {
        const wellnessData = JSON.parse(stored);
        syncToFirebase(wellnessData);
      }
    } catch (e) {
      console.warn("Failed to load pending wellness data from localStorage:", e);
    }
  }, [studentEmail, syncToFirebase]);
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getFirebaseClient } from "../../lib/firebase";
import type { Quest } from "../types";
import { WELLNESS_QUESTS } from "../constants"; // Fallback

/**
 * Hook to fetch wellness quests from Firebase
 * Falls back to constants if Firebase is not available or no quests exist
 */
export function useWellnessQuests() {
  const [quests, setQuests] = useState<Quest[]>(WELLNESS_QUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebase = getFirebaseClient();

    if (!firebase) {
      // Offline mode - use constants
      setQuests(WELLNESS_QUESTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    let hasResolved = false;

    // Timeout fallback - if Firebase takes too long, use constants
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        console.warn("⚠️ Firebase quest loading timeout, using fallback constants");
        setQuests(WELLNESS_QUESTS);
        setLoading(false);
        hasResolved = true;
      }
    }, 3000); // 3 second timeout

    const unsubscribe: Unsubscribe = onSnapshot(
      collection(firebase.db, "wellness_quests"),
      (querySnapshot) => {
        if (hasResolved) return; // Already resolved via timeout
        
        clearTimeout(timeoutId);
        hasResolved = true;

        if (querySnapshot.empty) {
          // No quests in Firebase, use constants as fallback
          console.log("📭 No quests in Firebase, using fallback constants");
          setQuests(WELLNESS_QUESTS);
          setLoading(false);
          return;
        }

        const data: Quest[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            id: docData.id || parseInt(doc.id),
            title: docData.title,
            description: docData.description,
            dimension: docData.dimension,
            points: docData.points,
            icon: docData.icon,
          });
        });

        // Sort by ID
        data.sort((a, b) => a.id - b.id);
        console.log(`✅ Loaded ${data.length} quests from Firebase`);
        setQuests(data);
        setLoading(false);
      },
      (error) => {
        if (hasResolved) return; // Already resolved via timeout
        
        clearTimeout(timeoutId);
        hasResolved = true;
        console.error("❌ Error loading quests:", error);
        // Fallback to constants on error
        setQuests(WELLNESS_QUESTS);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return { quests, loading };
}

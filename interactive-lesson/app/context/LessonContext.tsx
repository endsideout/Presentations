"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { getFirebaseClient } from "../lib/firebase";
import {
  doc,
  setDoc,
  arrayUnion,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import type {
  StudentDocument,
  LocalProgress,
  SyncStatus,
  RetryQueueItem,
} from "../lib/types/firebase";
import { isStudentDocument, isLocalProgress } from "../lib/types/firebase";

// localStorage keys
const STORAGE_KEYS = {
  EMAIL: "student_email",
  PROGRESS: "student_progress",
  RETRY_QUEUE: "retry_queue",
} as const;

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
} as const;

interface LessonContextType {
  studentEmail: string | null;
  setStudentEmail: (email: string) => Promise<void>;
  completedSlides: number[];
  markSlideComplete: (slideNumber: number) => Promise<void>;
  updateCurrentSlide: (slideNumber: number) => Promise<void>;
  loading: boolean;
  logout: () => void;
  /** Current sync status with Firestore */
  syncStatus: SyncStatus;
  /** Last sync error message, if any */
  syncError: string | null;
  /** Whether the browser is online */
  isOnline: boolean;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

/**
 * Load progress from localStorage
 */
function loadLocalProgress(email: string): LocalProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (isLocalProgress(data) && data.email === email) {
      return data;
    }
  } catch {
    // Invalid JSON, ignore
  }
  return null;
}

/**
 * Save progress to localStorage
 */
function saveLocalProgress(progress: LocalProgress): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save progress to localStorage:", e);
  }
}

/**
 * Clear localStorage progress
 */
function clearLocalProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.EMAIL);
  localStorage.removeItem(STORAGE_KEYS.RETRY_QUEUE);
}

/**
 * Initialize email from localStorage (runs only on client)
 */
function getInitialEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.EMAIL);
}

/**
 * Initialize progress from localStorage (runs only on client)
 */
function getInitialProgress(): { slides: number[]; slide: number } {
  if (typeof window === "undefined") return { slides: [], slide: 1 };

  const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
  if (!email) return { slides: [], slide: 1 };

  const progress = loadLocalProgress(email);
  return {
    slides: progress?.completedSlides || [],
    slide: progress?.currentSlide || 1,
  };
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(retryCount: number): number {
  const delay = RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, retryCount);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY_MS);
}

/**
 * Generate unique ID for retry queue items
 */
function generateRetryId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function LessonProvider({ children }: { children: ReactNode }) {
  // Use lazy initializers to avoid setState in effects
  const [studentEmail, setStudentState] = useState<string | null>(
    getInitialEmail
  );
  const [completedSlides, setCompletedSlides] = useState<number[]>(
    () => getInitialProgress().slides
  );
  const [loading, setLoading] = useState(() => Boolean(getInitialEmail()));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true
  );

  // Track active listener for cleanup
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Track last synced slide to avoid redundant writes
  const lastSyncedSlideRef = useRef<number | null>(null);

  // Retry queue for failed writes
  const retryQueueRef = useRef<RetryQueueItem[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load retry queue from localStorage
   */
  const loadRetryQueue = useCallback((): RetryQueueItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RETRY_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  /**
   * Save retry queue to localStorage
   */
  const saveRetryQueue = useCallback((queue: RetryQueueItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.RETRY_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to save retry queue:", e);
    }
  }, []);

  /**
   * Add item to retry queue
   */
  const addToRetryQueue = useCallback(
    (email: string, data: Partial<StudentDocument>) => {
      const item: RetryQueueItem = {
        id: generateRetryId(),
        email,
        data,
        retryCount: 0,
        maxRetries: RETRY_CONFIG.MAX_RETRIES,
        createdAt: Date.now(),
      };

      retryQueueRef.current = [...retryQueueRef.current, item];
      saveRetryQueue(retryQueueRef.current);

      if (process.env.NODE_ENV === "development") {
        console.log(`📥 Added to retry queue:`, item.id);
      }
    },
    [saveRetryQueue]
  );

  /**
   * Process the retry queue
   */
  const processRetryQueue = useCallback(async () => {
    const firebase = getFirebaseClient();
    if (!firebase || !isOnline || retryQueueRef.current.length === 0) {
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔄 Processing retry queue: ${retryQueueRef.current.length} items`
      );
    }

    const queue = [...retryQueueRef.current];
    const failedItems: RetryQueueItem[] = [];
    const successfulIds: string[] = [];

    for (const item of queue) {
      if (item.retryCount >= item.maxRetries) {
        // Max retries reached, drop the item
        if (process.env.NODE_ENV === "development") {
          console.warn(`❌ Max retries reached for ${item.id}, dropping`);
        }
        continue;
      }

      try {
        const docRef = doc(firebase.db, "students", item.email);
        await setDoc(
          docRef,
          {
            email: item.email,
            lastActiveAt: Timestamp.now(),
            ...item.data,
          },
          { merge: true }
        );

        successfulIds.push(item.id);
        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Retry successful for ${item.id}`);
        }
      } catch {
        // Increment retry count and keep in queue
        failedItems.push({
          ...item,
          retryCount: item.retryCount + 1,
          lastAttemptAt: Date.now(),
        });

        if (process.env.NODE_ENV === "development") {
          console.warn(
            `⚠️ Retry failed for ${item.id}, attempt ${item.retryCount + 1}`
          );
        }
      }
    }

    // Update queue with remaining failed items
    retryQueueRef.current = failedItems;
    saveRetryQueue(failedItems);

    // Schedule next retry if there are still items
    if (failedItems.length > 0 && isOnline) {
      const nextDelay = getBackoffDelay(failedItems[0].retryCount);
      retryTimeoutRef.current = setTimeout(processRetryQueue, nextDelay);
    }

    // Update sync status
    if (failedItems.length === 0 && successfulIds.length > 0) {
      setSyncStatus("synced");
    }
  }, [isOnline, saveRetryQueue]);

  /**
   * Subscribe to real-time updates for a student's progress
   */
  const subscribeToProgress = useCallback((email: string) => {
    // Clean up existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const firebase = getFirebaseClient();
    if (!firebase) {
      // Offline mode - just use localStorage
      setSyncStatus("offline");
      setLoading(false);
      return;
    }

    setSyncStatus("syncing");
    setSyncError(null);

    const docRef = doc(firebase.db, "students", email);

    // Set up real-time listener
    unsubscribeRef.current = onSnapshot(
      docRef,
      (snapshot) => {
        setSyncStatus("synced");
        setSyncError(null);

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (isStudentDocument(data)) {
            const firestoreSlides = data.completedSlides || [];
            const firestoreCurrentSlide = data.currentSlide;

            // Update React state from Firestore
            setCompletedSlides(firestoreSlides);

            // Sync Firestore → localStorage for offline consistency
            saveLocalProgress({
              email,
              completedSlides: firestoreSlides,
              currentSlide: firestoreCurrentSlide,
              lastSyncedAt: new Date().toISOString(),
            });

            // Track last synced slide
            if (firestoreCurrentSlide !== undefined) {
              lastSyncedSlideRef.current = firestoreCurrentSlide;
            }

            if (process.env.NODE_ENV === "development") {
              console.log(
                `🔄 Real-time sync: ${email} - ${firestoreSlides.length} slides completed`
              );
            }
          }
        } else {
          // Document doesn't exist yet - that's fine, student just started
          if (process.env.NODE_ENV === "development") {
            console.log(`📝 No existing progress for ${email}`);
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error("❌ Firestore listener error:", error);
        setSyncStatus("error");
        setSyncError(error.message || "Failed to sync with server");
        setLoading(false);
      }
    );
  }, []);

  /**
   * Write student data to Firestore using setDoc with merge
   * This handles both creation and updates atomically
   * Falls back to retry queue on failure
   */
  const writeToFirestore = useCallback(
    async (
      email: string,
      updates: Partial<Omit<StudentDocument, "email">>
    ): Promise<boolean> => {
      const firebase = getFirebaseClient();

      // If offline or no firebase, queue for later
      if (!firebase || !isOnline) {
        addToRetryQueue(email, updates);
        setSyncStatus("offline");
        return false;
      }

      setSyncStatus("syncing");

      try {
        const docRef = doc(firebase.db, "students", email);

        // Use setDoc with merge: true to handle both create and update
        // This is the key fix - avoids "document does not exist" errors
        await setDoc(
          docRef,
          {
            email,
            lastActiveAt: Timestamp.now(),
            ...updates,
          },
          { merge: true }
        );

        setSyncStatus("synced");
        setSyncError(null);

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Firestore write successful for ${email}`);
        }

        return true;
      } catch (e) {
        const error = e as Error;
        console.error("❌ Firestore write failed:", error.message);

        // Add to retry queue
        addToRetryQueue(email, updates);

        setSyncStatus("error");
        setSyncError(`Write failed: ${error.message}`);

        // Schedule retry
        const delay = getBackoffDelay(0);
        retryTimeoutRef.current = setTimeout(processRetryQueue, delay);

        return false;
      }
    },
    [isOnline, addToRetryQueue, processRetryQueue]
  );

  // Online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("syncing");

      if (process.env.NODE_ENV === "development") {
        console.log("🌐 Back online, processing retry queue...");
      }

      // Process retry queue when coming back online
      processRetryQueue();

      // Re-establish listener if we have an email
      if (studentEmail) {
        subscribeToProgress(studentEmail);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");

      if (process.env.NODE_ENV === "development") {
        console.log("📴 Gone offline");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load persisted retry queue on mount
    retryQueueRef.current = loadRetryQueue();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [processRetryQueue, subscribeToProgress, studentEmail, loadRetryQueue]);

  // Attach listener on mount if we have a stored email
  // (initial state is already set via lazy initializers)
  useEffect(() => {
    const email = studentEmail;

    if (email) {
      // Attach real-time listener to reconcile with Firestore
      subscribeToProgress(email);

      // Process any pending retries
      if (isOnline && retryQueueRef.current.length > 0) {
        processRetryQueue();
      }
    } else {
      setLoading(false);
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // Only run on mount - studentEmail from lazy init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStudentEmail = async (email: string) => {
    // Set local state immediately for better UX
    setStudentState(email);
    localStorage.setItem(STORAGE_KEYS.EMAIL, email);

    // Load any existing local progress for this email
    const localProgress = loadLocalProgress(email);
    if (localProgress) {
      setCompletedSlides(localProgress.completedSlides);
    }

    // Initialize/update Firestore document (non-blocking)
    writeToFirestore(email, {}).catch(() => {
      // Error already handled in writeToFirestore
    });

    // Attach real-time listener
    subscribeToProgress(email);

    return Promise.resolve();
  };

  const updateCurrentSlide = async (slideNumber: number) => {
    if (!studentEmail) return;

    // Skip redundant writes for the same slide
    if (lastSyncedSlideRef.current === slideNumber) return;
    lastSyncedSlideRef.current = slideNumber;

    // Update localStorage
    const currentProgress = loadLocalProgress(studentEmail);
    saveLocalProgress({
      email: studentEmail,
      completedSlides: currentProgress?.completedSlides || completedSlides,
      currentSlide: slideNumber,
      lastSyncedAt: currentProgress?.lastSyncedAt,
    });

    // Sync to Firestore (non-blocking)
    writeToFirestore(studentEmail, { currentSlide: slideNumber }).catch(() => {
      // Error already handled
    });
  };

  const markSlideComplete = async (slideNumber: number) => {
    if (!studentEmail) return;

    // Skip if already completed
    if (completedSlides.includes(slideNumber)) return;

    // Update local state immediately
    const newCompleted = [...completedSlides, slideNumber];
    setCompletedSlides(newCompleted);

    // Update localStorage
    saveLocalProgress({
      email: studentEmail,
      completedSlides: newCompleted,
      currentSlide: slideNumber,
      lastSyncedAt: new Date().toISOString(),
    });

    // Sync to Firestore using arrayUnion for atomic append
    const firebase = getFirebaseClient();
    if (firebase && isOnline) {
      setSyncStatus("syncing");
      try {
        const docRef = doc(firebase.db, "students", studentEmail);
        // Use setDoc with merge + arrayUnion for atomic, idempotent updates
        await setDoc(
          docRef,
          {
            email: studentEmail,
            completedSlides: arrayUnion(slideNumber),
            lastActiveAt: Timestamp.now(),
            currentSlide: slideNumber,
          },
          { merge: true }
        );

        setSyncStatus("synced");
        setSyncError(null);

        if (process.env.NODE_ENV === "development") {
          console.log(
            `✅ Slide ${slideNumber} marked complete for ${studentEmail}`
          );
        }
      } catch (e) {
        const error = e as Error;
        console.error("❌ Failed to mark slide complete:", error.message);

        // Add to retry queue
        addToRetryQueue(studentEmail, {
          completedSlides: arrayUnion(slideNumber) as unknown as number[],
          currentSlide: slideNumber,
        });

        setSyncStatus("error");
        setSyncError(`Failed to save progress: ${error.message}`);

        // Schedule retry
        const delay = getBackoffDelay(0);
        retryTimeoutRef.current = setTimeout(processRetryQueue, delay);
      }
    } else {
      // Offline - queue for later
      addToRetryQueue(studentEmail, {
        completedSlides: arrayUnion(slideNumber) as unknown as number[],
        currentSlide: slideNumber,
      });
    }
  };

  const logout = () => {
    // Clean up listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Reset state
    setStudentState(null);
    setCompletedSlides([]);
    setSyncStatus("idle");
    setSyncError(null);
    lastSyncedSlideRef.current = null;
    retryQueueRef.current = [];

    // Clear localStorage
    clearLocalProgress();
  };

  return (
    <LessonContext.Provider
      value={{
        studentEmail,
        setStudentEmail,
        completedSlides,
        markSlideComplete,
        updateCurrentSlide,
        loading,
        logout,
        syncStatus,
        syncError,
        isOnline,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error("useLesson must be used within a LessonProvider");
  }
  return context;
}

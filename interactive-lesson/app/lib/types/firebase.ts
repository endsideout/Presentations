import { Timestamp } from "firebase/firestore";

/**
 * Sync status for student-side operations
 */
export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

/**
 * Connection status for real-time listeners
 */
export type ConnectionStatus = "connecting" | "connected" | "error" | "disconnected";

/**
 * Item in the retry queue for failed writes
 */
export interface RetryQueueItem {
  id: string;
  email: string;
  data: Partial<StudentDocument>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttemptAt?: number;
}

/**
 * Student document structure in Firestore
 */
export interface StudentDocument {
  email: string;
  completedSlides: number[];
  /** Optional - may not exist on first write or for older documents */
  lastActiveAt?: Timestamp;
  currentSlide?: number;
}

/**
 * Progress data stored in localStorage
 */
export interface LocalProgress {
  email: string;
  completedSlides: number[];
  currentSlide?: number;
  /** ISO timestamp of last sync with Firestore */
  lastSyncedAt?: string;
}

/**
 * Type guard to check if a document is a valid StudentDocument
 */
export function isStudentDocument(data: unknown): data is StudentDocument {
  if (typeof data !== "object" || data === null) return false;

  const doc = data as Record<string, unknown>;
  return (
    typeof doc.email === "string" &&
    Array.isArray(doc.completedSlides) &&
    doc.completedSlides.every((slide: unknown) => typeof slide === "number")
    // lastActiveAt is now optional, so we don't check for it
  );
}

/**
 * Type guard for localStorage progress
 */
export function isLocalProgress(data: unknown): data is LocalProgress {
  if (typeof data !== "object" || data === null) return false;

  const doc = data as Record<string, unknown>;
  return (
    typeof doc.email === "string" &&
    Array.isArray(doc.completedSlides) &&
    doc.completedSlides.every((slide: unknown) => typeof slide === "number")
  );
}

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

export interface ModuleProgress {
  completedSlides: number[];
  currentSlide: number;
  lastActiveAt?: Timestamp;
}

/**
 * Student document structure in Firestore
 */
export interface StudentDocument {
  email: string;
  /** Legacy: flattened progress for the original single-module lesson */
  completedSlides?: number[];
  /** Optional - may not exist on first write or for older documents */
  lastActiveAt?: Timestamp;
  /** Legacy: flattened current slide */
  currentSlide?: number;

  /** New: Multi-module progress map */
  progress?: Record<string, ModuleProgress>;
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
  /** Multi-module progress map */
  progress?: Record<string, {
    completedSlides: number[];
    currentSlide: number;
    lastSyncedAt?: string;
  }>;
}

/**
 * Type guard to check if a document is a valid StudentDocument
 */
export function isStudentDocument(data: unknown): data is StudentDocument {
  if (typeof data !== "object" || data === null) return false;

  const doc = data as Record<string, unknown>;
  return (
    typeof doc.email === "string"
    // Loosened checks because completedSlides is now optional if progress exists, 
    // but in practice we expect at least email.
  );
}

/**
 * Type guard for localStorage progress
 */
export function isLocalProgress(data: unknown): data is LocalProgress {
  if (typeof data !== "object" || data === null) return false;

  const doc = data as Record<string, unknown>;
  return typeof doc.email === "string";
}

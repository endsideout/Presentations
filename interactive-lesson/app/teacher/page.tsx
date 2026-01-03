"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "../lib/firebase";
import { Heading, Subheading } from "../components/Typography";
import type { ConnectionStatus } from "../lib/types/firebase";

// ============================================================================
// Constants
// ============================================================================

/**
 * Interactive slides that count toward progress
 */
const INTERACTIVE_SLIDES = {
  PLATE_ACTIVITY: { slide: 3, label: "Plate Activity" },
  QUIZ: { slide: 6, label: "Quiz" },
  GRAINS_SORTING: { slide: 8, label: "Grains Sorting" },
  PROTEIN_SORTING: { slide: 12, label: "Protein Sorting" },
  PLATE_CHOICE: { slide: 13, label: "Plate Choice" },
} as const;

const INTERACTIVE_SLIDE_LIST = Object.values(INTERACTIVE_SLIDES);
const TOTAL_INTERACTIVE_SLIDES = INTERACTIVE_SLIDE_LIST.length;

// ============================================================================
// Types
// ============================================================================

interface StudentData {
  id: string; // email
  email: string;
  completedSlides: number[];
  lastActiveAt?: Timestamp;
  currentSlide?: number;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Connection status badge showing real-time listener state
 */
function ConnectionStatusBadge({
  status,
  error,
  onRetry,
}: {
  status: ConnectionStatus;
  error: string | null;
  onRetry?: () => void;
}) {
  const config = {
    connecting: {
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
      dotClass: "bg-blue-500",
      label: "Connecting...",
      animate: true,
    },
    connected: {
      bgClass: "bg-green-100",
      textClass: "text-green-700",
      dotClass: "bg-green-500",
      label: "Real-time Active",
      animate: false,
    },
    error: {
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      dotClass: "bg-red-500",
      label: "Connection Error",
      animate: false,
    },
    disconnected: {
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-700",
      dotClass: "bg-yellow-500",
      label: "Offline / Demo Mode",
      animate: false,
    },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.bgClass} ${config.textClass}`}
        title={error || undefined}
      >
        <div
          className={`h-2 w-2 rounded-full ${config.dotClass} ${
            config.animate ? "animate-pulse" : ""
          }`}
        />
        {config.label}
      </div>
      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-300 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Activity completion badge
 */
function ActivityBadge({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        completed
          ? "bg-green-100 text-green-800"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * Format relative time from timestamp
 */
function formatRelativeTime(timestamp: Timestamp | undefined): string {
  if (!timestamp?.seconds) return "N/A";

  const now = Date.now();
  const then = timestamp.seconds * 1000;
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Date(then).toLocaleDateString();
}

/**
 * Check if student is currently active (within last 5 minutes)
 */
function isStudentActive(lastActiveAt: Timestamp | undefined): boolean {
  if (!lastActiveAt?.seconds) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return lastActiveAt.seconds * 1000 > fiveMinutesAgo;
}

/**
 * Single student row in the table
 */
function StudentRow({ student }: { student: StudentData }) {
  const completedCount = student.completedSlides?.length || 0;
  const progressPercent = Math.round(
    (completedCount / TOTAL_INTERACTIVE_SLIDES) * 100
  );
  const isActive = isStudentActive(student.lastActiveAt);

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Active indicator */}
          {isActive && (
            <div
              className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
              title="Currently active"
            />
          )}
          <div>
            <div className="font-medium text-slate-900">
              {student.id.split("@")[0]}
            </div>
            <div className="text-xs text-slate-400">{student.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">
        <div className="flex flex-col">
          <span className={isActive ? "font-medium text-green-600" : ""}>
            {formatRelativeTime(student.lastActiveAt)}
          </span>
          {student.lastActiveAt?.seconds && (
            <span className="text-xs text-slate-400">
              {new Date(student.lastActiveAt.seconds * 1000).toLocaleTimeString()}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 min-w-[3rem] text-right">
              {progressPercent}%
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {completedCount} of {TOTAL_INTERACTIVE_SLIDES} activities
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {INTERACTIVE_SLIDE_LIST.map(({ slide, label }) => (
            <ActivityBadge
              key={slide}
              label={label}
              completed={student.completedSlides?.includes(slide) || false}
            />
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600">
        Slide {student.currentSlide || 1}
      </td>
    </tr>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const setupListener = useCallback(() => {
    const firebase = getFirebaseClient();

    if (!firebase) {
      setConnectionStatus("disconnected");
      setConnectionError("Firebase not configured");
      setLoading(false);
      return undefined;
    }

    setConnectionStatus("connecting");
    setConnectionError(null);

    // Set up real-time listener
    const unsubscribe: Unsubscribe = onSnapshot(
      collection(firebase.db, "students"),
      (querySnapshot) => {
        // First successful snapshot = connected
        setConnectionStatus("connected");
        setConnectionError(null);

        const data: StudentData[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            id: doc.id,
            email: docData.email || doc.id,
            completedSlides: docData.completedSlides || [],
            lastActiveAt: docData.lastActiveAt,
            currentSlide: docData.currentSlide,
          });
        });

        // Log in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.log(
            `📊 Teacher Dashboard: Found ${data.length} student(s)`,
            data.map((s) => s.email)
          );
        }

        // Sort by last active (most recent first)
        data.sort((a, b) => {
          const aTime = a.lastActiveAt?.seconds || 0;
          const bTime = b.lastActiveAt?.seconds || 0;
          return bTime - aTime;
        });
        setStudents(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to students:", error);
        setConnectionStatus("error");
        setConnectionError(error.message || "Failed to connect to database");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupListener]);

  const handleRetry = () => {
    setLoading(true);
    setupListener();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <Heading className="text-3xl text-slate-800">
              Teacher Dashboard 🍎
            </Heading>
            <Subheading className="text-slate-500">
              Track student progress in real-time.
            </Subheading>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status Badge */}
            <ConnectionStatusBadge
              status={connectionStatus}
              error={connectionError}
              onRetry={handleRetry}
            />

            {/* Student count */}
            <div className="text-xs text-slate-500 font-medium">
              {students.length} {students.length === 1 ? "student" : "students"}
            </div>

          </div>
        </header>

        {/* Error banner */}
        {connectionError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <strong>Connection Error:</strong> {connectionError}
            <span className="ml-2 text-red-500">Data shown may be stale.</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-sm font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Completed Activities</th>
                  <th className="px-6 py-4">Current Slide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No students have started the lesson yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <StudentRow key={student.id} student={student} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

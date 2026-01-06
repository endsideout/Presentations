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
import type { ConnectionStatus, ModuleProgress } from "../lib/types/firebase";

// ============================================================================
// Constants
// ============================================================================

import { AVAILABLE_MODULES } from "../constants/modules";

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
  completedSlides: number[]; // legacy fallback
  lastActiveAt?: Timestamp;
  currentSlide?: number; // legacy fallback
  progress?: Record<string, ModuleProgress>;
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
function StudentRow({ student, moduleId }: { student: StudentData; moduleId: string }) {
  // Extract progress for the selected module
  // Fallback to root level if module not found AND module is "healthy-eating" (legacy support)
  
  let completedSlides: number[] = [];
  let currentSlide = 1;

  if (student.progress?.[moduleId]) {
      completedSlides = student.progress[moduleId].completedSlides || [];
      currentSlide = student.progress[moduleId].currentSlide || 1;
  } else if (moduleId === "healthy-eating") {
      // Legacy fallback
      completedSlides = student.completedSlides || [];
      currentSlide = student.currentSlide || 1;
  }

  const completedCount = completedSlides.length;
  const progressPercent = Math.round(
    (completedCount / TOTAL_INTERACTIVE_SLIDES) * 100
  );
  
  // Use global lastActiveAt for now, as we don't strictly track per-module activity yet in all cases
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
              completed={completedSlides.includes(slide)}
            />
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600">
        Slide {currentSlide}
      </td>
    </tr>
  );
}

// ============================================================================
// Auth Components
// ============================================================================

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for now as requested
    // "admin" is the only teacher for now
    if (email === "admin@endsideout.com" && password === "admin123") {
        onLogin();
    } else {
        setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
            <div className="text-4xl mb-4">🍎</div>
            <Heading className="text-2xl text-slate-800">Teacher Login</Heading>
            <Subheading className="text-slate-500">Sign in to view student progress</Subheading>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="admin@endsideout.com"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>
            
            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}
            
            <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
            >
                Sign In
            </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard Component (Authenticated)
// ============================================================================

function DashboardView({ onLogout }: { onLogout: () => void }) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("healthy-eating");

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
            progress: docData.progress,
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
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Heading className="text-3xl text-slate-800">
              Teacher Dashboard 🍎
            </Heading>
            <Subheading className="text-slate-500">
              Track student progress in real-time.
            </Subheading>
          </div>
          
          <div className="flex flex-col gap-3 items-end">
             <div className="flex items-center gap-4">
                 {/* Logout Button */}
                 <button 
                    onClick={onLogout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                 >
                    Logout
                 </button>
             </div>
             {/* Module Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Module:</label>
                <select 
                    value={selectedModule} 
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="block rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                >
                    {AVAILABLE_MODULES.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
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
                  <th className="px-6 py-4">Progress ({AVAILABLE_MODULES.find(m => m.id === selectedModule)?.label.split(' ')[0]})</th>
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
                    <StudentRow key={student.id} student={student} moduleId={selectedModule} />
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

// ============================================================================
// Main Page Component
// ============================================================================

export default function TeacherPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem("teacher_auth") === "true";
        if (auth) {
            setIsAuthenticated(true);
        }
    }, []);
    
    const handleLogin = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem("teacher_auth", "true");
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("teacher_auth");
    };
    
    if (!isAuthenticated) {
        return <LoginForm onLogin={handleLogin} />;
    }
    
    return <DashboardView onLogout={handleLogout} />;
}

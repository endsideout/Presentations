"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "../../lib/firebase";
import type { ConnectionStatus, WellnessData } from "../../lib/types/firebase";
import { WELLNESS_UNITS, ALL_BADGES } from "../../wellness/constants";
import { useWellnessQuests } from "../../wellness/hooks/useWellnessQuests";

interface StudentWellnessData {
  id: string; // email
  email: string;
  name?: string; // Student's name
  wellness?: WellnessData;
  classId?: string;
  lastActiveAt?: Timestamp;
}

/**
 * Connection status badge
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
 * Single student wellness row
 */
function StudentWellnessRow({ student, totalQuests }: { student: StudentWellnessData; totalQuests: number }) {
  const wellness = student.wellness;
  
  if (!wellness) {
    return (
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4">
          <div className="font-medium text-slate-900">
            {student.name || student.id.split("@")[0]}
          </div>
          <div className="text-xs text-slate-400">{student.email}</div>
        </td>
        <td colSpan={6} className="px-6 py-4 text-center text-slate-400 text-sm">
          No wellness data yet
        </td>
      </tr>
    );
  }

  const avgProgress = useMemo(() => {
    const dims = WELLNESS_UNITS.map(u => wellness.dimensions[u.id]?.progress || 0);
    return Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
  }, [wellness.dimensions]);

  const completedQuestsCount = wellness.completedQuests.length;
  const questProgress = Math.round((completedQuestsCount / totalQuests) * 100);

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="font-medium text-slate-900">
          {student.name || student.id.split("@")[0]}
        </div>
        <div className="text-xs text-slate-400">{student.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-2xl font-bold text-indigo-600">
          {wellness.totalPoints}
        </div>
        <div className="text-xs text-slate-500">Total Points</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 min-w-[3rem] text-right">
              {avgProgress}%
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Avg. Dimension Progress
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${questProgress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 min-w-[3rem] text-right">
              {questProgress}%
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {completedQuestsCount} of {totalQuests} quests
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-xl font-bold text-purple-600">
          {wellness.earnedBadgeIndices.length}
        </div>
        <div className="text-xs text-slate-500">Badges</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-xl font-bold text-emerald-600">
          {wellness.streakDays}
        </div>
        <div className="text-xs text-slate-500">Day Streak</div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          {WELLNESS_UNITS.slice(0, 3).map((unit) => {
            const dim = wellness.dimensions[unit.id];
            const progress = dim?.progress || 0;
            return (
              <div key={unit.id} className="flex items-center gap-2">
                <span className="text-xs">{unit.icon}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: unit.color,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-600 min-w-[2.5rem] text-right">
                  {progress}%
                </span>
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

/**
 * Main Wellness Teacher View Component
 */
export function WellnessTeacherView() {
  const [students, setStudents] = useState<StudentWellnessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const { quests: allQuests } = useWellnessQuests();

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

    const unsubscribe: Unsubscribe = onSnapshot(
      collection(firebase.db, "students"),
      (querySnapshot) => {
        setConnectionStatus("connected");
        setConnectionError(null);

        const data: StudentWellnessData[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            id: doc.id,
            email: docData.email || doc.id,
            name: docData.name, // Student's name from wellness login
            wellness: docData.wellness,
            classId: docData.classId,
            lastActiveAt: docData.lastActiveAt,
          });
        });

        // Filter to only students with wellness data
        const withWellness = data.filter((s) => s.wellness);

        // Sort by total points (highest first)
        withWellness.sort((a, b) => {
          const aPoints = a.wellness?.totalPoints || 0;
          const bPoints = b.wellness?.totalPoints || 0;
          return bPoints - aPoints;
        });

        setStudents(withWellness);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to wellness data:", error);
        setConnectionStatus("error");
        
        // Provide more specific error messages
        let errorMessage = "Failed to connect to database";
        if (error.code === "permission-denied") {
          errorMessage = "Permission denied. Please check Firestore security rules allow reading from 'students' collection.";
        } else if (error.code === "unavailable") {
          errorMessage = "Firebase service is temporarily unavailable. Please try again later.";
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setConnectionError(errorMessage);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Extract unique classes from students
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    students.forEach((s) => {
      if (s.classId) classes.add(s.classId);
    });
    return Array.from(classes).sort();
  }, [students]);

  // Group students by class (respecting filter)
  const studentsByClass = useMemo(() => {
    const grouped: Record<string, StudentWellnessData[]> = {};
    const ungrouped: StudentWellnessData[] = [];

    // Apply filter first
    const studentsToShow = selectedClass === "all" 
      ? students 
      : students.filter((s) => s.classId === selectedClass);

    studentsToShow.forEach((student) => {
      if (student.classId) {
        if (!grouped[student.classId]) {
          grouped[student.classId] = [];
        }
        grouped[student.classId].push(student);
      } else {
        ungrouped.push(student);
      }
    });

    // Sort students within each class by total points
    Object.keys(grouped).forEach((classId) => {
      grouped[classId].sort((a, b) => {
        const aPoints = a.wellness?.totalPoints || 0;
        const bPoints = b.wellness?.totalPoints || 0;
        return bPoints - aPoints;
      });
    });

    return { grouped, ungrouped };
  }, [students, selectedClass]);

  // Filter students by class (for aggregate stats)
  const filteredStudents = useMemo(() => {
    if (selectedClass === "all") return students;
    return students.filter((s) => s.classId === selectedClass);
  }, [students, selectedClass]);

  useEffect(() => {
    const unsubscribe = setupListener();
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

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    if (filteredStudents.length === 0) {
      return {
        avgPoints: 0,
        avgProgress: 0,
        totalQuests: 0,
        totalBadges: 0,
        avgStreak: 0,
      };
    }

    const totals = filteredStudents.reduce(
      (acc, s) => {
        const w = s.wellness;
        if (!w) return acc;
        return {
          points: acc.points + w.totalPoints,
          progress: acc.progress + (WELLNESS_UNITS.reduce((sum, u) => sum + (w.dimensions[u.id]?.progress || 0), 0) / WELLNESS_UNITS.length),
          quests: acc.quests + w.completedQuests.length,
          badges: acc.badges + w.earnedBadgeIndices.length,
          streak: acc.streak + w.streakDays,
        };
      },
      { points: 0, progress: 0, quests: 0, badges: 0, streak: 0 }
    );

    return {
      avgPoints: Math.round(totals.points / filteredStudents.length),
      avgProgress: Math.round(totals.progress / filteredStudents.length),
      totalQuests: totals.quests,
      totalBadges: totals.badges,
      avgStreak: Math.round(totals.streak / filteredStudents.length),
    };
  }, [filteredStudents]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Wellness Progress Dashboard 🪐
            </h1>
            <p className="text-slate-500">
              Track student wellness activities and achievements.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-end">
            <div className="flex items-center gap-4">
              <ConnectionStatusBadge
                status={connectionStatus}
                error={connectionError}
                onRetry={handleRetry}
              />
              <div className="text-xs text-slate-500 font-medium">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1 ? "student" : "students"} with
                wellness data
              </div>
            </div>

            {/* Class Selector */}
            {availableClasses.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Filter Class:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="block rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1.5 px-2.5 border"
                >
                  <option value="all">All Classes</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Aggregate Stats */}
        {filteredStudents.length > 0 && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Avg. Points
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {aggregateStats.avgPoints}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Avg. Progress
              </div>
              <div className="text-2xl font-black text-blue-600">
                {aggregateStats.avgProgress}%
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Total Quests
              </div>
              <div className="text-2xl font-black text-pink-600">
                {aggregateStats.totalQuests}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Total Badges
              </div>
              <div className="text-2xl font-black text-purple-600">
                {aggregateStats.totalBadges}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Avg. Streak
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {aggregateStats.avgStreak}
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {connectionError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <strong>Connection Error:</strong> {connectionError}
            <span className="ml-2 text-red-500">Data shown may be stale.</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-12 text-center text-slate-400">
            No students have wellness data yet.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render each class as a separate section */}
            {Object.entries(studentsByClass.grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([classId, classStudents]) => {
                // Calculate class-specific stats
                const classStats = classStudents.reduce(
                  (acc, s) => {
                    const w = s.wellness;
                    if (!w) return acc;
                    return {
                      points: acc.points + w.totalPoints,
                      progress: acc.progress + (WELLNESS_UNITS.reduce((sum, u) => sum + (w.dimensions[u.id]?.progress || 0), 0) / WELLNESS_UNITS.length),
                      quests: acc.quests + w.completedQuests.length,
                      badges: acc.badges + w.earnedBadgeIndices.length,
                      streak: acc.streak + w.streakDays,
                    };
                  },
                  { points: 0, progress: 0, quests: 0, badges: 0, streak: 0 }
                );

                const classAvgPoints = Math.round(classStats.points / classStudents.length);
                const classAvgProgress = Math.round(classStats.progress / classStudents.length);
                const classAvgStreak = Math.round(classStats.streak / classStudents.length);

                return (
                  <div
                    key={classId}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    {/* Class Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-white">
                            {classId}
                          </h2>
                          <p className="text-sm text-indigo-100">
                            {classStudents.length}{" "}
                            {classStudents.length === 1 ? "student" : "students"}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-white">
                          <div className="text-right">
                            <div className="text-xs text-indigo-100 uppercase tracking-wider">
                              Avg. Points
                            </div>
                            <div className="text-2xl font-black">{classAvgPoints}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-indigo-100 uppercase tracking-wider">
                              Avg. Progress
                            </div>
                            <div className="text-2xl font-black">{classAvgProgress}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-indigo-100 uppercase tracking-wider">
                              Avg. Streak
                            </div>
                            <div className="text-2xl font-black">{classAvgStreak}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Students Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-sm font-semibold uppercase text-slate-500">
                          <tr>
                            <th className="px-6 py-3">Student</th>
                            <th className="px-6 py-3">Total Points</th>
                            <th className="px-6 py-3">Avg. Progress</th>
                            <th className="px-6 py-3">Quests</th>
                            <th className="px-6 py-3">Badges</th>
                            <th className="px-6 py-3">Streak</th>
                            <th className="px-6 py-3">Top Dimensions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {classStudents.map((student) => (
                            <StudentWellnessRow key={student.id} student={student} totalQuests={allQuests.length || 1} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            {/* Students without a class */}
            {studentsByClass.ungrouped.length > 0 && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                {/* Unassigned Header */}
                <div className="bg-gradient-to-r from-slate-400 to-slate-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        Unassigned Students
                      </h2>
                      <p className="text-sm text-slate-100">
                        {studentsByClass.ungrouped.length}{" "}
                        {studentsByClass.ungrouped.length === 1 ? "student" : "students"} without a class
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unassigned Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-sm font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Total Points</th>
                        <th className="px-6 py-3">Avg. Progress</th>
                        <th className="px-6 py-3">Quests</th>
                        <th className="px-6 py-3">Badges</th>
                        <th className="px-6 py-3">Streak</th>
                        <th className="px-6 py-3">Top Dimensions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentsByClass.ungrouped.map((student) => (
                        <StudentWellnessRow key={student.id} student={student} totalQuests={allQuests.length || 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

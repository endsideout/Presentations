"use client";

import { useLesson } from "../context/LessonContext";

/**
 * Small indicator showing sync status to students
 * Shows only when there's an issue (error/offline) or while syncing
 * When synced, fades to minimal presence
 */
export function SyncStatusIndicator() {
  const { syncStatus, syncError, studentEmail, isOnline } = useLesson();

  // Don't show if not logged in
  if (!studentEmail) return null;

  // When synced, show a subtle indicator that can be expanded on hover
  if (syncStatus === "synced") {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 group"
        title="Progress synced"
      >
        <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-700 opacity-60 hover:opacity-100 transition-opacity">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="hidden group-hover:inline">Synced</span>
        </div>
      </div>
    );
  }

  // Syncing state
  if (syncStatus === "syncing") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Syncing...
        </div>
      </div>
    );
  }

  // Offline state
  if (syncStatus === "offline" || !isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-xs font-medium text-yellow-700 shadow-md border border-yellow-200">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>Offline – progress saved locally</span>
        </div>
      </div>
    );
  }

  // Error state - more prominent
  if (syncStatus === "error") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 shadow-md border border-red-200 max-w-xs"
          title={syncError || "Sync error"}
        >
          <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="truncate">
            Sync error – retrying automatically
          </span>
        </div>
      </div>
    );
  }

  // Idle state - minimal indicator
  if (syncStatus === "idle") {
    return (
      <div className="fixed bottom-4 right-4 z-50 group">
        <div className="flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2 py-1 text-xs text-slate-500 opacity-60 hover:opacity-100 transition-opacity">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span className="hidden group-hover:inline">Ready</span>
        </div>
      </div>
    );
  }

  return null;
}

"use client";

import { SlideNavigation } from "../../components/SlideNavigation";
import { SlideTracker } from "../../components/SlideTracker";
import { SyncStatusIndicator } from "../../components/SyncStatusIndicator";
import { LessonProvider } from "../../context/LessonContext";

/**
 * Student-specific layout
 * This layout wraps all student routes (home page and slides)
 * and provides student-specific context and components
 */
export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LessonProvider moduleId="math-basics">
      <SlideTracker />
      <SlideNavigation />
      <SyncStatusIndicator />
      {children}
    </LessonProvider>
  );
}


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description: "Monitor student progress in real-time",
};

/**
 * Teacher-specific layout
 * This layout wraps all /teacher/* routes and does NOT include
 * student-specific components like LessonProvider, SlideTracker, etc.
 */
export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


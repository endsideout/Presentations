"use client";

import { LessonProvider } from "../context/LessonContext";

export default function WellnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LessonProvider>{children}</LessonProvider>;
}

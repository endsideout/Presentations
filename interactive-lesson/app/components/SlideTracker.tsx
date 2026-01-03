"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLesson } from "../context/LessonContext";

/**
 * Component that tracks the current slide number based on the pathname
 * and updates Firestore with the student's current location
 */
export function SlideTracker() {
  const pathname = usePathname();
  const { updateCurrentSlide, studentEmail } = useLesson();

  useEffect(() => {
    if (!studentEmail) return;

    // Extract slide number from pathname
    const match = pathname.match(/\/slide\/(\d+)/);
    if (match) {
      const slideNum = parseInt(match[1], 10);
      updateCurrentSlide(slideNum);
    } else if (pathname === "/slide/end") {
      // Track end slide as slide 14 (or whatever makes sense)
      updateCurrentSlide(14);
    } else if (pathname === "/") {
      // Home page - could track as slide 1 or 0
      updateCurrentSlide(1);
    }
  }, [pathname, updateCurrentSlide, studentEmail]);

  return null; // This component doesn't render anything
}



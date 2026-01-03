"use client";

import { usePathname, useRouter } from "next/navigation";
import { routes } from "../constants/routes";

export function SlideNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine back destination
  const getBackPath = (): string | null => {
    // If we are at root, no back button (handled by not including this component in root layout)
    if (pathname === routes.home) return null;

    // Slide 2 -> Home
    if (pathname === routes.slides.slide2) return routes.home;

    // Slide End -> Slide 13
    if (pathname === routes.slides.end) return routes.slides.slide13;

    // Parse slide number for other cases
    const match = pathname.match(/\/slide\/(\d+)/);
    if (match) {
      const slideNum = parseInt(match[1], 10);
      return routes.getPreviousSlideRoute(slideNum);
    }

    return null;
  };

  const backPath = getBackPath();

  if (!backPath) return null;

  return (
    <button
      onClick={() => router.push(backPath)}
      className="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-md ring-1 ring-black/10 transition hover:scale-105 active:scale-95"
      aria-label="Go Back"
    >
      ⬅️
    </button>
  );
}

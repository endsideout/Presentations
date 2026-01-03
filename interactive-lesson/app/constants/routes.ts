/**
 * Route constants for navigation
 * Centralized route definitions to prevent hardcoded paths
 */

export const routes = {
  home: "/",
  teacher: "/teacher",
  
  // Slide routes
  slides: {
    start: "/slide/2",
    slide2: "/slide/2",
    slide3: "/slide/3",
    slide4: "/slide/4",
    slide5: "/slide/5",
    slide6: "/slide/6",
    slide7: "/slide/7",
    slide8: "/slide/8",
    slide9: "/slide/9",
    slide10: "/slide/10",
    slide11: "/slide/11",
    slide12: "/slide/12",
    slide13: "/slide/13",
    end: "/slide/end",
  },
  
  /**
   * Get the route for a specific slide number
   */
  getSlideRoute: (slideNumber: number): string => {
    if (slideNumber === 2) return routes.slides.slide2;
    if (slideNumber >= 3 && slideNumber <= 13) {
      return `/slide/${slideNumber}`;
    }
    return routes.home;
  },
  
  /**
   * Get the next slide route
   */
  getNextSlideRoute: (currentSlide: number): string => {
    if (currentSlide === 13) return routes.slides.end;
    if (currentSlide >= 2 && currentSlide < 13) {
      return `/slide/${currentSlide + 1}`;
    }
    return routes.slides.start;
  },
  
  /**
   * Get the previous slide route
   */
  getPreviousSlideRoute: (currentSlide: number): string | null => {
    if (currentSlide === 2) return routes.home;
    if (currentSlide > 2 && currentSlide <= 13) {
      return `/slide/${currentSlide - 1}`;
    }
    if (currentSlide === 0) return routes.slides.end; // from end slide
    return null;
  },
} as const;


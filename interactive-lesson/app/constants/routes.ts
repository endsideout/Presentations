/**
 * Route constants for navigation
 * Centralized route definitions to prevent hardcoded paths
 */

export const ROUTES_CONFIG = {
  MODULES_BASE: "/modules",
  DEFAULT_MODULE: "healthy-eating",
} as const;

export const routes = {
  home: "/",
  teacher: "/teacher",

  // Legacy support for specific slides (mapped to healthy-eating)
  slides: {
    start: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/2`,
    slide2: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/2`,
    slide3: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/3`,
    slide4: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/4`,
    slide5: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/5`,
    slide6: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/6`,
    slide7: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/7`,
    slide8: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/8`,
    slide9: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/9`,
    slide10: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/10`,
    slide11: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/11`,
    slide12: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/12`,
    slide13: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/13`,
    end: `/modules/${ROUTES_CONFIG.DEFAULT_MODULE}/slide/end`,
  },

  /**
   * Get the route for a specific slide number
   */
  getSlideRoute: (slideNumber: number, moduleId: string = ROUTES_CONFIG.DEFAULT_MODULE): string => {
    if (slideNumber === 2) return `/modules/${moduleId}/slide/2`;
    if (slideNumber >= 3 && slideNumber <= 13) {
      return `/modules/${moduleId}/slide/${slideNumber}`;
    }
    return `/modules/${moduleId}`;
  },

  /**
   * Get the next slide route
   */
  getNextSlideRoute: (currentSlide: number, moduleId: string = ROUTES_CONFIG.DEFAULT_MODULE): string => {
    if (currentSlide === 13) return `/modules/${moduleId}/slide/end`;
    if (currentSlide >= 2 && currentSlide < 13) {
      return `/modules/${moduleId}/slide/${currentSlide + 1}`;
    }
    return `/modules/${moduleId}/slide/2`;
  },

  /**
   * Get the previous slide route
   */
  getPreviousSlideRoute: (currentSlide: number, moduleId: string = ROUTES_CONFIG.DEFAULT_MODULE): string | null => {
    if (currentSlide === 2) return `/modules/${moduleId}`;
    if (currentSlide > 2 && currentSlide <= 13) {
      return `/modules/${moduleId}/slide/${currentSlide - 1}`;
    }
    if (currentSlide === 0) return `/modules/${moduleId}/slide/end`; // from end slide
    return null;
  },
} as const;


/**
 * Color constants for the application
 * Centralized color definitions for consistency
 */

export const colors = {
    // Primary brand colors
    primary: "#E85B1C",
    primaryHover: "#d65017",
    primaryDark: "#c54e18",

    // Background colors
    background: "#F7D7D3",
    backgroundLight: "#FBE6E1",

    // Accent colors
    accentGreen: "#8BC34A",
    accentGreenLight: "#A8CF5A",
    accentYellow: "#F6E27A",

    // Food group colors
    fruits: "#FFCDD2",
    vegetables: "#C8E6C9",
    grains: "#FFF9C4",
    protein: "#BBDEFB",

    // Zone colors
    sometimesZone: "#FFE0B2",
    anytimeZone: "#DCEDC8",

    // Text colors
    textPrimary: "#1a1a1a",
    textSecondary: "#171717",
    textMuted: "rgba(0, 0, 0, 0.6)",

    // Status colors
    success: "#2E7D32",
    successLight: "#4CAF50",
    error: "#D32F2F",
    warning: "#F57C00",

    // Neutral colors
    white: "#FFFFFF",
    gray: {
        100: "#F5F5F5",
        200: "#EEEEEE",
        300: "#E0E0E0",
        400: "#BDBDBD",
        500: "#9E9E9E",
        600: "#757575",
        700: "#616161",
    },
} as const;


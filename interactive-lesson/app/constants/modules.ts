export const AVAILABLE_MODULES = [
    {
        id: "healthy-eating",
        label: "Healthy Eating 🥗",
        description: "Learn about balanced diets, food groups, and building a healthy plate.",
        path: "/modules/healthy-eating"
    },
    {
        id: "math-basics",
        label: "Math Basics ➗",
        description: "Introduction to basic arithmetic operations and number sense.",
        path: "/modules/math-basics"
    },
] as const;

export const KYH_MODULE = {
    id: "kyh",
    label: "Know Your Health 🩺",
    description: "Review and recap what you've learned in each module with fun activities and earn points!",
    path: "/modules/kyh"
} as const;

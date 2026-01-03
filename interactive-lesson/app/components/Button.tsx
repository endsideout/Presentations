import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
    const baseStyles = "inline-flex w-fit items-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold shadow-lg ring-1 ring-black/10 transition hover:scale-[1.02] active:scale-[0.99]";
    
    // Consistent primary button style from Slide 1 and 2
    // White background with dark text seems to be the "Start Learning" and "Build My Plate" syle
    const variants = {
        primary: "bg-white text-[#1a1a1a]",
        secondary: "bg-[#E85B1C] text-white", // Fallback or alternative
    };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

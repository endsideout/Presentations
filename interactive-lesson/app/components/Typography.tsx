import React from "react";

interface HeadingProps {
  children: React.ReactNode;
  className?: string; // Allow overriding or adding classes
  style?: React.CSSProperties; // Allow inline styles for dynamic colors
}

export function Heading({ children, className = "", style }: HeadingProps) {
  return (
    <h1
      className={`font-rounded text-5xl font-extrabold tracking-wide text-[#E85B1C] sm:text-6xl ${className}`}
      style={style}
    >
      {children}
    </h1>
  );
}

export function Subheading({ children, className = "" }: HeadingProps) {
  return (
    <p className={`mt-4 max-w-md text-sm text-black/60 ${className}`}>
        {children}
    </p>
  );
}

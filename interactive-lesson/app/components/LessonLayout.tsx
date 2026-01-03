"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LessonLayoutProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function LessonLayout({
  children,
  className = "",
  ariaLabel,
}: LessonLayoutProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Calculate scale based on the container width vs reference width (1280px)
        const currentWidth = entry.contentRect.width;
        // Ensure we don't divide by 0 or set invalid scale
        if (currentWidth > 0) {
            setScale(currentWidth / 1280);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-[#F7D7D3] p-4 sm:p-8">
      <div className="w-full max-w-6xl">
        <section
          ref={containerRef}
          className={`relative mx-auto aspect-video w-full overflow-hidden rounded-3xl bg-[#FBE6E1] shadow-xl ring-1 ring-black/5 ${className}`}
          aria-label={ariaLabel}
        >
          {/* Scaled Content Container (Reference: 1280x720) */}
          <div
            style={{
              width: "1280px",
              height: "720px",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="absolute top-0 left-0"
          >
            {/* Background grid layer */}
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60"></div>
            
            {/* Content area */}
            <div className="relative h-full w-full">
                 {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { SocialWellbeingPostSurvey } from "./SocialWellbeingPostSurvey";

export function WellnessTracker3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="perspective-1000 w-full h-full flex justify-center group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full transform-style-3d transition-transform duration-200 ease-out cursor-pointer"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Card Content */}
        <div className="h-full flex flex-col justify-between bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-white transform-style-3d border border-emerald-400/30">
          <div className="flex justify-between items-start mb-6 translate-z-10">
            <div>
              <h3 className="text-2xl font-bold mb-1">Daily Wellness</h3>
              <p className="text-emerald-100">Your personalized health summary</p>
            </div>
            <div className="bg-emerald-400/30 p-2 rounded-xl backdrop-blur-sm">
              <span className="text-2xl">🏃</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 translate-z-20">
            {/* Stat 1 */}
            <div className="bg-emerald-800/20 rounded-2xl p-4 backdrop-blur-sm text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-1">8,432</div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Steps</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-emerald-800/20 rounded-2xl p-4 backdrop-blur-sm text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-1">7.5h</div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Sleep</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-emerald-800/20 rounded-2xl p-4 backdrop-blur-sm text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-1">1.8L</div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Water</div>
            </div>
          </div>

          {/* Floating Element */}
          <div className="absolute -right-4 -bottom-4 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium translate-z-30 shadow-lg border border-white/20">
            Keep it up! 🔥
          </div>
        </div>
        
        {/* Shadow Drop */}
         <div className="absolute inset-x-8 -bottom-6 h-8 bg-emerald-900/20 blur-xl rounded-[100%] -z-10 transform scale-y-50"></div>
      </div>
       <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-10 {
           transform: translateZ(20px);
        }
        .translate-z-20 {
           transform: translateZ(40px);
        }
         .translate-z-30 {
           transform: translateZ(60px);
        }
      `}</style>
    </div>
  );
}

// Social Wellbeing Component - Active Missions
export { SocialWellbeingPostSurvey };

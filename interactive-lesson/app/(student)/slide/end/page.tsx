"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LessonLayout } from "../../../components/LessonLayout";
import { Heading, Subheading } from "../../../components/Typography";
import { Button } from "../../../components/Button";

// Using absolute paths from public directory

export default function EndSlide() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <LessonLayout ariaLabel="Great Job!">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 animate-float opacity-80" style={{animationDelay: '0s'}}>
             <div className="relative h-full w-full">
               <Image src="/assets/image2.webp" alt="" fill className="object-contain" />
             </div>
        </div>
        <div className="absolute bottom-20 right-20 w-32 h-32 animate-float opacity-80" style={{animationDelay: '1s'}}>
             <div className="relative h-full w-full">
               <Image src="/assets/image6.webp" alt="" fill className="object-contain" />
             </div>
        </div>
        <div className="absolute top-20 right-40 w-24 h-24 animate-float opacity-60" style={{animationDelay: '2s'}}>
             <div className="relative h-full w-full">
               <Image src="/assets/image14.webp" alt="" fill className="object-contain" />
             </div>
        </div>
        <div className="absolute bottom-40 left-20 w-28 h-28 animate-float opacity-60" style={{animationDelay: '3s'}}>
             <div className="relative h-full w-full">
               <Image src="/assets/image9.webp" alt="" fill className="object-contain" />
             </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full min-h-[500px] flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <Heading className="relative mb-2">
            GREAT JOB!
          </Heading>
        </div>

        <Subheading className="text-2xl font-medium max-w-md leading-relaxed">
          You've learned all about building a <span className="text-[#8BC34A] font-bold">healthy plate</span>! 
          <br/>Keep up the great work! 🌟
        </Subheading>

        <div className="mt-8 flex gap-4">
          <Link href="/">
            <Button variant="secondary" className="px-10 py-5 text-xl">
              🔄 Restart Lesson
            </Button>
          </Link>
        </div>
      </div>
    </LessonLayout>
  );
}

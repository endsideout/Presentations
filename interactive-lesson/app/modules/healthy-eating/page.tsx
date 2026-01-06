"use client";

import Link from "next/link";
import { LessonLayout } from "../../components/LessonLayout";
import { Heading, Subheading } from "../../components/Typography";

import { useLesson } from "../../context/LessonContext";
import { routes } from "../../constants/routes";
import { colors } from "../../constants/colors";
import Image from "next/image";
/* import { useRef } from "react"; - removed */

export default function Home() {
  const { studentEmail } = useLesson();
  /* bounceGame logic removed as it was for static images */

  return (
      <LessonLayout ariaLabel="Healthy Eating Intro">
        {/* Decorative corner accents */}
        <div className="pointer-events-none absolute left-4 top-4 h-16 w-16">
          <Image
            src="/assets/image19.webp"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="pointer-events-none absolute right-6 bottom-6 h-20 w-20">
          <Image
            src="/assets/image11.webp"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="relative grid gap-8 p-6 sm:p-12 md:grid-cols-2 md:gap-10">
          {/* Left: Title + badge + CTA */}
          <div className="flex flex-col justify-center">
            <Heading>
              HEALTHY
              <br />
              EATING
            </Heading>

            {/* Grade badge */}
            <div 
              className="mt-6 inline-flex w-fit items-center rounded-full px-6 py-3 text-lg font-semibold text-black shadow-md"
              style={{ backgroundColor: colors.accentGreen }}
            >
              3rd Grade
            </div>

            {/* CTA */}
             <div className="mt-8">
                {studentEmail && <p className="text-lg text-green-700 font-bold mb-4">Welcome back, {studentEmail.split('@')[0]}!</p>}
                
                <Link 
                  href={routes.slides.start} 
                  className="inline-flex w-fit items-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold shadow-lg ring-1 ring-black/10 transition hover:scale-[1.02] active:scale-[0.99] bg-white text-[#1a1a1a]"
                >
                    <span 
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: colors.primary }}
                    >
                        ▶
                    </span>
                    Start Learning
                </Link>
            </div>

            <Subheading>
              Tap “Start Learning” to begin interactive activities about healthy
              food groups.
            </Subheading>
          </div>

          {/* Right: Video Animation */}
          <div className="relative flex min-h-[400px] items-center justify-center">
            <video
              src="/assets/avocado.mp4"
              autoPlay
              controls
              playsInline
              className="w-full h-auto max-h-[500px] object-contain rounded-[48px] shadow-lg"
            />
          </div>
        </div>
    </LessonLayout>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LessonLayout } from "../components/LessonLayout";
import { Heading, Subheading } from "../components/Typography";
import { Button } from "../components/Button";
import { LoginModal } from "../components/LoginModal";
import { useLesson } from "../context/LessonContext";
import { routes } from "../constants/routes";
import { colors } from "../constants/colors";

export default function Home() {
  const router = useRouter();
  
  // Refs for animation intervals to clean them up if needed
  const intervalRefs = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());
  const { studentEmail, setStudentEmail, logout } = useLesson();
  
  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startLearning = () => {
    if (studentEmail) {
      router.push(routes.slides.start);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = async (email: string) => {
    setIsSubmitting(true);
    try {
      // setStudentEmail now resolves immediately and runs Firestore in background
      await setStudentEmail(email);
      // Navigate immediately - don't wait for Firestore
      router.push(routes.slides.start);
      setShowLogin(false);
    } catch (e) {
      // This should rarely happen now, but handle gracefully
      console.error("Login failed", e);
      // Still allow navigation - local storage is set
      router.push(routes.slides.start);
      setShowLogin(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bounceGame = (e: React.MouseEvent<HTMLImageElement>) => {
    const element = e.currentTarget;
    
    // Check if already animating using a custom property we'll check via the map
    if (intervalRefs.current.has(element)) {
      clearInterval(intervalRefs.current.get(element));
    }

    // Initial state for a "jump"
    let pos = 0;
    let velocity = -15; // jump up
    const gravity = 0.8; // gravity
    const bounceFactor = -0.5; // bounce dampening

    const frame = () => {
      velocity += gravity;
      pos += velocity;

      // When it hits the floor
      if (pos > 0) {
        pos = 0;
        // Bounce
        velocity = velocity * bounceFactor;

        // Stop if velocity is negligible
        if (Math.abs(velocity) < gravity) {
          velocity = 0;
          const interval = intervalRefs.current.get(element);
          if (interval) clearInterval(interval);
          intervalRefs.current.delete(element);
          element.style.transform = `translateY(0px)`;
          return;
        }
      }

      element.style.transform = `translateY(${pos}px)`;
    };

    // Animation loop
    const intervalId = setInterval(frame, 20);
    intervalRefs.current.set(element, intervalId);
  };

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
               {studentEmail ? (
                 <div className="flex flex-col gap-4">
                    <p className="text-lg text-green-700 font-bold">Welcome back, {studentEmail.split('@')[0]}!</p>
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={startLearning}>
                            <span 
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: colors.primary }}
                            >
                                ▶
                            </span>
                            Continue
                        </Button>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 underline transition"
                        >
                            Sign Out
                        </button>
                    </div>
                 </div>
               ) : (
                <Button onClick={startLearning}>
                  <span 
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    ▶
                  </span>
                  Start Learning
                </Button>
               )}
            </div>

            <Subheading>
              Tap “Start Learning” to begin interactive activities about healthy
              food groups.
            </Subheading>
          </div>

          {/* Right: Mascots / illustration area */}
          <div className="relative flex min-h-[400px] items-center justify-center">
            {/* Yellow splash placeholder - Image 2 */}
            <div className="absolute -right-6 top-10 h-64 w-64 rotate-6">
              <Image
                src="/assets/image2.webp"
                alt=""
                fill
                className="object-contain"
              />
            </div>

            {/* Mascot placeholders */}
            <div className="relative flex items-end gap-4">
              {/* Avocado */}
              <div className="z-10 flex h-56 w-44 flex-col items-center justify-center rounded-[48px] bg-white/70 shadow-lg ring-1 ring-black/5">
                <div className="relative h-28 w-28 cursor-pointer">
                  <Image
                    src="/assets/image32.webp"
                    alt="Avocado"
                    fill
                    className="object-contain"
                    onClick={bounceGame}
                  />
                </div>
                <div className="mt-3 text-sm font-semibold text-black/70">
                  Avocado
                </div>
              </div>

              {/* Strawberry */}
              <div className="z-10 flex h-52 w-40 flex-col items-center justify-center rounded-[48px] bg-white/70 shadow-lg ring-1 ring-black/5">
                <div className="relative h-24 w-24 cursor-pointer">
                  <Image
                    src="/assets/image43.webp"
                    alt="Strawberry"
                    fill
                    className="object-contain"
                    onClick={bounceGame}
                  />
                </div>
                <div className="mt-3 text-sm font-semibold text-black/70">
                  Strawberry
                </div>
              </div>
            </div>

            {/* Extra floating fruit placeholders */}
            <div className="z-0 pointer-events-none absolute left-6 top-6 h-10 w-10">
              <Image
                src="/assets/image6.webp"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <div className="z-20 pointer-events-none absolute right-10 top-6 h-10 w-10">
              <Image
                src="/assets/image1.webp"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <div className="z-20 pointer-events-none absolute bottom-10 right-14 h-10 w-10">
              <Image
                src="/assets/image14.webp"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
        />
    </LessonLayout>
  );
}

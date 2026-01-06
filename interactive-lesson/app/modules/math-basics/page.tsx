import Link from "next/link";
import { LessonLayout } from "../../components/LessonLayout";
import { Heading, Subheading } from "../../components/Typography";
import { Button } from "../../components/Button";
import { useLesson } from "../../context/LessonContext";
import { colors } from "../../constants/colors";
import Image from "next/image";
import { useRef } from "react";

export default function Home() {
  const intervalRefs = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());
  const { studentEmail } = useLesson();

  const bounceGame = (e: React.MouseEvent<HTMLImageElement>) => {
    const element = e.currentTarget;
    
    if (intervalRefs.current.has(element)) {
      clearInterval(intervalRefs.current.get(element));
    }

    let pos = 0;
    let velocity = -15; 
    const gravity = 0.8; 
    const bounceFactor = -0.5; 

    const frame = () => {
      velocity += gravity;
      pos += velocity;

      if (pos > 0) {
        pos = 0;
        velocity = velocity * bounceFactor;

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
               {studentEmail && <p className="text-lg text-green-700 font-bold mb-4">Welcome back, {studentEmail.split('@')[0]}!</p>}
               
               <Link href="/modules/math-basics/slide/2" passHref legacyBehavior>
                <Button>
                  <span 
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    ▶
                  </span>
                  Start Learning
                </Button>
               </Link>
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
    </LessonLayout>
  );
}

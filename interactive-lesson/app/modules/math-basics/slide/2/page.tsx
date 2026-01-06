"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading, Subheading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";

export default function Slide2() {
  const router = useRouter();
  const nextActivity = () => {
    router.push("/modules/math-basics/slide/3");
  };

  return (
    <LessonLayout ariaLabel="What's On Your Plate?">
        {/* Yellow watercolor accents */}
        <div className="pointer-events-none absolute bottom-4 left-4 h-40 w-40 rotate-[-12deg]">
          <Image
            src="/assets/image2.webp"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="pointer-events-none absolute right-0 top-6 h-48 w-48 -rotate-90">
          <Image
            src="/assets/image4.webp"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="relative grid gap-10 p-6 sm:p-12 md:grid-cols-2">
          {/* LEFT: Question text */}
          <div className="flex flex-col justify-center">
            <Heading>
              WHAT’S
              <br />
              ON YOUR
              <br />
              BOOK?
            </Heading>

            <Subheading className="text-lg">
              Let’s learn about the food groups that help our bodies grow strong
              and healthy!
            </Subheading>

            {/* CTA */}
            <Button onClick={nextActivity} className="mt-8 text-2xl px-8 py-5 rounded-3xl">
              🍽️ Build My Plate
            </Button>
          </div>

          {/* RIGHT: Plate illustration */}
          <div className="flex items-center justify-center">
            <div className="relative rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5">
              {/* Placeholder for plate image */}
              <div className="relative h-96 w-96">
                <Image
                  src="/assets/image61.webp"
                  alt="Plate Illustration"
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              {/* Labels */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm font-semibold text-black/70">
                <div className="rounded-xl bg-[#FFCDD2] px-3 py-2">
                  Fruits
                </div>
                <div className="rounded-xl bg-[#C8E6C9] px-3 py-2">
                  Vegetables
                </div>
                <div className="rounded-xl bg-[#FFF9C4] px-3 py-2">
                  Whole Grains
                </div>
                <div className="rounded-xl bg-[#BBDEFB] px-3 py-2">
                  Healthy Protein
                </div>
              </div>
            </div>
          </div>
        </div>
    </LessonLayout>
  );
}

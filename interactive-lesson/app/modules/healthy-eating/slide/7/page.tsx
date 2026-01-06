"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";
import { colors } from "../../../../constants/colors";

// Using absolute paths from public directory

export default function Slide7() {
  const router = useRouter();

  return (
    <LessonLayout ariaLabel="Grains">
      {/* Yellow watercolor accents */}
      <div className="pointer-events-none absolute left-6 top-6 h-40 w-40 rotate-[-12deg] rounded-[48px] bg-[#F6E27A]/60"></div>
      <div className="pointer-events-none absolute right-6 top-10 h-44 w-44 rotate-12 rounded-[48px] bg-[#F6E27A]/60"></div>

      {/* Content */}
      <div className="relative grid gap-10 p-6 sm:p-12 md:grid-cols-2 items-center">
        {/* LEFT: Image */}
        <div className="flex justify-center">
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 rotate-[-2deg] transition hover:rotate-0 hover:scale-105 duration-500">
            <div className="relative h-72 w-72">
                <Image
                src="/assets/image35.webp"
                alt="Grains like bread and pasta"
                className="rounded-xl object-contain"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                />
            </div>
          </div>
        </div>

        {/* RIGHT: Text */}
        <div className="flex flex-col gap-6">
          <Heading className="text-4xl sm:text-5xl uppercase leading-tight" style={{ color: colors.primary }}>
            Grains
          </Heading>

          {/* Info pill */}
          <div className="rounded-3xl px-6 py-5 text-lg font-semibold text-black shadow-md w-fit transform hover:scale-105 transition-transform duration-300" style={{ backgroundColor: colors.accentGreenLight }}>
            Give us energy
          </div>

          {/* Helper text */}
          <div className="rounded-2xl bg-white px-5 py-4 shadow ring-1 ring-black/5">
            <p className="text-sm font-semibold text-black/70">
              🍞 Grains help fuel our bodies so we can play, learn, and grow!
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => router.push(routes.slides.slide8)}
            className="mt-2"
            variant="primary"
          >
            Next ▶
          </Button>
        </div>
      </div>
    </LessonLayout>
  );
}

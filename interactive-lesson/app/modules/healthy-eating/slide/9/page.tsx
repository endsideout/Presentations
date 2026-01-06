"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";
import { colors } from "../../../../constants/colors";

// Using absolute paths from public directory

export default function Slide9() {
  const router = useRouter();

  return (
    <LessonLayout ariaLabel="Protein">
      {/* Decorative Images */}
      <div className="pointer-events-none absolute left-6 top-6 h-40 w-40 rotate-[-12deg] opacity-80">
        <div className="relative h-full w-full">
          <Image src="/assets/image4.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-6 top-10 h-44 w-44 rotate-12 opacity-80">
        <div className="relative h-full w-full">
          <Image src="/assets/image2.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Extra Background Decorations */}
      <div className="pointer-events-none absolute left-[-10px] bottom-10 h-24 w-24 rotate-12 opacity-60">
        <div className="relative h-full w-full">
          <Image src="/assets/image6.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[-10px] bottom-20 h-28 w-28 rotate-[-12deg] opacity-60">
        <div className="relative h-full w-full">
          <Image src="/assets/image9.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[-20px] h-20 w-20 -translate-x-1/2 rotate-6 opacity-50">
        <div className="relative h-full w-full">
          <Image src="/assets/image14.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[20%] top-[40%] h-16 w-16 rotate-45 opacity-30">
        <div className="relative h-full w-full">
          <Image src="/assets/image19.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Content */}
      <div className="relative grid gap-10 p-6 sm:p-12 md:grid-cols-2 items-center">
        {/* LEFT: Image */}
        <div className="flex justify-center">
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 rotate-[-2deg] transition hover:rotate-0 hover:scale-105 duration-500">
            {/* Protein Image */}
            <div className="relative h-72 w-72">
                 <Image
                  src="/assets/image40.webp"
                  alt="Protein"
                  className="rounded-xl object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                />
            </div>
          </div>
        </div>

        {/* RIGHT: Text content */}
        <div className="flex flex-col gap-6">
          <Heading className="text-4xl sm:text-5xl uppercase leading-tight" style={{ color: colors.primary }}>
            Protein
          </Heading>

          {/* Info pills */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl px-6 py-5 text-lg font-semibold text-black shadow-md transform hover:scale-105 transition-transform duration-300" style={{ backgroundColor: colors.accentGreenLight }}>
             Keeps us full
            </div>

            <div className="rounded-3xl px-6 py-5 text-lg font-semibold text-black shadow-md transform hover:scale-105 transition-transform duration-300 delay-100" style={{ backgroundColor: colors.accentGreenLight }}>
              Helps us grow strong
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => router.push(routes.slides.slide10)}
            className="mt-4"
            variant="primary"
          >
            Next ▶
          </Button>
        </div>
      </div>
    </LessonLayout>
  );
}

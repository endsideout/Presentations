"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";
import { colors } from "../../../../constants/colors";

// Using absolute paths from public directory

export default function Slide5() {
  const router = useRouter();

  return (
    <LessonLayout ariaLabel="Fruits and Vegetables Detail">
      {/* Decorative Images */}
      <div className="pointer-events-none absolute left-6 top-8 h-44 w-44 rotate-[-10deg] opacity-80">
        <div className="relative h-full w-full">
          <Image src="/assets/image2.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Tiny Background Decorations */}
      <div className="pointer-events-none absolute left-10 bottom-10 h-10 w-10 rotate-12 opacity-60">
        <div className="relative h-full w-full">
          <Image src="/assets/image6.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-1/2 top-10 h-8 w-8 rotate-[-6deg] opacity-50">
        <div className="relative h-full w-full">
          <Image src="/assets/image8.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-12 bottom-20 h-12 w-12 rotate-[-12deg] opacity-60">
        <div className="relative h-full w-full">
          <Image src="/assets/image9.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/3 bottom-4 h-8 w-8 rotate-6 opacity-40">
        <div className="relative h-full w-full">
          <Image src="/assets/image14.webp" alt="" fill className="object-contain" />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-10 w-10 rotate-45 opacity-40">
        <div className="relative h-full w-full">
          <Image src="/assets/image19.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Content */}
      <div className="relative grid gap-8 p-6 sm:p-12 md:grid-cols-2 items-start">
        {/* LEFT: Illustrations + food examples */}
        <div className="flex flex-col gap-6">
          {/* Cartoon illustration placeholder */}
          <div className="flex items-center gap-4">
            <div className="flex items-end gap-2 flex-shrink-0">
              <div className="relative h-32 w-20 rotate-[-5deg]">
                <Image
                  src="/assets/image33.webp"
                  alt="Carrot character"
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
              <div className="relative h-16 w-16 rotate-[5deg]">
                 <Image
                  src="/assets/image29.webp"
                  alt="Peas character"
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
            </div>
            <p className="max-w-xs text-sm font-semibold text-black/70">
              Fruits and veggies help our tummies feel happy!
            </p>
          </div>

          {/* Example foods */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-3 shadow ring-1 ring-black/5 transition hover:scale-105">
              <div className="relative h-32 w-full">
                <Image
                  src="/assets/image47.webp"
                  alt="Berries"
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 33vw, 150px"
                />
              </div>
              <p className="mt-2 text-center text-sm font-semibold">Berries</p>
            </div>

            <div className="rounded-2xl bg-white p-3 shadow ring-1 ring-black/5 transition hover:scale-105">
              <div className="relative h-32 w-full">
                <Image
                  src="/assets/image42.webp"
                  alt="Sweet potato"
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 33vw, 150px"
                />
              </div>
              <p className="mt-2 text-center text-sm font-semibold">
                Sweet Potato
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3 shadow ring-1 ring-black/5 transition hover:scale-105">
              <div className="relative h-32 w-full">
                <Image
                  src="/assets/image28.webp"
                  alt="Broccoli"
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 33vw, 150px"
                />
              </div>
              <p className="mt-2 text-center text-sm font-semibold">Broccoli</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Key message */}
        <div className="flex flex-col gap-6">
          <Heading className="text-4xl sm:text-5xl uppercase leading-tight" style={{ color: colors.primary }}>
            Fruits and Vegetables also have{" "}
            <span className="block" style={{ color: colors.success }}>Fiber</span>
          </Heading>

          <div className="rounded-3xl px-6 py-5 text-lg font-semibold text-black shadow-md transform hover:scale-105 transition-transform duration-300" style={{ backgroundColor: colors.accentGreenLight }}>
            Fiber is good for our stomachs!
          </div>

          {/* Gentle interaction hook */}
          <div className="rounded-2xl bg-white px-5 py-4 shadow ring-1 ring-black/5">
            <p className="text-sm font-semibold text-black/70">
              💡 Fiber helps food move through our bodies and keeps us feeling
              good.
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => router.push(routes.slides.slide6)}
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

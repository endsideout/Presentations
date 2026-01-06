"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";

// Using absolute paths from public directory

export default function Slide10() {
  const router = useRouter();

  return (
    <LessonLayout ariaLabel="Protein in Meat">
      {/* Yellow watercolor accents */}
      <div className="pointer-events-none absolute left-6 top-8 h-44 w-44 rotate-[-10deg] rounded-[48px] bg-[#F6E27A]/60"></div>
      <div className="pointer-events-none absolute right-6 top-10 h-44 w-44 rotate-12 rounded-[48px] bg-[#F6E27A]/60"></div>

      {/* Content */}
      <div className="relative p-6 sm:p-12">
        {/* Title */}
        <Heading className="mb-8 text-center text-[#E85B1C] uppercase leading-tight">
          Protein in Meat
        </Heading>

        {/* Images Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Fish */}
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-105">
             <div className="relative h-40 w-full">
                <Image
                src="/assets/image52.webp"
                alt="Fish"
                className="object-cover rounded-xl"
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                />
            </div>
            <p className="mt-3 text-center text-sm font-semibold">Fish</p>
          </div>

          {/* Steak */}
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-105">
             <div className="relative h-40 w-full">
                <Image
                src="/assets/image46.webp"
                alt="Beef"
                className="object-cover rounded-xl"
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                />
            </div>
            <p className="mt-3 text-center text-sm font-semibold">Eggs</p>
          </div>

          {/* Eggs */}
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-105">
            <div className="relative h-40 w-full">
                <Image
                src="/assets/image44.webp"
                alt="Eggs"
                className="object-cover rounded-xl"
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                />
            </div>
            <p className="mt-3 text-center text-sm font-semibold">Beef</p>
          </div>

          {/* Chicken */}
          <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-105">
            <div className="relative h-40 w-full">
                <Image
                src="/assets/image55.webp"
                alt="Chicken"
                className="object-cover rounded-xl"
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                />
            </div>
            <p className="mt-3 text-center text-sm font-semibold">Chicken</p>
          </div>
        </div>

        {/* Info pill */}
        <div className="mt-8 flex justify-center">
          <div className="rounded-3xl bg-[#A8CF5A] px-8 py-5 text-lg font-semibold text-black shadow-md transform hover:scale-105 transition-transform duration-300">
            Protein helps us grow strong and stay full 💪
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.push(routes.slides.slide11)}
            variant="primary"
          >
            Next ▶
          </Button>
        </div>
      </div>
    </LessonLayout>
  );
}

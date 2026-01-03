"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../components/LessonLayout";
import { Heading } from "../../../components/Typography";
import { Button } from "../../../components/Button";
import { routes } from "../../../constants/routes";

// Using absolute paths from public directory

export default function Slide11() {
  const router = useRouter();

  return (
    <LessonLayout ariaLabel="Plant Protein">
      {/* Background Yellow watercolor accents */}
       <div className="pointer-events-none absolute left-[-40px] top-[-40px] h-64 w-64 rotate-[-10deg] opacity-90">
         <div className="relative h-full w-full">
           <Image src="/assets/image2.webp" alt="" fill className="object-contain" />
         </div>
      </div>
      <div className="pointer-events-none absolute right-[-20px] top-20 h-40 w-40 rotate-12 opacity-80">
         <div className="relative h-full w-full">
           <Image src="/assets/image61.webp" alt="" fill className="object-contain mix-blend-multiply opacity-50" />
         </div>
      </div>

       {/* More decorative elements */}
       <div className="pointer-events-none absolute left-20 top-2 h-16 w-16 rotate-12 opacity-80">
        <div className="relative h-full w-full">
          <Image src="/assets/image4.webp" alt="" fill className="object-contain" />
        </div>
       </div>
       <div className="pointer-events-none absolute right-10 bottom-10 h-24 w-24 rotate-[-12deg] opacity-80">
        <div className="relative h-full w-full">
          <Image src="/assets/image14.webp" alt="" fill className="object-contain" />
        </div>
       </div>

      {/* Content */}
      <div className="relative p-6 sm:p-12">
        {/* Title */}
        <Heading
          className="mb-12 text-center text-[#3E2723] uppercase leading-tight text-3xl sm:text-4xl"
        >
          Protein can be in<br />Plants too!
        </Heading>

        {/* Images Grid */}
        <div className="grid gap-8 sm:grid-cols-3 items-center justify-items-center max-w-5xl mx-auto">
          
          {/* Nuts & Seeds */}
          <div className="w-full max-w-xs transition hover:scale-105">
            <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                <div className="relative h-64 w-full">
                    <Image
                    src="/assets/image50.webp"
                    alt="Nuts & Seeds"
                    className="object-cover rounded-xl"
                    fill
                    sizes="(max-width: 768px) 80vw, 300px"
                    />
                </div>
            </div>
          </div>

          {/* Beans */}
          <div className="w-full max-w-xs transition hover:scale-105">
            <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                <div className="relative h-64 w-full">
                    <Image
                    src="/assets/image49.webp"
                    alt="Beans"
                    className="object-cover rounded-xl"
                    fill
                    sizes="(max-width: 768px) 80vw, 300px"
                    />
                </div>
            </div>
          </div>

          {/* Tofu */}
          <div className="w-full max-w-xs transition hover:scale-105">
            <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                <div className="relative h-64 w-full">
                    <Image
                    src="/assets/image38.webp"
                    alt="Tofu"
                    className="object-cover rounded-xl"
                    fill
                    sizes="(max-width: 768px) 80vw, 300px"
                    />
                </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
            {/* The previous button had secondary styling sort of (orange), so we'll use primary or secondary depending on what we defined.
                Button default is primary (white). Secondary is orange. We want orange here.
            */}
          <Button
            onClick={() => router.push(routes.slides.slide12)}
            variant="secondary"
          >
            Next ▶
          </Button>
        </div>
      </div>
    </LessonLayout>
  );
}

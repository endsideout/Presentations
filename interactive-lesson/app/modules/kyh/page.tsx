"use client";

import Link from "next/link";
import Image from "next/image";

export default function KYHHome() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#D8EDD3" }}>
      <div className="w-full max-w-6xl">
        <section
          className="relative mx-auto aspect-video w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5"
          style={{ backgroundColor: "#E8F5E4" }}
        >
          {/* Grid background */}
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

          {/* Decorative corner fruits */}
          <div className="pointer-events-none absolute left-4 top-4 h-16 w-16">
            <Image src="/assets/image19.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute right-6 bottom-6 h-20 w-20">
            <Image src="/assets/image11.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute left-4 bottom-6 h-16 w-16">
            <Image src="/assets/image6.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute right-6 top-4 h-16 w-16">
            <Image src="/assets/image9.webp" alt="" fill className="object-contain" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center justify-center h-full gap-8 px-8">
            <div className="text-center">
              <h1
                className="text-6xl font-black tracking-wide uppercase"
                style={{ color: "#E85B1C", fontFamily: "ui-rounded, system-ui, sans-serif" }}
              >
                Know Your Health
              </h1>
              <p className="mt-3 text-2xl font-bold" style={{ color: "#1B3A6B" }}>
                Review what you&apos;ve learned!
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-black/60 font-medium">Choose a recap to get started:</p>
              <Link
                href="/modules/kyh/recap/module1"
                className="inline-flex items-center gap-3 rounded-2xl px-8 py-5 text-xl font-bold shadow-lg ring-1 ring-black/10 transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#8BC34A", color: "white" }}
              >
                <span className="text-3xl">📚</span>
                Module 1 — Healthy Eating Recap
              </Link>
            </div>

            <div
              className="rounded-2xl px-6 py-3 text-base font-semibold"
              style={{ backgroundColor: "#FFF9C4", color: "#5D4037" }}
            >
              Complete activities to earn points! ⭐
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

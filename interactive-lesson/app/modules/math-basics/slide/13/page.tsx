"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";
import { colors } from "../../../../constants/colors";
import { useLesson } from "../../../../context/LessonContext";

// Using absolute paths from public directory

export default function Slide13() {
  const router = useRouter();
  const { markSlideComplete } = useLesson();
  const [selectedPlate, setSelectedPlate] = useState<"healthy" | "pasta" | null>(
    null
  );
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error" | "neutral";
  }>({ text: "", type: "neutral" });

  const handleSelect = (plate: "healthy" | "pasta") => {
    setSelectedPlate(plate);
    if (plate === "healthy") {
      setFeedback({
        text: "Great choice! This plate has protein, grains, and vegetables 💪🥦🍚",
        type: "success",
      });
    } else {
      setFeedback({
        text: "Good try! A balanced plate has more than just grains 😊",
        type: "error",
      });
    }
  };

  // Mark slide complete when correct plate is selected
  useEffect(() => {
    if (selectedPlate === "healthy") {
      markSlideComplete(13);
    }
  }, [selectedPlate, markSlideComplete]);

  return (
    <LessonLayout ariaLabel="Which Plate?">
      {/* Background Yellow Accents */}
      <div className="pointer-events-none absolute left-6 top-6 h-40 w-40 rotate-[-10deg] rounded-[48px] bg-[#F6E27A]/60"></div>
      <div className="pointer-events-none absolute right-6 top-10 h-40 w-40 rotate-12 rounded-[48px] bg-[#F6E27A]/60"></div>

      {/* Content */}
      <div className="relative p-6 sm:p-12 w-full">
        <Heading className="mb-6 text-center uppercase leading-tight" style={{ color: colors.primary }}>
          Which Plate?
        </Heading>

        <p className="mb-8 text-center text-lg text-black/70 font-medium">
          Tap the plate that helps your body the most!
        </p>

        {/* Plates */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Healthy Plate */}
          <button
            onClick={() => handleSelect("healthy")}
            className={`flex flex-col items-center rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-[1.02] ${
              selectedPlate === "healthy"
                ? "outline outline-6 outline-[#8BC34A] outline-offset-4"
                : ""
            }`}
          >
             <div className="relative mb-3 h-64 w-full">
                <Image
                src="/assets/image59.webp"
                alt="Healthy balanced plate"
                className="object-contain rounded-xl"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                />
            </div>
            <p className="text-xl font-bold text-black/80">
              Balanced Plate
            </p>
          </button>

          {/* Less Healthy Plate */}
          <button
            onClick={() => handleSelect("pasta")}
            className={`flex flex-col items-center rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:scale-[1.02] ${
              selectedPlate === "pasta"
                ? "outline outline-6 outline-[#FF7043] outline-offset-4"
                : ""
            }`}
          >
             <div className="relative mb-3 h-64 w-full">
                <Image
                src="/assets/image48.webp"
                alt="Mostly pasta plate"
                className="object-contain rounded-xl"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                />
            </div>
            <p className="text-xl font-bold text-black/80">Mostly Pasta</p>
          </button>
        </div>

        {/* Feedback */}
        <div
          className={`mt-8 min-h-[3rem] text-center text-xl font-bold transition-colors ${
            feedback.type === "success"
              ? "text-green-700"
              : feedback.type === "error"
              ? "text-red-600"
              : ""
          }`}
        >
          {feedback.text}
        </div>

        {/* Next */}
        {selectedPlate === "healthy" && (
          <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              onClick={() => router.push("/modules/math-basics/slide/end")}
              variant="secondary"
            >
              Next ▶
            </Button>
          </div>
        )}
      </div>
    </LessonLayout>
  );
}

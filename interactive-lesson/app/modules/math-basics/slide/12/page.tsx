"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { DropZone } from "../../../../components/DropZone";
import { DraggableFoodItem } from "../../../../components/DraggableFoodItem";
import { useDragAndDrop, type DragAndDropFoodItem } from "../../../../hooks/useDragAndDrop";
import { routes } from "../../../../constants/routes";
import { colors } from "../../../../constants/colors";
import { useLesson } from "../../../../context/LessonContext";

// Using absolute paths from public directory

interface FoodItem extends DragAndDropFoodItem {
  src: string;
}

export default function Slide12() {
  const router = useRouter();
  const { markSlideComplete } = useLesson();
  const [foods] = useState<FoodItem[]>([
    {
      id: "bacon",
      name: "Bacon",
      src: "/assets/image56.webp",
      zone: "sometimes",
    },
    {
      id: "salami",
      name: "Salami",
      src: "/assets/image60.webp",
      zone: "sometimes",
    },
    {
      id: "chicken",
      name: "Roasted Chicken",
      src: "/assets/image51.webp",
      zone: "anytime",
    },
    {
      id: "salmon",
      name: "Salmon",
      src: "/assets/image58.webp",
      zone: "anytime",
    },
  ]);

  const {
    placedFoods,
    feedback,
    shakingZone,
    isComplete,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop({
    foods,
  });

  // Mark slide complete when all foods are correctly placed
  useEffect(() => {
    if (isComplete) {
      markSlideComplete(12);
    }
  }, [isComplete, markSlideComplete]);

  const sometimesFoods = foods
    .filter((f) => placedFoods[f.id] === "sometimes")
    .map((f) => ({ id: f.id, name: f.name, src: f.src }));

  const anytimeFoods = foods
    .filter((f) => placedFoods[f.id] === "anytime")
    .map((f) => ({ id: f.id, name: f.name, src: f.src }));

  const unplacedFoods = foods.filter((f) => !placedFoods[f.id]);

  return (
    <LessonLayout ariaLabel="Protein Activity">
      {/* Decorative Images */}
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

      <div className="relative p-6 sm:p-12 w-full">
        <Heading
          className="mb-6 text-center uppercase leading-tight"
          style={{ color: colors.primary }}
        >
          Sometimes or Anytime?
        </Heading>

        <p className="mb-8 text-center text-lg text-black/70 font-medium">
          Drag each food to where it belongs!
        </p>

        {/* Game Area: Table Layout */}
        <div
          className="mx-auto mb-10 max-w-4xl overflow-hidden rounded-3xl border-4 bg-white/50 shadow-lg"
          style={{ borderColor: colors.primary }}
        >
          <div
            className="grid grid-cols-2 divide-x-4"
            style={{ borderColor: colors.primary }}
          >
            {/* SOMETIMES Zone */}
            <DropZone
              zone="sometimes"
              title="SOMETIMES"
              foods={sometimesFoods}
              isShaking={shakingZone === "sometimes"}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              foodCardSize="medium"
            />

            {/* ANYTIME Zone */}
            <DropZone
              zone="anytime"
              title="ANYTIME"
              foods={anytimeFoods}
              isShaking={shakingZone === "anytime"}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              foodCardSize="medium"
            />
          </div>
        </div>

        {/* Draggable Foods Source */}
        <div className="flex min-h-[120px] flex-wrap justify-center gap-4">
          {unplacedFoods.map((food) => (
            <DraggableFoodItem
              key={food.id}
              id={food.id}
              name={food.name}
              src={food.src}
              onDragStart={handleDragStart}
              size="large"
            />
          ))}
          {isComplete && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <p className="text-2xl font-bold text-green-600 mb-4">
                All done! Excellent work! 🌟
              </p>
              <Button
                onClick={() => router.push("/modules/math-basics/slide/13")}
                variant="primary"
                className="mt-2"
              >
                Next ▶
              </Button>
            </div>
          )}
        </div>

        {/* Feedback Toast */}
        {!isComplete && (
          <div
            className={`mt-6 h-8 text-center text-xl font-bold transition-all ${
              feedback.type === "success"
                ? "text-green-700 scale-110"
                : feedback.type === "error"
                ? "text-red-600"
                : "text-transparent"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </LessonLayout>
  );
}

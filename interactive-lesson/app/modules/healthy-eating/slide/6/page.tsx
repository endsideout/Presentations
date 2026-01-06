"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { routes } from "../../../../constants/routes";
import { useLesson } from "../../../../context/LessonContext";

// Using absolute paths from public directory

type Answer = "anytime" | "sometimes";

interface FoodItem {
  id: string;
  name: string;
  src: string;
  answer: Answer;
}

export default function Slide6() {
  const router = useRouter();
  const { markSlideComplete } = useLesson();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error" | "neutral";
  }>({ text: "", type: "neutral" });
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());

  const foodItems: FoodItem[] = [
    {
      id: "banana",
      name: "Banana",
      src: "/assets/image39.webp",
      answer: "anytime",
    },
    {
      id: "juice",
      name: "Juice",
      src: "/assets/image27.webp",
      answer: "sometimes",
    },
    {
      id: "fries",
      name: "French Fries",
      src: "/assets/image45.webp",
      answer: "sometimes",
    },
  ];

  const checkAnswer = (choice: Answer) => {
    if (!selectedFood) {
      setFeedback({
        text: "Select a food specific first! 👆",
        type: "neutral",
      });
      return;
    }

    if (choice === selectedFood.answer) {
      setFeedback({
        text: `Correct! ${selectedFood.name} is an ${choice} food! 🎉`,
        type: "success",
      });
      // Track correct answer
      setCorrectAnswers((prev) => new Set([...prev, selectedFood.id]));
    } else {
      setFeedback({
        text: `Nice try! But ${selectedFood.name} is a ${selectedFood.answer} food. 😊`,
        type: "error",
      });
    }
  };

  // Mark slide complete when all foods answered correctly
  const isComplete = correctAnswers.size === foodItems.length;
  
  useEffect(() => {
    if (isComplete) {
      markSlideComplete(6);
    }
  }, [isComplete, markSlideComplete]);

  return (
    <LessonLayout ariaLabel="Sometimes or Anytime Quiz">
      {/* Background Yellow Accents */}
      <div className="pointer-events-none absolute left-6 top-6 h-40 w-40 rotate-[-10deg] rounded-[48px] bg-[#F6E27A]/60"></div>
      <div className="pointer-events-none absolute right-6 top-10 h-40 w-40 rotate-12 rounded-[48px] bg-[#F6E27A]/60"></div>

      {/* Content */}
      <div className="relative flex flex-col items-center p-6 sm:p-12 w-full">
        <Heading className="mb-6 text-center text-[#E85B1C]">
          Sometimes or Anytime?
        </Heading>

        <p className="mb-8 text-center text-lg text-black/70 font-medium">
          Click a food, then decide: Is it an <b>Anytime</b> or{" "}
          <b>Sometimes</b> food?
        </p>

        {/* Food cards */}
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-3xl">
          {foodItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedFood(item);
                setFeedback({ text: "", type: "neutral" });
              }}
              className={`flex flex-col items-center rounded-3xl p-4 shadow ring-1 ring-black/5 transition-all duration-300 hover:scale-105 ${
                selectedFood?.id === item.id
                  ? "bg-[#FFF3E0] ring-4 ring-[#E85B1C] scale-110 shadow-2xl z-10"
                  : "bg-white"
              }`}
            >
              <div className="relative mb-3 h-40 w-full">
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-contain rounded-xl"
                  sizes="(max-width: 768px) 33vw, 150px"
                />
              </div>
              <p className="font-bold text-black/80">{item.name}</p>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <button
            onClick={() => checkAnswer("anytime")}
            className="rounded-2xl bg-[#A8CF5A] px-8 py-4 text-lg font-bold shadow transition hover:scale-105 active:scale-95"
          >
            Anytime ✅
          </button>

          <button
            onClick={() => checkAnswer("sometimes")}
            className="rounded-2xl bg-[#FFCC80] px-8 py-4 text-lg font-bold shadow transition hover:scale-105 active:scale-95"
          >
            Sometimes ⚠️
          </button>
        </div>

        {/* Feedback */}
        <div
          className={`mt-6 h-8 text-center text-xl font-bold transition-all ${
            feedback.type === "success"
              ? "text-green-700 scale-110"
              : feedback.type === "error"
              ? "text-red-600"
              : "text-black/60"
          }`}
        >
          {feedback.text}
        </div>

        {/* Next */}
        <div className="mt-8 flex justify-center">
            <Button
                onClick={() => router.push(routes.slides.slide7)}
                variant="primary"
            >
                Next ▶
            </Button>
        </div>
      </div>
    </LessonLayout>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LessonLayout } from "../../../../components/LessonLayout";
import { Heading, Subheading } from "../../../../components/Typography";
import { Button } from "../../../../components/Button";
import { useLesson } from "../../../../context/LessonContext";
import { useEffect } from "react";
import { routes } from "../../../../constants/routes";

type Category =
  | "Fruits"
  | "Vegetables"
  | "Whole Grains"
  | "Healthy Meat"
  | "Sometimes Food";

type FoodItem = {
  id: string;
  name: string;
  src: string;
  type: "healthy" | "unhealthy";
  category: Category;
};

// Assets provided by user - using absolute paths from public directory
const FOOD_ITEMS: FoodItem[] = [
  // Fruits
  {
    id: "fruits",
    name: "Fruits",
    src: "/assets/image62.webp",
    type: "healthy",
    category: "Fruits",
  },
  // Vegetables
  {
    id: "veggies",
    name: "Vegetables",
    src: "/assets/image63.webp",
    type: "healthy",
    category: "Vegetables",
  },
  // Whole Grains
  {
    id: "grains",
    name: "Whole Grains",
    src: "/assets/image35.webp",
    type: "healthy",
    category: "Whole Grains",
  },
  // Healthy Meat (Protein)
  {
    id: "protein",
    name: "Healthy Protein",
    src: "/assets/image40.webp",
    type: "healthy",
    category: "Healthy Meat",
  },
  // Sometimes Food
  {
    id: "sometimes",
    name: "Sometimes Food",
    src: "/assets/image64.webp",
    type: "unhealthy",
    category: "Sometimes Food",
  },
];

export default function Slide3() {
  const router = useRouter();
  const { markSlideComplete } = useLesson();
  const [plateItems, setPlateItems] = useState<FoodItem[]>([]);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error" | "neutral";
  }>({ text: "", type: "neutral" });
  const [shake, setShake] = useState(false);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: FoodItem
  ) => {
    e.dataTransfer.setData("foodId", item.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const foodId = e.dataTransfer.getData("foodId");
    const item = FOOD_ITEMS.find((f) => f.id === foodId);

    if (!item) return;

    if (item.type === "healthy") {
      // Check if already on plate
      if (!plateItems.find((p) => p.id === item.id)) {
        setPlateItems((prev) => [...prev, item]);
        setFeedback({ text: "Great choice! 👍", type: "success" });
      }
    } else {
      setFeedback({ text: "Oops! That’s a sometimes food 🚫", type: "error" });
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const isComplete = [
    "Fruits",
    "Vegetables",
    "Whole Grains",
    "Healthy Meat",
  ].every((cat) => plateItems.some((i) => i.category === cat));

  // Track completion
  useEffect(() => {
    if (isComplete) {
      markSlideComplete(3);
    }
  }, [isComplete]);

  const renderCategory = (category: Category) => {
    // Filter out items that are already on the plate
    const items = FOOD_ITEMS.filter(
      (i) => i.category === category && !plateItems.find((p) => p.id === i.id)
    );

    // If no items left in this category (and we strictly want to hide them), we could return null.
    // However, keeping the header might be nicer or empty space.
    // Given the request "hide it", let's hide the dragged items.

    return (
      <div className="flex flex-col gap-3 min-h-[140px]">
        <h3
          className={`text-center text-xl font-bold uppercase tracking-wider text-[#E85B1C] transition-opacity ${
            items.length === 0 ? "opacity-30" : "opacity-100"
          }`}
        >
          {category}
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="group relative flex h-40 w-40 cursor-grab items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/10 transition hover:scale-110 active:cursor-grabbing animate-float"
              title={item.name}
              style={{ animationDelay: `-${index * 0.7}s` }}
            >
              <div className="relative h-36 w-36 pointer-events-none">
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 160px) 100vw, 160px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <LessonLayout ariaLabel="Build Your Plate">
      <div className="relative h-full w-full p-6 sm:p-8 flex flex-col">
        <Heading className="mb-2 text-center text-3xl sm:text-4xl">
          Build Your Plate 🍽️
        </Heading>
        <Subheading className="mb-4 text-center mx-auto text-black/70">
          Drag healthy foods onto your plate!
        </Subheading>

        {/* Game Layout */}
        <div className="relative flex-1 grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-center">
          {/* LEFT: Fruits & Vegetables */}
          <div
            className={`flex flex-col gap-4 justify-center transition-opacity duration-500 ${
              isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {renderCategory("Fruits")}
            {renderCategory("Vegetables")}
          </div>

          {/* CENTER: Plate & Sometimes Food */}
          <div className="flex flex-col items-center justify-center gap-8">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative grid h-64 w-64 grid-cols-2 grid-rows-2 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl transition-transform sm:h-80 sm:w-80 ${
                shake ? "animate-shake" : ""
              } ${isComplete ? "scale-110" : ""}`}
            >
              {/* Fruits - Top Left */}
              <div className="relative flex flex-col items-center justify-center border-b-2 border-r-2 border-white bg-red-100/50 p-1">
                {plateItems.filter((i) => i.category === "Fruits").length >
                  0 && (
                  <span className="relative z-10 mb-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-600">
                    Fruits
                  </span>
                )}
                {plateItems
                  .filter((i) => i.category === "Fruits")
                  .slice(-1)
                  .map((item) => (
                    <div key={item.id} className="absolute inset-0 p-2">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 320px) 50vw, 160px"
                      />
                    </div>
                  ))}
              </div>

              {/* Grains - Top Right */}
              <div className="relative flex flex-col items-center justify-center border-b-2 border-l-2 border-white bg-orange-100/50 p-1">
                {plateItems.filter((i) => i.category === "Whole Grains")
                  .length > 0 && (
                  <span className="relative z-10 mb-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                    Grains
                  </span>
                )}
                {plateItems
                  .filter((i) => i.category === "Whole Grains")
                  .slice(-1)
                  .map((item) => (
                    <div key={item.id} className="absolute inset-0 p-2">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 320px) 50vw, 160px"
                      />
                    </div>
                  ))}
              </div>

              {/* Vegetables - Bottom Left */}
              <div className="relative flex flex-col items-center justify-center border-t-2 border-r-2 border-white bg-green-100/50 p-1">
                {plateItems.filter((i) => i.category === "Vegetables").length >
                  0 && (
                  <span className="relative z-10 mb-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
                    Veggies
                  </span>
                )}
                {plateItems
                  .filter((i) => i.category === "Vegetables")
                  .slice(-1)
                  .map((item) => (
                    <div key={item.id} className="absolute inset-0 p-2">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 320px) 50vw, 160px"
                      />
                    </div>
                  ))}
              </div>

              {/* Protein - Bottom Right */}
              <div className="relative flex flex-col items-center justify-center border-t-2 border-l-2 border-white bg-purple-100/50 p-1">
                {plateItems.filter((i) => i.category === "Healthy Meat")
                  .length > 0 && (
                  <span className="relative z-10 mb-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-600">
                    Protein
                  </span>
                )}
                {plateItems
                  .filter((i) => i.category === "Healthy Meat")
                  .slice(-1)
                  .map((item) => (
                    <div key={item.id} className="absolute inset-0 p-2">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 320px) 50vw, 160px"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Sometimes Food below plate (Hidden when complete) */}
            <div
              className={`transition-opacity duration-500 ${
                isComplete ? "opacity-0 hidden" : "opacity-100"
              }`}
            >
              {renderCategory("Sometimes Food")}
            </div>

            {/* Feedback Message */}
            {!isComplete && (
              <div
                className={`text-center text-lg font-bold min-h-[28px] ${
                  feedback.type === "success"
                    ? "text-green-700"
                    : feedback.type === "error"
                    ? "text-red-600"
                    : "text-transparent"
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Next Button (Visible when plate is complete) */}
            {isComplete && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <p className="text-2xl font-bold text-green-600 mb-4">
                  Perfect Plate! 🌟
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setPlateItems([]);
                      setFeedback({ text: "", type: "neutral" });
                    }}
                    className="rounded-full bg-white px-6 py-3 text-lg font-bold text-[#E85B1C] shadow-md ring-1 ring-[#E85B1C]/20 hover:bg-gray-50"
                    variant="primary" // Actually customized via className
                  >
                    🔄 Retake
                  </Button>
                  <Button
                    onClick={() => router.push("/modules/math-basics/slide/4")}
                    className="rounded-full bg-[#E85B1C] px-8 py-3 text-xl font-bold text-white shadow-lg transition hover:scale-105 hover:bg-[#c54e18]"
                    variant="secondary"
                  >
                    Next Activity ➡️
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Grains & Meat */}
          <div
            className={`flex flex-col gap-4 justify-center transition-opacity duration-500 ${
              isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {renderCategory("Whole Grains")}
            {renderCategory("Healthy Meat")}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-6px);
          }
          50% {
            transform: translateX(6px);
          }
          75% {
            transform: translateX(-6px);
          }
        }
        .animate-shake {
          animation: shake 0.4s;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </LessonLayout>
  );
}

"use client";

import Image from "next/image";
import { Zone } from "../hooks/useDragAndDrop";
import { colors } from "../constants/colors";

interface DropZoneProps {
  zone: Zone;
  title: string;
  foods: Array<{
    id: string;
    name: string;
    src: string;
  }>;
  isShaking: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, zone: Zone) => void;
  foodCardSize?: "small" | "medium" | "large";
}

const foodCardSizes = {
  small: "w-32",
  medium: "w-40",
  large: "w-44",
};

const foodImageSizes = {
  small: "h-16",
  medium: "h-24",
  large: "h-28",
};

export function DropZone({
  zone,
  title,
  foods,
  isShaking,
  onDragOver,
  onDrop,
  foodCardSize = "medium",
}: DropZoneProps) {
  const zoneBgColor =
    zone === "sometimes" ? colors.sometimesZone : colors.anytimeZone;

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, zone)}
      className={`flex min-h-[300px] flex-col items-center p-4 transition-colors ${
        isShaking ? "shake bg-red-100" : ""
      }`}
      style={{
        backgroundColor: `${zoneBgColor}30`,
      }}
    >
      <h3
        className="mb-6 text-2xl font-extrabold tracking-wide"
        style={{ color: colors.primary }}
      >
        {title}
      </h3>
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {foods.map((food) => (
          <div
            key={food.id}
            className={`flex ${foodCardSizes[foodCardSize]} flex-col items-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5`}
          >
            <div className={`relative mb-2 ${foodImageSizes[foodCardSize]} w-full`}>
              <Image
                src={food.src}
                alt={food.name}
                fill
                className="object-contain"
                sizes={
                  foodCardSize === "small"
                    ? "100px"
                    : foodCardSize === "medium"
                    ? "150px"
                    : "200px"
                }
              />
            </div>
            <p className="text-center text-xs font-bold">{food.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


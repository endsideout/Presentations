"use client";

import Image from "next/image";

interface DraggableFoodItemProps {
  id: string;
  name: string;
  src: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
  size?: "small" | "medium" | "large";
}

const itemSizes = {
  small: {
    container: "w-36",
    image: "h-20",
    sizes: "150px",
  },
  medium: {
    container: "w-36",
    image: "h-20",
    sizes: "150px",
  },
  large: {
    container: "w-44",
    image: "h-28",
    sizes: "200px",
  },
};

export function DraggableFoodItem({
  id,
  name,
  src,
  onDragStart,
  size = "medium",
}: DraggableFoodItemProps) {
  const sizeConfig = itemSizes[size];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      className={`cursor-grab active:cursor-grabbing flex ${sizeConfig.container} flex-col items-center rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 transition hover:scale-105 hover:rotate-2`}
    >
      <div className={`relative mb-2 ${sizeConfig.image} w-full`}>
        <Image
          src={src}
          alt={name}
          fill
          className="object-contain"
          sizes={sizeConfig.sizes}
        />
      </div>
      <p className="text-center text-sm font-bold">{name}</p>
    </div>
  );
}


"use client";

import { useState, useCallback } from "react";

export type Zone = "sometimes" | "anytime";

export interface DragAndDropFoodItem {
  id: string;
  name: string;
  zone: Zone;
}

export interface Feedback {
  text: string;
  type: "success" | "error" | "neutral";
}

interface UseDragAndDropOptions {
  foods: DragAndDropFoodItem[];
  onComplete?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseDragAndDropReturn {
  placedFoods: Record<string, Zone>;
  feedback: Feedback;
  shakingZone: Zone | null;
  isComplete: boolean;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetZone: Zone) => void;
  reset: () => void;
}

const SHAKE_DURATION = 400;

export function useDragAndDrop({
  foods,
  onComplete,
  successMessage = "Great choice! 🎉",
  errorMessage = "Good try! That goes in the other group 😊",
}: UseDragAndDropOptions): UseDragAndDropReturn {
  const [placedFoods, setPlacedFoods] = useState<Record<string, Zone>>({});
  const [feedback, setFeedback] = useState<Feedback>({
    text: "",
    type: "neutral",
  });
  const [shakingZone, setShakingZone] = useState<Zone | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetZone: Zone) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("id");
      const food = foods.find((f) => f.id === id);

      if (!food) return;

      if (food.zone === targetZone) {
        setPlacedFoods((prev) => ({ ...prev, [id]: targetZone }));
        setFeedback({
          text: successMessage,
          type: "success",
        });

        // Check if all foods are placed
        const newPlacedFoods = { ...placedFoods, [id]: targetZone };
        const allPlaced = foods.every((f) => newPlacedFoods[f.id]);
        if (allPlaced && onComplete) {
          onComplete();
        }
      } else {
        setFeedback({
          text: errorMessage,
          type: "error",
        });
        setShakingZone(targetZone);
        setTimeout(() => setShakingZone(null), SHAKE_DURATION);
      }
    },
    [foods, placedFoods, successMessage, errorMessage, onComplete]
  );

  const isComplete = foods.every((f) => placedFoods[f.id]);

  const reset = useCallback(() => {
    setPlacedFoods({});
    setFeedback({ text: "", type: "neutral" });
    setShakingZone(null);
  }, []);

  return {
    placedFoods,
    feedback,
    shakingZone,
    isComplete,
    handleDragStart,
    handleDragOver,
    handleDrop,
    reset,
  };
}


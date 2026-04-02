"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Grade = "grade3" | "grade4" | "grade5";

interface Option {
  id: string;
  text: string;
  emoji: string;
  correct: boolean;
  imageBg?: string;        // optional background colour for image-style cards
  imageEmojis?: string[];  // multiple emojis arranged as a scene
  imageLabel?: string;     // descriptive caption inside the image panel
}

interface ClassifyItem {
  id: string;
  name: string;
  emoji: string;
  category: "anytime" | "sometimes";
}

interface MCQActivity {
  type: "mcq";
  id: number;
  title: string;
  subtitle: string;
  question: string;
  options: Option[];
  points: number;
  grades: Grade[];
}

interface TwoOptionActivity {
  type: "two-option";
  id: number;
  title: string;
  subtitle: string;
  question: string;
  options: Option[];
  points: number;
  grades: Grade[];
}

interface SelectAllActivity {
  type: "select-all";
  id: number;
  title: string;
  subtitle: string;
  question: string;
  options: Option[];
  points: number;
  grades: Grade[];
}

interface ClassifyActivity {
  type: "classify";
  id: number;
  title: string;
  subtitle: string;
  instruction: string;
  items: ClassifyItem[];
  pointsPerItem: number;
  grades: Grade[];
}

type Activity = MCQActivity | TwoOptionActivity | SelectAllActivity | ClassifyActivity;

// ─── Activity Data ────────────────────────────────────────────────────────────

const ALL_ACTIVITIES: Activity[] = [
  // Activity 1 — Nutrition Definition (all grades)
  {
    type: "mcq",
    id: 1,
    title: "What is Nutrition?",
    subtitle: "Let's check what you remember!",
    question: "Nutrition is...",
    points: 10,
    grades: ["grade3", "grade4", "grade5"],
    options: [
      { id: "a", text: "Eating any food you want, any time", emoji: "🍔", correct: false },
      { id: "b", text: "Eating the right food so we can grow healthy and strong", emoji: "💪", correct: true },
      { id: "c", text: "Only eating vegetables every single day", emoji: "🥦", correct: false },
      { id: "d", text: "Skipping meals to stay fit", emoji: "⏭️", correct: false },
    ],
  },

  // Activity 2 — Healthy Foods Help You (grade 4 & 5 only)
  {
    type: "select-all",
    id: 2,
    title: "Healthy Foods Help You!",
    subtitle: "Select ALL the correct answers",
    question: "Healthy foods help you do which of these? Select all that apply:",
    points: 10,
    grades: ["grade4", "grade5"],
    options: [
      { id: "a", text: "Focus better in class", emoji: "🧠", correct: true },
      { id: "b", text: "Get better grades", emoji: "📚", correct: true },
      { id: "c", text: "Prevent sickness", emoji: "🛡️", correct: true },
      { id: "d", text: "Stay up all night without sleeping", emoji: "😴", correct: false },
      { id: "e", text: "Never feel tired ever again", emoji: "⚡", correct: false },
    ],
  },

  // Activity 3 — Colorful Foods (all grades)
  {
    type: "mcq",
    id: 3,
    title: "Colorful Foods",
    subtitle: "Think about the rainbow plate!",
    question: "Why should your plate have many different COLORS of fruits and vegetables?",
    points: 10,
    grades: ["grade3", "grade4", "grade5"],
    options: [
      { id: "a", text: "Because colorful foods look pretty on the plate", emoji: "🎨", correct: false },
      { id: "b", text: "Different colors mean different vitamins and nutrients for your body", emoji: "🌈", correct: true },
      { id: "c", text: "Because you should only eat one color every day", emoji: "🔴", correct: false },
      { id: "d", text: "Color does not matter at all", emoji: "⬜", correct: false },
    ],
  },

  // Activity 4 — Where is our food from? (all grades)
  {
    type: "two-option",
    id: 4,
    title: "Where Does Our Food Come From?",
    subtitle: "Pick the right answer!",
    question: "Which place gives us fresh, whole foods like fruits, vegetables, and grains?",
    points: 10,
    grades: ["grade3", "grade4", "grade5"],
    options: [
      {
        id: "garden",
        text: "Garden",
        emoji: "🌱",
        correct: true,
        imageBg: "#C8E6C9",
        imageEmojis: ["🌽", "🥕", "🥦", "🍅", "🌿", "👨‍🌾"],
        imageLabel: "Fresh from the garden",
      },
      {
        id: "factory",
        text: "Factory",
        emoji: "🏭",
        correct: false,
        imageBg: "#CFD8DC",
        imageEmojis: ["⚙️", "📦", "🏭", "🔩", "👷", "📋"],
        imageLabel: "Made in a factory",
      },
    ],
  },



  // Activity 7 — Sometimes or Anytime? Classify (all grades)
  {
    type: "classify",
    id: 7,
    title: "Sometimes or Anytime?",
    subtitle: "Sort each food — one at a time!",
    instruction: "Is this food an Anytime food or a Sometimes food?",
    pointsPerItem: 5,
    grades: ["grade3", "grade4", "grade5"],
    items: [
      { id: "icecream", name: "Ice Cream", emoji: "🍦", category: "sometimes" },
      { id: "avocado", name: "Avocado", emoji: "🥑", category: "anytime" },
      { id: "chicken", name: "Grilled Chicken", emoji: "🍗", category: "anytime" },
      { id: "chips", name: "Chips", emoji: "🍟", category: "sometimes" },
    ],
  },

  // Activity 8 — Healthy Habits (all grades)
  {
    type: "select-all",
    id: 8,
    title: "You Can Eat Healthy By...",
    subtitle: "Select ALL the healthy habits",
    question: "How can you eat healthy? Select all the good habits:",
    points: 10,
    grades: ["grade3", "grade4", "grade5"],
    options: [
      { id: "a", text: "Eating fruits and vegetables", emoji: "🥦", correct: true },
      { id: "b", text: "Making a colorful plate", emoji: "🎨", correct: true },
      { id: "c", text: "Saving sweets for sometimes", emoji: "🍬", correct: true },
      { id: "d", text: "Eating chips every single day", emoji: "🍟", correct: false },
      { id: "e", text: "Drinking soda with every meal", emoji: "🥤", correct: false },
    ],
  },

  // Activity 9 — Balanced Plate (grade 5 only)
  {
    type: "select-all",
    id: 9,
    title: "Build a Balanced Plate",
    subtitle: "Grade 5 challenge!",
    question: "A balanced meal should include all of these. Select everything that belongs on your plate:",
    points: 10,
    grades: ["grade5"],
    options: [
      { id: "water", text: "Water", emoji: "💧", correct: true },
      { id: "fruits", text: "Fruits", emoji: "🍎", correct: true },
      { id: "grains", text: "Grains", emoji: "🌾", correct: true },
      { id: "veggies", text: "Veggies", emoji: "🥦", correct: true },
      { id: "protein", text: "Protein", emoji: "🍗", correct: true },
      { id: "candy", text: "Candy", emoji: "🍬", correct: false },
      { id: "soda", text: "Soda", emoji: "🥤", correct: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActivitiesForGrade(grade: Grade): Activity[] {
  return ALL_ACTIVITIES.filter((a) => a.grades.includes(grade));
}

function classifyActivityPoints(activity: ClassifyActivity): number {
  return activity.items.length * activity.pointsPerItem;
}

function totalPossiblePoints(grade: Grade): number {
  return getActivitiesForGrade(grade).reduce((sum, a) => {
    if (a.type === "classify") return sum + classifyActivityPoints(a);
    return sum + a.points;
  }, 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PointsBadge({ points }: { points: number }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-5 py-2 text-lg font-bold shadow"
      style={{ backgroundColor: "#FFF9C4", color: "#5D4037" }}
    >
      ⭐ {points} pts
    </div>
  );
}

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm font-semibold text-black/60">
        <span>Activity {current} of {total}</span>
        <span>{pct}% done</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 ring-1 ring-black/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: "#8BC34A",
          }}
        />
      </div>
    </div>
  );
}

function FeedbackBanner({
  correct,
  message,
}: {
  correct: boolean;
  message: string;
}) {
  return (
    <div
      className="mt-4 rounded-2xl px-6 py-3 text-center text-lg font-bold shadow-md transition-all"
      style={{
        backgroundColor: correct ? "#DCEDC8" : "#FFCCBC",
        color: correct ? "#33691E" : "#BF360C",
      }}
    >
      {correct ? "🎉 " : "😊 "}
      {message}
    </div>
  );
}

// ─── Activity Renderers ───────────────────────────────────────────────────────

function MCQActivityView({
  activity,
  onAnswer,
}: {
  activity: MCQActivity;
  onAnswer: (correct: boolean, points: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    const opt = activity.options.find((o) => o.id === selected)!;
    onAnswer(opt.correct, opt.correct ? activity.points : 0);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-2xl font-bold text-center" style={{ color: "#1B3A6B" }}>
        {activity.question}
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showResult = submitted;
          let bg = "bg-white";
          let border = "ring-1 ring-black/10";
          if (showResult && opt.correct) {
            bg = "bg-[#DCEDC8]";
            border = "ring-4 ring-[#558B2F]";
          } else if (showResult && isSelected && !opt.correct) {
            bg = "bg-[#FFCCBC]";
            border = "ring-4 ring-[#BF360C]";
          } else if (!showResult && isSelected) {
            bg = "bg-[#E3F2FD]";
            border = "ring-4 ring-[#1565C0]";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={submitted}
              className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-left text-lg font-semibold shadow transition-all hover:scale-[1.02] active:scale-[0.98] ${bg} ${border}`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-black/80">{opt.text}</span>
              {showResult && opt.correct && <span className="ml-auto text-green-700">✓</span>}
              {showResult && isSelected && !opt.correct && <span className="ml-auto text-red-600">✗</span>}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="mt-2 rounded-2xl px-8 py-4 text-xl font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#8BC34A", color: "white" }}
        >
          Check Answer ✓
        </button>
      )}
    </div>
  );
}

function TwoOptionActivityView({
  activity,
  onAnswer,
}: {
  activity: TwoOptionActivity;
  onAnswer: (correct: boolean, points: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hasImages = activity.options.some((o) => o.imageEmojis);

  const handleClick = (opt: Option) => {
    if (submitted) return;
    setSelected(opt.id);
    setSubmitted(true);
    onAnswer(opt.correct, opt.correct ? activity.points : 0);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-2xl font-bold text-center" style={{ color: "#1B3A6B" }}>
        {activity.question}
      </p>

      <div className="flex gap-8 justify-center w-full max-w-3xl">
        {activity.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showResult = submitted;

          let borderColor = "transparent";
          let overlayBg = "transparent";
          if (showResult && opt.correct) {
            borderColor = "#558B2F";
            overlayBg = "rgba(220,237,200,0.4)";
          } else if (showResult && isSelected && !opt.correct) {
            borderColor = "#BF360C";
            overlayBg = "rgba(255,204,188,0.4)";
          } else if (!showResult && isSelected) {
            borderColor = "#1565C0";
          }

          if (hasImages && opt.imageEmojis) {
            // Image-style card: scene panel on top, button below
            return (
              <div
                key={opt.id}
                className="flex flex-col items-center gap-3 flex-1"
                style={{ maxWidth: "280px" }}
              >
                {/* Scene panel */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: opt.imageBg ?? "#e0e0e0",
                    border: `4px solid ${borderColor === "transparent" ? "rgba(0,0,0,0.08)" : borderColor}`,
                    height: "180px",
                  }}
                >
                  {/* Emoji scene grid */}
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
                    {opt.imageEmojis.map((em, i) => (
                      <span key={i} className="text-4xl leading-none select-none">
                        {em}
                      </span>
                    ))}
                  </div>
                  {/* Overlay tint on result */}
                  <div
                    className="absolute inset-0 rounded-2xl transition-all"
                    style={{ backgroundColor: overlayBg }}
                  />
                  {/* Result badge */}
                  {showResult && opt.correct && (
                    <div className="absolute top-2 right-2 rounded-full bg-green-600 text-white text-lg w-8 h-8 flex items-center justify-center font-bold shadow">
                      ✓
                    </div>
                  )}
                  {showResult && isSelected && !opt.correct && (
                    <div className="absolute top-2 right-2 rounded-full bg-red-600 text-white text-lg w-8 h-8 flex items-center justify-center font-bold shadow">
                      ✗
                    </div>
                  )}
                  {/* Label inside image */}
                  {opt.imageLabel && (
                    <div className="absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-semibold text-black/50 bg-white/40 backdrop-blur-sm">
                      {opt.imageLabel}
                    </div>
                  )}
                </div>

                {/* Button below image */}
                <button
                  onClick={() => handleClick(opt)}
                  disabled={submitted}
                  className="w-full rounded-2xl py-4 text-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: showResult && opt.correct
                      ? "#8BC34A"
                      : showResult && isSelected && !opt.correct
                      ? "#FF8A65"
                      : "#8BC34A",
                    color: "white",
                    opacity: submitted && !isSelected && !opt.correct ? 0.6 : 1,
                  }}
                >
                  {opt.emoji} {opt.text}
                </button>
              </div>
            );
          }

          // Fallback: plain big button (no image)
          let bg = "#ffffff";
          let ring = "ring-1 ring-black/10";
          if (showResult && opt.correct) { bg = "#DCEDC8"; ring = "ring-4 ring-[#558B2F]"; }
          else if (showResult && isSelected && !opt.correct) { bg = "#FFCCBC"; ring = "ring-4 ring-[#BF360C]"; }

          return (
            <button
              key={opt.id}
              onClick={() => handleClick(opt)}
              disabled={submitted}
              className={`flex flex-col items-center gap-3 rounded-3xl px-10 py-8 text-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${ring}`}
              style={{ backgroundColor: bg, minWidth: "200px" }}
            >
              <span className="text-7xl">{opt.emoji}</span>
              <span className="text-black/80">{opt.text}</span>
              {showResult && opt.correct && <span className="text-green-700 text-2xl">✓</span>}
              {showResult && isSelected && !opt.correct && <span className="text-red-600 text-2xl">✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectAllActivityView({
  activity,
  onAnswer,
}: {
  activity: SelectAllActivity;
  onAnswer: (correct: boolean, points: number) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitted) return;
    const correctIds = new Set(activity.options.filter((o) => o.correct).map((o) => o.id));
    const allCorrectSelected = [...correctIds].every((id) => selected.has(id));
    const noWrongSelected = [...selected].every((id) => correctIds.has(id));
    const correct = allCorrectSelected && noWrongSelected;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct, correct ? activity.points : 0);
  };

  const correctIds = new Set(activity.options.filter((o) => o.correct).map((o) => o.id));

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-xl font-bold text-center" style={{ color: "#1B3A6B" }}>
        {activity.question}
      </p>
      <p className="text-sm font-medium text-black/50">(Click to select, click again to deselect)</p>

      <div className="flex flex-wrap gap-3 justify-center w-full max-w-3xl">
        {activity.options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const showResult = submitted;
          let bg = "bg-white";
          let border = "ring-1 ring-black/10";

          if (showResult) {
            if (opt.correct && isSelected) {
              bg = "bg-[#DCEDC8]";
              border = "ring-4 ring-[#558B2F]";
            } else if (opt.correct && !isSelected) {
              bg = "bg-[#FFF9C4]";
              border = "ring-4 ring-[#F57F17] ring-dashed";
            } else if (!opt.correct && isSelected) {
              bg = "bg-[#FFCCBC]";
              border = "ring-4 ring-[#BF360C]";
            }
          } else if (isSelected) {
            bg = "bg-[#E3F2FD]";
            border = "ring-4 ring-[#1565C0]";
          }

          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              disabled={submitted}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-semibold shadow transition-all hover:scale-105 active:scale-95 ${bg} ${border}`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-black/80">{opt.text}</span>
              {isSelected && !submitted && <span className="text-blue-600">✓</span>}
              {showResult && isSelected && opt.correct && <span className="text-green-700">✓</span>}
              {showResult && isSelected && !opt.correct && <span className="text-red-600">✗</span>}
              {showResult && !isSelected && opt.correct && <span className="text-amber-600">!</span>}
            </button>
          );
        })}
      </div>

      {submitted && !isCorrect && (
        <p className="text-sm text-amber-700 font-medium">
          💡 Yellow outlines show the correct answers you missed.
        </p>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className="mt-2 rounded-2xl px-8 py-4 text-xl font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#8BC34A", color: "white" }}
        >
          Submit Answers ✓
        </button>
      )}
    </div>
  );
}

function ClassifyActivityView({
  activity,
  onAnswer,
}: {
  activity: ClassifyActivity;
  onAnswer: (correct: boolean, points: number) => void;
}) {
  const [itemIndex, setItemIndex] = useState(0);
  const [itemResult, setItemResult] = useState<{ correct: boolean; chosen: string } | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [done, setDone] = useState(false);

  const currentItem = activity.items[itemIndex];

  const handleClassify = useCallback(
    (choice: "anytime" | "sometimes") => {
      if (itemResult) return;
      const correct = choice === currentItem.category;
      const earned = correct ? activity.pointsPerItem : 0;
      setTotalEarned((p) => p + earned);
      setItemResult({ correct, chosen: choice });
      // Notify parent after last item
      if (itemIndex === activity.items.length - 1) {
        onAnswer(correct, earned + totalEarned);
      }
    },
    [itemResult, currentItem, activity, itemIndex, totalEarned, onAnswer]
  );

  const handleNext = () => {
    if (itemIndex < activity.items.length - 1) {
      setItemIndex((i) => i + 1);
      setItemResult(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const total = activity.items.length * activity.pointsPerItem;
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-6xl">🏆</span>
        <p className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
          All foods sorted!
        </p>
        <p className="text-xl font-semibold text-black/70">
          You earned {totalEarned} out of {total} points
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Progress dots */}
      <div className="flex gap-2">
        {activity.items.map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full transition-all"
            style={{
              backgroundColor: i < itemIndex ? "#8BC34A" : i === itemIndex ? "#E85B1C" : "#D0D0D0",
            }}
          />
        ))}
      </div>

      <p className="text-xl font-bold text-center" style={{ color: "#1B3A6B" }}>
        {activity.instruction}
      </p>

      {/* Food card */}
      <div
        className="flex flex-col items-center gap-3 rounded-3xl px-16 py-8 shadow-xl ring-2 ring-black/10"
        style={{ backgroundColor: "white" }}
      >
        <span className="text-8xl">{currentItem.emoji}</span>
        <span className="text-2xl font-black text-black/80">{currentItem.name}</span>
      </div>

      {/* Classify buttons */}
      {!itemResult && (
        <div className="flex gap-6">
          <button
            onClick={() => handleClassify("anytime")}
            className="rounded-2xl px-8 py-4 text-xl font-bold shadow-lg transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#A8CF5A", color: "white" }}
          >
            ✅ Anytime
          </button>
          <button
            onClick={() => handleClassify("sometimes")}
            className="rounded-2xl px-8 py-4 text-xl font-bold shadow-lg transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#FFCC80", color: "#5D4037" }}
          >
            ⚠️ Sometimes
          </button>
        </div>
      )}

      {/* Feedback for this item */}
      {itemResult && (
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-2xl px-6 py-3 text-lg font-bold shadow-md"
            style={{
              backgroundColor: itemResult.correct ? "#DCEDC8" : "#FFCCBC",
              color: itemResult.correct ? "#33691E" : "#BF360C",
            }}
          >
            {itemResult.correct
              ? `🎉 Correct! ${currentItem.name} is an ${currentItem.category} food! +${activity.pointsPerItem} pts`
              : `😊 Not quite! ${currentItem.name} is a ${currentItem.category} food.`}
          </div>

          <button
            onClick={handleNext}
            className="rounded-2xl px-8 py-4 text-xl font-bold shadow-lg transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#E85B1C", color: "white" }}
          >
            {itemIndex < activity.items.length - 1 ? "Next Food ▶" : "See Results ▶"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GRADE_LABELS: Record<Grade, string> = {
  grade3: "3rd Grade",
  grade4: "4th Grade",
  grade5: "5th Grade",
};

export default function Module1Recap() {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [lastResult, setLastResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [activityDone, setActivityDone] = useState(false);
  const [finished, setFinished] = useState(false);

  const activities = selectedGrade ? getActivitiesForGrade(selectedGrade) : [];
  const currentActivity = activities[currentActivityIndex];
  const possible = selectedGrade ? totalPossiblePoints(selectedGrade) : 0;

  const handleAnswer = useCallback(
    (correct: boolean, points: number) => {
      setTotalPoints((p) => p + points);
      setLastResult({
        correct,
        message: correct
          ? `Great job! +${points} points!`
          : `Nice try! Keep it up — you're learning!`,
      });
      setActivityDone(true);
    },
    []
  );

  const handleNextActivity = () => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((i) => i + 1);
      setLastResult(null);
      setActivityDone(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setSelectedGrade(null);
    setCurrentActivityIndex(0);
    setTotalPoints(0);
    setLastResult(null);
    setActivityDone(false);
    setFinished(false);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#D8EDD3" }}
    >
      <div className="w-full max-w-6xl">
        <section
          className="relative mx-auto w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5"
          style={{ backgroundColor: "#E8F5E4", minHeight: "600px" }}
        >
          {/* Grid BG */}
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

          {/* Decorative fruits */}
          <div className="pointer-events-none absolute left-2 top-2 h-14 w-14 opacity-70">
            <Image src="/assets/image19.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute right-2 top-2 h-14 w-14 opacity-70">
            <Image src="/assets/image9.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute left-2 bottom-2 h-14 w-14 opacity-70">
            <Image src="/assets/image6.webp" alt="" fill className="object-contain" />
          </div>
          <div className="pointer-events-none absolute right-2 bottom-2 h-14 w-14 opacity-70">
            <Image src="/assets/image11.webp" alt="" fill className="object-contain" />
          </div>

          {/* ── Header ── */}
          <div
            className="relative flex items-center justify-between px-8 py-4 shadow-sm"
            style={{ backgroundColor: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div className="flex items-center gap-3">
              <Link
                href="/modules/kyh"
                className="rounded-xl px-3 py-2 text-sm font-bold text-black/50 hover:text-black/80 transition"
              >
                ← KYH
              </Link>
              <span className="text-black/30">/</span>
              <h1
                className="text-2xl font-black uppercase tracking-wide"
                style={{ color: "#E85B1C", fontFamily: "ui-rounded, system-ui, sans-serif" }}
              >
                Module 1 — Healthy Eating Recap
              </h1>
              {selectedGrade && (
                <>
                  <span className="text-black/30">/</span>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: "#8BC34A", color: "white" }}
                  >
                    {GRADE_LABELS[selectedGrade]}
                  </span>
                </>
              )}
            </div>
            <PointsBadge points={totalPoints} />
          </div>

          {/* ── Content ── */}
          <div className="relative px-8 py-6">

            {/* Grade Selector */}
            {!selectedGrade && (
              <div className="flex flex-col items-center gap-8 py-8">
                <div className="text-center">
                  <h2
                    className="text-4xl font-black uppercase"
                    style={{ color: "#E85B1C", fontFamily: "ui-rounded, system-ui, sans-serif" }}
                  >
                    Choose Your Grade
                  </h2>
                  <p className="mt-2 text-lg font-medium text-black/60">
                    Select your grade to begin the recap activities!
                  </p>
                </div>

                <div className="flex gap-6 flex-wrap justify-center">
                  {(["grade3", "grade4", "grade5"] as Grade[]).map((g) => {
                    const acts = getActivitiesForGrade(g);
                    const pts = totalPossiblePoints(g);
                    return (
                      <button
                        key={g}
                        onClick={() => setSelectedGrade(g)}
                        className="flex flex-col items-center gap-3 rounded-3xl px-10 py-8 shadow-xl ring-1 ring-black/10 transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: "white", minWidth: "200px" }}
                      >
                        <span className="text-5xl">
                          {g === "grade3" ? "🌱" : g === "grade4" ? "🌿" : "🌳"}
                        </span>
                        <span className="text-2xl font-black" style={{ color: "#E85B1C" }}>
                          {GRADE_LABELS[g]}
                        </span>
                        <div className="flex flex-col items-center gap-1 text-sm text-black/50 font-medium">
                          <span>{acts.length} activities</span>
                          <span>Up to {pts} pts ⭐</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="rounded-2xl px-6 py-3 text-center text-sm font-semibold max-w-md"
                  style={{ backgroundColor: "#FFF9C4", color: "#5D4037" }}
                >
                  💡 Activities are based on what you learned in Module 1. Pick your grade to get started!
                </div>
              </div>
            )}

            {/* Finished Screen */}
            {selectedGrade && finished && (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <span className="text-8xl">🏆</span>
                <h2
                  className="text-4xl font-black uppercase"
                  style={{ color: "#E85B1C", fontFamily: "ui-rounded, system-ui, sans-serif" }}
                >
                  Recap Complete!
                </h2>
                <p className="text-xl font-bold" style={{ color: "#1B3A6B" }}>
                  {GRADE_LABELS[selectedGrade]} — Module 1: Healthy Eating
                </p>

                <div
                  className="rounded-3xl px-12 py-6 shadow-xl ring-1 ring-black/10"
                  style={{ backgroundColor: "white" }}
                >
                  <p className="text-5xl font-black" style={{ color: "#E85B1C" }}>
                    {totalPoints}
                    <span className="text-2xl text-black/40"> / {possible} pts</span>
                  </p>
                  <p className="mt-2 text-lg font-semibold text-black/60">Total Points Earned</p>
                  <div className="mt-4 h-4 w-64 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${possible > 0 ? Math.round((totalPoints / possible) * 100) : 0}%`,
                        backgroundColor: "#8BC34A",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-black/40 font-medium">
                    {possible > 0 ? Math.round((totalPoints / possible) * 100) : 0}% score
                  </p>
                </div>

                <p className="text-xl font-semibold text-black/70">
                  {totalPoints === possible
                    ? "🌟 Perfect score! Outstanding work!"
                    : totalPoints >= possible * 0.8
                    ? "🎉 Excellent work! You really know your health!"
                    : totalPoints >= possible * 0.6
                    ? "👍 Great job! Keep learning and you'll be a health expert!"
                    : "💪 Good effort! Review Module 1 and try again!"}
                </p>

                <div className="flex gap-4 flex-wrap justify-center">
                  <button
                    onClick={handleReset}
                    className="rounded-2xl px-8 py-4 text-lg font-bold shadow-lg transition hover:scale-105 active:scale-95"
                    style={{ backgroundColor: "#8BC34A", color: "white" }}
                  >
                    Try Another Grade
                  </button>
                  <Link
                    href="/modules/kyh"
                    className="rounded-2xl px-8 py-4 text-lg font-bold shadow-lg transition hover:scale-105 active:scale-95"
                    style={{ backgroundColor: "white", color: "#E85B1C" }}
                  >
                    Back to KYH
                  </Link>
                </div>
              </div>
            )}

            {/* Activity View */}
            {selectedGrade && !finished && currentActivity && (
              <div className="flex flex-col gap-5">
                {/* Progress */}
                <ProgressBar current={currentActivityIndex + 1} total={activities.length} />

                {/* Activity card */}
                <div
                  className="rounded-3xl p-6 shadow-lg ring-1 ring-black/10 relative overflow-hidden"
                  style={{ backgroundColor: "#D6EDD0" }}
                >
                  {/* Grid background overlay */}
                  <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />

                  {/* Activity header */}
                  <div className="mb-5 text-center">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                      style={{ backgroundColor: "#FFF9C4", color: "#F57F17" }}
                    >
                      Activity {currentActivityIndex + 1} of {activities.length} ·{" "}
                      {currentActivity.type === "classify"
                        ? `${currentActivity.items.length * currentActivity.pointsPerItem} pts`
                        : `${currentActivity.points} pts`}
                    </span>
                    <h2
                      className="mt-2 text-3xl font-black uppercase"
                      style={{ color: "#E85B1C", fontFamily: "ui-rounded, system-ui, sans-serif" }}
                    >
                      {currentActivity.title}
                    </h2>
                    <p className="text-base font-medium text-black/50">{currentActivity.subtitle}</p>
                  </div>

                  {/* Render activity by type — key forces remount on activity change */}
                  {currentActivity.type === "mcq" && (
                    <MCQActivityView
                      key={currentActivity.id}
                      activity={currentActivity}
                      onAnswer={handleAnswer}
                    />
                  )}
                  {currentActivity.type === "two-option" && (
                    <TwoOptionActivityView
                      key={currentActivity.id}
                      activity={currentActivity}
                      onAnswer={handleAnswer}
                    />
                  )}
                  {currentActivity.type === "select-all" && (
                    <SelectAllActivityView
                      key={currentActivity.id}
                      activity={currentActivity}
                      onAnswer={handleAnswer}
                    />
                  )}
                  {currentActivity.type === "classify" && (
                    <ClassifyActivityView
                      key={currentActivity.id}
                      activity={currentActivity}
                      onAnswer={handleAnswer}
                    />
                  )}

                  {/* Feedback banner (for non-classify activities) */}
                  {lastResult && currentActivity.type !== "classify" && (
                    <FeedbackBanner
                      correct={lastResult.correct}
                      message={lastResult.message}
                    />
                  )}
                </div>

                {/* Next Activity button */}
                {activityDone && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleNextActivity}
                      className="rounded-2xl px-10 py-5 text-xl font-bold shadow-xl ring-1 ring-black/10 transition hover:scale-105 active:scale-95"
                      style={{ backgroundColor: "#E85B1C", color: "white" }}
                    >
                      {currentActivityIndex < activities.length - 1
                        ? "Next Activity ▶"
                        : "See Final Score 🏆"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

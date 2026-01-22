"use client";

import { useState, FormEvent } from "react";

interface WellnessLoginModalProps {
  isOpen: boolean;
  onSubmit: (name: string, email: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function WellnessLoginModal({
  isOpen,
  onSubmit,
  isSubmitting = false,
}: WellnessLoginModalProps) {
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    try {
      await onSubmit(nameInput.trim(), emailInput.trim().toLowerCase());
      setNameInput("");
      setEmailInput("");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🪐</div>
          <h2 className="mb-2 text-3xl font-black text-indigo-600">
            Welcome to Wellness Tracker!
          </h2>
          <p className="text-gray-600">
            Enter your name and email to start tracking your wellness journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-xl border-2 border-gray-200 p-4 text-lg outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 disabled:opacity-50"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@school.com"
              className="w-full rounded-xl border-2 border-gray-200 p-4 text-lg outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 disabled:opacity-50"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !nameInput.trim() || !emailInput.trim()}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 font-bold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Starting..." : "Start My Wellness Journey! 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}

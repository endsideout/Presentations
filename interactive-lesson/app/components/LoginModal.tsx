"use client";

import { useState, FormEvent } from "react";
import { colors } from "../constants/colors";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function LoginModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: LoginModalProps) {
  const [emailInput, setEmailInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      await onSubmit(emailInput.trim().toLowerCase());
      setEmailInput("");
    } catch (error) {
      console.error("Login failed", error);
      // Error handling could be improved with user-facing error messages
    }
  };

  const handleCancel = () => {
    setEmailInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-2 text-2xl font-bold" style={{ color: colors.primary }}>
          Ready to start?
        </h2>
        <p className="mb-6 text-gray-600">
          Enter your student email (or a nickname) to track your progress.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="name@school.com"
            className="w-full rounded-xl border-2 border-gray-200 p-4 text-lg outline-none transition focus:ring-4 disabled:opacity-50"
            style={{
              borderColor: "rgb(229, 231, 235)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 4px ${colors.primary}1a`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgb(229, 231, 235)";
              e.target.style.boxShadow = "none";
            }}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            autoFocus
            required
            disabled={isSubmitting}
          />

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition disabled:opacity-50"
              style={{
                backgroundColor: colors.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              {isSubmitting ? "Starting..." : "Let's Go!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


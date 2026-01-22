"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Mission {
  id: number;
  icon: string;
  title: string;
  description: string;
  points: number;
}

const missions: Mission[] = [
  {
    id: 1,
    icon: "💬",
    title: "Kindness Connector",
    description: "Give a genuine compliment to 3 different friends or family members.",
    points: 15,
  },
  {
    id: 2,
    icon: "🤝",
    title: "Trust Builder",
    description: "Share something important with someone you trust and listen to their response.",
    points: 20,
  },
  {
    id: 3,
    icon: "🎯",
    title: "Boundary Setter",
    description: "Practice saying 'no' respectfully to something you don't want to do.",
    points: 15,
  },
  {
    id: 4,
    icon: "💝",
    title: "Empathy Explorer",
    description: "Try to understand how someone else feels in a situation and express your understanding.",
    points: 20,
  },
  {
    id: 5,
    icon: "⚖️",
    title: "Equality Champion",
    description: "Stand up for fairness by treating everyone with equal respect in a group activity.",
    points: 25,
  },
  {
    id: 6,
    icon: "🗣️",
    title: "Communication Master",
    description: "Have an open conversation where you both listen and share your thoughts clearly.",
    points: 20,
  },
  {
    id: 7,
    icon: "❤️",
    title: "Relationship Nurturer",
    description: "Do something thoughtful for someone important in your life without being asked.",
    points: 15,
  },
  {
    id: 8,
    icon: "🤗",
    title: "Support Giver",
    description: "Offer help or support to someone who might be going through a difficult time.",
    points: 20,
  },
  {
    id: 9,
    icon: "✨",
    title: "Honesty Hero",
    description: "Practice being honest about your feelings in a kind and respectful way.",
    points: 15,
  },
  {
    id: 10,
    icon: "🌱",
    title: "Connection Creator",
    description: "Make a new friend or strengthen an existing friendship through shared activities.",
    points: 25,
  },
];

export function SocialWellbeingPostSurvey(): React.JSX.Element {
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);

  const handleCompleteMission = (missionId: number, points: number): void => {
    if (completedMissions.has(missionId)) {
      // Already completed, do nothing or allow uncompleting
      return;
    }

    setCompletedMissions((prev) => {
      const newSet = new Set(prev);
      newSet.add(missionId);
      return newSet;
    });

    setTotalPoints((prev) => prev + points);
  };

  const completedCount = completedMissions.size;
  const totalMissions = missions.length;
  const progressPercentage = (completedCount / totalMissions) * 100;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          "linear-gradient(135deg, #FFE0F0 0%, #FFD1E8 25%, #FFC2E0 50%, #FFB3D8 75%, #FFA4D0 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-4 border-pink-300 inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <span className="text-4xl mr-3">🚀</span>
                <h1 className="text-4xl font-bold text-gray-800">
                  Active Missions
                </h1>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-4">
              Complete social wellbeing activities to earn points!
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedCount} of {totalMissions} completed</span>
              <span className="font-bold text-purple-600">Total: {totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          {missions.map((mission) => {
            const isCompleted = completedMissions.has(mission.id);
            return (
              <div
                key={mission.id}
                className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                  isCompleted
                    ? "border-green-300 opacity-75"
                    : "border-pink-200 hover:border-pink-300 hover:shadow-xl"
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left Side: Icon and Content */}
                  <div className="flex items-center flex-1">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mr-4 ${
                        isCompleted
                          ? "bg-green-100"
                          : "bg-gradient-to-br from-pink-100 to-purple-100"
                      }`}
                    >
                      {mission.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          isCompleted ? "text-gray-500 line-through" : "text-gray-800"
                        }`}
                      >
                        {mission.title}
                      </h3>
                      <p
                        className={`text-base ${
                          isCompleted ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Points and Button */}
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <span
                        className={`text-2xl font-bold ${
                          isCompleted ? "text-green-600" : "text-purple-600"
                        }`}
                      >
                        +{mission.points} pts
                      </span>
                    </div>
                    <button
                      onClick={() => handleCompleteMission(mission.id, mission.points)}
                      disabled={isCompleted}
                      className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105"
                      }`}
                    >
                      {isCompleted ? "✓ Completed" : "Complete Mission"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <Link
            href="/wellness"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ← Back to Wellness
          </Link>
        </div>

        {/* Completion Message */}
        {completedCount === totalMissions && (
          <div className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 text-center shadow-2xl border-4 border-green-300">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Congratulations!
            </h2>
            <p className="text-xl text-white mb-4">
              You've completed all missions and earned {totalPoints} points!
            </p>
            <p className="text-lg text-white/90">
              You're a Social Wellbeing Champion! 🌟
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

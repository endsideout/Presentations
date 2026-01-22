"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClient } from "../../lib/firebase";
import type { ConnectionStatus } from "../../lib/types/firebase";
import { WELLNESS_UNITS } from "../../wellness/constants";
import type { Quest } from "../../wellness/types";

// Default Social Wellbeing quests from SocialWellbeingPostSurvey
const DEFAULT_SOCIAL_WELLBEING_QUESTS: Omit<Quest, "id">[] = [
  { title: 'Kindness Connector', description: 'Give a genuine compliment to 3 different friends or family members.', dimension: 'w1', points: 15, icon: '💬' },
  { title: 'Trust Builder', description: 'Share something important with someone you trust and listen to their response.', dimension: 'w1', points: 20, icon: '🤝' },
  { title: 'Boundary Setter', description: 'Practice saying \'no\' respectfully to something you don\'t want to do.', dimension: 'w1', points: 15, icon: '🎯' },
  { title: 'Empathy Explorer', description: 'Try to understand how someone else feels in a situation and express your understanding.', dimension: 'w1', points: 20, icon: '💝' },
  { title: 'Equality Champion', description: 'Stand up for fairness by treating everyone with equal respect in a group activity.', dimension: 'w1', points: 25, icon: '⚖️' },
  { title: 'Communication Master', description: 'Have an open conversation where you both listen and share your thoughts clearly.', dimension: 'w1', points: 20, icon: '🗣️' },
  { title: 'Relationship Nurturer', description: 'Do something thoughtful for someone important in your life without being asked.', dimension: 'w1', points: 15, icon: '❤️' },
  { title: 'Support Giver', description: 'Offer help or support to someone who might be going through a difficult time.', dimension: 'w1', points: 20, icon: '🤗' },
  { title: 'Honesty Hero', description: 'Practice being honest about your feelings in a kind and respectful way.', dimension: 'w1', points: 15, icon: '✨' },
  { title: 'Connection Creator', description: 'Make a new friend or strengthen an existing friendship through shared activities.', dimension: 'w1', points: 25, icon: '🌱' },
];

interface QuestWithId extends Quest {
  firebaseId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Connection status badge
 */
function ConnectionStatusBadge({
  status,
  error,
  onRetry,
}: {
  status: ConnectionStatus;
  error: string | null;
  onRetry?: () => void;
}) {
  const config = {
    connecting: {
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
      dotClass: "bg-blue-500",
      label: "Connecting...",
      animate: true,
    },
    connected: {
      bgClass: "bg-green-100",
      textClass: "text-green-700",
      dotClass: "bg-green-500",
      label: "Real-time Active",
      animate: false,
    },
    error: {
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      dotClass: "bg-red-500",
      label: "Connection Error",
      animate: false,
    },
    disconnected: {
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-700",
      dotClass: "bg-yellow-500",
      label: "Offline / Demo Mode",
      animate: false,
    },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.bgClass} ${config.textClass}`}
        title={error || undefined}
      >
        <div
          className={`h-2 w-2 rounded-full ${config.dotClass} ${
            config.animate ? "animate-pulse" : ""
          }`}
        />
        {config.label}
      </div>
      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-300 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Quest Form Modal
 */
function QuestFormModal({
  isOpen,
  onClose,
  onSave,
  quest,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quest: Omit<Quest, "id">) => Promise<void>;
  quest?: QuestWithId;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dimension, setDimension] = useState("w1");
  const [points, setPoints] = useState(15);
  const [icon, setIcon] = useState("💬");

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description);
      setDimension(quest.dimension);
      setPoints(quest.points);
      setIcon(quest.icon);
    } else {
      setTitle("");
      setDescription("");
      setDimension("w1");
      setPoints(15);
      setIcon("💬");
    }
  }, [quest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ title, description, dimension, points, icon });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-slate-800 mb-6">
          {quest ? "Edit Quest" : "Create New Quest"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-2xl text-center outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="💬"
              maxLength={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Quest Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Kindness Connector"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 min-h-[100px]"
              placeholder="Give a genuine compliment to 3 different friends today."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Wellness Dimension
              </label>
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
                required
              >
                {WELLNESS_UNITS.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.icon} {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border-2 border-gray-200 p-3 outline-none transition focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : quest ? "Update Quest" : "Create Quest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Main Quest Manager Component
 */
export function WellnessQuestManager() {
  const [quests, setQuests] = useState<QuestWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<QuestWithId | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const setupListener = useCallback(() => {
    const firebase = getFirebaseClient();

    if (!firebase) {
      setConnectionStatus("disconnected");
      setConnectionError("Firebase not configured");
      setLoading(false);
      return undefined;
    }

    setConnectionStatus("connecting");
    setConnectionError(null);

    const unsubscribe: Unsubscribe = onSnapshot(
      collection(firebase.db, "wellness_quests"),
      (querySnapshot) => {
        setConnectionStatus("connected");
        setConnectionError(null);

        const data: QuestWithId[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            id: docData.id || parseInt(doc.id),
            title: docData.title,
            description: docData.description,
            dimension: docData.dimension,
            points: docData.points,
            icon: docData.icon,
            firebaseId: doc.id,
            createdAt: docData.createdAt,
            updatedAt: docData.updatedAt,
          });
        });

        // Sort by ID
        data.sort((a, b) => a.id - b.id);
        setQuests(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to quests:", error);
        setConnectionStatus("error");
        
        // Provide more specific error messages
        let errorMessage = "Failed to connect to database";
        if (error.code === "permission-denied") {
          errorMessage = "Permission denied. Please check Firestore security rules allow reading from 'wellness_quests' collection.";
        } else if (error.code === "unavailable") {
          errorMessage = "Firebase service is temporarily unavailable. Please try again later.";
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setConnectionError(errorMessage);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = setupListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setupListener]);

  const handleRetry = () => {
    setLoading(true);
    setupListener();
  };

  const handleSave = async (questData: Omit<Quest, "id">) => {
    const firebase = getFirebaseClient();
    if (!firebase) {
      alert("Firebase not configured. Cannot save quest.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingQuest?.firebaseId) {
        // Update existing quest
        const questRef = doc(firebase.db, "wellness_quests", editingQuest.firebaseId);
        await updateDoc(questRef, {
          ...questData,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create new quest - generate ID based on highest existing ID
        const maxId = quests.length > 0 ? Math.max(...quests.map((q) => q.id)) : 100;
        const newId = maxId + 1;

        await addDoc(collection(firebase.db, "wellness_quests"), {
          id: newId,
          ...questData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      setShowForm(false);
      setEditingQuest(undefined);
    } catch (error) {
      console.error("Failed to save quest:", error);
      alert("Failed to save quest. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (quest: QuestWithId) => {
    if (!quest.firebaseId) return;

    if (!confirm(`Are you sure you want to delete "${quest.title}"?`)) {
      return;
    }

    const firebase = getFirebaseClient();
    if (!firebase) {
      alert("Firebase not configured. Cannot delete quest.");
      return;
    }

    try {
      await deleteDoc(doc(firebase.db, "wellness_quests", quest.firebaseId));
    } catch (error) {
      console.error("Failed to delete quest:", error);
      alert("Failed to delete quest. Please try again.");
    }
  };

  const handleSeedSocialWellbeing = async () => {
    if (!confirm("This will add 10 default Social Wellbeing quests. Continue?")) {
      return;
    }

    const firebase = getFirebaseClient();
    if (!firebase) {
      alert("Firebase not configured. Cannot seed quests.");
      return;
    }

    setIsSeeding(true);
    try {
      // Get the highest existing ID
      const maxId = quests.length > 0 ? Math.max(...quests.map((q) => q.id)) : 100;
      let nextId = maxId + 1;

      // Check which quests already exist (by title and dimension)
      const existingTitles = new Set(quests.filter(q => q.dimension === 'w1').map(q => q.title));

      for (const questData of DEFAULT_SOCIAL_WELLBEING_QUESTS) {
        // Skip if already exists
        if (existingTitles.has(questData.title)) {
          continue;
        }

        await addDoc(collection(firebase.db, "wellness_quests"), {
          id: nextId++,
          ...questData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      alert("Social Wellbeing quests added successfully!");
    } catch (error) {
      console.error("Failed to seed quests:", error);
      alert("Failed to seed quests. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleEdit = (quest: QuestWithId) => {
    setEditingQuest(quest);
    setShowForm(true);
  };

  const handleNewQuest = () => {
    setEditingQuest(undefined);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Wellness Quest Manager 🎯
            </h1>
            <p className="text-slate-500">
              Create and manage wellness quests for students.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatusBadge
              status={connectionStatus}
              error={connectionError}
              onRetry={handleRetry}
            />
            <button
              onClick={handleSeedSocialWellbeing}
              disabled={isSeeding}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 font-bold text-white shadow-lg transition hover:from-pink-600 hover:to-rose-700 disabled:opacity-50"
              title="Add default Social Wellbeing quests"
            >
              {isSeeding ? "Adding..." : "🌱 Seed Social Wellbeing"}
            </button>
            <button
              onClick={handleNewQuest}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700"
            >
              + New Quest
            </button>
          </div>
        </header>

        {/* Error banner */}
        {connectionError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <strong>Connection Error:</strong> {connectionError}
            <span className="ml-2 text-red-500">Data shown may be stale.</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-12 text-center text-slate-400">
                No quests yet. Create your first quest!
              </div>
            ) : (
              quests.map((quest) => {
                const unit = WELLNESS_UNITS.find((u) => u.id === quest.dimension);
                return (
                  <div
                    key={quest.firebaseId || quest.id}
                    className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{quest.icon}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(quest)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quest)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2">
                      {quest.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 min-h-[60px]">
                      {quest.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{unit?.icon || "📌"}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {unit?.name || quest.dimension}
                        </span>
                      </div>
                      <div className="text-lg font-black text-indigo-600">
                        +{quest.points} pts
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quest Form Modal */}
      <QuestFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingQuest(undefined);
        }}
        onSave={handleSave}
        quest={editingQuest}
        isSaving={isSaving}
      />
    </div>
  );
}

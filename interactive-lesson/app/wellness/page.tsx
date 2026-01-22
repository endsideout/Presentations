"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { WELLNESS_UNITS, WELLNESS_QUESTS, ALL_BADGES, INITIAL_LEADERBOARD } from './constants';
import { UserData, UserDimensionState } from './types';
import StatsCard from './components/StatsCard';
import UnitCard from './components/UnitCard';
import { getHealthEncouragement } from './services/geminiService';
import { useWellnessSync } from './hooks/useWellnessSync';
import { useWellnessQuests } from './hooks/useWellnessQuests';
import { WellnessLoginModal } from './components/WellnessLoginModal';

const WELLNESS_STORAGE_KEYS = {
  NAME: "wellness_student_name",
  EMAIL: "wellness_student_email",
  DATA: "wellness_user_data",
} as const;

// Load initial data from localStorage
function loadWellnessData(): { name: string; email: string; data: UserData | null } {
  if (typeof window === "undefined") {
    return { name: "", email: "", data: null };
  }

  try {
    const name = localStorage.getItem(WELLNESS_STORAGE_KEYS.NAME) || "";
    const email = localStorage.getItem(WELLNESS_STORAGE_KEYS.EMAIL) || "";
    const dataStr = localStorage.getItem(WELLNESS_STORAGE_KEYS.DATA);
    const data = dataStr ? JSON.parse(dataStr) : null;
    
    return { name, email, data };
  } catch {
    return { name: "", email: "", data: null };
  }
}

export default function WellnessPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userData, setUserData] = useState<UserData>(() => {
    const dims: Record<string, UserDimensionState> = {};
    WELLNESS_UNITS.forEach(u => dims[u.id] = { progress: 0, points: 0 });
    
    // Try to load from localStorage
    const stored = loadWellnessData();
    if (stored.name && stored.email) {
      return stored.data || {
        name: stored.name,
        totalPoints: 0,
        dimensions: dims,
        completedQuests: [],
        earnedBadgeIndices: [],
        streakDays: 0
      };
    }
    
    return {
      name: 'Super Student',
      totalPoints: 0,
      dimensions: dims,
      completedQuests: [],
      earnedBadgeIndices: [],
      streakDays: 0 
    };
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const stored = loadWellnessData();
    if (stored.name && stored.email) {
      setStudentName(stored.name);
      setStudentEmail(stored.email);
      setIsLoggedIn(true);
      if (stored.data) {
        setUserData(stored.data);
      }
    } else {
      setShowLogin(true);
    }
  }, []);

  const [hasIncremenetedStreakToday, setHasIncrementedStreakToday] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("Ready to explore your wellness? 🚀");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const currentUnits = WELLNESS_UNITS;
  const { quests: currentQuests, loading: questsLoading } = useWellnessQuests();
  
  // Filter quests by selected unit dimension
  const filteredQuests = selectedUnit 
    ? currentQuests.filter(q => q.dimension === selectedUnit)
    : [];

  const handleQuestToggle = useCallback(async (questId: number) => {
    const quest = currentQuests.find(q => q.id === questId);
    if (!quest) return;

    const isCompleting = !userData.completedQuests.includes(questId);

    setUserData(prev => {
      const newCompleted = isCompleting 
        ? [...prev.completedQuests, questId]
        : prev.completedQuests.filter(id => id !== questId);
      
      const pointsDiff = isCompleting ? quest.points : -quest.points;
      const progressDiff = isCompleting ? 20 : -20;

      const newDimensions = { ...prev.dimensions };
      const dim = newDimensions[quest.dimension] || { progress: 0, points: 0 };
      newDimensions[quest.dimension] = {
        points: Math.max(0, dim.points + pointsDiff),
        progress: Math.min(100, Math.max(0, dim.progress + progressDiff))
      };

      const newEarnedBadges = [...prev.earnedBadgeIndices];
      ALL_BADGES.forEach((badge, idx) => {
        if (!newEarnedBadges.includes(idx) && newDimensions[badge.dimension]?.progress >= 20) {
          newEarnedBadges.push(idx);
        }
      });

      let newStreak = prev.streakDays;
      if (isCompleting && !hasIncremenetedStreakToday) {
        newStreak += 1;
        setHasIncrementedStreakToday(true);
      }

      return {
        ...prev,
        totalPoints: Math.max(0, prev.totalPoints + pointsDiff),
        completedQuests: newCompleted,
        dimensions: newDimensions,
        earnedBadgeIndices: newEarnedBadges,
        streakDays: newStreak
      };
    });

    if (isCompleting) {
      setIsAiLoading(true);
      const nameToUse = studentName || userData.name;
      const msg = await getHealthEncouragement(nameToUse, quest.title);
      setAiMessage(msg);
      setIsAiLoading(false);
    }
  }, [userData.completedQuests, userData.dimensions, studentName, userData.name, hasIncremenetedStreakToday, currentQuests]);

  const avgCompletion = useMemo(() => {
    const relevantDims = currentUnits.map(u => userData.dimensions[u.id]?.progress || 0);
    return Math.round(relevantDims.reduce((a, b) => a + b, 0) / currentUnits.length);
  }, [userData.dimensions, currentUnits]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn && studentName && studentEmail) {
      try {
        localStorage.setItem(WELLNESS_STORAGE_KEYS.NAME, studentName);
        localStorage.setItem(WELLNESS_STORAGE_KEYS.EMAIL, studentEmail);
        localStorage.setItem(WELLNESS_STORAGE_KEYS.DATA, JSON.stringify({
          ...userData,
          name: studentName,
        }));
      } catch (e) {
        console.warn("Failed to save wellness data to localStorage:", e);
      }
    }
  }, [userData, isLoggedIn, studentName, studentEmail]);

  // Handle login
  const handleLogin = async (name: string, email: string) => {
    setIsSubmitting(true);
    try {
      setStudentName(name);
      setStudentEmail(email);
      setIsLoggedIn(true);
      setShowLogin(false);
      
      // Update userData with the name
      setUserData(prev => ({
        ...prev,
        name: name,
      }));

      // Save to localStorage
      localStorage.setItem(WELLNESS_STORAGE_KEYS.NAME, name);
      localStorage.setItem(WELLNESS_STORAGE_KEYS.EMAIL, email);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem(WELLNESS_STORAGE_KEYS.NAME);
    localStorage.removeItem(WELLNESS_STORAGE_KEYS.EMAIL);
    localStorage.removeItem(WELLNESS_STORAGE_KEYS.DATA);
    setStudentName("");
    setStudentEmail("");
    setIsLoggedIn(false);
    setShowLogin(true);
    
    // Reset user data
    const dims: Record<string, UserDimensionState> = {};
    WELLNESS_UNITS.forEach(u => dims[u.id] = { progress: 0, points: 0 });
    setUserData({
      name: 'Super Student',
      totalPoints: 0,
      dimensions: dims,
      completedQuests: [],
      earnedBadgeIndices: [],
      streakDays: 0
    });
  };

  // Sync wellness data to Firebase (using wellness email, not lesson email)
  // We'll update the hook to accept email as parameter
  useWellnessSync(userData, studentEmail);

  return (
    <div className="min-h-screen pb-20 max-w-5xl mx-auto px-4 sm:px-6 bg-white font-[family-name:var(--font-geist-sans)]">
      {/* Login Modal */}
      <WellnessLoginModal
        isOpen={showLogin}
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
      />

      {/* Header */}
      <header className="pt-8 pb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-4xl sm:text-5xl font-black drop-shadow-sm flex items-center gap-2 text-indigo-600">
              <span className="floating inline-block">🪐</span> 
              3D Wellness Dimension
            </h1>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
          <p className="text-slate-500 font-bold text-lg">
            Master your mind, money, and world!
          </p>
          {isLoggedIn && studentEmail && (
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: {studentEmail}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-3xl p-2 pl-6 pr-6 flex items-center gap-4 shadow-xl border-b-4 border-slate-100">
           <div className="text-right">
             <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Total XP</div>
             <div className="text-2xl font-black text-indigo-600">{userData.totalPoints}</div>
           </div>
           <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white shadow-lg bg-indigo-500">
             ✨
           </div>
        </div>
      </header>

      {/* Profile & AI Buddy */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-white to-indigo-50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex items-center gap-6 border-2 border-white">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex-shrink-0 flex items-center justify-center text-5xl sm:text-6xl border-4 border-white shadow-lg overflow-hidden bg-indigo-200">
             <img src="https://picsum.photos/200?random=2" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Hey {studentName || userData.name}!
            </h2>
            <div className={`p-4 rounded-2xl ${isAiLoading ? 'bg-slate-100' : 'bg-white'} shadow-inner border border-slate-100 relative min-h-[80px]`}>
              {isAiLoading ? (
                <div className="flex gap-2 p-2">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-400"></div>
                  <div className="w-2 h-2 rounded-full animate-bounce delay-75 bg-indigo-400"></div>
                  <div className="w-2 h-2 rounded-full animate-bounce delay-150 bg-indigo-400"></div>
                </div>
              ) : (
                <p className="text-slate-700 font-bold leading-relaxed">"{aiMessage}"</p>
              )}
              <div className="text-[10px] font-black mt-2 uppercase tracking-widest text-indigo-500">— Sparky, Your AI Buddy</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-center items-center text-white text-center transform rotate-1 bg-purple-500 shadow-purple-200">
          <div className="text-6xl mb-2">💫</div>
          <div className="text-4xl font-black mb-1">{userData.streakDays}</div>
          <div className="text-sm font-black uppercase tracking-tighter opacity-90">Day Streak!</div>
          {hasIncremenetedStreakToday && (
            <div className="mt-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Daily Goal Met! ✅
            </div>
          )}
        </div>
      </section>

      {/* Stats Summary */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Quests" value={userData.completedQuests.length} icon="⚡" color="bg-indigo-100 text-indigo-500" />
          <StatsCard label="Badges" value={userData.earnedBadgeIndices.length} icon="🏆" color="bg-purple-100 text-purple-500" />
          <StatsCard label="Progress" value={`${avgCompletion}%`} icon="📊" color="bg-blue-100 text-blue-500" />
          <StatsCard label="Rank" value={userData.totalPoints > 50 ? 'Explorer' : 'Newbie'} icon="💎" color="bg-rose-100 text-rose-500" />
        </div>
      </section>

      {/* Program Content */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg text-white bg-indigo-600">
            🌀
          </div>
          <h2 className="text-3xl font-black text-slate-800">
            Wellness Units
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUnits.map(unit => (
            <div 
              key={unit.id}
              onClick={() => setSelectedUnit(unit.id)}
              className="cursor-pointer"
            >
              <UnitCard 
                unit={unit} 
                progress={userData.dimensions[unit.id]?.progress || 0} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* Unit Quests Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelectedUnit(null)}>
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const unit = currentUnits.find(u => u.id === selectedUnit);
                    return (
                      <>
                        <div className="text-5xl">{unit?.icon}</div>
                        <div>
                          <h2 className="text-3xl font-black">{unit?.name}</h2>
                          <p className="text-indigo-100 text-sm font-medium">{unit?.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {questsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                  <span className="ml-3 text-slate-500">Loading quests...</span>
                </div>
              ) : filteredQuests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-semibold">No quests available for this dimension yet.</p>
                  <p className="text-sm mt-2">Check back later or ask your teacher to add some quests!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuests.map(quest => {
                    const isDone = userData.completedQuests.includes(quest.id);
                    return (
                      <div 
                        key={quest.id}
                        className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl transition-all border-2 ${
                          isDone 
                            ? 'bg-slate-50 border-slate-200 scale-[0.98] opacity-60' 
                            : 'bg-white border-slate-100 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-md ${
                          isDone ? 'bg-slate-200' : 'bg-pink-50 text-pink-500'
                        }`}>
                          {quest.icon}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className={`text-xl font-black ${isDone ? 'line-through' : 'text-slate-800'}`}>
                            {quest.title}
                          </h3>
                          <p className="text-slate-500 font-bold text-sm mb-1">{quest.description}</p>
                        </div>
                        <div className="flex flex-col items-center sm:items-end gap-2">
                          <div className="font-black text-lg text-indigo-600">+{quest.points} pts</div>
                          <button 
                            onClick={() => {
                              handleQuestToggle(quest.id);
                            }}
                            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                              isDone 
                                ? 'bg-slate-100 text-slate-400' 
                                : 'bg-pink-500 text-white hover:bg-pink-600'
                            }`}
                          >
                            {isDone ? '✓ Done' : 'Start Quest'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quests */}
      <section className="mb-16">
        <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg text-white bg-pink-500">
              🚀
            </div>
            <h2 className="text-3xl font-black text-slate-800">Active Missions</h2>
          </div>
          
          <div className="space-y-4">
            {questsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <span className="ml-3 text-slate-500">Loading quests...</span>
              </div>
            ) : currentQuests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No quests available. Please check back later.
              </div>
            ) : (
              currentQuests.map(quest => {
              const isDone = userData.completedQuests.includes(quest.id);
              return (
                <div 
                  key={quest.id}
                  className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl transition-all border-2 ${
                    isDone 
                      ? 'bg-slate-50 border-slate-200 scale-[0.98] opacity-60' 
                      : 'bg-white border-slate-100 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-md ${
                    isDone ? 'bg-slate-200' : 'bg-pink-50 text-pink-500'
                  }`}>
                    {quest.icon}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className={`text-xl font-black ${isDone ? 'line-through' : 'text-slate-800'}`}>
                      {quest.title}
                    </h3>
                    <p className="text-slate-500 font-bold text-sm mb-1">{quest.description}</p>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <div className="font-black text-lg text-indigo-600">+{quest.points} pts</div>
                    <button 
                      onClick={() => handleQuestToggle(quest.id)}
                      className={`px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                        isDone 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-pink-500 text-white hover:bg-pink-600'
                      }`}
                    >
                      {isDone ? '✓ Done' : 'Start Quest'}
                    </button>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section>
        <div className="rounded-[3rem] p-10 shadow-2xl text-white bg-indigo-950">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-pulse">🍕</div>
              <div>
                <h2 className="text-3xl font-black">Class Pizza Race!</h2>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Global Standings</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {INITIAL_LEADERBOARD.map((item, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-6 p-5 rounded-3xl transition-all ${
                  item.isUser 
                    ? 'bg-white/10 ring-4 ring-rose-500/50 scale-[1.02]' 
                    : 'bg-black/20'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center font-black text-slate-400">
                  {idx + 1}
                </div>
                <div className="text-3xl flex-shrink-0">{['🥇', '🥈', '🥉'][idx] || '✨'}</div>
                <div className="flex-1">
                  <h4 className={`text-xl font-black ${item.isUser ? 'text-rose-400' : 'text-white'}`}>
                    {item.name}
                  </h4>
                  <div className="w-full h-2 bg-black/40 rounded-full mt-2 overflow-hidden">
                     <div 
                       className={`h-full transition-all duration-1000 ${item.isUser ? 'bg-rose-500' : 'bg-slate-500'}`} 
                       style={{ width: `${item.points}%` }}
                     ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black">{item.points}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

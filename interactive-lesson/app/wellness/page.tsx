"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { WELLNESS_UNITS, WELLNESS_QUESTS, ALL_BADGES, INITIAL_LEADERBOARD } from './constants';
import { UserData, UserDimensionState } from './types';
import StatsCard from './components/StatsCard';
import UnitCard from './components/UnitCard';
import { getHealthEncouragement } from './services/geminiService';

export default function WellnessPage() {
  const [userData, setUserData] = useState<UserData>(() => {
    const dims: Record<string, UserDimensionState> = {};
    WELLNESS_UNITS.forEach(u => dims[u.id] = { progress: 0, points: 0 });
    return {
      name: 'Super Student',
      totalPoints: 0,
      dimensions: dims,
      completedQuests: [],
      earnedBadgeIndices: [],
      streakDays: 3 
    };
  });

  const [hasIncremenetedStreakToday, setHasIncrementedStreakToday] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("Ready to explore your wellness? 🚀");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentUnits = WELLNESS_UNITS;
  const currentQuests = WELLNESS_QUESTS;

  const handleQuestToggle = useCallback(async (questId: number) => {
    const quest = WELLNESS_QUESTS.find(q => q.id === questId);
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
      const msg = await getHealthEncouragement(userData.name, quest.title);
      setAiMessage(msg);
      setIsAiLoading(false);
    }
  }, [userData.completedQuests, userData.dimensions, userData.name, hasIncremenetedStreakToday]);

  const avgCompletion = useMemo(() => {
    const relevantDims = currentUnits.map(u => userData.dimensions[u.id]?.progress || 0);
    return Math.round(relevantDims.reduce((a, b) => a + b, 0) / currentUnits.length);
  }, [userData.dimensions, currentUnits]);

  return (
    <div className="min-h-screen pb-20 max-w-5xl mx-auto px-4 sm:px-6 bg-white font-[family-name:var(--font-geist-sans)]">
      
      {/* Header */}
      <header className="pt-8 pb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-black mb-2 drop-shadow-sm flex items-center justify-center md:justify-start gap-2 text-indigo-600">
            <span className="floating inline-block">🪐</span> 
            3D Wellness Dimension
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            Master your mind, money, and world!
          </p>
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Hey {userData.name}!</h2>
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
            <UnitCard 
              key={unit.id} 
              unit={unit} 
              progress={userData.dimensions[unit.id]?.progress || 0} 
            />
          ))}
        </div>
      </section>

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
            {currentQuests.map(quest => {
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
            })}
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

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Heading, Subheading } from "./components/Typography";

import { AVAILABLE_MODULES } from "./constants/modules";
import { LessonProvider, useLesson } from "./context/LessonContext";
import { LoginModal } from "./components/LoginModal";
import { useRouter } from "next/navigation";

function ModuleGrid() {
    const { allProgress, studentEmail, setStudentEmail, logout } = useLesson();
    const router = useRouter();
    
    // Login State
    const [showLogin, setShowLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);

    const handleLogin = async (email: string) => {
        setIsSubmitting(true);
        try {
            await setStudentEmail(email);
            setShowLogin(false);
            if (pendingPath) {
                router.push(pendingPath);
                setPendingPath(null);
            }
        } catch (e) {
            console.error("Login failed", e);
            setShowLogin(false);
            if (pendingPath) {
                router.push(pendingPath); // allow fallthrough
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModuleClick = (e: React.MouseEvent, path: string) => {
        if (!studentEmail) {
            e.preventDefault();
            setPendingPath(path);
            setShowLogin(true);
        }
        // If logged in, let Link handle navigation
    };

    return (
        <div className="flex flex-col">
            {studentEmail && (
                <div className="flex justify-end mb-8 items-center gap-4">
                     <span className="text-slate-600 font-medium">
                        Welcome, {studentEmail}
                     </span>
                     <button 
                        onClick={logout}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                     >
                        Sign Out
                     </button>
                </div>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
            {AVAILABLE_MODULES.map((module) => {
                const modProgress = allProgress[module.id];
                const completedCount = modProgress?.completedSlides?.length || 0;
                const currentSlide = modProgress?.currentSlide || 2; 
                const hasStarted = !!modProgress;
                
                const totalActivities = 5; 
                const percent = Math.min(100, Math.round((completedCount / totalActivities) * 100));
                const isCompleted = completedCount >= totalActivities;
                
                const resumeLink = hasStarted 
                    ? `${module.path}/slide/${currentSlide}`
                    : `${module.path}/slide/2`;

                return (
                <Link
                key={module.id}
                href={module.path}
                onClick={(e) => handleModuleClick(e, module.path)}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 overflow-hidden flex flex-col"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-4xl">{module.label.split(" ").pop()}</div>
                        {hasStarted && (
                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                {isCompleted ? "Completed" : `${percent}%`}
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {module.label.replace(module.label.split(" ").pop() || "", "")}
                    </h2>
                    <p className="text-slate-500 leading-relaxed mb-8">
                    {module.description}
                    </p>
                </div>
                
                <div className="relative z-10 mt-auto">
                    {hasStarted && (
                        <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    )}
                
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    {isCompleted ? "Review Module" : (hasStarted ? "Resume Lesson" : "Start Lesson")}
                    <svg
                        className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </svg>
                    </div>
                </div>
                </Link>
            )})}
            
            {/* 3D Wellness Tracker */}
            <Link href="/wellness" className="cursor-pointer group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🪐</div>
                    <h2 className="text-2xl font-bold text-slate-800 break-words">
                        3D Wellness Tracker
                    </h2>
                </div>
            </Link>
            
            {/* Teacher Dashboard Link */}
                <Link
                href="/teacher"
                className="group relative bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-700 overflow-hidden md:col-span-2 lg:col-span-1"
                >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="text-4xl mb-6">🍎</div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                        Teacher Dashboard
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-8">
                        View student progress, track activity, and manage your class.
                        </p>
                    </div>
                    
                    <div className="flex items-center text-blue-300 font-semibold group-hover:gap-2 transition-all">
                    Go to Dashboard
                    <svg
                        className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </svg>
                    </div>
                </div>
                </Link>
            </div>
            
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onSubmit={handleLogin}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block animate-bounce text-6xl mb-4">📚</div>
          <Heading className="text-5xl md:text-6xl text-slate-900 tracking-tight">
            Learning Modules
          </Heading>
          <Subheading className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select a module to begin your learning journey. interactive lessons designed to make learning fun and engaging.
          </Subheading>
        </div>

        <Suspense fallback={null}>
          <LessonProvider>
              <ModuleGrid />
          </LessonProvider>
        </Suspense>
      </main>
    </div>
  );
}

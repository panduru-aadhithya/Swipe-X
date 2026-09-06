import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  Lock, 
  Clock, 
  FileText, 
  Mic, 
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { getGamificationState, addXp } from '../api/mockInterviewService';
import { Link } from 'react-router-dom';

export const GrowthJourneyPage: React.FC = () => {
  const [gamification, setGamification] = useState(getGamificationState());

  const progressPercent = Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100));

  const milestones = [
    {
      level: 1,
      title: 'Aspiring Candidate',
      xpRequired: 0,
      reward: 'Unlocked AI Resume Analyzer',
      unlocked: true
    },
    {
      level: 2,
      title: 'Verified Candidate',
      xpRequired: 500,
      reward: 'Unlocked 1-Click Fast Track Apply',
      unlocked: true
    },
    {
      level: 3,
      title: 'Market Match Specialist',
      xpRequired: 1200,
      reward: 'Unlocked Early Applicant Radar (<24h)',
      unlocked: true
    },
    {
      level: 4,
      title: 'Senior Candidate',
      xpRequired: 1850,
      reward: 'Unlocked Real-Time Voice Mock Interview Simulator',
      unlocked: true
    },
    {
      level: 5,
      title: 'Principal Candidate',
      xpRequired: 2500,
      reward: 'Direct Recruiter Fast-Lane Priority Match',
      unlocked: false
    },
    {
      level: 6,
      title: 'Staff Lead Candidate',
      xpRequired: 3500,
      reward: 'Exclusive High-Compensation Executive Postings',
      unlocked: false
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Bento Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Flame className="w-3.5 h-3.5 fill-amber-400" /> {gamification.streakDays}-Day Active Preparation Streak
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
              Growth Journey & Level Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Track your career readiness index, earn experience points from mock interviews and tailored applications, and unlock recruiter fast-track benefits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block font-sans">Current Level</span>
              <span className="text-2xl font-black text-white font-serif">Level {gamification.level}</span>
              <span className="text-[10px] text-slate-400 block">{gamification.levelTitle}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-amber-300 block font-sans">Market Readiness</span>
              <span className="text-2xl font-black text-amber-400 font-serif">{gamification.marketReadinessIndex}%</span>
              <span className="text-[10px] text-emerald-400 block">Top 5% Tier</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" /> {gamification.xp} XP Earned
            </span>
            <span className="text-slate-400">
              {gamification.nextLevelXp - gamification.xp} XP needed to Level {gamification.level + 1}
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Core Pillars of Growth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase font-serif">
            <span>Swipe X Mock Simulations</span>
            <Mic className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              {gamification.mockInterviewsCompleted}
            </span>
            <span className="text-xs font-bold text-purple-600">Simulations</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">+150 XP per completed session</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase font-serif">
            <span>ATS Resume Scans</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              {gamification.resumesScanned}
            </span>
            <span className="text-xs font-bold text-indigo-600">Scanned</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">+100 XP per tailored match</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase font-serif">
            <span>Fast-Track Applied</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              {gamification.rolesApplied}
            </span>
            <span className="text-xs font-bold text-emerald-600">Sent</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">+50 XP per verified application</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase font-serif">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              {gamification.streakDays}
            </span>
            <span className="text-xs font-bold text-amber-600">Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily preparation multiplier</p>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
          Achievements & Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gamification.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                  {badge.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Unlocked {badge.unlockedAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Progression Roadmap */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
          Level Progression Roadmap
        </h2>

        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.level}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                m.unlocked
                  ? 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-serif font-bold text-sm ${
                  m.unlocked
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  L{m.level}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                    <span>{m.title}</span>
                    {m.unlocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {m.reward}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                  {m.xpRequired} XP
                </span>
                <span className="text-[10px] text-slate-400">
                  {m.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

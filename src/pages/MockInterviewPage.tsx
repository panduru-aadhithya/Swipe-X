import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  Award, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Play, 
  Lightbulb, 
  Layers, 
  Zap, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Star,
  RotateCcw
} from 'lucide-react';
import { MockInterviewModal } from '../components/MockInterviewModal';
import { MockInterviewSession } from '../types';
import { getGamificationState } from '../api/mockInterviewService';

export const MockInterviewPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    roleTitle: string;
    companyName: string;
    category?: string;
  }>({
    isOpen: false,
    roleTitle: 'Senior Full Stack Engineer',
    companyName: 'Tech Innovations Inc'
  });

  const [gamification, setGamification] = useState(getGamificationState());
  const [completedSessions, setCompletedSessions] = useState<MockInterviewSession[]>([
    {
      id: 's1',
      roleTitle: 'Lead Frontend Architect',
      companyName: 'Stripe Ecosystem',
      category: 'SYSTEM_DESIGN',
      questions: [],
      currentQuestionIndex: 3,
      overallScore: 92,
      clarityScore: 94,
      depthScore: 90,
      impactScore: 92,
      xpEarned: 196,
      status: 'COMPLETED',
      completedAt: 'Yesterday'
    },
    {
      id: 's2',
      roleTitle: 'AI / ML Engineer',
      companyName: 'Anthropic Partner Lab',
      category: 'TECHNICAL',
      questions: [],
      currentQuestionIndex: 3,
      overallScore: 88,
      clarityScore: 86,
      depthScore: 92,
      impactScore: 86,
      xpEarned: 194,
      status: 'COMPLETED',
      completedAt: '3 days ago'
    }
  ]);

  const interviewTracks = [
    {
      id: 'fullstack',
      title: 'Senior Full Stack & Distributed Systems',
      company: 'High-Scale Tech Unicorns',
      category: 'Full Stack',
      difficulty: 'Hard',
      questionCount: 3,
      estimatedTime: '8-12 min',
      xpReward: '+200 XP',
      topics: ['Microservices', 'React 19 Concurrent UI', 'Idempotency', 'Redis Caching'],
      gradient: 'from-indigo-600 to-blue-600'
    },
    {
      id: 'aiml',
      title: 'AI / LLM Application Engineer',
      company: 'Modern GenAI Startups',
      category: 'GenAI & ML',
      difficulty: 'Hard',
      questionCount: 3,
      estimatedTime: '10-15 min',
      xpReward: '+220 XP',
      topics: ['RAG Pipeline Latency', 'Vector Embeddings', 'Model Fallbacks', 'Token Optimization'],
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'star',
      title: 'Executive Behavioral & STAR Leadership',
      company: 'Top Tier Enterprises & MNCs',
      category: 'Behavioral',
      difficulty: 'Medium',
      questionCount: 3,
      estimatedTime: '6-10 min',
      xpReward: '+180 XP',
      topics: ['Conflict Resolution', 'Cross-Functional Roadmaps', 'Incident Triage', 'Stakeholder Alignment'],
      gradient: 'from-amber-600 to-orange-600'
    },
    {
      id: 'frontend',
      title: 'Senior Frontend & Performance Specialist',
      company: 'Design-Driven Product Companies',
      category: 'UI/UX & React',
      difficulty: 'Medium',
      questionCount: 3,
      estimatedTime: '8-10 min',
      xpReward: '+190 XP',
      topics: ['Web Vitals (INP/LCP)', 'Virtualization', 'State Colocation', 'Design Systems'],
      gradient: 'from-emerald-600 to-teal-600'
    }
  ];

  const handleStartTrack = (roleTitle: string, companyName: string, category?: string) => {
    setActiveModal({
      isOpen: true,
      roleTitle,
      companyName,
      category
    });
  };

  const handleSessionFinished = (session: MockInterviewSession) => {
    setCompletedSessions((prev) => [session, ...prev]);
    setGamification(getGamificationState());
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Swipe X — AI Career Co-Pilot</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
              Swipe X — Interview Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Simulate role-specific interview dialogue, practice voice/text answers, and receive instant evaluation on clarity, technical depth, and STAR framework effectiveness.
            </p>
          </div>

          {/* Quick Stats Pill Bento */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-left">
              <span className="text-[10px] text-indigo-200 uppercase font-bold block font-sans">Simulations</span>
              <span className="text-xl font-black text-white font-serif">{gamification.mockInterviewsCompleted + completedSessions.length} Done</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-left">
              <span className="text-[10px] text-amber-200 uppercase font-bold block font-sans">Role Alignment</span>
              <span className="text-xl font-black text-amber-400 font-serif">⚡ High Fit</span>
            </div>
            <button
              type="button"
              onClick={() => handleStartTrack('Senior Full Stack Engineer', 'Tech Innovations Inc', 'Full Stack')}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Start Quick Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Role Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
              Curated Interview Tracks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated from current active high-growth tech job openings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {interviewTracks.map((track) => (
            <div
              key={track.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                    {track.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{track.estimatedTime}</span>
                    <span className="text-amber-500 font-bold">{track.xpReward}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modeled for {track.company}
                  </p>
                </div>

                {/* Key Topic Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {track.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  {track.questionCount} Questions • STAR Feedback
                </span>
                <button
                  type="button"
                  onClick={() => handleStartTrack(track.title, track.company, track.category)}
                  className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all group-hover:scale-105"
                >
                  <Mic className="w-3.5 h-3.5" /> Launch Flow <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Simulation History */}
      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
            Recent Practice & Performance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block font-serif">
                    {session.category} • {session.completedAt || 'Recently'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                    {session.roleTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.companyName}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-xl font-black text-emerald-600 font-serif">
                      {session.overallScore}%
                    </span>
                    <span className="text-[10px] block text-slate-400">STAR Score</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Modal */}
      <MockInterviewModal
        isOpen={activeModal.isOpen}
        onClose={() => setActiveModal({ ...activeModal, isOpen: false })}
        roleTitle={activeModal.roleTitle}
        companyName={activeModal.companyName}
        onSessionComplete={handleSessionFinished}
      />

    </div>
  );
};

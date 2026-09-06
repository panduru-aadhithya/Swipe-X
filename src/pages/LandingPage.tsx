import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Briefcase,
  MapPin,
  DollarSign,
  Bookmark,
  Mic,
  FileCheck,
  TrendingUp,
  Award,
  Clock,
  Play,
  Check,
  Star,
  Users,
  ChevronRight,
  Layers,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OrionLogo } from '../components/OrionLogo';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'interview' | 'ats'>('overview');
  const [demoActionState, setDemoActionState] = useState<string | null>(null);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('Remote');

  const handleDemoStart = async () => {
    await demoLogin();
    if (heroSearch.trim()) {
      navigate(`/candidate/explore?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/candidate/explore');
    }
  };

  return (
    <div className="w-full max-w-7xl xl:max-w-[1560px] mx-auto space-y-24 sm:space-y-36 py-8 sm:py-16 px-4 sm:px-8">
      
      {/* 1. HERO SECTION (Modern Job Opportunities SaaS Style) */}
      <section className="relative overflow-hidden rounded-[36px] bg-[#0F172A] p-8 sm:p-16 lg:p-24 text-white border border-slate-800 shadow-2xl">
        {/* Subtle background ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>SwipeX — Centralized Job Opportunities Platform</span>
          </div>

          {/* Display Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Centralized Job Opportunities. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              Precision AI Matching.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate noisy job portals and blind applications. Discover centralized tech listings from industry leaders, evaluate real-time ATS compatibility, and simulate interviews with STAR AI feedback.
          </p>

          {/* Centralized Search & Filter Bar in Hero */}
          <div className="pt-4 max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleDemoStart();
              }}
              className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full flex items-center px-4">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Role, skill, or tech (e.g., Senior Full Stack, AI, React)"
                  className="w-full pl-3 pr-2 py-3 bg-transparent text-white text-sm sm:text-base placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block" />

              <div className="w-full sm:w-auto px-4 py-1.5 flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  <option value="Remote" className="bg-slate-900 text-white">Remote</option>
                  <option value="Hybrid" className="bg-slate-900 text-white">Hybrid</option>
                  <option value="All" className="bg-slate-900 text-white">Global</option>
                </select>
              </div>

              <button
                type="submit"
                id="hero-find-jobs-btn"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all shrink-0 cursor-pointer hover:scale-105"
              >
                <span>Find Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Key SaaS Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">+30%</span>
              <span className="text-xs text-slate-400 font-medium">Faster Discovery</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">+40%</span>
              <span className="text-xs text-slate-400 font-medium">Candidate Engagement</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">94%</span>
              <span className="text-xs text-slate-400 font-medium">Average Match Fit</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">1,240+</span>
              <span className="text-xs text-slate-400 font-medium">Centralized Listings</span>
            </div>
          </div>

        </div>

        {/* 2. INTERACTIVE DEMO CARD SHOWCASE (Embedded Spotlight Card) */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-[#0F172A] rounded-[32px] border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-2xl space-y-6 text-slate-900 dark:text-white">
            
            {/* Top Bar of Demo Card */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Opportunity Spotlight
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Opportunity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('interview')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'interview'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Mock Interview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ats')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'ats'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ATS Radar
                </button>
              </div>
            </div>

            {/* Tab 1: Opportunity View */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                      ST
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          Staff Platform Architect
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          96% Fit
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Stripe • San Francisco, CA (Remote Friendly)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    $220k - $275k
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Distributed Systems', 'TypeScript', 'PostgreSQL', 'Idempotency', 'Kafka'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lead low-latency payment infrastructure and high-throughput transaction pipelines. Direct hiring manager contact with fast-track screening.
                </p>
              </div>
            )}

            {/* Tab 2: Mock Interview Simulator */}
            {activeTab === 'interview' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" /> Predicted Technical Question
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                      STAR AI Scored
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "How do you ensure exactly-once semantics when handling distributed payments across multiple services?"
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Clarity</span>
                    <span className="font-bold text-indigo-600">92%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Depth</span>
                    <span className="font-bold text-purple-600">89%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">STAR Impact</span>
                    <span className="font-bold text-indigo-600">95%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: ATS Radar View */}
            {activeTab === 'ats' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> ATS Score: 94 / 100
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      TOP 5% APPLICANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Your candidate profile strongly matches the required distributed architecture competencies.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">Recommended keyword additions:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-xs">
                    + Kafka Partitions, p99 Latency SLA
                  </span>
                </div>
              </div>
            )}

            {/* Card Action Row */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDemoActionState('interview_launched')}
                  className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" /> Launch Mock Sim
                </button>
                <button
                  type="button"
                  onClick={() => setDemoActionState('ats_scanned')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> ATS Audit
                </button>
              </div>

              <button
                type="button"
                onClick={handleDemoStart}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
              >
                <span>⚡ 1-Click Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {demoActionState && (
              <p className="text-xs text-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse pt-1">
                {demoActionState === 'interview_launched' ? '🎙️ Opening Voice Simulation with Gemini AI STAR evaluation...' : '📊 Scanning resume against 42 job requirements...'}
              </p>
            )}

          </div>
        </div>

      </section>

      {/* 3. COMPANIES HIRING ON SWIPE X */}
      <section className="text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Centralized listings from leading engineering organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">Stripe</span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">Vercel</span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">Figma</span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">Linear</span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">Supabase</span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300 font-serif">OpenAI</span>
        </div>
      </section>

      {/* 4. CORE 4-PILLAR WORKFLOW SECTION */}
      <section className="space-y-12 sm:space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Intelligent Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white font-serif">
            Designed for Clarity. Powered by Precision.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Every feature in Swipe X is built to minimize distraction and give you a decisive edge in discovery, preparation, and direct application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Card 1 */}
          <div className="p-8 sm:p-9 rounded-[32px] bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between hover:border-indigo-400/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-black group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                Centralized Listings
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore real-time tech openings aggregated across top companies with early applicant indicators (&lt;24h) and zero ghost postings.
              </p>
            </div>
            <div className="pt-3 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span>Verified Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 sm:p-9 rounded-[32px] bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between hover:border-purple-400/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-black group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                Live AI Mock Interview
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Practice role-specific technical & behavioral questions with real-time scoring on Clarity, Depth, and STAR Impact.
              </p>
            </div>
            <div className="pt-3 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span>Voice & STAR Feedback</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 sm:p-9 rounded-[32px] bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between hover:border-emerald-400/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                ATS Gap Scanner
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Audit your resume with recruiter-grade ATS algorithms, uncover keyword gaps, and receive tailored bullet recommendations.
              </p>
            </div>
            <div className="pt-3 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>0-100 Compatibility</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 sm:p-9 rounded-[32px] bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between hover:border-amber-400/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-black group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                Career Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive live salary benchmarks, competition telemetry, and adaptive recommendations as your skill stack grows.
              </p>
            </div>
            <div className="pt-3 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>Live Market Telemetry</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION BANNER */}
      <section className="rounded-[36px] bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-10 sm:p-16 lg:p-20 text-center text-white border border-indigo-500/20 shadow-2xl space-y-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold font-serif">
          Ready to Accelerate Your Career Discovery?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join thousands of developers and tech professionals finding verified opportunities and passing high-stakes interviews with Swipe X.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleDemoStart}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            Launch Swipe X (1-Click Demo)
          </button>
          <Link
            to="/register"
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all"
          >
            Create Candidate Account
          </Link>
        </div>
      </section>

    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  Briefcase, 
  Layers, 
  Loader2, 
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Bot,
  Zap,
  Info,
  Check,
  Building2,
  Bookmark,
  Undo2,
  X,
  History,
  BrainCircuit
} from 'lucide-react';
import { Job, JobRecommendation, BehavioralProfile } from '../types';
import { recommendationApi, swipeApi, savedJobApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/JobCard';
import { ApplyModal } from '../components/ApplyModal';
import { JobDetailDrawer } from '../components/JobDetailDrawer';
import { SwipeHistoryPage } from './SwipeHistoryPage';
import { useNavigate, Link } from 'react-router-dom';

export const SwipePage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deck' | 'history'>('deck');
  const [totalHistoryCount, setTotalHistoryCount] = useState<number>(0);
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile | null>(null);
  
  // Filter states
  const [minScore, setMinScore] = useState<number>(60);
  const [selectedWorkType, setSelectedWorkType] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Apply Modal & Detail Drawer states
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);
  const [selectedDrawerJob, setSelectedDrawerJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Swipe history for undo
  const [swipedHistory, setSwipedHistory] = useState<{ job: Job; decision: 'LEFT' | 'RIGHT' | 'SAVE' }[]>([]);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    jobTitle?: string;
    canUndo?: boolean;
  } | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, historyData] = await Promise.all([
        recommendationApi.getRecommendations({ limit: 40 }),
        swipeApi.getHistory().catch(() => [])
      ]);
      setRecommendations(res.recommendations);
      if (res.behavioralProfile) {
        setBehavioralProfile(res.behavioralProfile);
      }
      setTotalHistoryCount(historyData.length);
      setCurrentIndex(0);
      setSwipedHistory([]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Filtered deck
  const filteredDeck = recommendations.filter((rec) => {
    if (rec.matchScore < minScore) return false;
    if (selectedWorkType !== 'All' && rec.job.workType !== selectedWorkType) return false;
    return true;
  });

  const currentRecommendation = filteredDeck[currentIndex];

  const handleSwipeLeft = async (job: Job) => {
    try {
      swipeApi.recordSwipe(job.id, 'LEFT').catch(() => {});
      setSwipedHistory((prev) => [...prev, { job, decision: 'LEFT' }]);
      setTotalHistoryCount((prev) => prev + 1);
      setBehavioralProfile((prev) => prev ? { ...prev, leftSwipesCount: prev.leftSwipesCount + 1, totalSwipes: prev.totalSwipes + 1 } : null);
      setCurrentIndex((prev) => prev + 1);
      
      setToastNotification({
        message: `Passed on ${job.title} at ${job.company}`,
        jobTitle: job.title,
        canUndo: true
      });
      setTimeout(() => {
        setToastNotification((curr) => curr?.jobTitle === job.title ? null : curr);
      }, 4000);
    } catch (err) {
      console.error('Failed to record left swipe:', err);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = async (job: Job) => {
    try {
      swipeApi.recordSwipe(job.id, 'RIGHT').catch(() => {});
      setSwipedHistory((prev) => [...prev, { job, decision: 'RIGHT' }]);
      setTotalHistoryCount((prev) => prev + 1);
      setBehavioralProfile((prev) => prev ? { ...prev, rightSwipesCount: prev.rightSwipesCount + 1, totalSwipes: prev.totalSwipes + 1 } : null);
      // Open the comprehensive 4-step ATS Apply Journey
      setActiveApplyingJob(job);
    } catch (err) {
      console.error('Failed to record right swipe:', err);
      setActiveApplyingJob(job);
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      if (savedJobIds.has(job.id)) {
        await savedJobApi.removeSavedJob(job.id);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setToastNotification({
          message: `Removed ${job.title} from bookmarks`,
          canUndo: false
        });
      } else {
        await savedJobApi.saveJob(job.id);
        swipeApi.recordSwipe(job.id, 'SAVE').catch(() => {});
        setSavedJobIds((prev) => new Set(prev).add(job.id));
        setSwipedHistory((prev) => [...prev, { job, decision: 'SAVE' }]);
        setTotalHistoryCount((prev) => prev + 1);
        setBehavioralProfile((prev) => prev ? { ...prev, savedCount: prev.savedCount + 1, totalSwipes: prev.totalSwipes + 1 } : null);
        setToastNotification({
          message: `Saved ${job.title} to bookmarks`,
          jobTitle: job.title,
          canUndo: true
        });
      }
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const handleUndo = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const restoredRec = filteredDeck[prevIndex];
      const lastSwipe = swipedHistory[swipedHistory.length - 1];

      if (lastSwipe) {
        setSwipedHistory((prev) => prev.slice(0, -1));
        setTotalHistoryCount((prev) => Math.max(0, prev - 1));
        
        // Asynchronously notify backend of undone swipe
        try {
          swipeApi.undoSwipe(lastSwipe.job.id).catch(() => {});
        } catch (e) {
          console.error('Failed to sync undo with backend:', e);
        }

        // Revert behavioral profile counts
        if (lastSwipe.decision === 'LEFT') {
          setBehavioralProfile((prev) => prev ? { ...prev, leftSwipesCount: Math.max(0, prev.leftSwipesCount - 1), totalSwipes: Math.max(0, prev.totalSwipes - 1) } : null);
        } else if (lastSwipe.decision === 'RIGHT') {
          setBehavioralProfile((prev) => prev ? { ...prev, rightSwipesCount: Math.max(0, prev.rightSwipesCount - 1), totalSwipes: Math.max(0, prev.totalSwipes - 1) } : null);
        } else if (lastSwipe.decision === 'SAVE') {
          setBehavioralProfile((prev) => prev ? { ...prev, savedCount: Math.max(0, prev.savedCount - 1), totalSwipes: Math.max(0, prev.totalSwipes - 1) } : null);
        }
      }

      setCurrentIndex(prevIndex);
      setToastNotification({
        message: `Restored "${restoredRec?.job?.title || 'previous job'}" back to your deck`,
        canUndo: false
      });
      setTimeout(() => setToastNotification(null), 3000);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if modal or text input is active
      if (activeApplyingJob || selectedDrawerJob || ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) || e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (!currentRecommendation) return;

      if (e.key === 'ArrowLeft') {
        handleSwipeLeft(currentRecommendation.job);
      } else if (e.key === 'ArrowRight') {
        handleSwipeRight(currentRecommendation.job);
      } else if (e.key.toLowerCase() === 's') {
        handleSaveJob(currentRecommendation.job);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRecommendation, activeApplyingJob, selectedDrawerJob, currentIndex, swipedHistory]);

  return (
    <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-8 pb-24 relative">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
              Swipe Match
            </h1>

            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                id="btn-tab-match-deck"
                type="button"
                onClick={() => setActiveTab('deck')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'deck'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>AI Match Deck</span>
              </button>

              <button
                id="btn-tab-swipe-history"
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4 text-purple-500" />
                <span>Swipe History ({totalHistoryCount})</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeTab === 'deck'
              ? 'Swipe right to match, left to pass. Your swipe behavior continuously trains our AI recommendation engine in real time.'
              : 'Inspect, revert, or change your past swipe decisions.'}
          </p>
        </div>

        {activeTab === 'deck' && (
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            {/* Undo Button */}
            <button
              id="btn-undo-swipe"
              type="button"
              onClick={handleUndo}
              disabled={currentIndex === 0}
              title={currentIndex > 0 ? "Undo last swipe action (U or ⌘Z)" : "No swipes to undo yet"}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                currentIndex > 0
                  ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Undo {currentIndex > 0 ? `(${currentIndex})` : ''}</span>
            </button>

            <button
              id="btn-toggle-filters"
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isFilterOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>

            <Link
              to="/candidate/explore"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              Grid View
            </Link>
          </div>
        )}
      </div>

      {/* When in History mode, render SwipeHistoryPage directly */}
      {activeTab === 'history' ? (
        <SwipeHistoryPage />
      ) : (
        <>
          {/* AI Swipe Recommendation Insights Banner */}
          {behavioralProfile && (
            <div className="p-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white font-serif">
                      Swipe-Trained Recommendations
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {totalHistoryCount} Signals Analyzed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {behavioralProfile.topBoostedSkills && behavioralProfile.topBoostedSkills.length > 0 ? (
                      <span>
                        Boosting roles matching <strong className="text-indigo-600 dark:text-indigo-400">{behavioralProfile.topBoostedSkills.slice(0, 3).map(s => s.skill).join(', ')}</strong> by up to +25%.
                      </span>
                    ) : (
                      <span>AI algorithm dynamically learns from each right and left swipe to prioritize matching stacks.</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
              >
                <span>View Full Swipe History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

      {/* Transient Action & Undo Notification Bar */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="p-3 px-4 rounded-xl bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700 shadow-lg flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">{toastNotification.message}</span>
            </div>

            <div className="flex items-center gap-2">
              {toastNotification.canUndo && currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Filter Drawer */}
      {isFilterOpen && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 font-serif">
                Minimum Match Score: {minScore}%
              </label>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>40% (Broad)</span>
                <span>70% (Targeted)</span>
                <span>95% (High Precision)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 font-serif">
                Work Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedWorkType(type)}
                    className={`px-3.5 py-1 text-xs rounded-full font-semibold transition-all ${
                      selectedWorkType === type
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Swipe Deck Canvas */}
      <div className="flex flex-col items-center justify-center min-h-[580px]">
        {isLoading ? (
          <div className="text-center py-28 space-y-5">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <p className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              AI Recommendation Agent Ranking Verified Roles...
            </p>
            <p className="text-sm text-slate-500">
              Scoring candidate profile against 1,048 real jobs with behavioral keyword adjustment.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-4 max-w-md bg-white dark:bg-[#1E293B] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Retry Discovery
            </button>
          </div>
        ) : currentRecommendation ? (
          <div className="w-full flex flex-col items-center space-y-6">
            {/* Deck Progress Indicator & Deck Controls Header */}
            <div className="flex flex-wrap items-center justify-between w-full max-w-2xl px-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>
                    Card <strong className="text-slate-900 dark:text-white font-bold">{currentIndex + 1}</strong> of{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">{filteredDeck.length}</strong>
                  </span>
                </div>

                {currentIndex > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                    {currentIndex} swiped
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>← Pass • → Match</span>
              </div>
            </div>

            {/* Stacked Card Container */}
            <div className="relative w-full max-w-2xl flex justify-center min-h-[540px]">
              {/* Background Card Preview for Stack Depth */}
              {filteredDeck[currentIndex + 1] && (
                <div className="absolute inset-0 top-3 transform scale-[0.94] opacity-50 dark:opacity-40 pointer-events-none transition-all flex justify-center z-0">
                  <JobCard
                    job={filteredDeck[currentIndex + 1].job}
                    recommendation={filteredDeck[currentIndex + 1]}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                    onSave={() => {}}
                    isInteractiveSwipe={false}
                    isBackgroundCard={true}
                  />
                </div>
              )}

              {/* Active Foreground Swipeable Card */}
              <div className="relative z-10 w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRecommendation.job.id}
                    initial={{ scale: 0.95, opacity: 0.7, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex justify-center"
                  >
                    <JobCard
                      job={currentRecommendation.job}
                      recommendation={currentRecommendation}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onSave={handleSaveJob}
                      isSaved={savedJobIds.has(currentRecommendation.job.id)}
                      onViewDetails={(job) => setSelectedDrawerJob(job)}
                      isInteractiveSwipe={true}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 space-y-6 max-w-lg bg-white dark:bg-[#1E293B] p-8 sm:p-12 rounded-[36px] border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                You've Reviewed All Top Matches!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You've swiped through all jobs in this cohort. If you accidentally dismissed the last job, you can undo it below.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {currentIndex > 0 && (
                <button
                  id="btn-empty-state-undo"
                  type="button"
                  onClick={handleUndo}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Undo Last Dismissal</span>
                </button>
              )}

              <button
                type="button"
                onClick={fetchRecommendations}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Load Next 40 Job Matches
              </button>

              <button
                type="button"
                onClick={() => navigate('/candidate/saved-jobs')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-all"
              >
                Review Saved Roles
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Split View Drawer (Screenshot 172) */}
      {selectedDrawerJob && (
        <JobDetailDrawer
          job={selectedDrawerJob}
          recommendation={currentRecommendation}
          isOpen={!!selectedDrawerJob}
          onClose={() => setSelectedDrawerJob(null)}
          onApply={(job) => {
            setSelectedDrawerJob(null);
            handleSwipeRight(job);
          }}
          onSwipeLeft={(job) => {
            setSelectedDrawerJob(null);
            handleSwipeLeft(job);
          }}
          onSwipeRight={(job) => {
            setSelectedDrawerJob(null);
            handleSwipeRight(job);
          }}
          onSave={handleSaveJob}
          isSaved={savedJobIds.has(selectedDrawerJob.id)}
        />
      )}

      {/* ATS Apply Journey Modal */}
      {activeApplyingJob && (
        <ApplyModal
          job={activeApplyingJob}
          isOpen={!!activeApplyingJob}
          onClose={() => {
            setActiveApplyingJob(null);
            setCurrentIndex((prev) => prev + 1);
          }}
          onAppliedSuccess={() => {
            // Callback
          }}
        />
      )}
    </div>
  );
};

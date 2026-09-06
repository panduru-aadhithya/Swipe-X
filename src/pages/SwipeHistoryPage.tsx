import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Heart, 
  X, 
  Bookmark, 
  Briefcase, 
  Search, 
  SlidersHorizontal, 
  Building2, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  ArrowRight,
  Clock,
  TrendingUp,
  BrainCircuit,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { SwipeDecision, Job, BehavioralProfile } from '../types';
import { swipeApi, recommendationApi, savedJobApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ApplyModal } from '../components/ApplyModal';
import { JobDetailDrawer } from '../components/JobDetailDrawer';
import { Link } from 'react-router-dom';

export const SwipeHistoryPage: React.FC = () => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<SwipeDecision[]>([]);
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'RIGHT' | 'LEFT' | 'SAVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest');

  // Interactive drawers and modals
  const [selectedDrawerJob, setSelectedDrawerJob] = useState<Job | null>(null);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);
  const [actionNotification, setActionNotification] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchHistoryAndProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [historyData, recsData] = await Promise.all([
        swipeApi.getHistory(),
        recommendationApi.getRecommendations({ limit: 1 }).catch(() => null)
      ]);

      setHistory(historyData);
      if (recsData?.behavioralProfile) {
        setBehavioralProfile(recsData.behavioralProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load swipe history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryAndProfile();
  }, [fetchHistoryAndProfile]);

  const showToast = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 3500);
  };

  // Revert/Delete single swipe
  const handleRemoveSwipe = async (jobId: string, jobTitle?: string) => {
    try {
      await swipeApi.deleteSwipe(jobId);
      setHistory(prev => prev.filter(s => s.jobId !== jobId));
      showToast(`Removed "${jobTitle || 'Job'}" from swipe history`);
      
      // Update behavioral profile counts
      if (behavioralProfile) {
        const removed = history.find(s => s.jobId === jobId);
        if (removed) {
          setBehavioralProfile(prev => prev ? {
            ...prev,
            totalSwipes: Math.max(0, prev.totalSwipes - 1),
            rightSwipesCount: removed.decision === 'RIGHT' ? Math.max(0, prev.rightSwipesCount - 1) : prev.rightSwipesCount,
            leftSwipesCount: removed.decision === 'LEFT' ? Math.max(0, prev.leftSwipesCount - 1) : prev.leftSwipesCount,
            savedCount: removed.decision === 'SAVE' ? Math.max(0, prev.savedCount - 1) : prev.savedCount
          } : null);
        }
      }
    } catch (err: any) {
      showToast(`Error removing swipe: ${err.message}`);
    }
  };

  // Change decision (e.g. change Passed to Liked)
  const handleChangeDecision = async (job: Job, newDecision: 'RIGHT' | 'LEFT' | 'SAVE') => {
    try {
      await swipeApi.recordSwipe(job.id, newDecision);
      setHistory(prev => prev.map(s => {
        if (s.jobId === job.id) {
          return { ...s, decision: newDecision };
        }
        return s;
      }));
      const label = newDecision === 'RIGHT' ? 'Liked' : newDecision === 'SAVE' ? 'Saved' : 'Passed';
      showToast(`Updated decision for "${job.title}" to ${label}`);
      
      if (newDecision === 'RIGHT') {
        setActiveApplyingJob(job);
      }
    } catch (err: any) {
      showToast(`Error updating decision: ${err.message}`);
    }
  };

  // Clear entire history
  const handleClearHistory = async () => {
    setIsClearingAll(true);
    try {
      await swipeApi.clearHistory();
      setHistory([]);
      setShowClearConfirm(false);
      showToast('All swipe history cleared successfully');
      setBehavioralProfile(null);
    } catch (err: any) {
      showToast(`Failed to clear history: ${err.message}`);
    } finally {
      setIsClearingAll(false);
    }
  };

  // Filtered and sorted records
  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        if (filterDecision !== 'ALL' && item.decision !== filterDecision) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = item.job?.title?.toLowerCase() || '';
          const company = item.job?.company?.toLowerCase() || '';
          const location = item.job?.location?.toLowerCase() || '';
          const skills = (item.job?.extractedSkills || []).join(' ').toLowerCase();
          return title.includes(q) || company.includes(q) || location.includes(q) || skills.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'company') {
          return (a.job?.company || '').localeCompare(b.job?.company || '');
        }
        return 0;
      });
  }, [history, filterDecision, searchQuery, sortBy]);

  const counts = useMemo(() => {
    return {
      all: history.length,
      right: history.filter(s => s.decision === 'RIGHT').length,
      left: history.filter(s => s.decision === 'LEFT').length,
      save: history.filter(s => s.decision === 'SAVE').length
    };
  }, [history]);

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Toast Notification */}
      {actionNotification && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700 shadow-xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{actionNotification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
              Swipe History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800">
              {history.length} Swiped
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your past swipe decisions. Every swipe trains the AI recommendation engine to score and rank upcoming roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/candidate/swipe"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Match Deck</span>
          </Link>

          {history.length > 0 && (
            <button
              id="btn-clear-swipe-history"
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Behavioral Intelligence Card: How Swipes Shape Recommendations */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold font-serif tracking-wide">
                AI Recommendation Model Learning Profile
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80">
              Real-time behavioral training profile derived from your past swipe interactions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {behavioralProfile?.learningSignalStrength === 'OPTIMIZED' 
                ? 'Model Optimized' 
                : behavioralProfile?.learningSignalStrength === 'LEARNING'
                ? 'Actively Learning' 
                : 'Cold Start'}
            </span>
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-emerald-400" /> Liked Roles
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              {counts.right}
            </div>
            <div className="text-[10px] text-emerald-400">
              Positive signals boosting matching tech
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" /> Passed Roles
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              {counts.left}
            </div>
            <div className="text-[10px] text-rose-400">
              Negative signals de-prioritizing stacks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" /> Saved Roles
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              {counts.save}
            </div>
            <div className="text-[10px] text-indigo-300">
              High intent career bookmarks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Match Acceptance
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              {behavioralProfile?.acceptanceRate || (counts.all > 0 ? Math.round(((counts.right + counts.save) / counts.all) * 100) : 0)}%
            </div>
            <div className="text-[10px] text-amber-300">
              Right-swipe conversion rate
            </div>
          </div>
        </div>

        {/* Learned Preferences: Skills & Work Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Top Boosted Skills */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Top Boosted Technologies (+25% Max Boost)
              </span>
            </div>
            {behavioralProfile?.topBoostedSkills && behavioralProfile.topBoostedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {behavioralProfile.topBoostedSkills.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-medium flex items-center gap-1"
                  >
                    <span>{item.skill}</span>
                    <span className="text-[10px] opacity-80">+{item.weight}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Swipe right on more jobs with your favorite tech stack to populate skill boosts.
              </p>
            )}
          </div>

          {/* Preferred Work Mode & Roles */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Preferred Work Mode & Target Roles
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Work Mode Preference:</span>
                <span className="font-bold text-white px-2.5 py-0.5 rounded-lg bg-indigo-500/30 border border-indigo-400/30">
                  {behavioralProfile?.preferredWorkMode || 'Calibrating from swipes...'}
                </span>
              </div>
              {behavioralProfile?.preferredRoles && behavioralProfile.preferredRoles.length > 0 && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-slate-400">Target Role Categories:</span>
                  {behavioralProfile.preferredRoles.map((role, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Decision Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterDecision('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterDecision === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Swipes ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setFilterDecision('RIGHT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterDecision === 'RIGHT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Heart className="w-3 h-3 fill-current" />
            Liked ({counts.right})
          </button>

          <button
            type="button"
            onClick={() => setFilterDecision('LEFT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterDecision === 'LEFT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <X className="w-3 h-3" />
            Passed ({counts.left})
          </button>

          <button
            type="button"
            onClick={() => setFilterDecision('SAVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterDecision === 'SAVE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <Bookmark className="w-3 h-3 fill-current" />
            Saved ({counts.save})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* History Items Feed */}
      {isLoading ? (
        <div className="text-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-serif font-bold text-slate-700 dark:text-slate-300">
            Loading your swipe decision history...
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
              No Swipes Match Your Filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery 
                ? `No history found matching "${searchQuery}". Try resetting your search query.`
                : "You haven't recorded any swipes in this category yet. Head to the AI Match Deck to start discovering roles!"}
            </p>
          </div>
          <Link
            to="/candidate/swipe"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Flame className="w-4 h-4 text-amber-300" /> Start Swiping in Match Deck
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const job = item.job;
            const isLiked = item.decision === 'RIGHT';
            const isPassed = item.decision === 'LEFT';
            const isSaved = item.decision === 'SAVE';

            const formattedSalary = job?.salaryMin && job?.salaryMax
              ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k`
              : '$120k – $160k';

            return (
              <div
                key={item.id}
                id={`swipe-history-item-${item.jobId}`}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header: Decision Badge & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isLiked && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        Liked (Right Swipe)
                      </span>
                    )}
                    {isPassed && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        Passed (Left Swipe)
                      </span>
                    )}
                    {isSaved && (
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                        Saved Role
                      </span>
                    )}

                    {item.applied && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" /> Applied
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Job Core Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {job?.title || 'Unknown Position'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          {job?.company || 'Company'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job?.location || 'Location'}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formattedSalary}
                        </span>
                      </div>
                    </div>

                    {job?.workType && (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shrink-0">
                        {job.workType}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  {job?.extractedSkills && job.extractedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.extractedSkills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.extractedSkills.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                          +{job.extractedSkills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Interactive Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* If passed, give option to switch to Liked or Apply */}
                    {isPassed && job && (
                      <button
                        type="button"
                        onClick={() => handleChangeDecision(job, 'RIGHT')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Change decision to Liked"
                      >
                        <Heart className="w-3 h-3 fill-emerald-600" />
                        <span>Change to Liked</span>
                      </button>
                    )}

                    {/* If liked and not applied, offer 1-click apply */}
                    {isLiked && !item.applied && job && (
                      <button
                        type="button"
                        onClick={() => setActiveApplyingJob(job)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                    )}

                    {/* View Details Drawer */}
                    {job && (
                      <button
                        type="button"
                        onClick={() => setSelectedDrawerJob(job)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>

                  {/* Revert / Remove from History */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSwipe(item.jobId, job?.title)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Undo/Delete swipe decision from history (returns job to deck)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Clear All Swipe History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will reset your {history.length} swipe decisions and allow previously swiped jobs to reappear in your AI Match Deck.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={isClearingAll}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                {isClearingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split View Drawer */}
      {selectedDrawerJob && (
        <JobDetailDrawer
          job={selectedDrawerJob}
          isOpen={!!selectedDrawerJob}
          onClose={() => setSelectedDrawerJob(null)}
          onApply={(job) => {
            setSelectedDrawerJob(null);
            setActiveApplyingJob(job);
          }}
          onSwipeLeft={(job) => {
            setSelectedDrawerJob(null);
            handleChangeDecision(job, 'LEFT');
          }}
          onSwipeRight={(job) => {
            setSelectedDrawerJob(null);
            handleChangeDecision(job, 'RIGHT');
          }}
          onSave={async (job) => {
            await savedJobApi.saveJob(job.id);
            handleChangeDecision(job, 'SAVE');
          }}
        />
      )}

      {/* ATS Apply Journey Modal */}
      {activeApplyingJob && (
        <ApplyModal
          job={activeApplyingJob}
          isOpen={!!activeApplyingJob}
          onClose={() => setActiveApplyingJob(null)}
          onAppliedSuccess={() => {
            fetchHistoryAndProfile();
          }}
        />
      )}
    </div>
  );
};

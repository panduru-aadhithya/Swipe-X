import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Heart, 
  X, 
  Bookmark, 
  Briefcase, 
  Compass,
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
import { SwipeDecision, Job, BehavioralProfile, Application, EmploymentType } from '../types';
import { swipeApi, recommendationApi, savedJobApi, applicationApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ApplyModal } from '../components/ApplyModal';
import { JobDetailDrawer } from '../components/JobDetailDrawer';
import { ApplicationSuccessModal } from '../components/ApplicationSuccessModal';
import { ApplicationAlertModal } from '../components/ApplicationAlertModal';
import { Link } from 'react-router-dom';

export const SwipeHistoryPage: React.FC = () => {
  const { user, profile, isAuthenticated } = useAuth();
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
  
  // Application submission states
  const [submittingJobId, setSubmittingJobId] = useState<string | null>(null);
  const [submittedSuccessData, setSubmittedSuccessData] = useState<{ job: Partial<Job>; application: Application | null } | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'ALREADY_APPLIED' | 'LOGIN_REQUIRED' | 'ERROR';
    jobTitle?: string;
    companyName?: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'ALREADY_APPLIED'
  });

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

  // Handle 1-click apply from history item
  const handleApplyHistoryItem = async (item: SwipeDecision) => {
    const jobTitle = item.jobTitle || item.job?.title || 'Position';
    const companyName = item.company || item.job?.company || 'Company';

    if (item.applied) {
      setAlertModal({
        isOpen: true,
        type: 'ALREADY_APPLIED',
        jobTitle,
        companyName
      });
      return;
    }

    if (!isAuthenticated || !user) {
      setAlertModal({
        isOpen: true,
        type: 'LOGIN_REQUIRED',
        jobTitle,
        companyName
      });
      return;
    }

    if (submittingJobId) return;

    setSubmittingJobId(item.jobId);
    try {
      const app = await applicationApi.submitApplication({ jobId: item.jobId });
      
      // Update item in history state
      setHistory(prev => prev.map(s => {
        if (s.jobId === item.jobId) {
          return {
            ...s,
            applied: true,
            applicationId: app.id,
            applicationStatus: app.status,
            appliedDate: app.appliedDate
          };
        }
        return s;
      }));

      const jobObj: Partial<Job> = item.job || {
        id: item.jobId,
        title: jobTitle,
        company: companyName,
        location: item.location || '',
        employmentType: (item.employmentType as EmploymentType) || 'Full-time',
        experienceLevel: (item.experienceLevel as any) || 'Mid'
      };

      setSubmittedSuccessData({ job: jobObj, application: app });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('already applied') || err?.code === 'ALREADY_APPLIED') {
        setHistory(prev => prev.map(s => s.jobId === item.jobId ? { ...s, applied: true } : s));
        setAlertModal({
          isOpen: true,
          type: 'ALREADY_APPLIED',
          jobTitle,
          companyName
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'ERROR',
          jobTitle,
          companyName,
          message: err?.message || 'Application could not be submitted. Please try again.'
        });
      }
    } finally {
      setSubmittingJobId(null);
    }
  };

  // Filtered and sorted records
  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        const isRight = item.decision === 'RIGHT' || item.action === 'right_swipe';
        const isLeft = item.decision === 'LEFT' || item.action === 'left_swipe';
        const isSave = item.decision === 'SAVE';

        if (filterDecision === 'RIGHT' && !isRight) return false;
        if (filterDecision === 'LEFT' && !isLeft) return false;
        if (filterDecision === 'SAVE' && !isSave) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = (item.jobTitle || item.job?.title || '').toLowerCase();
          const company = (item.company || item.job?.company || '').toLowerCase();
          const location = (item.location || item.job?.location || '').toLowerCase();
          const skills = (item.skills || item.job?.extractedSkills || []).join(' ').toLowerCase();
          return title.includes(q) || company.includes(q) || location.includes(q) || skills.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        if (sortBy === 'newest') {
          return timeB - timeA;
        }
        if (sortBy === 'oldest') {
          return timeA - timeB;
        }
        if (sortBy === 'company') {
          const compA = a.company || a.job?.company || '';
          const compB = b.company || b.job?.company || '';
          return compA.localeCompare(compB);
        }
        return 0;
      });
  }, [history, filterDecision, searchQuery, sortBy]);

  const counts = useMemo(() => {
    return {
      all: history.length,
      right: history.filter(s => s.decision === 'RIGHT' || s.action === 'right_swipe').length,
      left: history.filter(s => s.decision === 'LEFT' || s.action === 'left_swipe').length,
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Swipe History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200/80 dark:border-violet-800">
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
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/90 via-slate-900 to-violet-950 text-white border border-violet-800/40 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-violet-800/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold font-display tracking-wide">
                AI Recommendation Model Learning Profile
              </h2>
            </div>
            <p className="text-xs text-violet-200/80">
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
            <div className="text-2xl font-bold font-display text-white">
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
            <div className="text-2xl font-bold font-display text-white">
              {counts.left}
            </div>
            <div className="text-[10px] text-rose-400">
              Negative signals de-prioritizing stacks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-violet-400" /> Saved Roles
            </div>
            <div className="text-2xl font-bold font-display text-white">
              {counts.save}
            </div>
            <div className="text-[10px] text-violet-300">
              High intent career bookmarks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" /> Match Acceptance
            </div>
            <div className="text-2xl font-bold font-display text-white">
              {behavioralProfile?.acceptanceRate || (counts.all > 0 ? Math.round(((counts.right + counts.save) / counts.all) * 100) : 0)}%
            </div>
            <div className="text-[10px] text-orange-300">
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
              <span className="font-semibold text-violet-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Preferred Work Mode & Target Roles
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Work Mode Preference:</span>
                <span className="font-bold text-white px-2.5 py-0.5 rounded-lg bg-violet-500/30 border border-violet-400/30">
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
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40'
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
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
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
          <p className="text-sm font-display font-bold text-slate-700 dark:text-slate-300">
            Loading your swipe decision history...
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-xs hover:bg-violet-700 transition-colors"
          >
            <Flame className="w-4 h-4 text-orange-400" /> Start Swiping in Match Deck
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const job = item.job;
            const isLiked = item.decision === 'RIGHT' || item.action === 'right_swipe';
            const isPassed = item.decision === 'LEFT' || item.action === 'left_swipe';
            const isSaved = item.decision === 'SAVE';

            const jobTitle = item.jobTitle || job?.title || 'Unknown Position';
            const companyName = item.company || job?.company || 'Company';
            const location = item.location || job?.location || 'Location';
            const skills = item.skills || job?.extractedSkills || [];
            const employmentType = item.employmentType || job?.employmentType;
            const experienceLevel = item.experienceLevel || job?.experienceLevel;

            const formattedSalary = job?.salaryMin && job?.salaryMax
              ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k`
              : '$120k – $160k';

            return (
              <div
                key={item.id}
                id={`swipe-history-item-${item.jobId}`}
                className="p-5 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header: Decision Badge & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isLiked && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        Interested (Right Swipe)
                      </span>
                    )}
                    {isPassed && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        Passed (Left Swipe)
                      </span>
                    )}
                    {isSaved && (
                      <span className="px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 fill-violet-600 text-violet-600" />
                        Saved Role
                      </span>
                    )}

                    {item.applied && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> ✓ Applied {item.applicationId ? `(${item.applicationId})` : ''}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {formatDate(item.createdAt || item.timestamp || '')}
                  </span>
                </div>

                {/* Job Core Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white leading-snug hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        {jobTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-violet-500" />
                          {companyName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {location}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formattedSalary}
                        </span>
                      </div>
                    </div>

                    {(job?.workType || employmentType) && (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shrink-0">
                        {job?.workType || employmentType}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  {skills && skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Interactive Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* If passed, give option to switch to Liked */}
                    {isPassed && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetJob: Job = job || {
                            id: item.jobId,
                            title: jobTitle,
                            company: companyName,
                            location,
                            employmentType: employmentType || 'Full-time',
                            experienceLevel: experienceLevel || 'Mid-Level',
                            workType: 'Remote',
                            salaryMin: 120000,
                            salaryMax: 160000,
                            salaryCurrency: 'USD',
                            description: '',
                            requirements: [],
                            benefits: [],
                            extractedSkills: skills,
                            companyType: 'Technology',
                            isVerified: true,
                            source: 'SWIPEX_VERIFIED',
                            postedDate: new Date().toISOString(),
                            expiresDate: new Date().toISOString()
                          };
                          handleChangeDecision(targetJob, 'RIGHT');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Change decision to Liked"
                      >
                        <Heart className="w-3 h-3 fill-emerald-600" />
                        <span>Change to Interested</span>
                      </button>
                    )}

                    {/* If liked and not applied, offer 1-click apply */}
                    {isLiked && !item.applied && (
                      <button
                        type="button"
                        disabled={submittingJobId === item.jobId}
                        onClick={() => handleApplyHistoryItem(item)}
                        className={`px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                          submittingJobId === item.jobId
                            ? 'bg-indigo-400 cursor-wait'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 cursor-pointer'
                        }`}
                      >
                        {submittingJobId === item.jobId ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Apply Now</span>
                          </>
                        )}
                      </button>
                    )}

                    {item.applied && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </span>
                    )}

                    {/* View Details Drawer */}
                    {job && (
                      <button
                        type="button"
                        onClick={() => setSelectedDrawerJob(job)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    )}
                  </div>

                  {/* Revert / Remove from History */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSwipe(item.jobId, jobTitle)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-[#151D2A] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
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
            const existing = history.find(h => h.jobId === job.id);
            if (existing) {
              handleApplyHistoryItem(existing);
            } else {
              handleApplyHistoryItem({
                id: `history-${job.id}`,
                jobId: job.id,
                job,
                candidateProfileId: '',
                decision: 'RIGHT',
                createdAt: new Date().toISOString()
              });
            }
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
          isSubmitting={submittingJobId === selectedDrawerJob.id}
          isApplied={history.some(s => s.jobId === selectedDrawerJob.id && s.applied)}
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

      {/* Application Success Confirmation Modal */}
      {submittedSuccessData && (
        <ApplicationSuccessModal
          isOpen={!!submittedSuccessData}
          onClose={() => setSubmittedSuccessData(null)}
          job={submittedSuccessData.job as Job}
          application={submittedSuccessData.application}
        />
      )}

      {/* Alert & Validation Modals */}
      <ApplicationAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        type={alertModal.type}
        jobTitle={alertModal.jobTitle}
        companyName={alertModal.companyName}
        message={alertModal.message}
      />
    </div>
  );
};

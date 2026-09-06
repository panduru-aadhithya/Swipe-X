import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Bookmark, 
  X, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Info, 
  Layers, 
  ChevronRight, 
  Check,
  Hand
} from 'lucide-react';
import { Job, JobRecommendation } from '../types';
import { MatchBadge } from './MatchBadge';

interface JobCardProps {
  job: Job;
  recommendation?: JobRecommendation;
  onSwipeLeft: (job: Job) => void;
  onSwipeRight: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  onViewDetails?: (job: Job) => void;
  isInteractiveSwipe?: boolean;
  isBackgroundCard?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  recommendation,
  onSwipeLeft,
  onSwipeRight,
  onSave,
  isSaved = false,
  onViewDetails,
  isInteractiveSwipe = true,
  isBackgroundCard = false
}) => {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Motion physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
  const opacity = useTransform(x, [-300, -180, 0, 180, 300], [0.4, 0.95, 1, 0.95, 0.4]);

  // Dynamic border tint based on drag direction
  const rightIndicatorOpacity = useTransform(x, [30, 100], [0, 1]);
  const leftIndicatorOpacity = useTransform(x, [-30, -100], [0, 1]);
  const rightIndicatorScale = useTransform(x, [30, 110], [0.75, 1.1]);
  const leftIndicatorScale = useTransform(x, [-30, -110], [0.75, 1.1]);

  const matchScore = recommendation?.matchScore || 86;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 85;
    const velocityThreshold = 350;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      setExitDirection('right');
      setIsExiting(true);
      setTimeout(() => {
        onSwipeRight(job);
      }, 180);
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      setExitDirection('left');
      setIsExiting(true);
      setTimeout(() => {
        onSwipeLeft(job);
      }, 180);
    }
  };

  const handleButtonSwipeLeft = () => {
    setExitDirection('left');
    setIsExiting(true);
    setTimeout(() => {
      onSwipeLeft(job);
    }, 180);
  };

  const handleButtonSwipeRight = () => {
    setExitDirection('right');
    setIsExiting(true);
    setTimeout(() => {
      onSwipeRight(job);
    }, 180);
  };

  const formattedSalary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k USD`
    : '$115k – $150k USD';

  const companyColors = ['bg-indigo-600', 'bg-emerald-600', 'bg-rose-500', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600'];
  const colorIndex = Math.abs(job.company.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % companyColors.length;
  const companyBg = companyColors[colorIndex];

  if (isBackgroundCard) {
    return (
      <div className="w-full max-w-2xl bg-white/90 dark:bg-[#1E293B]/90 rounded-[38px] border border-slate-200/60 dark:border-slate-800/60 shadow-md overflow-hidden pointer-events-none select-none">
        <div className="h-32 sm:h-36 bg-slate-800 dark:bg-slate-900 p-7 opacity-60" />
        <div className="p-7 sm:p-9 pt-0 relative -mt-10 space-y-5 opacity-75">
          <div className="flex items-end justify-between gap-4">
            <div className={`w-18 h-18 rounded-2xl ${companyBg} text-white border-4 border-white dark:border-[#1E293B] shadow flex items-center justify-center text-2xl font-bold font-serif`}>
              {job.company.charAt(0)}
            </div>
            <MatchBadge score={matchScore} size="lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              {job.company} • {job.location} • {formattedSalary}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id={`job-card-${job.id}`}
      style={isInteractiveSwipe ? { x, rotate, opacity } : {}}
      drag={isInteractiveSwipe && !isExiting ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isInteractiveSwipe && !isExiting ? handleDragEnd : undefined}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      animate={
        isExiting
          ? {
              x: exitDirection === 'right' ? 600 : -600,
              rotate: exitDirection === 'right' ? 24 : -24,
              opacity: 0,
              transition: { duration: 0.22, ease: 'easeOut' }
            }
          : undefined
      }
      className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-[38px] border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-2xl touch-pan-y"
    >
      {/* Swipe Feedback Overlay Indicators */}
      {isInteractiveSwipe && (
        <>
          <motion.div
            style={{ opacity: rightIndicatorOpacity, scale: rightIndicatorScale }}
            className="absolute top-8 right-6 z-30 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-serif font-bold text-xs sm:text-sm tracking-wider border-2 border-white shadow-2xl pointer-events-none rotate-12 flex items-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>INTERESTED • SWIPE RIGHT</span>
          </motion.div>

          <motion.div
            style={{ opacity: leftIndicatorOpacity, scale: leftIndicatorScale }}
            className="absolute top-8 left-6 z-30 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-serif font-bold text-xs sm:text-sm tracking-wider border-2 border-white shadow-2xl pointer-events-none -rotate-12 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>NOT INTERESTED • SWIPE LEFT</span>
          </motion.div>
        </>
      )}

      {/* Top Banner Gradient */}
      <div className="h-32 sm:h-36 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 p-6 sm:p-7 relative flex items-start justify-between text-white/90">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md">
            <Briefcase className="w-3.5 h-3.5" /> Source: {job.source}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/30 backdrop-blur-md text-indigo-200 font-medium">
            {job.workType}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="hidden sm:flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-200">
            <Hand className="w-3 h-3" /> Swipeable
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {job.datePosted}
          </span>
        </div>
      </div>

      {/* Touch drag indicator strip */}
      <div className="flex justify-center -mt-2 mb-1 pointer-events-none">
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60" />
      </div>

      {/* Card Content Body */}
      <div className="p-7 sm:p-9 pt-0 relative -mt-9 space-y-5">
        
        {/* Header with Company Logo & Match Score */}
        <div className="flex items-end justify-between gap-4">
          <div className={`w-18 h-18 rounded-2xl ${companyBg} text-white border-4 border-white dark:border-[#1E293B] shadow-lg flex items-center justify-center text-2xl font-bold font-serif`}>
            {job.company.charAt(0)}
          </div>
          <MatchBadge score={matchScore} size="lg" />
        </div>

        {/* Title & Company info */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
            {job.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {job.company}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {job.location}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formattedSalary}
            </span>
          </div>
        </div>

        {/* Match Insight Highlight Box */}
        {recommendation && recommendation.whyItMatches && recommendation.whyItMatches.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                AI Agent Match Rationale
              </div>

              {recommendation.swipeBoost !== undefined && recommendation.swipeBoost !== 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                  recommendation.swipeBoost > 0
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {recommendation.swipeBoost > 0 ? `+${recommendation.swipeBoost}% Swipe Boost` : `${recommendation.swipeBoost}% Swipe Adjustment`}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{recommendation.whyItMatches[0]}</span>
            </p>

            {recommendation.swipeReasons && recommendation.swipeReasons.length > 0 && (
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 flex items-start gap-1.5 font-medium bg-amber-500/10 p-1.5 px-2 rounded-xl">
                <span>⚡</span>
                <span>{recommendation.swipeReasons[0]}</span>
              </p>
            )}
          </div>
        )}

        {/* Extracted Skills Matrix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Competencies & Tech Stack</span>
            <span>{job.extractedSkills.length} Required</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.extractedSkills.slice(0, 6).map((skill, idx) => {
              const isMatched = recommendation?.matchedSkills?.includes(skill);
              return (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                    isMatched
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isMatched ? '✓ ' : ''}{skill}
                </span>
              );
            })}
            {job.extractedSkills.length > 6 && (
              <span className="text-xs px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                +{job.extractedSkills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Description snippet */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
          <p className={showFullDesc ? '' : 'line-clamp-2'}>
            {job.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <button
              id={`toggle-desc-${job.id}`}
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showFullDesc ? 'Show Less' : 'Read Full Overview'}
            </button>
            {onViewDetails && (
              <button
                id={`btn-view-details-${job.id}`}
                type="button"
                onClick={() => onViewDetails(job)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                Job Details <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY SWIPE X ACTION BUTTONS */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Button: Not Interested (Swipe Left) */}
            <button
              id={`btn-swipe-left-${job.id}`}
              type="button"
              onClick={handleButtonSwipeLeft}
              title="Swipe Left: Not Interested (or press Left Arrow)"
              className="w-full py-4 px-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-sm shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2.5 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              <span>← Swipe Left (Pass)</span>
            </button>

            {/* Right Button: Interested / Apply (Swipe Right) */}
            <button
              id={`btn-swipe-right-${job.id}`}
              type="button"
              onClick={handleButtonSwipeRight}
              title="Swipe Right: Interested / Apply (or press Right Arrow)"
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Swipe Right (Match) →</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Secondary Utilities: Save and Details */}
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              id={`btn-save-job-${job.id}`}
              type="button"
              onClick={() => onSave(job)}
              className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                isSaved
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Saved to Bookmarks' : 'Save for Later'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>Keyboard:</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">← Pass</kbd>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">→ Match</kbd>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};


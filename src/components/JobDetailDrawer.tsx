import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Bookmark, 
  Heart,
  Share2,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2
} from 'lucide-react';
import { Job, JobRecommendation } from '../types';
import { MatchBadge } from './MatchBadge';

interface JobDetailDrawerProps {
  job: Job | null;
  recommendation?: JobRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
  onSwipeLeft?: (job: Job) => void;
  onSwipeRight?: (job: Job) => void;
  onSave?: (job: Job) => void;
  isSaved?: boolean;
  isSubmitting?: boolean;
  isApplied?: boolean;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  recommendation,
  isOpen,
  onClose,
  onApply,
  onSwipeLeft,
  onSwipeRight,
  onSave,
  isSaved = false,
  isSubmitting = false,
  isApplied = false
}) => {
  if (!job) return null;

  const formattedSalary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k USD`
    : '$115k – $150k USD';

  const companyColors = ['bg-indigo-600', 'bg-emerald-600', 'bg-rose-500', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600'];
  const colorIndex = Math.abs(job.company.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % companyColors.length;
  const companyColor = companyColors[colorIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-4xl bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-2xl z-10 flex flex-col h-full overflow-hidden border-l border-slate-200 dark:border-slate-800"
          >
            {/* Top Bar Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2A] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${companyColor} text-white flex items-center justify-center font-display font-bold text-lg shadow-sm`}>
                  {job.company.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {job.company}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Verified Posting</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
                    {job.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSave && (
                  <button
                    type="button"
                    onClick={() => onSave(job)}
                    title="Save Job"
                    className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Job Description & Details (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Highlights Banner */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      {job.workType}
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {job.employmentType}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                      {formattedSalary}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Posted {job.datePosted}
                    </span>
                  </div>

                  {recommendation && (
                    <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-900/20 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Recommendation Score: {recommendation.matchScore}%
                        </span>
                        <MatchBadge score={recommendation.matchScore} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {recommendation.whyItMatches?.[0] || 'Strong alignment with your profile skills and preferred role.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Extracted Skills */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Required Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.extractedSkills.map((skill, idx) => {
                      const isMatched = recommendation?.matchedSkills?.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-3 py-1 rounded-full font-medium border ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isMatched ? '✓ ' : ''}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Full Description */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    Role Description & Impact
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                    {job.description}
                  </div>
                </div>
              </div>

              {/* Right Column: Company & Job Facts (4 Cols) */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* Company Overview Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs text-center space-y-4">
                  <div className={`w-16 h-16 rounded-3xl ${companyColor} text-white text-2xl font-display font-bold flex items-center justify-center mx-auto shadow-md`}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {job.company}
                    </h4>
                    <a
                      href={job.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1 font-display"
                    >
                      <Globe className="w-3.5 h-3.5" /> Visit Website
                    </a>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    id="btn-drawer-apply-position"
                    type="button"
                    disabled={isSubmitting || isApplied}
                    onClick={() => onApply(job)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      isApplied
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isSubmitting
                        ? 'bg-indigo-400 text-white cursor-wait'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-lg active:scale-98 cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : isApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Application Submitted</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Apply Now</span>
                      </>
                    )}
                  </button>

                  {/* Direct Swipe Action Helpers */}
                  {(onSwipeLeft || onSwipeRight) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {onSwipeLeft && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwipeLeft(job);
                            onClose();
                          }}
                          className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors cursor-pointer font-display"
                        >
                          <ArrowLeft className="w-3 h-3" /> Swipe Left (Pass)
                        </button>
                      )}
                      {onSwipeRight && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwipeRight(job);
                            onClose();
                          }}
                          className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors cursor-pointer font-display"
                        >
                          Swipe Right (Like) <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Job Metadata Table */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block font-display">Job Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{job.employmentType}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 font-medium block font-display">Location</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{job.location} ({job.workType})</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 font-medium block font-display">Date posted</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{job.datePosted}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 font-medium block font-display">Experience level</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Senior / Lead Engineer</span>
                  </div>
                </div>

                {/* You might also like / Job Categories */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-display">
                    Job Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['IT Software Solutions', 'Full Stack', 'Cloud & AI', 'Remote Tech', 'Frontend'].map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

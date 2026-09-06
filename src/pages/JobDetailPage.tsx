import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  ChevronLeft, 
  Bookmark, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { jobApi, savedJobApi, swipeApi } from '../api';
import { Job } from '../types';
import { MatchBadge } from '../components/MatchBadge';
import { ApplyModal } from '../components/ApplyModal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await jobApi.getJobById(id);
        setJob(res.job);
        setMatchInfo(res.matchInfo);
        setIsSaved(res.isSaved);
        setApplicationStatus(res.applicationStatus);
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await savedJobApi.removeSavedJob(job.id);
        setIsSaved(false);
      } else {
        await savedJobApi.saveJob(job.id);
        await swipeApi.recordSwipe(job.id, 'SAVE');
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Not Found</h2>
        <p className="text-xs text-slate-500">The requested job posting may have been archived or removed.</p>
        <button
          onClick={() => navigate('/candidate/swipe')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  const formattedSalary = job.salaryMin && job.salaryMax
    ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k / year`
    : '$120,000 – $165,000 (Estimated Tech Range)';

  return (
    <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-8 pb-24 px-2 sm:px-4">
      
      {/* Back Button */}
      <div className="pt-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#8C867A] hover:text-[#2D2926] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-[#252C25] rounded-[32px] border border-[#DCD7C9] dark:border-[#2E362E] p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-[#5B6D5B] dark:text-[#8FA68F] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {job.company}
              </span>
              <span className="text-[#DCD7C9] dark:text-[#354235]">•</span>
              <span className="text-xs sm:text-sm text-[#8C867A] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-semibold border border-[#5B6D5B]/30">
                {job.workType}
              </span>
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-[#E9E4D9]/60 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#E9E4D9] font-medium border border-[#DCD7C9] dark:border-[#354235]">
                {job.employmentType}
              </span>
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-[#C29352]/15 text-[#C29352] dark:text-[#D9AC6C] font-semibold border border-[#C29352]/30">
                {formattedSalary}
              </span>
              <span className="text-xs sm:text-sm text-[#8C867A] flex items-center gap-1.5 ml-2">
                <Calendar className="w-4 h-4" /> Posted {job.datePosted}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
            {matchInfo && <MatchBadge score={matchInfo.matchScore} size="lg" />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#C29352] border-[#C29352] text-white'
                    : 'border-[#DCD7C9] dark:border-[#2E362E] text-[#8C867A] hover:bg-[#E9E4D9]/50'
                }`}
                title="Bookmark"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="px-8 py-3 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Heart className="w-4 h-4 fill-white" />
                {applicationStatus ? 'Re-Apply / Update' : 'Apply With ATS Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* Source URL preservation */}
        <div className="p-4 rounded-2xl bg-[#E9E4D9]/40 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between text-xs sm:text-sm text-[#8C867A]">
          <span className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#5B6D5B]" />
            Verified Job Source: {job.source}
          </span>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5B6D5B] dark:text-[#8FA68F] font-semibold hover:underline flex items-center gap-1.5"
          >
            View Original Posting <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* AI Match Overview Box */}
      {matchInfo && (
        <div className="bg-[#5B6D5B]/10 dark:bg-[#1E251E] border border-[#5B6D5B]/20 rounded-[32px] p-8 space-y-4">
          <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#5B6D5B]" />
            AI Compatibility Match Analysis ({matchInfo.matchScore}% Score)
          </h3>
          <ul className="space-y-2.5">
            {matchInfo.reasons?.map((r: string, idx: number) => (
              <li key={idx} className="text-sm sm:text-base text-[#2D2926] dark:text-[#E9E4D9] flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#5B6D5B] shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Skills Matrix */}
      <div className="bg-white dark:bg-[#252C25] rounded-[32px] border border-[#DCD7C9] dark:border-[#2E362E] p-8 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
          Extracted Technical Requirements
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {job.extractedSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm px-4 py-1.5 rounded-full bg-[#E9E4D9]/60 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#E9E4D9] font-semibold border border-[#DCD7C9] dark:border-[#354235]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Full Description Body */}
      <div className="bg-white dark:bg-[#252C25] rounded-[32px] border border-[#DCD7C9] dark:border-[#2E362E] p-8 sm:p-12 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
          Full Role Description & Responsibilities
        </h3>

        <div className="text-sm sm:text-base text-[#2D2926] dark:text-[#E9E4D9] leading-relaxed whitespace-pre-line space-y-4 font-normal">
          {job.description}
        </div>
      </div>

      {/* Apply Journey Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onAppliedSuccess={() => setApplicationStatus('APPLIED')}
        />
      )}
    </div>
  );
};

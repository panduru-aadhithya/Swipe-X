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
  ShieldCheck,
  Check,
  Send
} from 'lucide-react';
import { jobApi, savedJobApi, swipeApi, applicationApi } from '../api';
import { Job, Application } from '../types';
import { useAuth } from '../context/AuthContext';
import { MatchBadge } from '../components/MatchBadge';
import { ApplyModal } from '../components/ApplyModal';
import { ApplicationSuccessModal } from '../components/ApplicationSuccessModal';
import { ApplicationAlertModal } from '../components/ApplicationAlertModal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | undefined>(undefined);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'ALREADY_APPLIED' | 'LOGIN_REQUIRED' | 'ERROR';
    message?: string;
  }>({
    isOpen: false,
    type: 'ALREADY_APPLIED'
  });

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
        if (res.application) {
          setApplication(res.application);
        }
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

  const handleApplyNow = async () => {
    if (!job) return;

    // Check if user is already recorded as applied
    if (applicationStatus === 'APPLIED') {
      setAlertModal({
        isOpen: true,
        type: 'ALREADY_APPLIED'
      });
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated || !user) {
      setAlertModal({
        isOpen: true,
        type: 'LOGIN_REQUIRED'
      });
      return;
    }

    // Prevent duplicate rapid submissions
    if (isSubmittingApplication) return;

    setIsSubmittingApplication(true);
    try {
      const submittedApp = await applicationApi.submitApplication({ jobId: job.id });
      setApplication(submittedApp);
      setApplicationStatus('APPLIED');
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error('Application submission error:', err);
      if (err?.message?.toLowerCase().includes('already applied') || err?.code === 'ALREADY_APPLIED') {
        setApplicationStatus('APPLIED');
        setAlertModal({
          isOpen: true,
          type: 'ALREADY_APPLIED'
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'ERROR',
          message: err?.message || 'Application could not be submitted. Please try again.'
        });
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-24">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Job Not Found</h2>
        <p className="text-xs text-slate-500">The requested job posting may have been archived or removed.</p>
        <button
          onClick={() => navigate('/candidate/explore')}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Return to Job Directory
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
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {job.company}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800/80">
                {job.workType}
              </span>
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                {job.employmentType}
              </span>
              <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold border border-orange-200 dark:border-orange-800/80">
                {formattedSalary}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 ml-2 font-mono">
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
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Bookmark"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                disabled={isSubmittingApplication}
                onClick={handleApplyNow}
                className={`px-8 py-3 rounded-full font-bold text-sm sm:text-base shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  applicationStatus === 'APPLIED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
                }`}
              >
                {isSubmittingApplication ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Application...</span>
                  </>
                ) : applicationStatus === 'APPLIED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Applied ✓</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Apply Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Source URL preservation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Job Source: {job.source}
          </span>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1.5"
          >
            View Original Posting <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* AI Match Overview Box */}
      {matchInfo && (
        <div className="bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 rounded-3xl p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            AI Compatibility Match Analysis ({matchInfo.matchScore}% Score)
          </h3>
          <ul className="space-y-2.5">
            {matchInfo.reasons?.map((r: string, idx: number) => (
              <li key={idx} className="text-sm sm:text-base text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Skills Matrix */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
          Extracted Technical Requirements
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {job.extractedSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Full Description Body */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Full Role Description & Responsibilities
        </h3>

        <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4 font-normal">
          {job.description}
        </div>
      </div>

      {/* Apply Journey Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onAppliedSuccess={(app) => {
            if (app) setApplication(app);
            setApplicationStatus('APPLIED');
            setIsSuccessModalOpen(true);
          }}
        />
      )}

      {/* Application Success Modal */}
      <ApplicationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        job={job}
        application={application}
      />

      {/* Application Alert Modal */}
      <ApplicationAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        type={alertModal.type}
        jobTitle={job.title}
        companyName={job.company}
        customMessage={alertModal.message}
      />
    </div>
  );
};

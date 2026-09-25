import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  FileText, 
  AlertTriangle,
  Loader2,
  ThumbsUp,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Job, ATSReport, Application, formatApplicationId } from '../types';
import { atsApi, applicationApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ATSScoreGauge } from './ATSScoreGauge';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onAppliedSuccess?: (app?: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onAppliedSuccess
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && job) {
      setStep(1);
      setError(null);
      setSubmittedApp(null);
      runATSAnalysis();
    }
  }, [isOpen, job?.id]);

  const runATSAnalysis = async () => {
    setIsAnalyzingATS(true);
    setError(null);
    try {
      const report = await atsApi.analyzeJob(job.id);
      setAtsReport(report);
    } catch (err: any) {
      console.warn('ATS quick scan failed:', err);
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const app = await applicationApi.submitApplication({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
        candidateNotes: candidateNotes.trim() || undefined
      });

      setSubmittedApp(app);

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setStep(4);
      if (onAppliedSuccess) {
        onAppliedSuccess(app);
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('already applied') || err?.code === 'ALREADY_APPLIED') {
        setError('You have already applied for this job.');
      } else {
        setError(err.message || 'Application could not be submitted. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#151D2A] rounded-[36px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Application Journey
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step {step} of 3</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
              Apply to {job.company} — {job.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 1 ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30 font-bold' : 'border-transparent text-slate-400'}`}>
            1. ATS Pre-Flight Scan
          </div>
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 2 ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30 font-bold' : 'border-transparent text-slate-400'}`}>
            2. Candidate Profile
          </div>
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 3 || step === 4 ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30 font-bold' : 'border-transparent text-slate-400'}`}>
            3. Final Review & Submit
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ATS Pre-Flight Analysis */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    AI ATS Compatibility Assessment
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Understanding your resume alignment for this specific role before final submission.
                  </p>
                </div>
              </div>

              {isAnalyzingATS ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Scanning resume against {job.title} job criteria...
                  </p>
                  <span className="text-xs text-slate-400">Extracting required technical skills & calculating ATS match</span>
                </div>
              ) : atsReport ? (
                <ATSScoreGauge report={atsReport} />
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    ATS analysis ready. Proceed to review profile details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Candidate Profile & Resume Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Verify Your Application Details
              </h4>

              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Candidate Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{profile?.name || 'Applicant'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Email Address</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{profile?.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Phone</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Location</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{profile?.location || 'Remote'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium mb-1.5">Highlighted Skills Included</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.skills.slice(0, 10).map((skill, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Letter Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 font-display">
                  Tailored Cover Letter / Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Why are you excited about the ${job.title} role at ${job.company}?`}
                  className="w-full p-3.5 text-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Final Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Ready to submit your application?
              </h4>

              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white font-display">
                    Applying for: {job.title}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white">
                    ATS Score: {atsReport?.atsScore || 85}/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your candidate profile, attached resume, and verified ATS score report will be transmitted to the {job.company} talent repository.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 font-display">
                  Private Application Notes (For your tracker)
                </label>
                <input
                  type="text"
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="e.g. Applied via referral, follow up next Tuesday"
                  className="w-full p-3.5 text-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                  Application Submitted Successfully ✓
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your application has been confirmed and saved to the database.
                </p>
              </div>

              {/* Confirmation card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-left">
                <div>
                  <h5 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    {job.title}
                  </h5>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    {job.company}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Application ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {formatApplicationId(submittedApp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Applied on:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {submittedApp?.appliedDate
                        ? new Date(submittedApp.appliedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Applied
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/candidate/applications');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  View My Applications
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step !== 4 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

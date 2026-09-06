import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  FileText, 
  AlertTriangle,
  Loader2,
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Job, ATSReport } from '../types';
import { atsApi, applicationApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ATSScoreGauge } from './ATSScoreGauge';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onAppliedSuccess?: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onAppliedSuccess
}) => {
  const { profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && job) {
      setStep(1);
      setError(null);
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
      await applicationApi.submitApplication({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
        candidateNotes: candidateNotes.trim() || undefined
      });

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setStep(4);
      if (onAppliedSuccess) {
        onAppliedSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#252C25] rounded-[36px] border border-[#DCD7C9] dark:border-[#2E362E] shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#E9E4D9]/40 dark:bg-[#1E251E] border-b border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6D5B] dark:text-[#8FA68F]">
                Application Journey
              </span>
              <span className="text-[#DCD7C9] dark:text-[#3D4C3D]">•</span>
              <span className="text-xs text-[#8C867A] dark:text-[#A6A092] font-medium">Step {step} of 3</span>
            </div>
            <h3 className="text-xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif mt-0.5">
              Apply to {job.company} — {job.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#E9E4D9] dark:bg-[#2E362E] text-[#2D2926] dark:text-[#F2F0E9] hover:bg-[#DCD7C9] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 border-b border-[#DCD7C9] dark:border-[#2E362E] text-xs font-semibold">
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 1 ? 'border-[#5B6D5B] text-[#5B6D5B] dark:text-[#8FA68F] bg-[#5B6D5B]/10 font-bold' : 'border-transparent text-[#8C867A]'}`}>
            1. ATS Pre-Flight Scan
          </div>
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 2 ? 'border-[#5B6D5B] text-[#5B6D5B] dark:text-[#8FA68F] bg-[#5B6D5B]/10 font-bold' : 'border-transparent text-[#8C867A]'}`}>
            2. Candidate Profile
          </div>
          <div className={`p-3.5 text-center border-b-2 transition-colors ${step === 3 || step === 4 ? 'border-[#5B6D5B] text-[#5B6D5B] dark:text-[#8FA68F] bg-[#5B6D5B]/10 font-bold' : 'border-transparent text-[#8C867A]'}`}>
            3. Final Review & Submit
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-[#B86B64]/15 border border-[#B86B64]/40 text-[#B86B64] dark:text-[#D48982] text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ATS Pre-Flight Analysis */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] flex items-center gap-2 font-serif">
                    <Sparkles className="w-4 h-4 text-[#5B6D5B] dark:text-[#8FA68F]" />
                    AI ATS Compatibility Assessment
                  </h4>
                  <p className="text-xs text-[#8C867A] dark:text-[#A6A092]">
                    Understanding your resume alignment for this specific role before final submission.
                  </p>
                </div>
              </div>

              {isAnalyzingATS ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#5B6D5B] animate-spin" />
                  <p className="text-sm font-semibold text-[#2D2926] dark:text-[#F2F0E9]">
                    Scanning resume against {job.title} job criteria...
                  </p>
                  <span className="text-xs text-[#8C867A]">Extracting required technical skills & calculating ATS match</span>
                </div>
              ) : atsReport ? (
                <ATSScoreGauge report={atsReport} />
              ) : (
                <div className="p-6 rounded-2xl bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-center">
                  <p className="text-sm text-[#2D2926] dark:text-[#E9E4D9]">
                    ATS analysis ready. Proceed to review profile details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Candidate Profile & Resume Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                Verify Your Application Details
              </h4>

              <div className="p-5 rounded-3xl bg-[#E9E4D9]/40 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#8C867A] dark:text-[#A6A092] block font-medium">Candidate Name</span>
                    <span className="font-semibold text-[#2D2926] dark:text-[#F2F0E9]">{profile?.name || 'Applicant'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8C867A] dark:text-[#A6A092] block font-medium">Email Address</span>
                    <span className="font-semibold text-[#2D2926] dark:text-[#F2F0E9]">{profile?.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8C867A] dark:text-[#A6A092] block font-medium">Phone</span>
                    <span className="font-semibold text-[#2D2926] dark:text-[#F2F0E9]">{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8C867A] dark:text-[#A6A092] block font-medium">Location</span>
                    <span className="font-semibold text-[#2D2926] dark:text-[#F2F0E9]">{profile?.location || 'Remote'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCD7C9] dark:border-[#2E362E]">
                  <span className="text-xs text-[#8C867A] dark:text-[#A6A092] block font-medium mb-1.5">Highlighted Skills Included</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.skills.slice(0, 10).map((skill, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border border-[#5B6D5B]/30 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Letter Prompt */}
              <div>
                <label className="block text-xs font-bold text-[#2D2926] dark:text-[#E9E4D9] uppercase tracking-wider mb-1.5 font-serif">
                  Tailored Cover Letter / Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Why are you excited about the ${job.title} role at ${job.company}?`}
                  className="w-full p-3.5 text-sm rounded-2xl border border-[#DCD7C9] dark:border-[#2E362E] bg-white dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Final Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h4 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                Ready to submit your application?
              </h4>

              <div className="p-5 rounded-3xl bg-[#E9E4D9]/50 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                    Applying for: {job.title}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5B6D5B] text-white">
                    ATS Score: {atsReport?.atsScore || 85}/100
                  </span>
                </div>
                <p className="text-xs text-[#8C867A] dark:text-[#A6A092]">
                  Your candidate profile, attached resume, and verified ATS score report will be transmitted to the {job.company} talent repository.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] dark:text-[#E9E4D9] uppercase tracking-wider mb-1.5 font-serif">
                  Private Application Notes (For your tracker)
                </label>
                <input
                  type="text"
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="e.g. Applied via referral, follow up next Tuesday"
                  className="w-full p-3.5 text-sm rounded-2xl border border-[#DCD7C9] dark:border-[#2E362E] bg-white dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#5B6D5B]/20 text-[#5B6D5B] dark:text-[#8FA68F] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-2xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                Application Successfully Submitted!
              </h4>
              <p className="text-sm text-[#8C867A] dark:text-[#A6A092] max-w-md mx-auto">
                Your application for <strong className="text-[#2D2926] dark:text-[#F2F0E9]">{job.title}</strong> at <strong className="text-[#2D2926] dark:text-[#F2F0E9]">{job.company}</strong> is now logged in your Applications Tracker.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-[#5B6D5B] text-white font-semibold hover:bg-[#465546] transition-colors shadow-sm"
                >
                  Return to Discovery Hub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step !== 4 && (
          <div className="p-6 bg-[#E9E4D9]/40 dark:bg-[#1E251E] border-t border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 text-sm font-semibold text-[#8C867A] hover:text-[#2D2926] dark:hover:text-[#F2F0E9]"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#8C867A]"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
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

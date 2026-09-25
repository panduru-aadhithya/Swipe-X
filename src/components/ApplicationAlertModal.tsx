import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';

interface ApplicationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ALREADY_APPLIED' | 'LOGIN_REQUIRED' | 'ERROR';
  jobTitle?: string;
  companyName?: string;
  customMessage?: string;
}

export const ApplicationAlertModal: React.FC<ApplicationAlertModalProps> = ({
  isOpen,
  onClose,
  type,
  jobTitle,
  companyName,
  customMessage
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 relative">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ALREADY APPLIED */}
        {type === 'ALREADY_APPLIED' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                You have already applied for this job.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {jobTitle && companyName ? (
                  <>Your application for <strong className="text-slate-800 dark:text-slate-200">{jobTitle}</strong> at <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong> is already recorded in your pipeline.</>
                ) : (
                  'Your application for this position is already submitted and saved in your database.'
                )}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/candidate/applications');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>View My Applications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* LOGIN REQUIRED */}
        {type === 'LOGIN_REQUIRED' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Please Log In First
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You must be logged into your SwipeX candidate account to submit job applications and track them in your pipeline.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Log In to Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {type === 'ERROR' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 font-display">
                Submission Failed
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {customMessage || 'Application could not be submitted. Please try again.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

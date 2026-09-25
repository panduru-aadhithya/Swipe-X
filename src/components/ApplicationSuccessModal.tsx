import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Building2, Calendar, Hash, Check } from 'lucide-react';
import { Application, Job, formatApplicationId } from '../types';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  application: Application | null;
}

export const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  isOpen,
  onClose,
  job,
  application
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const displayAppId = formatApplicationId(application);
  const formattedDate = application?.appliedDate
    ? new Date(application.appliedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
            ✓ Application Submitted Successfully
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your application is securely saved in the database and submitted to the hiring team.
          </p>
        </div>

        {/* Application Details Summary Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-left">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              {job.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-violet-500" />
              <span>{job.company}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Application ID:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {displayAppId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied on:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Status:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3 h-3" /> Applied
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/candidate/applications');
            }}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <span>View My Applications</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Continue Browsing Jobs
          </button>
        </div>

      </div>
    </div>
  );
};

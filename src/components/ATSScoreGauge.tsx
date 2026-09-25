import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { ATSReport } from '../types';

interface ATSScoreGaugeProps {
  report: ATSReport;
  compact?: boolean;
}

export const ATSScoreGauge: React.FC<ATSScoreGaugeProps> = ({ report, compact = false }) => {
  const { atsScore, skillScore, keywordScore, experienceScore, educationScore } = report;

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-600 dark:text-emerald-400 stroke-emerald-600 dark:stroke-emerald-400';
    if (val >= 70) return 'text-violet-600 dark:text-violet-400 stroke-violet-600 dark:stroke-violet-400';
    if (val >= 50) return 'text-orange-500 dark:text-orange-400 stroke-orange-500 dark:stroke-orange-400';
    return 'text-rose-500 dark:text-rose-400 stroke-rose-500 dark:stroke-rose-400';
  };

  const getProgressBg = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 70) return 'bg-violet-600';
    if (val >= 50) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div id={`ats-report-${report.id}`} className="bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Header with Circular Score */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(atsScore)}
                strokeDasharray={`${atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black ${getScoreColor(atsScore)} font-display`}>
                {atsScore}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                ATS Compatibility Score
              </h3>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> AI Verified
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Evaluated against industry ATS parsing algorithms, keyword density, and technical requirements.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Swipe X ATS v2.4</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {atsScore >= 80 ? 'High Interview Probability' : atsScore >= 65 ? 'Moderate Match' : 'Optimization Needed'}
          </span>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Skills Overlap (35%)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{skillScore}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(skillScore)}`} style={{ width: `${skillScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Keywords (25%)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{keywordScore}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(keywordScore)}`} style={{ width: `${keywordScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Experience (20%)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{experienceScore}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(experienceScore)}`} style={{ width: `${experienceScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Education (10%)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{educationScore}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(educationScore)}`} style={{ width: `${educationScore}%` }} />
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      {!compact && (
        <div className="py-6 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched skills */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-display font-bold text-slate-900 dark:text-white mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Matched Skills ({report.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {report.matchedSkills.length > 0 ? (
                report.matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No direct skill matches detected</span>
              )}
            </div>
          </div>

          {/* Missing skills */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-display font-bold text-slate-900 dark:text-white mb-3">
              <XCircle className="w-4 h-4 text-rose-500" />
              Missing Skills / Keywords ({report.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {report.missingSkills.length > 0 ? (
                report.missingSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium"
                  >
                    • {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All core job skills matched!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions & Actionable Tips */}
      {!compact && report.suggestions.length > 0 && (
        <div className="pt-6">
          <h4 className="flex items-center gap-2 text-sm font-display font-bold text-slate-900 dark:text-white mb-3">
            <Lightbulb className="w-4 h-4 text-orange-500" />
            AI Resume Improvement Recommendations
          </h4>
          <ul className="space-y-2">
            {report.suggestions.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{report.disclaimer}</span>
      </div>
    </div>
  );
};


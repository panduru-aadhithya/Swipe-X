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
    if (val >= 85) return 'text-[#5B6D5B] dark:text-[#8FA68F] stroke-[#5B6D5B] dark:stroke-[#8FA68F]';
    if (val >= 70) return 'text-[#5A7787] dark:text-[#8BAAB9] stroke-[#5A7787] dark:stroke-[#8BAAB9]';
    if (val >= 50) return 'text-[#C29352] dark:text-[#E0B273] stroke-[#C29352] dark:stroke-[#E0B273]';
    return 'text-[#B86B64] dark:text-[#D48982] stroke-[#B86B64] dark:stroke-[#D48982]';
  };

  const getProgressBg = (val: number) => {
    if (val >= 85) return 'bg-[#5B6D5B]';
    if (val >= 70) return 'bg-[#5A7787]';
    if (val >= 50) return 'bg-[#C29352]';
    return 'bg-[#B86B64]';
  };

  return (
    <div id={`ats-report-${report.id}`} className="bg-white dark:bg-[#252C25] border border-[#DCD7C9] dark:border-[#2E362E] rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header with Circular Score */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E9E4D9] dark:text-[#1E251E]"
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
              <span className={`text-2xl font-black ${getScoreColor(atsScore)} font-serif`}>
                {atsScore}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#8C867A] dark:text-[#A6A092]">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                ATS Compatibility Score
              </h3>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#E9E4D9] dark:bg-[#1E251E] text-[#5B6D5B] dark:text-[#8FA68F] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5B6D5B]" /> AI Verified
              </span>
            </div>
            <p className="text-sm text-[#8C867A] dark:text-[#A6A092] mt-1 max-w-md">
              Evaluated against industry ATS parsing algorithms, keyword density, and technical requirements.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs text-[#8C867A] dark:text-[#A6A092]">
          <span className="font-mono text-[10px]">Model v2.4</span>
          <span className="font-semibold text-[#2D2926] dark:text-[#F2F0E9]">
            {atsScore >= 80 ? 'High Interview Probability' : atsScore >= 65 ? 'Moderate Match' : 'Optimization Needed'}
          </span>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8C867A] dark:text-[#A6A092]">Skills Overlap (35%)</span>
            <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9]">{skillScore}%</span>
          </div>
          <div className="h-2 bg-[#E9E4D9] dark:bg-[#1E251E] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(skillScore)}`} style={{ width: `${skillScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8C867A] dark:text-[#A6A092]">Keywords (25%)</span>
            <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9]">{keywordScore}%</span>
          </div>
          <div className="h-2 bg-[#E9E4D9] dark:bg-[#1E251E] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(keywordScore)}`} style={{ width: `${keywordScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8C867A] dark:text-[#A6A092]">Experience (20%)</span>
            <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9]">{experienceScore}%</span>
          </div>
          <div className="h-2 bg-[#E9E4D9] dark:bg-[#1E251E] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(experienceScore)}`} style={{ width: `${experienceScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#8C867A] dark:text-[#A6A092]">Education (10%)</span>
            <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9]">{educationScore}%</span>
          </div>
          <div className="h-2 bg-[#E9E4D9] dark:bg-[#1E251E] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getProgressBg(educationScore)}`} style={{ width: `${educationScore}%` }} />
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      {!compact && (
        <div className="py-6 border-b border-[#DCD7C9] dark:border-[#2E362E] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched skills */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-serif font-bold text-[#2D2926] dark:text-[#F2F0E9] mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#5B6D5B]" />
              Matched Skills ({report.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {report.matchedSkills.length > 0 ? (
                report.matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border border-[#5B6D5B]/30 font-medium"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#8C867A]">No direct skill matches detected</span>
              )}
            </div>
          </div>

          {/* Missing skills */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-serif font-bold text-[#2D2926] dark:text-[#F2F0E9] mb-3">
              <XCircle className="w-4 h-4 text-[#B86B64]" />
              Missing Skills / Keywords ({report.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {report.missingSkills.length > 0 ? (
                report.missingSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#B86B64]/15 text-[#B86B64] dark:text-[#D48982] border border-[#B86B64]/30 font-medium"
                  >
                    • {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#5B6D5B] dark:text-[#8FA68F] font-medium">All core job skills matched!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions & Actionable Tips */}
      {!compact && report.suggestions.length > 0 && (
        <div className="pt-6">
          <h4 className="flex items-center gap-2 text-sm font-serif font-bold text-[#2D2926] dark:text-[#F2F0E9] mb-3">
            <Lightbulb className="w-4 h-4 text-[#C29352]" />
            AI Resume Improvement Recommendations
          </h4>
          <ul className="space-y-2">
            {report.suggestions.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2D2926] dark:text-[#E9E4D9] bg-[#E9E4D9]/40 dark:bg-[#1E251E] p-3.5 rounded-2xl border border-[#DCD7C9] dark:border-[#2E362E]">
                <span className="w-5 h-5 rounded-full bg-[#C29352]/20 text-[#C29352] dark:text-[#E0B273] font-bold flex items-center justify-center shrink-0 text-xs">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-[#DCD7C9] dark:border-[#2E362E] flex items-start gap-2 text-[11px] text-[#8C867A] dark:text-[#A6A092]">
        <AlertTriangle className="w-3.5 h-3.5 text-[#8C867A] shrink-0 mt-0.5" />
        <span>{report.disclaimer}</span>
      </div>
    </div>
  );
};

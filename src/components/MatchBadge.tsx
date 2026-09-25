import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  let colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  let badgeIcon = <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;

  if (score >= 90) {
    colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    badgeIcon = <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  } else if (score >= 75) {
    colorClass = 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800/60';
    badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
  } else if (score >= 60) {
    colorClass = 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';
    badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />;
  } else {
    colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1 font-semibold',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5 font-bold',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-black'
  };

  return (
    <span
      id={`match-badge-${score}`}
      className={`inline-flex items-center rounded-full border shadow-2xs font-display tracking-tight ${colorClass} ${sizeClasses[size]}`}
    >
      {badgeIcon}
      <span>{score}%</span>
      {showLabel && <span className="text-[11px] uppercase tracking-wider font-semibold opacity-90">Match</span>}
    </span>
  );
};


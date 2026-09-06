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
  let colorClass = 'bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border-[#5B6D5B]/40';
  let badgeIcon = <Sparkles className="w-3.5 h-3.5 text-[#5B6D5B] dark:text-[#8FA68F]" />;

  if (score >= 90) {
    colorClass = 'bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border-[#5B6D5B]/40';
    badgeIcon = <Sparkles className="w-3.5 h-3.5 text-[#5B6D5B] dark:text-[#8FA68F]" />;
  } else if (score >= 75) {
    colorClass = 'bg-[#5A7787]/15 text-[#5A7787] dark:text-[#8BAAB9] border-[#5A7787]/40';
    badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-[#5A7787] dark:text-[#8BAAB9]" />;
  } else if (score >= 60) {
    colorClass = 'bg-[#C29352]/15 text-[#C29352] dark:text-[#E0B273] border-[#C29352]/40';
    badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-[#C29352] dark:text-[#E0B273]" />;
  } else {
    colorClass = 'bg-[#B86B64]/15 text-[#B86B64] dark:text-[#D48982] border-[#B86B64]/40';
    badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-[#B86B64] dark:text-[#D48982]" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span
      id={`match-badge-${score}`}
      className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClasses[size]}`}
    >
      {badgeIcon}
      <span>{score}%</span>
      {showLabel && <span className="text-xs font-medium opacity-85">Match</span>}
    </span>
  );
};

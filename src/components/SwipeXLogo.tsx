import React from 'react';

export interface SwipeXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  textClassName?: string;
}

export const SwipeXLogo: React.FC<SwipeXLogoProps> = ({ 
  size = 'md', 
  showText = true,
  showSubtitle = true,
  className = '',
  textClassName = ''
}) => {
  // Dimension resolver for the icon badge
  const getDimensions = () => {
    if (typeof size === 'number') {
      return {
        box: `w-[${size}px] h-[${size}px]`,
        style: { width: `${size}px`, height: `${size}px` },
        text: size >= 40 ? 'text-2xl' : size >= 32 ? 'text-xl' : 'text-base',
        iconSize: Math.round(size * 0.65)
      };
    }
    switch (size) {
      case 'sm':
        return { box: 'w-7 h-7', style: undefined, text: 'text-base', iconSize: 18 };
      case 'lg':
        return { box: 'w-11 h-11', style: undefined, text: 'text-2xl', iconSize: 26 };
      case 'xl':
        return { box: 'w-14 h-14', style: undefined, text: 'text-3xl', iconSize: 34 };
      case 'md':
      default:
        return { box: 'w-9 h-9', style: undefined, text: 'text-xl', iconSize: 22 };
    }
  };

  const dim = getDimensions();

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Swipe X Distinctive Dual-Card & X Spark Icon */}
      <div 
        className={`relative ${dim.box} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 p-[1.5px] shadow-md shrink-0 group transition-transform duration-200 group-hover:scale-105`}
        style={dim.style}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/20" />
          
          <svg 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="relative z-10 drop-shadow-sm"
            style={{ width: `${dim.iconSize}px`, height: `${dim.iconSize}px` }}
          >
            <defs>
              <linearGradient id="cardGrad1" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="cardGrad2" x1="10" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#9333EA" />
              </linearGradient>
            </defs>

            {/* Background angled card */}
            <rect 
              x="6" 
              y="9" 
              width="18" 
              height="22" 
              rx="4" 
              transform="rotate(-12 6 9)" 
              fill="url(#cardGrad1)" 
              opacity="0.6" 
            />

            {/* Foreground card */}
            <rect 
              x="11" 
              y="7" 
              width="18" 
              height="23" 
              rx="4" 
              fill="#0F172A" 
              stroke="url(#cardGrad2)" 
              strokeWidth="2" 
            />

            {/* Signature 'X' mark inside card */}
            <path 
              d="M16 14 L24 23 M24 14 L16 23" 
              stroke="#F8FAFC" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Vibrant green match spark */}
            <circle cx="26" cy="11" r="2.2" fill="#10B981" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark (Swipe X) */}
      {showText && (
        <div className={`flex flex-col ${textClassName}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${dim.text} font-serif`}>
              Swipe
            </span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-xl sm:text-2xl font-serif">
              X
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold tracking-tight uppercase">
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mt-0.5">
              Job Opportunities
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Unified exports
export const OrionLogo = SwipeXLogo;


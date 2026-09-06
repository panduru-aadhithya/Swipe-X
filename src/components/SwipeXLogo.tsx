import React from 'react';

export interface SwipeXLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const SwipeXLogo: React.FC<SwipeXLogoProps> = ({ 
  size = 'md', 
  showText = true,
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
        iconSize: Math.round(size * 0.6)
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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Aerodynamic SwipeX Monogram Badge */}
      <div 
        className={`relative ${dim.box} rounded-xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0A0E1A] p-[1.5px] shadow-sm shrink-0 group transition-transform duration-200 group-hover:scale-105`}
        style={dim.style}
      >
        {/* Ambient Gradient Outer Rim */}
        <div className="absolute -inset-[0.5px] rounded-xl bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-cyan-400/30 opacity-70 group-hover:opacity-100 transition-opacity blur-[0.5px]" />

        <div className="w-full h-full rounded-[10px] bg-[#0A0E1A] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Top-Down Radial Sheen */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.28),transparent_70%)]" />
          
          {/* Bespoke Geometric SwipeX Icon */}
          <svg 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="relative z-10 drop-shadow-[0_1px_4px_rgba(99,102,241,0.35)]"
            style={{ width: `${dim.iconSize}px`, height: `${dim.iconSize}px` }}
          >
            <defs>
              {/* Primary Forward Swipe Gradient (Electric Indigo to Vivid Cyan) */}
              <linearGradient id="swipePrimaryGrad" x1="6" y1="30" x2="30" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="45%" stopColor="#6366F1" />
                <stop offset="80%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#E0F2FE" />
              </linearGradient>

              {/* Intersecting Velocity Stroke Gradient (Violet to Indigo) */}
              <linearGradient id="swipeCrossGrad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="40%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>

              {/* Central Kinetic Flare */}
              <radialGradient id="sparkGlow" cx="18" cy="18" r="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Back ambient pulse */}
            <circle cx="18" cy="18" r="6" fill="url(#sparkGlow)" opacity="0.6" />

            {/* Path 1: Primary Ascending Swipe Trail (Bottom-Left to Top-Right) */}
            {/* Aerodynamic blade with motion curvature */}
            <path
              d="M7.5 28.5 C9.8 28.5 13.5 24.5 18 18 C22.5 11.5 26.2 7.5 28.5 7.5"
              stroke="url(#swipePrimaryGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 2: Intersecting Descending Blade (Top-Left to Center Gap) */}
            <path
              d="M7.5 7.5 C9.8 7.5 12.8 10.8 15 14"
              stroke="url(#swipeCrossGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 3: Intersecting Blade Continuation (Center Gap to Bottom-Right) */}
            <path
              d="M21 22 C23.2 25.2 26.2 28.5 28.5 28.5"
              stroke="url(#swipeCrossGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dynamic Kinetic Motion Sparks on the X */}
            <circle cx="28.5" cy="7.5" r="1.5" fill="#38BDF8" />
            <circle cx="7.5" cy="7.5" r="1.2" fill="#C084FC" />
            <circle cx="18" cy="18" r="1.6" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark (Clean "SwipeX", with "SaaS" removed) */}
      {showText && (
        <div className={`flex items-baseline tracking-tight ${textClassName}`}>
          <span className={`font-black text-slate-900 dark:text-white ${dim.text} font-serif tracking-tight`}>
            Swipe
          </span>
          <span className={`font-black ${dim.text} font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-cyan-400 ml-0.5 drop-shadow-xs`}>
            X
          </span>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility export
export const OrionLogo = SwipeXLogo;

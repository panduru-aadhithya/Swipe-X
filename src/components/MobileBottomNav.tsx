import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Flame,
  LayoutDashboard,
  Sparkles,
  FileCheck, 
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const items = [
    {
      to: '/candidate/explore',
      label: 'Jobs',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      to: '/candidate/swipe',
      label: 'Swipe',
      icon: <Flame className="w-5 h-5 text-indigo-500" />
    },
    {
      to: '/candidate/applications',
      label: 'Applied',
      icon: <Briefcase className="w-5 h-5 text-emerald-500" />
    },
    {
      to: '/candidate/ats',
      label: 'ATS Scanner',
      icon: <FileCheck className="w-5 h-5 text-teal-500" />
    },
    {
      to: '/candidate/saved-jobs',
      label: 'Saved',
      icon: <Bookmark className="w-5 h-5 text-rose-500" />
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/40'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            <span className="text-[11px] font-medium tracking-tight mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Flame, 
  LayoutDashboard, 
  FileCheck, 
  Bookmark, 
  Settings, 
  Users, 
  Compass,
  History,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeRole, switchRole } = useAuth();

  const candidateSections = [
    {
      title: 'Opportunities',
      items: [
        {
          to: '/candidate/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" />
        },
        {
          to: '/candidate/swipe',
          label: 'AI Match Deck',
          icon: <Flame className="w-4 h-4 text-violet-500" />
        },
        {
          to: '/candidate/swipe-history',
          label: 'Swipe History',
          icon: <History className="w-4 h-4 text-orange-500" />
        },
        {
          to: '/candidate/explore',
          label: 'Job Directory',
          icon: <Compass className="w-4 h-4 text-violet-500" />
        },
        {
          to: '/candidate/applications',
          label: 'Applications',
          icon: <Briefcase className="w-4 h-4 text-emerald-500" />
        },
        {
          to: '/candidate/saved-jobs',
          label: 'Saved Roles',
          icon: <Bookmark className="w-4 h-4 text-amber-500" />
        },
        {
          to: '/candidate/ats',
          label: 'Resume ATS Scanner',
          icon: <FileCheck className="w-4 h-4 text-teal-500" />
        }
      ]
    }
  ];

  const recruiterSections = [
    {
      title: 'Recruiter Studio',
      items: [
        {
          to: '/recruiter',
          label: 'Post a Job',
          icon: <PlusCircle className="w-4 h-4 text-purple-500" />
        },
        {
          to: '/recruiter?tab=applications',
          label: 'Received Applications',
          icon: <Users className="w-4 h-4 text-indigo-500" />
        }
      ]
    }
  ];

  const sections = activeRole === 'RECRUITER' 
    ? recruiterSections 
    : candidateSections;

  return (
    <aside className="w-72 xl:w-80 shrink-0 hidden lg:flex flex-col justify-between py-8 pr-8 xl:pr-10 border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-5rem)]">
      <div className="space-y-8">
        
        {/* Navigation Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 font-display">
              {section.title}
            </span>

            <nav className="space-y-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        {/* Portal View Switcher */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4">
            Portal Mode
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchRole('CANDIDATE')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                activeRole === 'CANDIDATE'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => switchRole('RECRUITER')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                activeRole === 'RECRUITER'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Recruiter
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile Settings Link */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        <NavLink
          to="/candidate/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

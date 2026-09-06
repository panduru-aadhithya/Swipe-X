import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Flame, 
  LayoutDashboard, 
  FileCheck, 
  Bookmark, 
  TrendingUp, 
  Settings, 
  Users, 
  ShieldCheck,
  Compass,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeRole, switchRole } = useAuth();

  const candidateSections = [
    {
      title: 'Opportunities',
      items: [
        {
          to: '/candidate/explore',
          label: 'Job Directory',
          icon: <Compass className="w-4 h-4 text-indigo-500" />
        },
        {
          to: '/candidate/swipe',
          label: 'AI Match Deck',
          icon: <Flame className="w-4 h-4 text-emerald-500" />
        },
        {
          to: '/candidate/swipe-history',
          label: 'Swipe History',
          icon: <History className="w-4 h-4 text-purple-500" />
        },
        {
          to: '/candidate/applications',
          label: 'Applications',
          icon: <LayoutDashboard className="w-4 h-4 text-amber-500" />
        },
        {
          to: '/candidate/saved-jobs',
          label: 'Saved Roles',
          icon: <Bookmark className="w-4 h-4 text-rose-500" />
        }
      ]
    },
    {
      title: 'Career Tools',
      items: [
        {
          to: '/candidate/interview',
          label: 'Mock Interview AI',
          icon: <Sparkles className="w-4 h-4 text-purple-500" />
        },
        {
          to: '/candidate/ats',
          label: 'Resume ATS Scanner',
          icon: <FileCheck className="w-4 h-4 text-blue-500" />
        },
        {
          to: '/candidate/dashboard',
          label: 'Career Insights',
          icon: <TrendingUp className="w-4 h-4 text-cyan-500" />
        }
      ]
    }
  ];

  const recruiterSections = [
    {
      title: 'Hiring Hub',
      items: [
        {
          to: '/recruiter',
          label: 'Candidates Pipeline',
          icon: <Users className="w-4 h-4 text-purple-500" />
        },
        {
          to: '/recruiter/dashboard',
          label: 'Job Postings',
          icon: <Briefcase className="w-4 h-4 text-indigo-500" />
        },
        {
          to: '/candidate/explore',
          label: 'Market Catalog',
          icon: <Compass className="w-4 h-4 text-emerald-500" />
        }
      ]
    }
  ];

  const adminSections = [
    {
      title: 'Administration',
      items: [
        {
          to: '/admin',
          label: 'System Dashboard',
          icon: <ShieldCheck className="w-4 h-4 text-rose-500" />
        },
        {
          to: '/admin/dashboard',
          label: 'System Analytics',
          icon: <TrendingUp className="w-4 h-4 text-indigo-500" />
        },
        {
          to: '/candidate/explore',
          label: 'Job Catalog',
          icon: <Compass className="w-4 h-4 text-emerald-500" />
        }
      ]
    }
  ];

  const sections = activeRole === 'RECRUITER' 
    ? recruiterSections 
    : activeRole === 'ADMIN' 
    ? adminSections 
    : candidateSections;

  return (
    <aside className="w-72 xl:w-80 shrink-0 hidden lg:flex flex-col justify-between py-8 pr-8 xl:pr-10 border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-5rem)]">
      <div className="space-y-8">
        
        {/* Navigation Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4">
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
                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
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

        {/* Real-time Insights Card */}
        {activeRole === 'CANDIDATE' && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-white dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Swipe X Match Index
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                94% Fit
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[94%]" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              30% faster discovery calibrated from your skill preferences.
            </p>
          </div>
        )}

        {/* Portal View Switcher */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4">
            Portal Mode
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchRole('CANDIDATE')}
              className={`py-2 rounded-xl transition-all ${
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
              className={`py-2 rounded-xl transition-all ${
                activeRole === 'RECRUITER'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => switchRole('ADMIN')}
              className={`py-2 rounded-xl transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
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
                ? 'bg-indigo-600 text-white shadow-xs'
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

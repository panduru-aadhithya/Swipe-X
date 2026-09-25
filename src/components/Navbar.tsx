import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Monitor, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Flame,
  FileCheck,
  Bookmark,
  Briefcase,
  Search,
  Globe,
  Bell,
  Settings,
  ShieldCheck,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationApi } from '../api';
import { NotificationsModal } from './NotificationsModal';

import { SwipeXLogo } from './SwipeXLogo';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout, activeRole, switchRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [navSearch, setNavSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi.getNotifications()
        .then(res => setUnreadCount(res.unreadCount))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/candidate/explore?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/candidate/explore');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md transition-colors">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-20 flex items-center justify-between gap-6 sm:gap-8">
          
          {/* Left: Brand Logo (Swipe X) */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to={isAuthenticated ? (activeRole === 'RECRUITER' ? '/recruiter' : '/candidate/swipe') : '/'} className="group">
              <SwipeXLogo size="md" />
            </Link>
          </div>

            {/* Center: Search Bar */}
          {isAuthenticated && (
            <form
              onSubmit={handleGlobalSearch}
              className="hidden md:flex items-center flex-1 max-w-lg mx-8 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full px-5 py-2.5 shadow-2xs gap-3 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="global-search-input"
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch('')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </form>
          )}

          {/* Right Section: Theme, Notifications, Settings, Profile & Sign Out */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={cycleTheme}
              title={`Current theme: ${theme}. Click to switch.`}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Monitor className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen(true)}
                    title="Notifications"
                    className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs relative cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Profile */}
                <Link
                  to="/candidate/profile"
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:inline">
                    {profile?.name || user?.name || 'My Profile'}
                  </span>
                </Link>

                {/* Sign Out Button */}
                <button
                  id="btn-logout"
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-rose-200 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-all text-xs font-semibold shadow-2xs shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 lg:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2A] space-y-3">
            {isAuthenticated ? (
              <div className="space-y-2 text-xs font-medium">
                {/* Mobile Role Switcher */}
                <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 mb-3">
                  <button
                    onClick={() => { switchRole('CANDIDATE'); setIsMobileMenuOpen(false); navigate('/candidate/swipe'); }}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold ${activeRole === 'CANDIDATE' ? 'bg-white dark:bg-[#0B1120] text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Candidate
                  </button>
                  <button
                    onClick={() => { switchRole('RECRUITER'); setIsMobileMenuOpen(false); navigate('/recruiter'); }}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold ${activeRole === 'RECRUITER' ? 'bg-white dark:bg-[#0B1120] text-purple-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Recruiter
                  </button>
                </div>

                <Link to="/candidate/swipe" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 font-bold">
                  ⚡ AI Match Deck
                </Link>
                <Link to="/candidate/applications" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Applications Tracker
                </Link>
                <Link to="/candidate/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Dashboard
                </Link>
                <Link to="/candidate/explore" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Jobs / Market Explorer
                </Link>
                <Link to="/candidate/swipe-history" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Interaction History
                </Link>
                <Link to="/recruiter" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 font-bold">
                  💼 Recruiter Studio & Applications
                </Link>
                <Link to="/candidate/ats" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold">
                  📄 Resume ATS Scanner
                </Link>
                <Link to="/candidate/resume" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  My Resumes & AI
                </Link>
                <Link to="/candidate/saved-jobs" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Saved Roles
                </Link>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs text-center block">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs text-center block">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};

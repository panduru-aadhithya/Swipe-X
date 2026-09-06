import React from 'react';
import { Settings, Sun, Moon, Monitor, Sparkles, Database, Shield, CheckCircle2 } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#5B6D5B]" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#8C867A] mt-0.5">
          Customize your visual appearance, AI matching models, and account parameters.
        </p>
      </div>

      {/* Visual Theme */}
      <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
            Visual Appearance
          </h3>
          <p className="text-xs text-[#8C867A]">
            Choose light mode, dark mode, or follow your operating system settings.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'light'
                ? 'border-[#5B6D5B] bg-[#5B6D5B]/10 text-[#5B6D5B] dark:text-[#8FA68F] ring-2 ring-[#5B6D5B]/30'
                : 'border-[#DCD7C9] dark:border-[#2E362E] text-[#8C867A] hover:bg-[#E9E4D9]/40'
            }`}
          >
            <Sun className="w-5 h-5 text-[#C29352]" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'border-[#5B6D5B] bg-[#5B6D5B]/10 text-[#5B6D5B] dark:text-[#8FA68F] ring-2 ring-[#5B6D5B]/30'
                : 'border-[#DCD7C9] dark:border-[#2E362E] text-[#8C867A] hover:bg-[#E9E4D9]/40'
            }`}
          >
            <Moon className="w-5 h-5 text-[#5B6D5B]" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'system'
                ? 'border-[#5B6D5B] bg-[#5B6D5B]/10 text-[#5B6D5B] dark:text-[#8FA68F] ring-2 ring-[#5B6D5B]/30'
                : 'border-[#DCD7C9] dark:border-[#2E362E] text-[#8C867A] hover:bg-[#E9E4D9]/40'
            }`}
          >
            <Monitor className="w-5 h-5 text-[#8C867A]" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* AI Model Information */}
      <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#5B6D5B]" />
            AI Intelligence Engines
          </h3>
          <p className="text-xs text-[#8C867A]">
            Powered by Google DeepMind's Gemini models with server-side telemetry.
          </p>
        </div>

        <div className="space-y-3 text-xs text-[#8C867A]">
          <div className="p-3.5 rounded-2xl bg-[#E9E4D9]/30 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between">
            <div>
              <strong className="text-[#2D2926] dark:text-[#F2F0E9] block font-bold font-serif">Resume Parsing Engine</strong>
              <span className="text-[#8C867A]">Model: gemini-3.7-flash (JSON Mode & fallback heuristics)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-bold">Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E9E4D9]/30 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between">
            <div>
              <strong className="text-[#2D2926] dark:text-[#F2F0E9] block font-bold font-serif">ATS Scoring Engine</strong>
              <span className="text-[#8C867A]">Algorithm: Multi-Factor Weighted Matrix (35% Skills / 25% Keywords / 20% Exp / 10% Edu / 10% Title)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-bold">Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E9E4D9]/30 dark:bg-[#1E251E] border border-[#DCD7C9] dark:border-[#2E362E] flex items-center justify-between">
            <div>
              <strong className="text-[#2D2926] dark:text-[#F2F0E9] block font-bold font-serif">Behavioral Feedback Loop</strong>
              <span className="text-[#8C867A]">Dynamically tracks swipe signals to boost/penalize role attributes</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Dataset & Storage Engine */}
      <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
          <Database className="w-5 h-5 text-[#5B6D5B]" />
          Persistence Layer
        </h3>
        <p className="text-xs text-[#8C867A]">
          Candidate profiles, resumes, ATS reports, saved bookmarks, and submitted applications are saved in local JSON persistence (<code className="font-mono">/data/db.json</code>).
        </p>
      </div>
    </div>
  );
};

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
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2 tracking-tight">
          <Settings className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your visual appearance, AI matching models, and account parameters.
        </p>
      </div>

      {/* Visual Theme */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
            Visual Appearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose light mode, dark mode, or follow your operating system settings.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all cursor-pointer font-display ${
              theme === 'light'
                ? 'border-violet-600 bg-violet-50 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Sun className="w-5 h-5 text-orange-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all cursor-pointer font-display ${
              theme === 'dark'
                ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Moon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all cursor-pointer font-display ${
              theme === 'system'
                ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-500" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* AI Model Information */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            AI Intelligence Engines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Google DeepMind's Gemini models with server-side telemetry.
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold font-display">Resume Parsing Engine</strong>
              <span className="text-slate-500 dark:text-slate-400">Model: gemini-2.5-flash (Structured JSON schema & deterministic heuristics)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 font-mono">Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold font-display">ATS Scoring Engine</strong>
              <span className="text-slate-500 dark:text-slate-400">Algorithm: Multi-Factor Weighted Matrix (35% Skills / 25% Keywords / 20% Exp / 10% Edu / 10% Title)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 font-mono">Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">Swipe X Feedback Signal Loop</strong>
              <span className="text-slate-500 dark:text-slate-400">Dynamically tracks swipe signals to boost/penalize role attributes</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 font-mono">Active</span>
          </div>
        </div>
      </div>

      {/* Dataset & Storage Engine */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Database className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Persistence Layer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Candidate profiles, resumes, ATS reports, saved bookmarks, and submitted applications are saved in local persistence (<code className="font-mono text-violet-600 dark:text-violet-400">/data/db.json</code>).
        </p>
      </div>
    </div>
  );
};

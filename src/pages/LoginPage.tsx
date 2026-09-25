import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SwipeXLogo } from '../components/SwipeXLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Invalid email or password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await login({ email: email.trim(), password });
      if (!result?.hasActiveResume) {
        navigate('/candidate/resume?promptUpload=true');
      } else {
        navigate('/candidate/explore');
      }
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('is not valid json') ||
        msg.includes('unexpected token') ||
        msg.includes('parse_error') ||
        msg.includes('invalid') ||
        msg.includes('credential') ||
        msg.includes('not found') ||
        msg.includes('required') ||
        err?.code === 'INVALID_CREDENTIALS' ||
        err?.code === 'VALIDATION_ERROR'
      ) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#151D2A] p-8 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SwipeXLogo size={48} showText={false} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Welcome back to SwipeX
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to discover verified tech roles tailored to your skills & ATS profile.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 font-display">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 font-display">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer font-display"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to SwipeX'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:underline font-display">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

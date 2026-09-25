import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileCheck, 
  Bookmark, 
  Briefcase, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Layers,
  ChevronRight,
  Mic,
  Zap,
  Building2,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';
import { MatchBadge } from '../components/MatchBadge';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await profileApi.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-7 pb-12 -mt-5 sm:-mt-8">
      
      {/* Welcome Banner - Modern SaaS Header (Blue Card elevated upward) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F1E36] via-[#1E293B] to-[#1E1B4B] p-6 sm:p-8 text-white border border-blue-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Swipe X — Centralized Career Platform</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {profile?.name || 'Candidate'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We’ve benchmarked <strong className="text-white font-bold">{summary?.recommendedJobsCount || 0} opportunities</strong> matching your targeted profile as a <strong className="text-blue-300 font-semibold">{profile?.preferredRole || 'Candidate'}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/candidate/explore"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <Briefcase className="w-4 h-4" /> Discover Opportunities
            </Link>

            <Link
              to="/candidate/ats"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 backdrop-blur-md shadow-sm transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-emerald-300" /> Resume ATS Scanner
            </Link>
          </div>
        </div>
      </div>

      {/* Mandatory Resume Upload Prompt Banner (When user has no active resume) */}
      {summary?.hasActiveResume === false && (
        <div className="p-5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Action Required: Upload Your Resume</p>
              <p className="text-xs text-blue-100">
                To receive authentic ATS evaluations and accurate job recommendations without default placeholders, please upload your resume.
              </p>
            </div>
          </div>
          <Link
            to="/candidate/resume?promptUpload=true"
            className="shrink-0 px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-sm transition-colors"
          >
            Upload Resume Now →
          </Link>
        </div>
      )}

      {/* Primary Key Metric Tiles (Modern SaaS style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* ATS Readiness Score */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-display">
            <span>ATS Compatibility</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          {summary?.atsScore !== null && summary?.atsScore !== undefined ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                {summary.atsScore}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">/ 100</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500 font-display">
                Not Evaluated
              </span>
              <Link to="/candidate/resume?promptUpload=true" className="block text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                Upload resume to scan →
              </Link>
            </div>
          )}
          <p className="text-xs text-slate-500">Benchmark against recruiter filters</p>
        </div>

        {/* Recommended Matches */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-display">
            <span>Verified Jobs</span>
            <Layers className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              {summary?.recommendedJobsCount || 1048}
            </span>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Verified</span>
          </div>
          <p className="text-xs text-slate-500">Live indexed from industry leaders</p>
        </div>

        {/* Saved Roles */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-display">
            <span>Saved Roles</span>
            <Bookmark className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              {summary?.savedJobsCount || 0}
            </span>
            <span className="text-xs text-slate-500">Bookmarked</span>
          </div>
          <Link to="/candidate/saved-jobs" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline block">
            View saved roles →
          </Link>
        </div>

        {/* Applications Submitted */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider font-display">
            <span>Active Pipeline</span>
            <Briefcase className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              {summary?.applicationsCount || 0}
            </span>
            <span className="text-xs text-violet-600 dark:text-violet-400">Applications</span>
          </div>
          <Link to="/candidate/applications" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline block">
            Track pipeline →
          </Link>
        </div>
      </div>

      {/* Top Ranked Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Top Ranked Opportunities For You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized matches ranked by skills alignment, location preference, and compensation.
            </p>
          </div>

          <Link
            to="/candidate/explore"
            className="text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            Explore All Openings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary?.topRecommendations?.map((rec: any) => (
            <div
              key={rec.job.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-violet-400/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm">
                      {rec.job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                        {rec.job.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{rec.job.company}</span>
                        <span>•</span>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{rec.job.location} ({rec.job.workType})</span>
                      </p>
                    </div>
                  </div>
                  <MatchBadge score={rec.matchScore} size="sm" />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.job.extractedSkills.slice(0, 4).map((s: string, idx: number) => (
                    <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-mono font-medium">
                  {rec.job.salaryMin && rec.job.salaryMax ? `$${(rec.job.salaryMin/1000).toFixed(0)}k - $${(rec.job.salaryMax/1000).toFixed(0)}k` : 'Competitive'}
                </span>
                <Link
                  to={`/candidate/jobs/${rec.job.id}`}
                  className="font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  Inspect & Apply <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

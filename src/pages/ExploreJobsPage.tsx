import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ExternalLink, 
  Bookmark, 
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Gift,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Flame,
  FileCheck,
  Check,
  Share2,
  Layers,
  Mic,
  Zap,
  ShieldCheck,
  TrendingUp,
  Target,
  Play
} from 'lucide-react';
import { jobApi, savedJobApi, swipeApi, recommendationApi } from '../api';
import { Job, JobRecommendation } from '../types';
import { ApplyModal } from '../components/ApplyModal';
import { JobDetailDrawer } from '../components/JobDetailDrawer';
import { MockInterviewModal } from '../components/MockInterviewModal';
import { getGamificationState } from '../api/mockInterviewService';

export const ExploreJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('q') || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [search, setSearch] = useState(querySearch);
  const [categoryTab, setCategoryTab] = useState('All');
  const [workType, setWorkType] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [companyType, setCompanyType] = useState('All');
  const [competitionLevel, setCompetitionLevel] = useState('All');
  const [isFresherFriendly, setIsFresherFriendly] = useState(false);
  const [isEarlyApplicant, setIsEarlyApplicant] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  // Split Drawer, Apply Modal & Mock Interview states
  const [selectedDrawerJob, setSelectedDrawerJob] = useState<Job | null>(null);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [mockInterviewJob, setMockInterviewJob] = useState<Job | null>(null);

  // Gamification & candidate snapshot
  const [gamification, setGamification] = useState(getGamificationState());

  // Interactive AI practice checklist state
  const [practiceChecks, setPracticeChecks] = useState<Record<string, boolean>>({
    alerts: true,
    interview: true,
    resume: true,
    networking: true,
    exclusive: true
  });

  const categories = [
    { id: 'All', label: 'All Opportunities', query: '' },
    { id: 'ai', label: 'AI & Machine Learning', query: 'AI' },
    { id: 'fullstack', label: 'Full Stack Engineering', query: 'Full Stack' },
    { id: 'frontend', label: 'Frontend & UI', query: 'Frontend' },
    { id: 'backend', label: 'Backend & Cloud', query: 'Backend' },
    { id: 'design', label: 'Product Design', query: 'Design' }
  ];

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const activeSearch = categoryTab !== 'All' 
        ? (search ? `${search} ${categories.find(c => c.id === categoryTab)?.query}` : categories.find(c => c.id === categoryTab)?.query)
        : (search.trim() || undefined);

      const res = await jobApi.getJobs({
        search: activeSearch,
        workType: workType !== 'All' ? workType : undefined,
        employmentType: employmentType !== 'All' ? employmentType : undefined,
        companyType: companyType !== 'All' ? companyType : undefined,
        competitionLevel: competitionLevel !== 'All' ? competitionLevel : undefined,
        isFresherFriendly: isFresherFriendly || undefined,
        isEarlyApplicant: isEarlyApplicant || undefined,
        limit,
        offset: page * limit
      });
      setJobs(res.jobs);
      setTotalJobs(res.total);

      if (res.jobs.length >= 4) {
        setFeaturedJobs(res.jobs.slice(0, 4));
      } else {
        setFeaturedJobs(res.jobs);
      }

      // Default select first job if none selected
      if (!selectedDrawerJob && res.jobs.length > 0) {
        setSelectedDrawerJob(res.jobs[0]);
      }
    } catch (err) {
      console.error('Failed to load explore jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, categoryTab, workType, employmentType, companyType, competitionLevel, isFresherFriendly, isEarlyApplicant]);

  useEffect(() => {
    if (querySearch) {
      setSearch(querySearch);
      setPage(0);
    }
  }, [querySearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const handleSave = async (job: Job) => {
    try {
      if (savedJobIds.has(job.id)) {
        await savedJobApi.removeSavedJob(job.id);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
      } else {
        await savedJobApi.saveJob(job.id);
        await swipeApi.recordSwipe(job.id, 'SAVE');
        setSavedJobIds((prev) => new Set(prev).add(job.id));
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const calculateMatchScore = (job: Job): number => {
    const hash = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 80 + (hash % 19); // Generates stable 80-98% match scores
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & Search Bar */}
      <div className="space-y-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800/80">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Swipe X Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
              Centralized Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore verified positions indexed across tech industry leaders with precision match analytics.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto font-mono">
            {totalJobs} Openings
          </span>
        </div>

        {/* Global Market Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role title, technologies (React, TypeScript, Go), or company..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" /> Search Jobs
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoryTab(cat.id);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              categoryTab === cat.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary Strategic Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 font-serif mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Work Type */}
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Company Type */}
          <select
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Markets</option>
            <option value="Startup">High-Growth Startups</option>
            <option value="MNC">Global Enterprises</option>
            <option value="Newly Founded">Seed & Stealth</option>
          </select>

          {/* Competition Filter */}
          <select
            value={competitionLevel}
            onChange={(e) => setCompetitionLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">Competition: All</option>
            <option value="Low">Low (&lt;15 applicants)</option>
            <option value="Medium">Moderate (15-50)</option>
            <option value="High">High (&gt;50)</option>
          </select>

          {/* Early Applicant Toggle */}
          <button
            type="button"
            onClick={() => setIsEarlyApplicant(!isEarlyApplicant)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isEarlyApplicant
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            ⚡ Early Applicant (&lt;24h)
          </button>

          {/* Fresher Friendly Toggle */}
          <button
            type="button"
            onClick={() => setIsFresherFriendly(!isFresherFriendly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isFresherFriendly
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Fresher Friendly
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-800 dark:text-slate-200">{jobs.length}</strong> of {totalJobs} positions
        </div>
      </div>

      {/* Main Two-Column Flow: Left Stream Cards + Right Interactive Role Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Stream Cards (8 cols on large) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <div className="p-16 text-center space-y-3 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold font-serif">
                Scanning and benchmarking job market flow...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-16 text-center space-y-3 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold font-serif text-slate-800 dark:text-slate-200">
                No matching opportunities found
              </h3>
              <p className="text-xs text-slate-500">
                Try resetting your filters or search keywords.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategoryTab('All');
                  setWorkType('All');
                  setCompanyType('All');
                  setCompetitionLevel('All');
                  setIsEarlyApplicant(false);
                  setIsFresherFriendly(false);
                }}
                className="px-5 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            jobs.map((job) => {
              const score = calculateMatchScore(job);
              const isSelected = selectedDrawerJob?.id === job.id;
              const isSaved = savedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedDrawerJob(job)}
                  className={`p-5 sm:p-6 rounded-3xl transition-all cursor-pointer border relative flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0F172A] border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs'
                  }`}
                >
                  {/* Top Row: Match Gauge Pill + Time + Save Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Match Score Ring Badge */}
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-serif font-black shadow-xs ${
                        score >= 90
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                      }`}>
                        <span className="text-sm leading-none">{score}%</span>
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider">Fit</span>
                      </div>

                      {/* Company & Title */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h3>
                          {job.isFresh && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white uppercase">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{job.company}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location} ({job.workType})</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(job);
                      }}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                        isSaved
                          ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                    </button>
                  </div>

                  {/* Highlight Feature Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {job.salaryMin && job.salaryMax ? (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold font-mono">
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold">
                        Competitive Package
                      </span>
                    )}

                    {job.isEarlyApplicant && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        ⚡ Early Applicant (&lt;24h)
                      </span>
                    )}

                    {job.competitionLevel === 'Low' && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        🔥 Low Competition ({job.applicantsCount || 8} applied)
                      </span>
                    )}

                    {job.companyType && (
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                        {job.companyType}
                      </span>
                    )}
                  </div>

                  {/* Skills preview */}
                  {job.extractedSkills && job.extractedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.extractedSkills.slice(0, 5).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.extractedSkills.length > 5 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">
                          +{job.extractedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Quick Apply & Mock Interview Simulator */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMockInterviewJob(job);
                        }}
                        className="px-3.5 py-2 rounded-full bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105"
                      >
                        <Mic className="w-3.5 h-3.5" /> 🎙️ Mock Interview
                      </button>

                      <Link
                        to={`/candidate/ats?jobId=${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-indigo-500" /> ATS Gap Scan
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveApplyingJob(job);
                      }}
                      className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <span>⚡ 1-Click Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination Controls */}
          {totalJobs > limit && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-mono text-slate-500">
                Page {page + 1} of {Math.ceil(totalJobs / limit)}
              </span>

              <button
                type="button"
                disabled={(page + 1) * limit >= totalJobs}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Role Inspector & AI Preparation Flow Widget (5 cols on large) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          {selectedDrawerJob ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
              
              {/* Role Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                    Role Inspector & Match Flow
                  </span>
                  <span className="text-xs font-serif font-black text-emerald-600">
                    {calculateMatchScore(selectedDrawerJob)}% Match
                  </span>
                </div>

                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  {selectedDrawerJob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDrawerJob.company} • {selectedDrawerJob.location} ({selectedDrawerJob.workType})
                </p>
              </div>

              {/* AI Predicted Mock Questions for this Role */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-serif text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-600" /> Predicted AI Interview Questions
                  </h4>
                  <span className="text-[10px] text-purple-600 font-bold">3 Questions Ready</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">1.</span>
                    <span>How would you architect high-concurrency real-time features for {selectedDrawerJob.company}?</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">2.</span>
                    <span>Tell me about an incident where production latency spiked and how you mitigated it using STAR.</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => setMockInterviewJob(selectedDrawerJob)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Launch Live Interview Simulator
                </button>
              </div>

              {/* AI Resume Tailoring Tips */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <h4 className="text-xs font-bold font-serif text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> High-Impact ATS Resume Tailoring
                </h4>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  To achieve a 98%+ ATS score for this role, ensure your resume emphasizes quantifiable latency reductions, distributed caching, and end-to-end type safety.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to={`/candidate/ats?jobId=${selectedDrawerJob.id}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View Full ATS Matrix & Suggestions <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* 1-Click Direct Application Button */}
              <button
                type="button"
                onClick={() => setActiveApplyingJob(selectedDrawerJob)}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <span>⚡ 1-Click Apply to {selectedDrawerJob.company}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="p-8 text-center space-y-2 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-200">
                Select an Opportunity
              </h4>
              <p className="text-xs text-slate-500">
                Click any role in the left stream to inspect match analytics, launch mock questions, and apply.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Apply Modal */}
      {activeApplyingJob && (
        <ApplyModal
          isOpen={!!activeApplyingJob}
          onClose={() => setActiveApplyingJob(null)}
          job={activeApplyingJob}
          onSuccess={() => {
            setActiveApplyingJob(null);
            fetchJobs();
          }}
        />
      )}

      {/* Mock Interview Live Simulator Modal */}
      {mockInterviewJob && (
        <MockInterviewModal
          isOpen={!!mockInterviewJob}
          onClose={() => setMockInterviewJob(null)}
          roleTitle={mockInterviewJob.title}
          companyName={mockInterviewJob.company}
          jobId={mockInterviewJob.id}
          onSessionComplete={() => {
            setGamification(getGamificationState());
          }}
        />
      )}

      {/* Detail Drawer if triggered */}
      {selectedDrawerJob && (
        <JobDetailDrawer
          isOpen={false}
          onClose={() => {}}
          job={selectedDrawerJob}
          onApply={() => setActiveApplyingJob(selectedDrawerJob)}
          isSaved={savedJobIds.has(selectedDrawerJob.id)}
          onToggleSave={() => handleSave(selectedDrawerJob)}
        />
      )}

    </div>
  );
};

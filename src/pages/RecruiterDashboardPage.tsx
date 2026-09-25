import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Building2, 
  MapPin, 
  ShieldCheck,
  Check,
  Clock,
  Zap,
  Info,
  Users,
  Mail,
  FileText,
  Filter,
  Calendar,
  X,
  Eye,
  Award,
  ChevronRight,
  TrendingUp,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { recruiterApi } from '../api';
import { Job, WorkType, EmploymentType, CompanyType, RecruiterApplicant, ApplicationStatus } from '../types';

interface PresetRole {
  name: string;
  title: string;
  company: string;
  workType: WorkType;
  employmentType: EmploymentType;
  companyType: CompanyType;
  location: string;
  salaryMin: number;
  salaryMax: number;
  skills: string;
  experienceRequirements: string;
  educationRequirements: string;
  description: string;
}

const PRESET_TEMPLATES: PresetRole[] = [
  {
    name: '🚀 Full-Stack TS Engineer',
    title: 'Senior Full Stack Engineer (TypeScript/React)',
    company: 'Nexus Scale Labs',
    workType: 'Remote',
    employmentType: 'Full-time',
    companyType: 'Startup',
    location: 'Remote (US & Global)',
    salaryMin: 140000,
    salaryMax: 190000,
    skills: 'React, TypeScript, Node.js, Next.js, PostgreSQL, Tailwind CSS',
    experienceRequirements: '3+ years of professional full-stack web engineering experience',
    educationRequirements: "Bachelor's degree in Computer Science or equivalent practical track record",
    description: 'We are seeking an autonomous Full Stack Engineer to lead core user-facing features and scalable backend microservices. You will architect responsive interfaces with React/TypeScript and integrate high-throughput distributed database pipelines.'
  },
  {
    name: '🎨 Frontend / UI Specialist',
    title: 'Senior Frontend Engineer & Design Technologist',
    company: 'Aura Cloud Systems',
    workType: 'Remote',
    employmentType: 'Full-time',
    companyType: 'Newly Founded',
    location: 'Remote / San Francisco, CA',
    salaryMin: 135000,
    salaryMax: 180000,
    skills: 'React, TypeScript, Tailwind CSS, Motion, Web Performance, Figma',
    experienceRequirements: '4+ years crafting polished, accessible, and high-performance design systems',
    educationRequirements: 'BS in Computer Science, HCI, Design, or equivalent portfolio',
    description: 'Join our product team to craft industry-defining web applications. You will collaborate closely with product designers to implement smooth motion transitions, responsive layouts, and robust micro-frontends.'
  },
  {
    name: '⚙️ Cloud & Go Systems',
    title: 'Cloud Platform & Distributed Systems Engineer',
    company: 'Vertex Data Core',
    workType: 'Hybrid',
    employmentType: 'Full-time',
    companyType: 'Enterprise',
    location: 'Seattle, WA (Hybrid)',
    salaryMin: 155000,
    salaryMax: 215000,
    skills: 'Go, Kubernetes, AWS, Docker, Microservices, gRPC, PostgreSQL',
    experienceRequirements: '4+ years architecting cloud infrastructure and backend microservices',
    educationRequirements: "Bachelor's or Master's in Computer Science or related STEM field",
    description: 'Drive reliability and scalability across our multi-region Kubernetes platform. Responsible for high-concurrency Go services, automated telemetry pipelines, and secure cloud networking.'
  },
  {
    name: '🧠 AI / LLM Applications',
    title: 'AI Solutions & Full-Stack GenAI Engineer',
    company: 'Cognitive Foundry AI',
    workType: 'Remote',
    employmentType: 'Full-time',
    companyType: 'Startup',
    location: 'Remote (Anywhere)',
    salaryMin: 150000,
    salaryMax: 205000,
    skills: 'Python, TypeScript, Gemini API, PyTorch, Vector DBs, LangChain, React',
    experienceRequirements: '3+ years software engineering with 1+ years building production LLM apps',
    educationRequirements: "Degree in Computer Science, Machine Learning, or demonstrated GenAI shipped projects",
    description: 'Build agentic AI workflows and intelligent semantic search engines. You will fine-tune prompt graphs, implement vector embeddings, and build clean interactive dashboards for our enterprise partners.'
  }
];

export const RecruiterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'applications' | 'post' | 'jobs') || 'applications';

  // Data states
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<RecruiterApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [postingSubmitting, setPostingSubmitting] = useState(false);
  const [lastPublishedJob, setLastPublishedJob] = useState<Job | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Applications filtering & search
  const [applicantSearch, setApplicantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<RecruiterApplicant | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Job Posting Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: 'Remote',
    workType: 'Remote' as WorkType,
    employmentType: 'Full-time' as EmploymentType,
    companyType: 'Startup' as CompanyType,
    salaryMin: 130000,
    salaryMax: 180000,
    description: '',
    skills: 'React, TypeScript, Node.js, PostgreSQL, Tailwind CSS',
    experienceRequirements: '3+ years of professional engineering experience',
    educationRequirements: "Bachelor's degree in Computer Science or equivalent practical track record"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, applicantsRes] = await Promise.all([
        recruiterApi.getPostedJobs().catch(() => ({ jobs: [] })),
        recruiterApi.getApplicants().catch(() => ({ applicants: [], total: 0 }))
      ]);
      setPostedJobs(jobsRes.jobs || []);
      setApplicants(applicantsRes.applicants || []);
    } catch (err: any) {
      console.warn('Error loading recruiter dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: 'applications' | 'post' | 'jobs') => {
    setSearchParams({ tab });
  };

  const handleApplyPreset = (preset: PresetRole) => {
    setJobForm({
      title: preset.title,
      company: preset.company,
      location: preset.location,
      workType: preset.workType,
      employmentType: preset.employmentType,
      companyType: preset.companyType,
      salaryMin: preset.salaryMin,
      salaryMax: preset.salaryMax,
      skills: preset.skills,
      experienceRequirements: preset.experienceRequirements,
      educationRequirements: preset.educationRequirements,
      description: preset.description
    });
    setErrorMsg(null);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.company.trim() || !jobForm.description.trim()) {
      setErrorMsg('Please fill in Job Title, Company Name, and Job Description.');
      return;
    }

    try {
      setPostingSubmitting(true);
      setErrorMsg(null);
      const skillsArray = jobForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const published = await recruiterApi.postJob({
        ...jobForm,
        skills: skillsArray
      });

      setLastPublishedJob(published);
      const jobsRes = await recruiterApi.getPostedJobs();
      setPostedJobs(jobsRes.jobs || []);

      // Reset main fields
      setJobForm(prev => ({
        ...prev,
        title: '',
        description: '',
        company: ''
      }));

      // Scroll smoothly to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to post job:', err);
      setErrorMsg(err?.message || 'Failed to publish job. Please try again.');
    } finally {
      setPostingSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the job posting for "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(jobId);
      await recruiterApi.deleteJob(jobId);
      setPostedJobs(prev => prev.filter(j => j.id !== jobId));
      if (lastPublishedJob?.id === jobId) {
        setLastPublishedJob(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to remove job posting.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: ApplicationStatus, note?: string) => {
    try {
      setUpdatingStatusId(applicantId);
      const updated = await recruiterApi.updateApplicantStatus(applicantId, newStatus, note);
      
      setApplicants(prev => prev.map(app => 
        app.applicationId === applicantId ? { ...app, status: newStatus } : app
      ));

      if (selectedApplicant && selectedApplicant.applicationId === applicantId) {
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setStatusNote('');
    } catch (err: any) {
      alert(err?.message || 'Failed to update applicant status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch = 
        !applicantSearch.trim() ||
        app.candidateName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.matchedSkills.some(s => s.toLowerCase().includes(applicantSearch.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesJob = jobFilter === 'ALL' || app.jobId === jobFilter || app.jobTitle === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applicants, applicantSearch, statusFilter, jobFilter]);

  // Status badge styling helper
  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
            Applied
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
            Under Review
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
            ★ Shortlisted
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Interviewing
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
            ✓ Offer / Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
            Archived / Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
            {status}
          </span>
        );
    }
  };

  // Pipeline count summary
  const summaryCounts = useMemo(() => {
    return {
      total: applicants.length,
      applied: applicants.filter(a => a.status === 'APPLIED').length,
      underReview: applicants.filter(a => a.status === 'UNDER_REVIEW').length,
      shortlisted: applicants.filter(a => a.status === 'SHORTLISTED').length,
      interview: applicants.filter(a => a.status === 'INTERVIEW').length,
      accepted: applicants.filter(a => a.status === 'ACCEPTED').length,
      rejected: applicants.filter(a => a.status === 'REJECTED').length
    };
  }, [applicants]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-24 transition-colors">
      
      {/* Top Banner / Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Recruiter Studio
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold border border-indigo-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  Active Talent Tracking
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mt-2">
                Recruiter Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl">
                Review incoming applications, triage candidate profiles with ATS matching scores, and publish new tech opportunities.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('post')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Post New Job
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div 
              onClick={() => handleTabChange('applications')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Received</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {summaryCounts.total}
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 block">
                {summaryCounts.applied} new applied
              </span>
            </div>

            <div 
              onClick={() => { handleTabChange('applications'); setStatusFilter('SHORTLISTED'); }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Shortlisted Talent</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {summaryCounts.shortlisted}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Top ATS match candidates</span>
            </div>

            <div 
              onClick={() => { handleTabChange('applications'); setStatusFilter('INTERVIEW'); }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Interviews</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {summaryCounts.interview}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 block">
                In scheduling pipeline
              </span>
            </div>

            <div 
              onClick={() => handleTabChange('jobs')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">My Job Postings</span>
                <Briefcase className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {postedJobs.length} Live
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                Active hiring roles
              </span>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => handleTabChange('applications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Received Applications
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {applicants.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('post')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'post'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              My Postings
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {postedJobs.length}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* TAB 1: RECEIVED APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            
            {/* Filtering and Search Controls */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    placeholder="Search candidate name, email, target role, or skills..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  {applicantSearch && (
                    <button
                      type="button"
                      onClick={() => setApplicantSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Job filter dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="ALL">All Applied Positions</option>
                    {Array.from(new Set(applicants.map(a => a.jobTitle))).map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Status:</span>
                {[
                  { id: 'ALL', label: 'All Applicants', count: applicants.length },
                  { id: 'APPLIED', label: 'Applied / New', count: summaryCounts.applied },
                  { id: 'UNDER_REVIEW', label: 'Under Review', count: summaryCounts.underReview },
                  { id: 'SHORTLISTED', label: 'Shortlisted', count: summaryCounts.shortlisted },
                  { id: 'INTERVIEW', label: 'Interviewing', count: summaryCounts.interview },
                  { id: 'ACCEPTED', label: 'Offers / Accepted', count: summaryCounts.accepted },
                  { id: 'REJECTED', label: 'Archived', count: summaryCounts.rejected }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-purple-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      statusFilter === st.id ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800">
                Loading received applications...
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-serif">
                  No Applications Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {applicantSearch || statusFilter !== 'ALL' || jobFilter !== 'ALL'
                    ? 'No candidates match your active search or filters. Try clearing the filters.'
                    : 'No candidates have applied to your active postings yet. Incoming candidate submissions will appear directly here.'}
                </p>
                {(applicantSearch || statusFilter !== 'ALL' || jobFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => { setApplicantSearch(''); setStatusFilter('ALL'); setJobFilter('ALL'); }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApplicants.map((applicant) => (
                  <div
                    key={applicant.applicationId}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/80 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Candidate Avatar & Core Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                          {applicant.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                              {applicant.candidateName}
                            </h3>
                            {renderStatusBadge(applicant.status)}
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-mono">
                              <Award className="w-3 h-3" />
                              {applicant.atsScore}% ATS Match
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                              <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                              {applicant.jobTitle}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {applicant.jobCompany}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {applicant.candidateEmail}
                            </span>
                            {applicant.experienceYears !== undefined && (
                              <>
                                <span>•</span>
                                <span>{applicant.experienceYears}+ years exp</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Applied Date & Quick Action Buttons */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied {new Date(applicant.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicant(applicant)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-500" />
                            Review Profile
                          </button>

                          <a
                            href={`mailto:${applicant.candidateEmail}?subject=Regarding your application for ${applicant.jobTitle}`}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                    </div>

                    {/* Matched Skills & Cover Pitch */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Matched Skills:</span>
                        {applicant.matchedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Quick Triage Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden lg:inline">Update:</span>
                        
                        {applicant.status !== 'SHORTLISTED' && (
                          <button
                            type="button"
                            disabled={updatingStatusId === applicant.applicationId}
                            onClick={() => handleStatusChange(applicant.applicationId, 'SHORTLISTED')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                          >
                            ★ Shortlist
                          </button>
                        )}

                        {applicant.status !== 'INTERVIEW' && (
                          <button
                            type="button"
                            disabled={updatingStatusId === applicant.applicationId}
                            onClick={() => handleStatusChange(applicant.applicationId, 'INTERVIEW')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                          >
                            Interview
                          </button>
                        )}

                        {applicant.status !== 'ACCEPTED' && (
                          <button
                            type="button"
                            disabled={updatingStatusId === applicant.applicationId}
                            onClick={() => handleStatusChange(applicant.applicationId, 'ACCEPTED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                          >
                            ✓ Offer
                          </button>
                        )}

                        {applicant.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={updatingStatusId === applicant.applicationId}
                            onClick={() => handleStatusChange(applicant.applicationId, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: POST A JOB */}
        {activeTab === 'post' && (
          <div className="space-y-6">
            
            {/* Success Banner when a job has just been published */}
            {lastPublishedJob && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                          Position Successfully Published!
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                          LIVE NOW
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        <strong>{lastPublishedJob.title}</strong> at <strong>{lastPublishedJob.company}</strong> is now open for candidate applications.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleTabChange('jobs')}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" /> View My Postings ({postedJobs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLastPublishedJob(null)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form and Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left 7 Cols: Post a Job Form */}
              <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-purple-600" />
                      Create Tech Opportunity
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Publish a new role directly into the candidate matching stream.
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    * Required fields
                  </span>
                </div>

                {/* Quick 1-Click Role Presets */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Quick Role Presets (1-Click Fill)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TEMPLATES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/80 transition-all cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePostJob} className="space-y-4 text-xs">
                  
                  {/* Job Title */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. Senior Full Stack Engineer (React/TypeScript)"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Company & Company Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                        placeholder="e.g. Stripe, OpenAI Labs, Scale AI"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Company Stage / Type
                      </label>
                      <select
                        value={jobForm.companyType}
                        onChange={(e) => setJobForm({ ...jobForm, companyType: e.target.value as CompanyType })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="Startup">Startup (Fast-growth)</option>
                        <option value="Newly Founded">Newly Founded (Seed/Stealth)</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="MNC">MNC / Tech Giant</option>
                      </select>
                    </div>
                  </div>

                  {/* Work Type, Location & Employment Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Work Arrangement
                      </label>
                      <select
                        value={jobForm.workType}
                        onChange={(e) => setJobForm({ ...jobForm, workType: e.target.value as WorkType })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="e.g. Remote, San Francisco, New York"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Employment Type
                      </label>
                      <select
                        value={jobForm.employmentType}
                        onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as EmploymentType })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Compensation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Minimum Annual Salary ($ USD)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={jobForm.salaryMin}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMin: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Maximum Annual Salary ($ USD)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={jobForm.salaryMax}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMax: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Required Technologies & Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                      placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Experience Requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Experience Requirement
                      </label>
                      <input
                        type="text"
                        value={jobForm.experienceRequirements}
                        onChange={(e) => setJobForm({ ...jobForm, experienceRequirements: e.target.value })}
                        placeholder="e.g. 3+ years professional experience"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Education Requirement
                      </label>
                      <input
                        type="text"
                        value={jobForm.educationRequirements}
                        onChange={(e) => setJobForm({ ...jobForm, educationRequirements: e.target.value })}
                        placeholder="e.g. Bachelor's in CS or equivalent experience"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job Description & Team Mission *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      placeholder="Outline key responsibilities, technical architecture, and team goals..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={postingSubmitting}
                      className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {postingSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Publishing Opportunity...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Publish Position to Candidates</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>

              {/* Right 5 Cols: Live Card Preview */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Candidate View Preview
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      Live Format
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50/20 dark:bg-purple-950/20 space-y-3">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center font-black shadow-xs">
                          <span className="text-xs leading-none">95%</span>
                          <span className="text-[7px] uppercase tracking-wider">FIT</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {jobForm.title.trim() || 'Senior Software Engineer'}
                            </h4>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                              ★ Recruiter Direct
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {jobForm.company.trim() || 'Company Name'}
                            </span>
                            <span>•</span>
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{jobForm.location || 'Remote'} ({jobForm.workType})</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold font-mono border border-slate-200 dark:border-slate-700">
                        ${((jobForm.salaryMin || 130000) / 1000).toFixed(0)}k - ${((jobForm.salaryMax || 180000) / 1000).toFixed(0)}k
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        ⚡ Early Applicant (&lt;24h)
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                        {jobForm.companyType}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {jobForm.description.trim() || 'Enter job description on the left to see live preview for candidates exploring opportunities...'}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(jobForm.skills ? jobForm.skills.split(',').slice(0, 5) : ['React', 'TypeScript', 'Node.js']).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>

                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-500" />
                      Immediate Candidate Distribution
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                      Published roles are instantly fed into Swipe X match algorithms. As qualified candidates match and apply, submissions will automatically appear in your <strong>Received Applications</strong> tab.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: MY POSTINGS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  My Active Job Postings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage opportunities published through your recruiter account.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('post')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Post Another Job
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800">
                Loading active postings...
              </div>
            ) : postedJobs.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-serif">
                  No Active Postings Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  You have not published any job listings yet. Create a position to start receiving candidate applications.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('post')}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {postedJobs.map((job) => {
                  const jobApplicantCount = applicants.filter(a => a.jobId === job.id || a.jobTitle === job.title).length;
                  return (
                    <div
                      key={job.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active Listing
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {job.postedTimeAgo || 'Today'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif font-black text-base text-slate-900 dark:text-white line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{job.company}</span>
                            <span>•</span>
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.location}</span>
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between font-mono">
                          <span>${((job.salaryMin || 120000) / 1000).toFixed(0)}k - ${((job.salaryMax || 180000) / 1000).toFixed(0)}k</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400 font-sans">{job.workType}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {job.extractedSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setJobFilter(job.title);
                            handleTabChange('applications');
                          }}
                          className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{jobApplicantCount} Received Applications →</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === job.id}
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          title="Remove Job Posting"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* APPLICANT DETAIL MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                  {selectedApplicant.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                      {selectedApplicant.candidateName}
                    </h3>
                    {renderStatusBadge(selectedApplicant.status)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Applied for <strong>{selectedApplicant.jobTitle}</strong> at <strong>{selectedApplicant.jobCompany}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              
              {/* ATS Match Score Box */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg">
                    {selectedApplicant.atsScore}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      ATS Skill Match Compatibility
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Calculated against job requirements and validated engineering background.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Strong Match
                </span>
              </div>

              {/* Contact and Overview */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Candidate Email</span>
                  <a href={`mailto:${selectedApplicant.candidateEmail}`} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                    {selectedApplicant.candidateEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Experience Track</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedApplicant.experienceYears || 4}+ Years Professional
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Application Date</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {new Date(selectedApplicant.appliedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attached Resume</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    {selectedApplicant.resumeFileName || 'Resume_Profile.pdf'}
                  </span>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Skills Assessment
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.matchedSkills.map(sk => (
                    <span key={sk} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {sk}
                    </span>
                  ))}
                  {selectedApplicant.missingSkills?.map(sk => (
                    <span key={sk} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[11px]">
                      Optional: {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Letter / Pitch */}
              {selectedApplicant.coverLetter && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Candidate Note & Pitch
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs leading-relaxed italic">
                    "{selectedApplicant.coverLetter}"
                  </div>
                </div>
              )}

              {/* Status Updater */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Update Candidate Pipeline Stage
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApplicant.applicationId || selectedApplicant.status === 'UNDER_REVIEW'}
                    onClick={() => handleStatusChange(selectedApplicant.applicationId, 'UNDER_REVIEW')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedApplicant.status === 'UNDER_REVIEW'
                        ? 'bg-amber-500 text-white'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Under Review
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApplicant.applicationId || selectedApplicant.status === 'SHORTLISTED'}
                    onClick={() => handleStatusChange(selectedApplicant.applicationId, 'SHORTLISTED')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedApplicant.status === 'SHORTLISTED'
                        ? 'bg-purple-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ★ Shortlist
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApplicant.applicationId || selectedApplicant.status === 'INTERVIEW'}
                    onClick={() => handleStatusChange(selectedApplicant.applicationId, 'INTERVIEW')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedApplicant.status === 'INTERVIEW'
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Interview
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApplicant.applicationId || selectedApplicant.status === 'ACCEPTED'}
                    onClick={() => handleStatusChange(selectedApplicant.applicationId, 'ACCEPTED')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedApplicant.status === 'ACCEPTED'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ✓ Offer
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={updatingStatusId === selectedApplicant.applicationId || selectedApplicant.status === 'REJECTED'}
                    onClick={() => handleStatusChange(selectedApplicant.applicationId, 'REJECTED')}
                    className="text-xs text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Mark as Not Moving Forward / Archive Candidate
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <a
                href={`mailto:${selectedApplicant.candidateEmail}?subject=Next steps for your application at ${selectedApplicant.jobCompany}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" /> Email Candidate
              </a>

              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

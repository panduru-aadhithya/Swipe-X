import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  TrendingUp, 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { recruiterApi } from '../api';
import { Job, RecruiterApplicant, ApplicationStatus } from '../types';

export const RecruiterDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'jobs' | 'post-job'>('applicants');
  const [applicants, setApplicants] = useState<RecruiterApplicant[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<RecruiterApplicant | null>(null);

  // Form State for Posting a new Job
  const [jobForm, setJobForm] = useState({
    title: '',
    company: 'Stripe / Scale AI Hub',
    location: 'Remote',
    workType: 'Remote',
    employmentType: 'Full-time',
    companyType: 'Startup',
    salaryMin: 130000,
    salaryMax: 180000,
    description: '',
    skills: 'React, TypeScript, Node.js, PostgreSQL, AWS',
    experienceRequirements: '3+ years of professional engineering experience',
    educationRequirements: "Bachelor's degree in Computer Science or equivalent"
  });
  const [postSuccess, setPostSuccess] = useState(false);
  const [postingSubmitting, setPostingSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicantsRes, jobsRes] = await Promise.all([
        recruiterApi.getApplicants(),
        recruiterApi.getPostedJobs()
      ]);
      setApplicants(applicantsRes.applicants);
      setPostedJobs(jobsRes.jobs);
    } catch (err) {
      console.warn('Error loading recruiter dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (applicantId: string, newStatus: ApplicationStatus) => {
    try {
      await recruiterApi.updateApplicantStatus(applicantId, newStatus);
      setApplicants(prev => prev.map(a => a.applicationId === applicantId ? { ...a, status: newStatus } : a));
      if (selectedApplicant?.applicationId === applicantId) {
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.warn('Error updating status:', err);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPostingSubmitting(true);
      const skillsArray = jobForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await recruiterApi.postJob({
        ...jobForm,
        skills: skillsArray
      });
      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setActiveTab('jobs');
        loadData();
      }, 1500);
    } catch (err) {
      console.warn('Error posting job:', err);
    } finally {
      setPostingSubmitting(false);
    }
  };

  const filteredApplicants = applicants.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = 
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalApplicants: applicants.length,
    shortlisted: applicants.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length,
    activeJobs: postedJobs.length,
    avgAtsScore: Math.round(applicants.reduce((acc, a) => acc + (a.atsScore || 85), 0) / (applicants.length || 1))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-24 transition-colors">
      
      {/* Top Banner / Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Recruiter & Hiring Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mt-2">
                Talent Pipeline & Job Management
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5">
                Screen candidate resumes, inspect verified ATS match scores, and publish targeted opportunities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('post-job')}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Applicants</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 block">{stats.totalApplicants}</span>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Shortlisted / Interviewing</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5 block">{stats.shortlisted}</span>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Active Open Postings</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block">{stats.activeJobs}</span>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Avg ATS Candidate Match</span>
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1.5 block">{stats.avgAtsScore}%</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-8 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('applicants')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'applicants'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" /> Applicant Review Pipeline ({applicants.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Active Job Postings ({postedJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('post-job')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'post-job'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" /> Create Job Posting
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
        
        {/* TAB 1: APPLICANTS PIPELINE */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by candidate, role, or skill..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Applicants Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Applicants List */}
              <div className="lg:col-span-2 space-y-3">
                {loading ? (
                  <div className="p-12 text-center text-xs text-slate-400">Loading candidate pipeline...</div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No applicants found</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try broadening your search criteria or status filter.</p>
                  </div>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <div
                      key={applicant.applicationId}
                      onClick={() => setSelectedApplicant(applicant)}
                      className={`p-4 rounded-2xl bg-white dark:bg-[#0F172A] border transition-all cursor-pointer ${
                        selectedApplicant?.applicationId === applicant.applicationId
                          ? 'border-indigo-600 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                            {applicant.candidateName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                              {applicant.candidateName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Applied for <span className="font-semibold text-slate-700 dark:text-slate-300">{applicant.jobTitle}</span> • {applicant.experienceYears}y exp
                            </p>
                          </div>
                        </div>

                        {/* ATS Match Gauge Pill */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {applicant.atsScore}% ATS
                            </span>
                            <span className="block text-[10px] text-slate-400">Match Readiness</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            applicant.status === 'SHORTLISTED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                            applicant.status === 'INTERVIEW' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30' :
                            applicant.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30' :
                            applicant.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {applicant.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Verified Matched Skills */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {applicant.matchedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>

                      {/* Quick Stage Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(applicant.applicationId, 'SHORTLISTED')}
                            title="Shortlist Candidate"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Shortlist
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(applicant.applicationId, 'INTERVIEW')}
                            title="Advance to Interview"
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold hover:bg-purple-100 transition-colors"
                          >
                            Interview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(applicant.applicationId, 'REJECTED')}
                            title="Decline"
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold hover:bg-rose-100 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right 1 Col: Detailed Candidate Inspection Panel */}
              <div className="lg:col-span-1">
                {selectedApplicant ? (
                  <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs sticky top-20 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-serif font-black text-sm text-slate-900 dark:text-white">
                        Applicant Profile Inspection
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {selectedApplicant.atsScore}% ATS Match
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                        {selectedApplicant.candidateName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedApplicant.candidateEmail}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">Candidate Statement:</span>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed italic">
                        "{selectedApplicant.coverLetter || 'Eager to apply software engineering expertise and leadership.'}"
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                        Verified Technical Match
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplicant.matchedSkills.map(s => (
                          <span key={s} className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Hiring Decision:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedApplicant.applicationId, 'SHORTLISTED')}
                          className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedApplicant.applicationId, 'INTERVIEW')}
                          className="py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-2xs"
                        >
                          Schedule Interview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedApplicant.applicationId, 'ACCEPTED')}
                          className="py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
                        >
                          Extend Offer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedApplicant.applicationId, 'REJECTED')}
                          className="py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
                    Select a candidate from the left list to review detailed ATS match breakdowns and take hiring actions.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ACTIVE JOB POSTINGS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                      {job.companyType || 'Startup'}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {job.applicantsCount || 8} applicants
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-base text-slate-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{job.company}</span> • <span>{job.location}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Comp: ${(job.salaryMin || 120000)/1000}k - ${(job.salaryMax || 180000)/1000}k</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{job.workType}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.extractedSkills.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Posted {job.postedTimeAgo || 'Today'}</span>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('applicants'); setSearchQuery(job.title); }}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      View Candidates →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE JOB POSTING FORM */}
        {activeTab === 'post-job' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md">
            <h2 className="font-serif font-black text-xl text-slate-900 dark:text-white">
              Publish New Opportunity to Candidate Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jobs published here are immediately normalized and recommended to candidates in their swipe deck.
            </p>

            {postSuccess && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Job successfully published and queued for AI recommendations!
              </div>
            )}

            <form onSubmit={handlePostJob} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Type</label>
                  <select
                    value={jobForm.companyType}
                    onChange={(e) => setJobForm({ ...jobForm, companyType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Startup">Startup</option>
                    <option value="Newly Founded">Newly Founded (Seed/Stealth)</option>
                    <option value="MNC">MNC / Tech Giant</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Work Type</label>
                  <select
                    value={jobForm.workType}
                    onChange={(e) => setJobForm({ ...jobForm, workType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Salary ($ USD)</label>
                  <input
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description *</label>
                <textarea
                  rows={4}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe key responsibilities, qualifications, and team mission..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={postingSubmitting}
                className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {postingSubmitting ? 'Publishing...' : 'Publish Job to Candidates'}
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};

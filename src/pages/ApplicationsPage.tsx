import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Filter, 
  Search, 
  ArrowUpDown, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  FileText, 
  Loader2, 
  DollarSign, 
  RefreshCw,
  Award,
  Flame,
  Send
} from 'lucide-react';
import { applicationApi } from '../api';
import { Application, ApplicationStatus } from '../types';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'ats_desc' | 'company_asc'>('newest');
  
  // Expanded history / notes states
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Record<string, boolean>>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await applicationApi.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
      showToast('Failed to load applications. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await applicationApi.updateStatus(
        appId, 
        newStatus, 
        `Candidate updated pipeline stage to ${newStatus.replace('_', ' ')}`
      );
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      showToast(`Application updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      showToast('Failed to update stage. Please try again.');
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setIsSavingNotes(true);
    try {
      const updated = await applicationApi.updateNotes(appId, notesDraft);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      setEditingNotesId(null);
      showToast('Personal notes saved successfully');
    } catch (err) {
      console.error('Failed to update notes:', err);
      showToast('Failed to save notes. Please try again.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    setIsWithdrawing(true);
    try {
      await applicationApi.withdrawApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setConfirmWithdrawId(null);
      showToast('Application withdrawn from pipeline');
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      showToast('Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const toggleHistory = (appId: string) => {
    setExpandedHistoryIds((prev) => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const exportCSV = () => {
    if (applications.length === 0) {
      showToast('No applications to export.');
      return;
    }

    const headers = ['Company', 'Job Title', 'Location', 'Work Type', 'Status', 'ATS Score', 'Applied Date', 'Notes'];
    const rows = applications.map((app) => [
      `"${app.job.company.replace(/"/g, '""')}"`,
      `"${app.job.title.replace(/"/g, '""')}"`,
      `"${app.job.location.replace(/"/g, '""')}"`,
      `"${app.job.workType || 'Not specified'}"`,
      `"${app.status}"`,
      app.atsScore,
      new Date(app.appliedDate).toLocaleDateString(),
      `"${(app.candidateNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swipex_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported applications report to CSV');
  };

  // Pipeline telemetry statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter(a => a.status === 'UNDER_REVIEW').length;
    const shortlisted = applications.filter(a => a.status === 'SHORTLISTED').length;
    const interview = applications.filter(a => a.status === 'INTERVIEW').length;
    const accepted = applications.filter(a => a.status === 'ACCEPTED').length;
    const rejected = applications.filter(a => a.status === 'REJECTED').length;
    const applied = applications.filter(a => a.status === 'APPLIED').length;
    const avgAts = total > 0 
      ? Math.round(applications.reduce((acc, curr) => acc + curr.atsScore, 0) / total) 
      : 0;

    return { total, inReview, shortlisted, interview, accepted, rejected, applied, avgAts };
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

        // Work type filter
        if (workTypeFilter !== 'ALL') {
          const wt = app.job.workType?.toUpperCase();
          if (workTypeFilter === 'REMOTE' && wt !== 'REMOTE') return false;
          if (workTypeFilter === 'HYBRID' && wt !== 'HYBRID') return false;
          if (workTypeFilter === 'ONSITE' && wt !== 'ONSITE') return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.job.company.toLowerCase().includes(q);
          const matchTitle = app.job.title.toLowerCase().includes(q);
          const matchLocation = app.job.location.toLowerCase().includes(q);
          const matchNotes = (app.candidateNotes || '').toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchLocation && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        }
        if (sortBy === 'ats_desc') {
          return b.atsScore - a.atsScore;
        }
        if (sortBy === 'company_asc') {
          return a.job.company.localeCompare(b.job.company);
        }
        return 0;
      });
  }, [applications, statusFilter, workTypeFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'INTERVIEW':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-800';
      case 'SHORTLISTED':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      case 'UNDER_REVIEW':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800';
    }
  };

  const getProgressStep = (status: ApplicationStatus): number => {
    switch (status) {
      case 'APPLIED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'SHORTLISTED': return 2.5;
      case 'INTERVIEW': return 3;
      case 'ACCEPTED': return 4;
      case 'REJECTED': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-[#151D2A] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 font-display">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-400/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 font-display">
              Pipeline Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1 tracking-tight">
            Track Submitted Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor stages, record interview logs, inspect ATS compatibility, and rehearse tailored mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadApplications}
            className="p-2 rounded-xl bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Refresh pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-600' : 'text-slate-500'}`} />
          </button>

          <Link
            to="/candidate/explore"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 font-display"
          >
            <span>+ Discover & Apply</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Stage Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-display">Total Tracked</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-1 block">{stats.total}</span>
        </div>

        <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider block font-display">Under Review</span>
          <span className="text-2xl font-extrabold text-orange-800 dark:text-orange-300 font-display mt-1 block">{stats.inReview}</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider block font-display">Shortlisted</span>
          <span className="text-2xl font-extrabold text-teal-800 dark:text-teal-300 font-display mt-1 block">{stats.shortlisted}</span>
        </div>

        <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block font-display">Interviewing</span>
          <span className="text-2xl font-extrabold text-violet-800 dark:text-violet-300 font-display mt-1 block">{stats.interview}</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-display">Offers / Won</span>
          <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 font-display mt-1 block">{stats.accepted}</span>
        </div>

        <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block font-display">Avg ATS Match</span>
          <span className="text-2xl font-extrabold text-violet-800 dark:text-violet-300 font-display mt-1 block">{stats.avgAts}%</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, title, location, or notes..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Work Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Work Type:</span>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">Onsite</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none font-medium"
            >
              <option value="newest">Newest Applied</option>
              <option value="oldest">Oldest Applied</option>
              <option value="ats_desc">Highest ATS Score</option>
              <option value="company_asc">Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Stage Filter Tabs with Counts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'ALL', label: 'All Applications', count: stats.total },
            { id: 'APPLIED', label: 'Applied', count: stats.applied },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: stats.inReview },
            { id: 'SHORTLISTED', label: 'Shortlisted', count: stats.shortlisted },
            { id: 'INTERVIEW', label: 'Interview', count: stats.interview },
            { id: 'ACCEPTED', label: 'Offer / Won', count: stats.accepted },
            { id: 'REJECTED', label: 'Rejected', count: stats.rejected }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-display ${
                statusFilter === tab.id
                  ? 'bg-violet-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? 'bg-violet-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-20 bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-display">Loading applications pipeline...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {searchQuery || statusFilter !== 'ALL' || workTypeFilter !== 'ALL'
                ? 'No Applications Match Filters'
                : 'No Applications Submitted Yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== 'ALL' || workTypeFilter !== 'ALL'
                ? 'Try clearing your search query or adjusting the stage and work type filters.'
                : 'When you apply to jobs from the Job Directory, your applications will be recorded here with full stage tracking and ATS scan scores.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {(searchQuery || statusFilter !== 'ALL' || workTypeFilter !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setWorkTypeFilter('ALL');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer font-display"
              >
                Reset All Filters
              </button>
            ) : (
              <Link
                to="/candidate/explore"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all font-display"
              >
                <span>Explore Verified Openings</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const stepNum = getProgressStep(app.status);
            const isExpandedHistory = !!expandedHistoryIds[app.id];
            const isEditingNotes = editingNotesId === app.id;
            const salaryFormatted = app.job.salaryMin && app.job.salaryMax
              ? `$${(app.job.salaryMin / 1000).toFixed(0)}k – $${(app.job.salaryMax / 1000).toFixed(0)}k`
              : 'Competitive';

            return (
              <div
                key={app.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow space-y-5"
              >
                {/* Top Row: Company, Title, Stage, ATS Match */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Company Initial Circle */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold flex items-center justify-center text-lg font-display shrink-0 shadow-2xs">
                      {app.job.company.charAt(0)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-violet-500" /> {app.job.company}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {app.job.location}
                        </span>
                        {app.job.workType && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              {app.job.workType}
                            </span>
                          </>
                        )}
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {salaryFormatted}
                        </span>
                      </div>

                      <Link
                        to={`/candidate/jobs/${app.jobId}`}
                        className="text-lg font-bold text-slate-900 dark:text-white font-display hover:text-violet-600 dark:hover:text-violet-400 transition-colors block"
                      >
                        {app.job.title}
                      </Link>
                    </div>
                  </div>

                  {/* Badges: Status & ATS Match */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border uppercase tracking-wider font-display ${getStatusBadge(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>

                    <Link
                      to={`/candidate/ats?jobId=${app.jobId}`}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-opacity hover:opacity-90 font-mono ${
                        app.atsScore >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : app.atsScore >= 75
                          ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                          : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                      }`}
                      title="Inspect ATS Score report"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{app.atsScore}% ATS</span>
                    </Link>
                  </div>
                </div>

                {/* 4-Step Pipeline Visual Stepper */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { step: 1, label: 'Applied', icon: Send },
                      { step: 2, label: 'Review / Screen', icon: Clock },
                      { step: 3, label: 'Interview', icon: Sparkles },
                      { step: 4, label: app.status === 'REJECTED' ? 'Archived' : 'Offer / Won', icon: CheckCircle2 }
                    ].map((st) => {
                      const isCompleted = stepNum >= st.step;
                      const isCurrent = (stepNum >= st.step && stepNum < st.step + 1) || (stepNum === 4 && st.step === 4);
                      const Icon = st.icon;

                      return (
                        <div key={st.step} className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isCurrent
                              ? app.status === 'REJECTED' && st.step === 4
                                ? 'bg-rose-500 text-white ring-4 ring-rose-100 dark:ring-rose-950'
                                : 'bg-violet-600 text-white ring-4 ring-violet-100 dark:ring-violet-950'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[11px] font-semibold font-display ${
                            isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                          }`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Notes Section */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-display">
                      <FileText className="w-3.5 h-3.5 text-violet-500" />
                      Candidate Notes & Interview Logs
                    </span>
                    {!isEditingNotes && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(app.id);
                          setNotesDraft(app.candidateNotes || '');
                        }}
                        className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer font-display"
                      >
                        <Edit3 className="w-3 h-3" />
                        {app.candidateNotes ? 'Edit Notes' : '+ Add Notes'}
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Record recruiter contact info, interview scheduled time, preparation topics, salary expectations..."
                        rows={3}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSavingNotes}
                          onClick={() => handleSaveNotes(app.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      {app.candidateNotes || 'No notes added yet. Click above to log interview milestones or recruiter details.'}
                    </p>
                  )}
                </div>

                {/* Audit Trail / History Milestones */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleHistory(app.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer font-display"
                    >
                      <span>Stage Timeline & History ({app.statusHistory.length} events)</span>
                      {isExpandedHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpandedHistory && (
                      <div className="mt-3 pl-2 border-l-2 border-violet-200 dark:border-violet-900 space-y-3 text-xs">
                        {app.statusHistory.map((h, idx) => (
                          <div key={idx} className="relative pl-3">
                            <div className="w-2 h-2 rounded-full bg-violet-500 absolute -left-[17px] top-1.5" />
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200 font-display">
                                {h.status.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(h.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {h.note && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {h.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Left: Applied Date & Stage Advance Dropdown */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied on {new Date(app.appliedDate).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase font-display">Update Stage:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D2A] text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="ACCEPTED">Accepted / Offer</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Action Hub: Practice Interview, View Job, Withdraw */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/candidate/interview?jobId=${app.jobId}`}
                      className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold hover:bg-violet-100 transition-colors flex items-center gap-1 shadow-2xs font-display"
                      title="Practice mock interview tailored to this specific job"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      <span>Mock Interview</span>
                    </Link>

                    <Link
                      to={`/candidate/jobs/${app.jobId}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 font-display"
                    >
                      <span>Job Spec</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {confirmWithdrawId === app.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 p-1 rounded-xl border border-rose-200 dark:border-rose-900">
                        <span className="text-[11px] font-bold text-rose-600 px-1 font-display">Confirm?</span>
                        <button
                          type="button"
                          disabled={isWithdrawing}
                          onClick={() => handleWithdraw(app.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmWithdrawId(null)}
                          className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmWithdrawId(app.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Withdraw Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { applicationApi } from '../api';
import { Application, ApplicationStatus } from '../types';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await applicationApi.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await applicationApi.updateStatus(appId, newStatus, `Status updated to ${newStatus}`);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border-[#5B6D5B]/30';
      case 'INTERVIEW':
        return 'bg-[#C29352]/15 text-[#C29352] dark:text-[#D9AC6C] border-[#C29352]/30';
      case 'SHORTLISTED':
        return 'bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] border-[#5B6D5B]/30';
      case 'UNDER_REVIEW':
        return 'bg-[#C29352]/15 text-[#C29352] dark:text-[#D9AC6C] border-[#C29352]/30';
      case 'REJECTED':
        return 'bg-[#B86B64]/15 text-[#B86B64] dark:text-[#D48982] border-[#B86B64]/30';
      default:
        return 'bg-[#8C867A]/15 text-[#8C867A] dark:text-[#DCD7C9] border-[#8C867A]/30';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#5B6D5B]" />
            Application Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#8C867A] dark:text-[#A6A092] mt-0.5">
            Track and manage your submitted applications & ATS verification records ({applications.length} submitted).
          </p>
        </div>

        <Link
          to="/candidate/swipe"
          className="px-5 py-2.5 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          Discover & Apply
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === st
                ? 'bg-[#5B6D5B] text-white shadow-sm'
                : 'bg-white dark:bg-[#252C25] border border-[#DCD7C9] dark:border-[#2E362E] text-[#2D2926] dark:text-[#E9E4D9] hover:bg-[#E9E4D9]/40'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-[#5B6D5B] animate-spin mx-auto" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">No Applications Found</h3>
          <p className="text-xs text-[#8C867A] max-w-sm mx-auto">
            When you swipe right or submit an application on a job, it is automatically tracked here with its full ATS compatibility score.
          </p>
          <Link
            to="/candidate/swipe"
            className="inline-block px-6 py-2.5 rounded-full bg-[#5B6D5B] text-white text-xs font-bold shadow-sm hover:bg-[#465546] transition-all mt-2"
          >
            Go to Swipe Hub
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#252C25] border border-[#DCD7C9] dark:border-[#2E362E] shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#5B6D5B]" /> {app.job.company}
                    </span>
                    <span className="text-[#DCD7C9]">•</span>
                    <span className="text-[#8C867A] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {app.job.location}
                    </span>
                  </div>

                  <Link
                    to={`/candidate/jobs/${app.jobId}`}
                    className="text-lg font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif hover:text-[#5B6D5B] dark:hover:text-[#8FA68F] block"
                  >
                    {app.job.title}
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-bold">
                    {app.atsScore}% ATS
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#DCD7C9] dark:border-[#2E362E] text-xs text-[#8C867A]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedDate).toLocaleDateString()}
                  </span>
                  {app.candidateNotes && (
                    <span className="italic text-[#2D2926] dark:text-[#E9E4D9]">
                      Note: "{app.candidateNotes}"
                    </span>
                  )}
                </div>

                {/* Pipeline Progression simulation */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#8C867A]">Advance Stage:</span>
                  <select
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="p-1 px-2 rounded-lg border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-[11px] font-semibold focus:outline-none"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

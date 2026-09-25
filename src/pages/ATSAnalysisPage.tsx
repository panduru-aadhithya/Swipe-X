import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  Briefcase, 
  History, 
  ShieldCheck,
  UploadCloud,
  FileText
} from 'lucide-react';
import { jobApi, atsApi, savedJobApi, resumeApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Job, ATSReport, SavedJob } from '../types';
import { ATSScoreGauge } from '../components/ATSScoreGauge';
import { ApplyModal } from '../components/ApplyModal';

export const ATSAnalysisPage: React.FC = () => {
  const { hasActiveResume, setHasActiveResume } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<ATSReport | null>(null);
  const [pastReports, setPastReports] = useState<ATSReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);
  const [userHasResume, setUserHasResume] = useState<boolean>(hasActiveResume);

  useEffect(() => {
    async function loadData() {
      setIsLoadingInitial(true);
      try {
        const [jobsRes, savedRes, reportsRes, resumeRes] = await Promise.all([
          jobApi.getJobs({ limit: 50 }),
          savedJobApi.getSavedJobs(),
          atsApi.getReports(),
          resumeApi.getActiveResume().catch(() => null)
        ]);
        setJobs(jobsRes.jobs);
        setSavedJobs(savedRes);
        setPastReports(reportsRes);

        const hasRes = Boolean(resumeRes?.resume);
        setUserHasResume(hasRes);
        setHasActiveResume(hasRes);

        if (jobsRes.jobs.length > 0) {
          setSelectedJobId(jobsRes.jobs[0].id);
          if (hasRes) {
            // Only run scan if candidate has uploaded a real resume
            runScan(jobsRes.jobs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load ATS analysis data:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const runScan = async (jobId: string) => {
    if (!jobId) return;
    setIsScanning(true);
    setError(null);
    try {
      const report = await atsApi.analyzeJob(jobId, true);
      setCurrentReport(report);
      // Refresh past reports
      const updatedReports = await atsApi.getReports();
      setPastReports(updatedReports);
    } catch (err: any) {
      if (err?.code === 'RESUME_REQUIRED' || (err?.message || '').toLowerCase().includes('resume')) {
        setUserHasResume(false);
        setHasActiveResume(false);
        setError('Resume required: Upload your resume before running an ATS scan. SwipeX evaluates your actual resume to ensure genuine results.');
      } else {
        setError(err.message || 'ATS scan failed. Please ensure your resume is uploaded.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || savedJobs.find((s) => s.jobId === selectedJobId)?.job;

  const filteredJobs = jobs.filter((j) => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            ATS Compatibility Scanner
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-display">
            Real Resume Audit
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit your real resume against target job requirements without fabricated or simulated scores.
        </p>
      </div>

      {/* When user has no active resume: Highlight prompt */}
      {!userHasResume && !isLoadingInitial && (
        <div className="p-8 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
              <UploadCloud className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
                Resume Required
              </span>
              <h2 className="text-xl font-bold mt-1">Upload Your Resume to Run ATS Compatibility Audits</h2>
            </div>
          </div>
          <p className="text-sm text-blue-50 max-w-2xl leading-relaxed">
            SwipeX calculates genuine ATS compatibility by cross-matching your real work experience, skills, and education against the employer’s job description. Default placeholder information is disabled.
          </p>
          <div className="pt-2">
            <Link
              to="/candidate/resume?promptUpload=true"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all font-display"
            >
              <FileText className="w-4 h-4" />
              Upload Resume Document Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Target Job Selector */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
          Select Target Job Posting to Audit
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <select
              id="select-ats-job"
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                if (userHasResume) {
                  runScan(e.target.value);
                }
              }}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
            >
              <optgroup label="Saved Roles">
                {savedJobs.map((s) => (
                  <option key={s.id} value={s.jobId}>
                    {s.job.title} — {s.job.company} (Saved)
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Verified Jobs">
                {filteredJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company} ({j.location})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            type="button"
            disabled={isScanning || !selectedJobId || !userHasResume}
            onClick={() => runScan(selectedJobId)}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer font-display"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-orange-300" /> Run Deep ATS Scan
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          {!userHasResume && (
            <Link
              to="/candidate/resume?promptUpload=true"
              className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
            >
              Upload Resume
            </Link>
          )}
        </div>
      )}

      {/* Live ATS Report Output */}
      {currentReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Scan Results for {selectedJob?.title} at {selectedJob?.company}
            </h2>

            {selectedJob && (
              <button
                type="button"
                onClick={() => setActiveApplyingJob(selectedJob)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
              >
                Apply With This Score →
              </button>
            )}
          </div>

          <ATSScoreGauge report={currentReport} compact={false} />
        </div>
      )}

      {/* Historical Reports */}
      {pastReports.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Recent ATS Audits History ({pastReports.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pastReports.slice(0, 5).map((rep) => (
              <div key={rep.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block font-display">
                    Job #{rep.jobId} Scan
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {new Date(rep.createdAt).toLocaleDateString()} • {rep.matchedSkills.length} matched skills
                  </span>
                </div>
                <span className={`font-bold text-sm px-2.5 py-1 rounded-full font-mono ${
                  rep.atsScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                }`}>
                  {rep.atsScore}% ATS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {activeApplyingJob && (
        <ApplyModal
          job={activeApplyingJob}
          isOpen={!!activeApplyingJob}
          onClose={() => setActiveApplyingJob(null)}
        />
      )}
    </div>
  );
};

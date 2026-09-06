import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { jobApi, atsApi, savedJobApi } from '../api';
import { Job, ATSReport, SavedJob } from '../types';
import { ATSScoreGauge } from '../components/ATSScoreGauge';
import { ApplyModal } from '../components/ApplyModal';

export const ATSAnalysisPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<ATSReport | null>(null);
  const [pastReports, setPastReports] = useState<ATSReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, savedRes, reportsRes] = await Promise.all([
          jobApi.getJobs({ limit: 50 }),
          savedJobApi.getSavedJobs(),
          atsApi.getReports()
        ]);
        setJobs(jobsRes.jobs);
        setSavedJobs(savedRes);
        setPastReports(reportsRes);

        if (jobsRes.jobs.length > 0) {
          setSelectedJobId(jobsRes.jobs[0].id);
          // Run initial scan on first job
          runScan(jobsRes.jobs[0].id);
        }
      } catch (err) {
        console.error('Failed to load ATS analysis data:', err);
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
      setError(err.message || 'ATS scan failed. Please ensure a resume is uploaded.');
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
          <FileCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-serif">
            ATS Compatibility Scanner
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Real-Time Audit
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulate enterprise ATS applicant screening algorithms against target job requirements.
        </p>
      </div>

      {/* Target Job Selector */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-serif">
          Select Target Job Posting to Audit
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <select
              id="select-ats-job"
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                runScan(e.target.value);
              }}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            disabled={isScanning || !selectedJobId}
            onClick={() => runScan(selectedJobId)}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> Run Deep ATS Scan
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Live ATS Report Output */}
      {currentReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
              Scan Results for {selectedJob?.title} at {selectedJob?.company}
            </h2>

            {selectedJob && (
              <button
                type="button"
                onClick={() => setActiveApplyingJob(selectedJob)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Recent ATS Audits History ({pastReports.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pastReports.slice(0, 5).map((rep) => (
              <div key={rep.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Job #{rep.jobId} Scan
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(rep.createdAt).toLocaleDateString()} • {rep.matchedSkills.length} matched skills
                  </span>
                </div>
                <span className={`font-bold text-sm px-2.5 py-1 rounded-full ${
                  rep.atsScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Heart, ExternalLink, MapPin, Building2, Briefcase, Loader2 } from 'lucide-react';
import { savedJobApi } from '../api';
import { SavedJob, Job } from '../types';
import { ApplyModal } from '../components/ApplyModal';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeApplyingJob, setActiveApplyingJob] = useState<Job | null>(null);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const data = await savedJobApi.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (jobId: string) => {
    try {
      await savedJobApi.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-orange-500" />
            Saved Job Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Roles you bookmarked during discovery sessions ({savedJobs.length} saved).
          </p>
        </div>

        <Link
          to="/candidate/swipe"
          className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          Discover More Roles
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">No Saved Jobs Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When browsing jobs in the AI Match Deck or Job Explorer, tap the bookmark icon or press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-xs">S</kbd> to save roles for later review.
          </p>
          <Link
            to="/candidate/swipe"
            className="inline-block px-6 py-2.5 rounded-full bg-violet-600 text-white text-xs font-bold shadow-xs hover:bg-violet-700 transition-all mt-2"
          >
            Launch AI Match Deck
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-violet-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> {saved.job.company}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {saved.job.location}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {saved.job.workType}
                  </span>
                </div>

                <Link
                  to={`/candidate/jobs/${saved.jobId}`}
                  className="text-lg font-bold text-slate-900 dark:text-white font-display hover:text-violet-600 dark:hover:text-violet-400 transition-colors block"
                >
                  {saved.job.title}
                </Link>

                <div className="flex flex-wrap gap-1.5">
                  {saved.job.extractedSkills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleRemove(saved.jobId)}
                  className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveApplyingJob(saved.job)}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" /> Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Journey Modal */}
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

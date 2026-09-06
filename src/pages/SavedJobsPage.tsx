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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-[#C29352]" />
            Saved Job Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-[#8C867A] dark:text-[#A6A092] mt-0.5">
            Roles you bookmarked during discovery sessions ({savedJobs.length} saved).
          </p>
        </div>

        <Link
          to="/candidate/swipe"
          className="px-5 py-2.5 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          Discover More Roles
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-[#5B6D5B] animate-spin mx-auto" />
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#C29352]/15 text-[#C29352] flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">No Saved Jobs Yet</h3>
          <p className="text-xs text-[#8C867A] max-w-sm mx-auto">
            When browsing jobs in the Swipe Hub or Job Explorer, tap the bookmark icon or press <kbd className="px-1.5 py-0.5 bg-[#E9E4D9] dark:bg-[#1E251E] rounded-md font-mono text-xs">S</kbd> to save roles for later review.
          </p>
          <Link
            to="/candidate/swipe"
            className="inline-block px-6 py-2.5 rounded-full bg-[#5B6D5B] text-white text-xs font-bold shadow-sm hover:bg-[#465546] transition-all mt-2"
          >
            Launch Swipe Discovery
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#252C25] border border-[#DCD7C9] dark:border-[#2E362E] shadow-sm hover:border-[#5B6D5B]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#2D2926] dark:text-[#F2F0E9] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#5B6D5B]" /> {saved.job.company}
                  </span>
                  <span className="text-[#DCD7C9]">•</span>
                  <span className="text-[#8C867A] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {saved.job.location}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E9E4D9] dark:bg-[#1E251E] text-[#5B6D5B] dark:text-[#8FA68F] font-semibold">
                    {saved.job.workType}
                  </span>
                </div>

                <Link
                  to={`/candidate/jobs/${saved.jobId}`}
                  className="text-lg font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif hover:text-[#5B6D5B] dark:hover:text-[#8FA68F] transition-colors block"
                >
                  {saved.job.title}
                </Link>

                <div className="flex flex-wrap gap-1.5">
                  {saved.job.extractedSkills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-0.5 rounded-full bg-[#E9E4D9]/60 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#E9E4D9] border border-[#DCD7C9] dark:border-[#354235]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#DCD7C9] dark:border-[#2E362E]">
                <button
                  onClick={() => handleRemove(saved.jobId)}
                  className="p-2.5 rounded-full border border-[#DCD7C9] dark:border-[#2E362E] text-[#8C867A] hover:text-[#B86B64] hover:bg-[#B86B64]/10 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveApplyingJob(saved.job)}
                  className="px-5 py-2.5 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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

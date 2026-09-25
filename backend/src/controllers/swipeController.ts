import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { swipeRepository, savedJobRepository, applicationRepository, jobRepository, atsRepository } from '../repositories/jobRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { SwipeDecision, SavedJob, Application, SwipeDecisionType } from '../types';

export const swipeController = {
  async recordSwipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const body = req.body as { 
        jobId: string; 
        action?: 'right_swipe' | 'left_swipe' | 'save_swipe' | 'RIGHT' | 'LEFT' | 'SAVE';
        decision?: SwipeDecisionType;
      };

      const jobId = body.jobId;
      const rawActionOrDecision = body.action || body.decision;

      if (!jobId || !rawActionOrDecision) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_SWIPE', message: 'jobId and action (right_swipe or left_swipe) are required' }
        });
        return;
      }

      // Normalize action and decision
      const isRight = rawActionOrDecision === 'right_swipe' || rawActionOrDecision === 'RIGHT';
      const isLeft = rawActionOrDecision === 'left_swipe' || rawActionOrDecision === 'LEFT';
      const isSave = rawActionOrDecision === 'save_swipe' || rawActionOrDecision === 'SAVE';

      if (!isRight && !isLeft && !isSave) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ACTION', message: 'action must be right_swipe, left_swipe, or save_swipe' }
        });
        return;
      }

      const action = isRight ? 'right_swipe' : isLeft ? 'left_swipe' : 'save_swipe';
      const decision: SwipeDecisionType = isRight ? 'RIGHT' : isLeft ? 'LEFT' : 'SAVE';

      const job = jobRepository.findById(jobId);
      if (!job) {
        res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
        });
        return;
      }

      // Check if user already applied for this job
      const candidateApplications = applicationRepository.findByCandidate(profile.id);
      const existingApp = candidateApplications.find(a => a.jobId === jobId);
      const nowIso = new Date().toISOString();

      // Format salary string if available
      let salaryDisplay: string | undefined = undefined;
      if (job.salaryMin && job.salaryMax) {
        salaryDisplay = `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency || '$'}${job.salaryMax.toLocaleString()}`;
      } else if (job.salaryMin) {
        salaryDisplay = `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()}+`;
      }

      const swipe: SwipeDecision = {
        id: `sw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id || profile.userId || profile.id,
        candidateProfileId: profile.id,
        jobId,
        action,
        decision,
        timestamp: nowIso,
        createdAt: nowIso,

        // Snapshot attributes at time of swipe
        jobTitle: job.title,
        company: job.company,
        skills: job.extractedSkills || job.keywords || [],
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel || job.experienceRequirements || 'Mid',
        salary: salaryDisplay,
        jobCategory: job.companyType || (job.keywords && job.keywords[0]) || 'Technology',

        job,
        applied: !!existingApp,
        applicationId: existingApp?.id,
        applicationStatus: existingApp?.status,
        appliedDate: existingApp?.appliedDate
      };

      swipeRepository.record(swipe);

      // If action is right_swipe (interested) or save_swipe, make it available in the user's saved/interested section
      if (isRight || isSave) {
        const saved: SavedJob = {
          id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          candidateProfileId: profile.id,
          jobId,
          job,
          createdAt: nowIso
        };
        savedJobRepository.save(saved);
      }

      res.status(201).json({
        success: true,
        message: isRight 
          ? 'Saved to Interested Roles in Swipe History' 
          : isLeft 
          ? 'Marked as Not Interested and saved to Swipe History' 
          : 'Saved role to bookmarks',
        data: {
          swipe,
          action,
          isInterested: isRight || isSave,
          isRejected: isLeft,
          proceedToApply: false // Right swipe means interested, separate from actual application submission
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SWIPE_FAILED', message: err.message }
      });
    }
  },

  async getSwipeHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const { action, filter } = req.query as { action?: string; filter?: string };
    const history = swipeRepository.findByCandidate(profile.id);
    const candidateApplications = applicationRepository.findByCandidate(profile.id);
    const appByJobId = new Map(candidateApplications.map(a => [a.jobId, a]));

    const enrichedHistory = history
      .map(s => {
        const job = jobRepository.findById(s.jobId) || s.job;
        const app = appByJobId.get(s.jobId);
        const resolvedAction = s.action || (s.decision === 'RIGHT' ? 'right_swipe' : s.decision === 'LEFT' ? 'left_swipe' : 'save_swipe');
        return {
          ...s,
          userId: s.userId || req.user?.id || profile.userId || profile.id,
          action: resolvedAction,
          timestamp: s.timestamp || s.createdAt,
          jobTitle: s.jobTitle || job?.title,
          company: s.company || job?.company,
          skills: s.skills || job?.extractedSkills || job?.keywords || [],
          location: s.location || job?.location,
          employmentType: s.employmentType || job?.employmentType,
          experienceLevel: s.experienceLevel || job?.experienceLevel,
          jobCategory: s.jobCategory || job?.companyType,
          job: job || undefined,
          applied: !!app,
          applicationId: app?.id,
          applicationStatus: app?.status,
          appliedDate: app?.appliedDate
        };
      })
      .filter(s => {
        const targetAction = action || filter;
        if (!targetAction || targetAction === 'all') return true;
        if (targetAction === 'right_swipe' || targetAction === 'interested') {
          return s.decision === 'RIGHT' || s.action === 'right_swipe' || s.decision === 'SAVE';
        }
        if (targetAction === 'left_swipe' || targetAction === 'rejected') {
          return s.decision === 'LEFT' || s.action === 'left_swipe';
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());

    res.json({
      success: true,
      data: enrichedHistory
    });
  },

  async getInterestedJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const history = swipeRepository.findByCandidate(profile.id);
    const candidateApplications = applicationRepository.findByCandidate(profile.id);
    const appByJobId = new Map(candidateApplications.map(a => [a.jobId, a]));

    const interested = history
      .filter(s => s.decision === 'RIGHT' || s.action === 'right_swipe' || s.decision === 'SAVE')
      .map(s => {
        const job = jobRepository.findById(s.jobId) || s.job;
        const app = appByJobId.get(s.jobId);
        return {
          ...s,
          userId: s.userId || req.user?.id || profile.userId || profile.id,
          action: 'right_swipe' as const,
          timestamp: s.timestamp || s.createdAt,
          jobTitle: s.jobTitle || job?.title,
          company: s.company || job?.company,
          skills: s.skills || job?.extractedSkills || job?.keywords || [],
          location: s.location || job?.location,
          employmentType: s.employmentType || job?.employmentType,
          experienceLevel: s.experienceLevel || job?.experienceLevel,
          jobCategory: s.jobCategory || job?.companyType,
          job: job || undefined,
          applied: !!app,
          applicationId: app?.id,
          applicationStatus: app?.status,
          appliedDate: app?.appliedDate
        };
      })
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());

    res.json({
      success: true,
      total: interested.length,
      data: interested
    });
  },

  async getRejectedJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const history = swipeRepository.findByCandidate(profile.id);
    const rejected = history
      .filter(s => s.decision === 'LEFT' || s.action === 'left_swipe')
      .map(s => {
        const job = jobRepository.findById(s.jobId) || s.job;
        return {
          ...s,
          userId: s.userId || req.user?.id || profile.userId || profile.id,
          action: 'left_swipe' as const,
          timestamp: s.timestamp || s.createdAt,
          jobTitle: s.jobTitle || job?.title,
          company: s.company || job?.company,
          skills: s.skills || job?.extractedSkills || job?.keywords || [],
          location: s.location || job?.location,
          employmentType: s.employmentType || job?.employmentType,
          experienceLevel: s.experienceLevel || job?.experienceLevel,
          jobCategory: s.jobCategory || job?.companyType,
          job: job || undefined,
          applied: false
        };
      })
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());

    res.json({
      success: true,
      total: rejected.length,
      data: rejected
    });
  },

  async deleteSwipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const { jobId } = req.params;
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_JOB_ID', message: 'Job ID parameter is required' }
        });
        return;
      }

      const removed = swipeRepository.remove(profile.id, jobId);
      res.json({
        success: true,
        message: removed ? 'Swipe removed from history' : 'Swipe not found',
        data: { jobId, removed }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_SWIPE_FAILED', message: err.message }
      });
    }
  },

  async clearHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const clearedCount = swipeRepository.clearCandidate(profile.id);
      res.json({
        success: true,
        message: `Cleared ${clearedCount} swipe records from history`,
        data: { clearedCount }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CLEAR_HISTORY_FAILED', message: err.message }
      });
    }
  },

  async undoSwipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const { jobId } = req.body as { jobId?: string };
      let targetJobId = jobId;

      // If no specific jobId provided, find the candidate's most recent swipe
      if (!targetJobId) {
        const history = swipeRepository.findByCandidate(profile.id);
        if (history.length > 0) {
          targetJobId = history[history.length - 1].jobId;
        }
      }

      if (!targetJobId) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_SWIPE_TO_UNDO', message: 'No swipe history found to undo' }
        });
        return;
      }

      const removed = swipeRepository.remove(profile.id, targetJobId);

      res.json({
        success: true,
        message: 'Swipe reverted successfully',
        data: {
          jobId: targetJobId,
          undone: removed
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'UNDO_FAILED', message: err.message }
      });
    }
  }
};

export const savedJobController = {
  async getSavedJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const saved = savedJobRepository.findByCandidate(profile.id);
    res.json({
      success: true,
      data: saved
    });
  },

  async saveJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { jobId, notes } = req.body;

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const job = jobRepository.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
      return;
    }

    const saved: SavedJob = {
      id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      candidateProfileId: profile.id,
      jobId,
      job,
      notes,
      createdAt: new Date().toISOString()
    };

    savedJobRepository.save(saved);

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: saved
    });
  },

  async removeSavedJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { jobId } = req.params;

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const removed = savedJobRepository.remove(profile.id, jobId);
    res.json({
      success: true,
      message: removed ? 'Job removed from saved list' : 'Job was not in saved list'
    });
  }
};

export const applicationController = {
  async submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const { jobId, coverLetter, candidateNotes } = req.body;
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_JOB_ID', message: 'jobId is required to submit application' }
        });
        return;
      }

      const job = jobRepository.findById(jobId);
      if (!job) {
        res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
        });
        return;
      }

      const existing = applicationRepository.findByCandidateAndJob(profile.id, jobId);
      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: 'ALREADY_APPLIED', message: 'You have already applied for this job.' },
          data: existing
        });
        return;
      }

      const activeResume = resumeRepository.findActiveByCandidateId(profile.id);
      const atsReport = atsRepository.findByCandidateAndJob(profile.id, jobId);

      const now = new Date().toISOString();
      const year = new Date().getFullYear();
      const randomSuffix = String(Math.floor(10000 + Math.random() * 90000));
      const appId = `SWX-${year}-${randomSuffix}`;

      const app: Application = {
        id: appId,
        candidateProfileId: profile.id,
        jobId,
        job,
        resumeId: activeResume?.id || 'profile_submission',
        atsReportId: atsReport?.id,
        atsScore: atsReport?.atsScore || 85,
        status: 'APPLIED',
        appliedDate: now,
        updatedDate: now,
        coverLetter: coverLetter || '',
        candidateNotes: candidateNotes || '',
        statusHistory: [
          {
            status: 'APPLIED',
            timestamp: now,
            note: 'Application submitted via SwipeX'
          }
        ]
      };

      // Persist to MongoDB and local state with write confirmation
      await applicationRepository.create(app);

      // Record positive swipe signal and link application
      swipeRepository.record({
        id: `sw_${Date.now()}`,
        candidateProfileId: profile.id,
        jobId,
        decision: 'RIGHT',
        action: 'right_swipe',
        jobTitle: job.title,
        company: job.company,
        skills: job.extractedSkills || job.keywords || [],
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        jobCategory: job.companyType,
        applied: true,
        applicationId: app.id,
        applicationStatus: 'APPLIED',
        appliedDate: now,
        createdAt: now
      });

      res.status(201).json({
        success: true,
        message: 'Application Submitted Successfully ✓',
        data: app
      });
    } catch (err: any) {
      console.error('[ApplicationController] Failed to save application:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'APPLICATION_SUBMIT_FAILED',
          message: 'Application could not be submitted. Please try again.'
        }
      });
    }
  },

  async getApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const apps = applicationRepository.findByCandidate(profile.id);
    res.json({
      success: true,
      data: apps
    });
  },

  async getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { id } = req.params;

    const app = applicationRepository.findById(id);
    if (!app || (profile && app.candidateProfileId !== profile.id)) {
      res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found or access denied' }
      });
      return;
    }

    res.json({
      success: true,
      data: app
    });
  },

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, note } = req.body;

    const updated = applicationRepository.updateStatus(id, status, note);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' }
      });
      return;
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated
    });
  },

  async updateApplicationNotes(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { id } = req.params;
    const { candidateNotes } = req.body;

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const app = applicationRepository.findById(id);
    if (!app || app.candidateProfileId !== profile.id) {
      res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found or access denied' }
      });
      return;
    }

    const updated = applicationRepository.updateNotes(id, candidateNotes || '');
    res.json({
      success: true,
      message: 'Application notes updated successfully',
      data: updated
    });
  },

  async withdrawApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { id } = req.params;

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const app = applicationRepository.findById(id);
    if (!app || app.candidateProfileId !== profile.id) {
      res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found or access denied' }
      });
      return;
    }

    const removed = applicationRepository.delete(id);
    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: { id, removed }
    });
  }
};

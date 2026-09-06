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

      const { jobId, decision } = req.body as { jobId: string; decision: SwipeDecisionType };

      if (!jobId || !decision || !['LEFT', 'SAVE', 'RIGHT'].includes(decision)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_SWIPE', message: 'Valid jobId and decision (LEFT, SAVE, RIGHT) are required' }
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

      const swipe: SwipeDecision = {
        id: `sw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        candidateProfileId: profile.id,
        jobId,
        decision,
        createdAt: new Date().toISOString()
      };

      swipeRepository.record(swipe);

      // If decision is SAVE, automatically add to saved jobs
      if (decision === 'SAVE') {
        const saved: SavedJob = {
          id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          candidateProfileId: profile.id,
          jobId,
          job,
          createdAt: new Date().toISOString()
        };
        savedJobRepository.save(saved);
      }

      res.status(201).json({
        success: true,
        message: `Swipe ${decision} recorded successfully`,
        data: {
          swipe,
          proceedToApply: decision === 'RIGHT'
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

    const history = swipeRepository.findByCandidate(profile.id);
    const candidateApplications = applicationRepository.findByCandidate(profile.id);
    const appliedJobIds = new Set(candidateApplications.map(a => a.jobId));

    const enrichedHistory = history
      .map(s => {
        const job = jobRepository.findById(s.jobId);
        return {
          ...s,
          job: job || undefined,
          applied: appliedJobIds.has(s.jobId)
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: enrichedHistory
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
          error: { code: 'ALREADY_APPLIED', message: 'You have already submitted an application for this position' }
        });
        return;
      }

      const activeResume = resumeRepository.findActiveByCandidateId(profile.id);
      const atsReport = atsRepository.findByCandidateAndJob(profile.id, jobId);

      const now = new Date().toISOString();
      const app: Application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
            note: 'Application submitted via Swipe X'
          }
        ]
      };

      applicationRepository.create(app);

      // Record positive swipe signal
      swipeRepository.record({
        id: `sw_${Date.now()}`,
        candidateProfileId: profile.id,
        jobId,
        decision: 'RIGHT',
        createdAt: now
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! Your application is now in review.',
        data: app
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'APPLICATION_SUBMIT_FAILED', message: err.message }
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
  }
};

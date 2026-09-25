import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { jobRepository, savedJobRepository, applicationRepository } from '../repositories/jobRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { jobMatcherService } from '../ai/jobMatcher/jobMatcherService';
import { recommendationEngineService } from '../ai/recommendationEngine/recommendationEngineService';

export const jobController = {
  async getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { 
      search, 
      workType, 
      employmentType, 
      companyType, 
      competitionLevel, 
      experienceLevel,
      isFresherFriendly,
      isEarlyApplicant,
      limit, 
      offset 
    } = req.query;

    const result = jobRepository.findAll({
      search: search as string,
      workType: workType as string,
      employmentType: employmentType as string,
      companyType: companyType as string,
      competitionLevel: competitionLevel as string,
      experienceLevel: experienceLevel as string,
      isFresherFriendly: isFresherFriendly === 'true',
      isEarlyApplicant: isEarlyApplicant === 'true',
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0
    });

    let appliedJobIds: string[] = [];
    if (req.candidateProfile) {
      const userApps = applicationRepository.findByCandidate(req.candidateProfile.id);
      appliedJobIds = userApps.map(a => a.jobId);
    }

    res.json({
      success: true,
      data: {
        jobs: result.jobs,
        total: result.total,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
        appliedJobIds
      }
    });
  },

  async getJobById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const job = jobRepository.findById(id);

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
      return;
    }

    let matchInfo = undefined;
    let isSaved = false;
    let applicationStatus = undefined;
    let application = undefined;

    if (req.candidateProfile) {
      const activeResume = resumeRepository.findActiveByCandidateId(req.candidateProfile.id);
      const resumeData = activeResume ? resumeRepository.getResumeDataByResumeId(activeResume.id) : undefined;
      matchInfo = jobMatcherService.calculateMatch(req.candidateProfile, resumeData, job);
      isSaved = savedJobRepository.isSaved(req.candidateProfile.id, job.id);
      
      const app = applicationRepository.findByCandidateAndJob(req.candidateProfile.id, job.id);
      if (app) {
        applicationStatus = app.status;
        application = app;
      }
    }

    res.json({
      success: true,
      data: {
        job,
        matchInfo,
        isSaved,
        applicationStatus,
        application
      }
    });
  },

  async getJobStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const total = jobRepository.count();
    res.json({
      success: true,
      data: {
        totalJobs: total,
        datasetSource: 'clean_jobs.csv',
        verifiedSources: ['LinkedIn', 'Indeed', 'Glassdoor', 'Greenhouse', 'Lever']
      }
    });
  }
};

export const recommendationController = {
  async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const includeSwiped = req.query.includeSwiped === 'true';

      const activeResume = resumeRepository.findActiveByCandidateId(profile.id);
      const resumeData = activeResume ? resumeRepository.getResumeDataByResumeId(activeResume.id) : undefined;

      const results = await recommendationEngineService.getRecommendations(profile, resumeData, {
        limit,
        offset,
        includeSwiped
      });

      res.json({
        success: true,
        data: results
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RECOMMENDATION_ERROR', message: err.message }
      });
    }
  }
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { atsRepository, jobRepository } from '../repositories/jobRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { atsAnalyzerService } from '../ai/atsAnalyzer/atsAnalyzerService';

export const atsController = {
  async analyzeJobATS(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const { jobId } = req.body;
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_JOB_ID', message: 'jobId is required for ATS analysis' }
        });
        return;
      }

      const job = jobRepository.findById(jobId);
      if (!job) {
        res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'The requested job posting was not found' }
        });
        return;
      }

      const activeResume = resumeRepository.findActiveByCandidateId(profile.id);
      const resumeData = activeResume ? resumeRepository.getResumeDataByResumeId(activeResume.id) : undefined;

      if (!activeResume || !resumeData) {
        res.status(400).json({
          success: false,
          error: {
            code: 'RESUME_REQUIRED',
            message: 'Please upload your resume before running an ATS scan. ATS analysis evaluates your real resume content, skills, and work history against job requirements.'
          }
        });
        return;
      }

      // Check if report already cached
      const existing = atsRepository.findByCandidateAndJob(profile.id, job.id);
      if (existing && !req.body.forceRefresh) {
        res.json({
          success: true,
          message: 'Retrieved cached ATS report',
          data: existing
        });
        return;
      }

      const report = await atsAnalyzerService.analyzeJobATS({
        candidateProfileId: profile.id,
        resumeId: activeResume?.id || 'profile',
        resumeData,
        job
      });

      atsRepository.save(report);

      res.status(201).json({
        success: true,
        message: 'ATS analysis completed successfully',
        data: report
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ATS_ANALYSIS_FAILED', message: err.message }
      });
    }
  },

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const reports = atsRepository.findByCandidate(profile.id);
    res.json({
      success: true,
      data: reports
    });
  },

  async getReportById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { id } = req.params;

    const report = atsRepository.findById(id);
    if (!report || (profile && report.candidateProfileId !== profile.id)) {
      res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'ATS report not found or access denied' }
      });
      return;
    }

    res.json({
      success: true,
      data: report
    });
  }
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { candidateRepository } from '../repositories/userRepository';
import { resumeRepository } from '../repositories/resumeRepository';
import { atsRepository, savedJobRepository, applicationRepository, swipeRepository } from '../repositories/jobRepository';
import { recommendationEngineService } from '../ai/recommendationEngine/recommendationEngineService';

export const candidateController = {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: profile
    });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const {
      name,
      phone,
      location,
      summary,
      preferredRole,
      preferredLocation,
      preferredWorkType,
      experienceLevel,
      targetSalary,
      skills,
      experienceYears
    } = req.body;

    const updated = candidateRepository.update(profile.id, {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(summary !== undefined && { summary }),
      ...(preferredRole !== undefined && { preferredRole }),
      ...(preferredLocation !== undefined && { preferredLocation }),
      ...(preferredWorkType !== undefined && { preferredWorkType }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(targetSalary !== undefined && { targetSalary: Number(targetSalary) }),
      ...(skills && Array.isArray(skills) && { skills }),
      ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) })
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  },

  async getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const activeResume = resumeRepository.findActiveByCandidateId(profile.id);
    const resumeData = activeResume ? resumeRepository.getResumeDataByResumeId(activeResume.id) : undefined;
    
    const savedJobs = savedJobRepository.findByCandidate(profile.id);
    const applications = applicationRepository.findByCandidate(profile.id);
    const candidateSwipes = swipeRepository.findByCandidate(profile.id);
    const atsReports = atsRepository.findByCandidate(profile.id);

    // Calculate latest or average ATS score without fake default values
    let averageAtsScore: number | null = null;
    if (atsReports.length > 0) {
      const sum = atsReports.reduce((acc, r) => acc + r.atsScore, 0);
      averageAtsScore = Math.round(sum / atsReports.length);
    } else if (resumeData && typeof resumeData.atsReadinessScore === 'number') {
      averageAtsScore = resumeData.atsReadinessScore;
    }

    // Recommendation count
    const recResults = await recommendationEngineService.getRecommendations(profile, resumeData, { limit: 10 });

    res.json({
      success: true,
      data: {
        profileCompletion: profile.profileCompletionScore,
        resumeStatus: activeResume ? 'Ready' : 'Not Uploaded',
        hasActiveResume: !!activeResume,
        resumeFileName: activeResume?.fileName,
        atsScore: averageAtsScore,
        recommendedJobsCount: recResults.totalAvailable,
        savedJobsCount: savedJobs.length,
        applicationsCount: applications.length,
        swipesCount: candidateSwipes.length,
        behavioralInsights: recResults.behavioralProfile,
        recentApplications: applications.slice(-3).reverse(),
        topRecommendations: recResults.recommendations.slice(0, 4)
      }
    });
  }
};

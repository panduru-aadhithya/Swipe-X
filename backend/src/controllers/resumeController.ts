import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { resumeRepository } from '../repositories/resumeRepository';
import { candidateRepository } from '../repositories/userRepository';
import { resumeParserService } from '../ai/resumeParser/resumeParserService';
import { Resume, ResumeData } from '../types';

export const resumeController = {
  async uploadResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      let fileName = 'Uploaded_Resume.txt';
      let fileSize = 1024;
      let mimeType = 'text/plain';
      let rawText = '';

      // If file was uploaded via multer or text body
      if (req.file) {
        fileName = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
        rawText = req.file.buffer.toString('utf8');
      } else if (req.body.text) {
        rawText = req.body.text;
        fileName = req.body.fileName || 'Resume_Text.txt';
      }

      if (!rawText || rawText.trim().length < 20) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RESUME_CONTENT',
            message: 'Resume text is too short or could not be extracted from the file'
          }
        });
        return;
      }

      const now = new Date().toISOString();
      const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const resume: Resume = {
        id: resumeId,
        userId: req.user!.id,
        candidateProfileId: profile.id,
        fileName,
        fileSize,
        mimeType,
        rawText,
        parsingStatus: 'PENDING',
        createdAt: now,
        updatedAt: now
      };

      resumeRepository.create(resume);

      // AI Parsing execution
      const parsedOutput = await resumeParserService.parseResumeText(rawText, fileName);

      const resumeData: ResumeData = {
        id: `rd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        resumeId: resume.id,
        candidateProfileId: profile.id,
        name: parsedOutput.name || profile.name,
        email: parsedOutput.email || profile.email,
        phone: parsedOutput.phone || profile.phone,
        location: parsedOutput.location || profile.location,
        summary: parsedOutput.summary || profile.summary,
        skills: parsedOutput.skills,
        experience: parsedOutput.experience,
        education: parsedOutput.education,
        projects: parsedOutput.projects,
        certifications: parsedOutput.certifications,
        atsReadinessScore: parsedOutput.atsReadinessScore,
        strengths: parsedOutput.strengths,
        areasForImprovement: parsedOutput.areasForImprovement,
        createdAt: now,
        updatedAt: now
      };

      resumeRepository.saveResumeData(resumeData);
      resumeRepository.update(resume.id, {
        parsingStatus: 'PARSED',
        parsedAt: new Date().toISOString()
      });

      // Update candidate profile skills with newly extracted skills
      const extractedSkillNames = parsedOutput.skills.map(s => s.name);
      const combinedSkills = Array.from(new Set([...(profile.skills || []), ...extractedSkillNames]));
      
      candidateRepository.update(profile.id, {
        skills: combinedSkills,
        summary: parsedOutput.summary || profile.summary,
        experienceYears: parsedOutput.experience.length * 2 || profile.experienceYears
      });

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully by AI',
        data: {
          resume,
          resumeData
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RESUME_PROCESSING_ERROR', message: err.message }
      });
    }
  },

  async getActiveResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const resume = resumeRepository.findActiveByCandidateId(profile.id);
    if (!resume) {
      res.json({
        success: true,
        data: null
      });
      return;
    }

    const resumeData = resumeRepository.getResumeDataByResumeId(resume.id);

    res.json({
      success: true,
      data: {
        resume,
        resumeData
      }
    });
  },

  async loadDemoResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      error: { code: 'DEMO_RESUME_REMOVED', message: 'Demo resume feature is discontinued. Please upload your personal resume.' }
    });
  },

  async getAllVersions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
      });
      return;
    }

    const resumes = resumeRepository.findByCandidateId(profile.id);
    const versions = resumes.map((r, idx) => {
      const data = resumeRepository.getResumeDataByResumeId(r.id);
      return {
        id: r.id,
        userId: r.userId,
        title: r.title || (idx === 0 ? 'Full-Stack & Systems Resume (Default)' : `Targeted Resume Version ${idx + 1}`),
        fileName: r.fileName,
        fileSize: r.fileSize,
        atsScore: data?.atsReadinessScore || 88,
        isActive: idx === 0 || r.isActive === true,
        uploadedAt: r.createdAt,
        extractedSkillsCount: data?.skills?.length || 8
      };
    });

    res.json({
      success: true,
      data: {
        versions,
        total: versions.length
      }
    });
  },

  async setActiveVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
    const profile = req.candidateProfile;
    const { id } = req.params;
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } });
      return;
    }

    const resumes = resumeRepository.findByCandidateId(profile.id);
    resumes.forEach(r => {
      resumeRepository.update(r.id, { isActive: r.id === id });
    });

    res.json({
      success: true,
      message: 'Active resume version updated successfully'
    });
  }
};

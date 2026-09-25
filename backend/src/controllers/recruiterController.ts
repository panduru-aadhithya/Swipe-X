import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Job, RecruiterApplicant, ApplicationStatus, WorkType, EmploymentType, CompanyType } from '../types';
import { db } from '../database/db';
import { extractSkillsFromText } from '../services/dataImporter';

export const recruiterController = {
  // 1. Post a new job
  postJob(req: AuthenticatedRequest, res: Response): void {
    try {
      const {
        title,
        company,
        location,
        workType,
        employmentType,
        companyType,
        salaryMin,
        salaryMax,
        description,
        skills,
        experienceRequirements,
        educationRequirements
      } = req.body;

      if (!title || !company || !description) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Title, company, and job description are required' }
        });
        return;
      }

      const now = new Date().toISOString();
      const id = `rec_job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const extractedSkills = Array.isArray(skills) && skills.length > 0
        ? skills
        : extractSkillsFromText(description, title);

      const newJob: Job = {
        id,
        title: title.trim(),
        company: company.trim(),
        location: (location || 'Remote').trim(),
        link: `/candidate/jobs/${id}`,
        source: 'Recruiter Direct',
        datePosted: now.split('T')[0],
        workType: (workType as WorkType) || 'Remote',
        employmentType: (employmentType as EmploymentType) || 'Full-time',
        companyType: (companyType as CompanyType) || 'Startup',
        description: description.trim(),
        salaryMin: salaryMin ? Number(salaryMin) : 120000,
        salaryMax: salaryMax ? Number(salaryMax) : 175000,
        salaryCurrency: 'USD',
        extractedSkills,
        experienceRequirements: experienceRequirements || '3+ years experience',
        educationRequirements: educationRequirements || 'BS in Computer Science or equivalent',
        experienceLevel: title.toLowerCase().includes('senior') ? 'Senior' : 'Mid',
        normalizedTitle: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
        normalizedCompany: company.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
        normalizedLocation: (location || 'Remote').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(),
        keywords: [
          ...extractedSkills.map((s: string) => s.toLowerCase()),
          company.toLowerCase(),
          (workType || 'remote').toLowerCase()
        ],
        applicantsCount: 1,
        competitionLevel: 'Low',
        isEarlyApplicant: true,
        isFresherFriendly: title.toLowerCase().includes('junior') || title.toLowerCase().includes('associate'),
        postedTimeAgo: 'Just now',
        isFresh: true,
        recruiterId: req.user?.id || 'recruiter_demo',
        createdAt: now,
        updatedAt: now
      };

      const updatedJobs = [newJob, ...db.jobs];
      db.setJobs(updatedJobs);

      res.status(201).json({
        success: true,
        message: 'Job posting created and published to candidate swipe decks',
        data: newJob
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'JOB_POST_FAILED', message: err.message }
      });
    }
  },

  // 2. Get recruiter's posted jobs
  getPostedJobs(req: AuthenticatedRequest, res: Response): void {
    const recruiterId = req.user?.id;
    // Return jobs posted by this recruiter (or recruiter_demo fallback)
    const recruiterJobs = db.jobs.filter(j => j.recruiterId === recruiterId || (req.user && j.recruiterId === 'recruiter_demo'));

    res.json({
      success: true,
      data: {
        jobs: recruiterJobs,
        total: recruiterJobs.length
      }
    });
  },

  // Delete a job posted by recruiter (removes it immediately from Jobs Discovery)
  deleteJob(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const recruiterId = req.user?.id;
    const initialCount = db.jobs.length;
    const updated = db.jobs.filter(j => !(j.id === id && (j.recruiterId === recruiterId || j.recruiterId === 'recruiter_demo')));
    
    if (updated.length < initialCount) {
      db.setJobs(updated);
      res.json({
        success: true,
        message: 'Job successfully removed from Jobs Discovery'
      });
    } else {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job not found or unauthorized' }
      });
    }
  },

  // 3. Get incoming applicants across all posted jobs
  getApplicants(req: AuthenticatedRequest, res: Response): void {
    const applications = db.applications;
    const candidates = db.candidateProfiles;
    const resumes = db.resumeData;

    // Convert applications into structured RecruiterApplicant view
    const applicants: RecruiterApplicant[] = [];

    // Always provide candidate applications or realistic demo talent candidates
    for (const app of applications) {
      const cand = candidates.find(c => c.id === app.candidateProfileId);
      const resData = resumes.find(r => r.candidateProfileId === app.candidateProfileId);

      applicants.push({
        applicationId: app.id,
        candidateId: app.candidateProfileId,
        candidateName: cand?.name || 'Applicant',
        candidateEmail: cand?.email || 'applicant@example.com',
        jobId: app.jobId,
        jobTitle: app.job.title,
        jobCompany: app.job.company,
        status: app.status,
        appliedDate: app.appliedDate,
        atsScore: app.atsScore || 92,
        matchedSkills: resData?.skills?.map(s => s.name).slice(0, 6) || ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        missingSkills: ['Kubernetes'],
        coverLetter: app.coverLetter,
        candidateNotes: app.candidateNotes,
        resumeFileName: cand?.name ? `${cand.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Candidate_Resume.pdf',
        experienceYears: cand?.experienceYears || 5
      });
    }

    // Seed realistic applicants if fewer than 4 applications exist
    if (applicants.length < 4) {
      const demoPool = [
        { name: 'Jordan Rivera', email: 'jordan.rivera@talent.io', role: 'Full Stack Engineer', ats: 96, status: 'SHORTLISTED' as ApplicationStatus, exp: 4, skills: ['React', 'TypeScript', 'Next.js', 'PostgreSQL', 'GraphQL'] },
        { name: 'Elena Rostova', email: 'elena.rostova@engineer.dev', role: 'Backend / Systems Engineer', ats: 91, status: 'INTERVIEW' as ApplicationStatus, exp: 6, skills: ['Python', 'Go', 'Docker', 'AWS', 'Kubernetes'] },
        { name: 'Marcus Sterling', email: 'marcus.s@techpool.com', role: 'Frontend Architect', ats: 88, status: 'UNDER_REVIEW' as ApplicationStatus, exp: 5, skills: ['React', 'Tailwind CSS', 'Redux', 'System Design'] },
        { name: 'Priya Sharma', email: 'priya.sharma@aiml.org', role: 'AI / Full Stack Developer', ats: 84, status: 'APPLIED' as ApplicationStatus, exp: 3, skills: ['TypeScript', 'Python', 'PyTorch', 'FastAPI'] }
      ];

      demoPool.forEach((demo, idx) => {
        const targetJob = db.jobs[idx % db.jobs.length];
        applicants.push({
          applicationId: `rec_app_demo_${idx + 1}`,
          candidateId: `cand_pool_${idx + 1}`,
          candidateName: demo.name,
          candidateEmail: demo.email,
          jobId: targetJob.id,
          jobTitle: targetJob.title,
          jobCompany: targetJob.company,
          status: demo.status,
          appliedDate: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
          atsScore: demo.ats,
          matchedSkills: demo.skills,
          missingSkills: ['Rust'],
          coverLetter: `Hi Hiring Team, I am eager to bring my ${demo.exp} years of engineering experience to the ${targetJob.title} role at ${targetJob.company}.`,
          candidateNotes: 'Candidate completed automated ATS pre-screening and passed skill verification.',
          resumeFileName: `${demo.name.replace(' ', '_')}_Resume.pdf`,
          experienceYears: demo.exp
        });
      });
    }

    res.json({
      success: true,
      data: {
        applicants,
        total: applicants.length,
        pipelineSummary: {
          applied: applicants.filter(a => a.status === 'APPLIED').length,
          underReview: applicants.filter(a => a.status === 'UNDER_REVIEW').length,
          shortlisted: applicants.filter(a => a.status === 'SHORTLISTED').length,
          interview: applicants.filter(a => a.status === 'INTERVIEW').length,
          accepted: applicants.filter(a => a.status === 'ACCEPTED').length,
          rejected: applicants.filter(a => a.status === 'REJECTED').length
        }
      }
    });
  },

  // 4. Update applicant status (Shortlist, Interview, Accept, Reject)
  updateApplicantStatus(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Provided status is invalid' }
      });
      return;
    }

    const app = db.applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      app.updatedDate = new Date().toISOString();
      app.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated by recruiter to ${status}`
      });
      db.saveState();
    }

    res.json({
      success: true,
      message: `Applicant status successfully transitioned to ${status}`
    });
  }
};

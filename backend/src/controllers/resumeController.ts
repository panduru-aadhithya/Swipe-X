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
    try {
      const profile = req.candidateProfile;
      if (!profile) {
        res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Candidate profile not found' }
        });
        return;
      }

      const demoText = `
Alex Morgan
San Francisco, CA | (415) 890-1234 | alex.morgan@example.com | linkedin.com/in/alex-morgan-dev

PROFESSIONAL SUMMARY
Senior Full Stack & AI Systems Engineer with 5+ years of experience designing and operating distributed web platforms, modern React micro-frontends, and LLM-powered enterprise tooling. Proven track record of architecting event-driven microservices that reduce endpoint latency by 45% while maintaining 99.99% system availability.

CORE COMPETENCIES & TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux, GraphQL
Databases & Caching: PostgreSQL, Redis, MongoDB, DynamoDB, Vector Databases (Pinecone/pgvector)
Cloud & DevOps: AWS (ECS, Lambda, S3, RDS, CloudFront), Docker, Kubernetes, Terraform, CI/CD, GitHub Actions
AI & Machine Learning: LLM Integrations, Gemini API, LangChain, RAG Pipelines, Prompt Engineering, PyTorch
Testing & Quality: Jest, Playwright, Cypress, TDD, Static Code Analysis, RESTful API Design

PROFESSIONAL EXPERIENCE

Senior Full Stack Engineer | CloudScale Technologies | San Francisco, CA | 2022 – Present
- Spearheaded the redesign of the core customer portal using React 19, TypeScript, and Tailwind CSS, increasing page responsiveness by 50% and improving conversion by 22%.
- Designed and maintained high-throughput REST and GraphQL backend services in Node.js and PostgreSQL processing over 25M daily requests.
- Integrated Gemini LLM capabilities for automated support triage and smart contextual search, decreasing ticket resolution time by 38%.
- Managed containerized deployment pipeline with Docker, AWS ECS, and GitHub Actions with zero-downtime rolling releases.
- Mentored a distributed team of 6 engineers, established code review standards, and improved automated test coverage from 55% to 88%.

Full Stack Software Engineer | Horizon Data Labs | Austin, TX | 2020 – 2022
- Built end-to-end analytical dashboards for enterprise telemetry monitoring using React, TypeScript, and Node.js microservices.
- Optimized complex PostgreSQL SQL queries and implemented Redis caching layer, reducing heavy query latency from 1.8s to 120ms.
- Built automated CI/CD deployment workflows and infrastructure-as-code scripts using Terraform.
- Collaborated with product designers in Figma to create an accessible, WCAG-compliant design system library.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2016 – 2020
- Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Systems, Computer Security.

PROJECTS
- AI Agent Pipeline: Orchestrated multi-agent autonomous workflow service using Node.js, vector embeddings, and LangChain.
- Real-time Collaborative Canvas: Developed low-latency collaborative diagramming tool using WebSockets, React, and Redis Pub/Sub.

CERTIFICATIONS
- AWS Certified Solutions Architect – Associate (2024)
- Meta Certified Front-End Developer (2023)
`;

      const now = new Date().toISOString();
      const resumeId = `res_demo_${Date.now()}`;

      const resume: Resume = {
        id: resumeId,
        userId: req.user!.id,
        candidateProfileId: profile.id,
        fileName: 'Alex_Morgan_Senior_FullStack_Resume.pdf',
        fileSize: 48200,
        mimeType: 'application/pdf',
        rawText: demoText.trim(),
        parsingStatus: 'PENDING',
        createdAt: now,
        updatedAt: now
      };

      resumeRepository.create(resume);

      const parsedOutput = await resumeParserService.parseResumeText(demoText, 'Alex_Morgan_Resume.pdf');

      const resumeData: ResumeData = {
        id: `rd_demo_${Date.now()}`,
        resumeId: resume.id,
        candidateProfileId: profile.id,
        name: 'Alex Morgan',
        email: profile.email,
        phone: '(415) 890-1234',
        location: 'San Francisco, CA',
        summary: parsedOutput.summary,
        skills: parsedOutput.skills,
        experience: parsedOutput.experience,
        education: parsedOutput.education,
        projects: parsedOutput.projects,
        certifications: parsedOutput.certifications,
        atsReadinessScore: 92,
        strengths: [
          'Strong quantification of business and technical impact across positions',
          'High density of modern in-demand technologies (TypeScript, React, Python, AWS)',
          'Clear chronological structure and prominent technical competencies matrix'
        ],
        areasForImprovement: [
          'Highlight specific cloud cost-optimization numbers',
          'Add Kubernetes production cluster sizing details'
        ],
        createdAt: now,
        updatedAt: now
      };

      resumeRepository.saveResumeData(resumeData);
      resumeRepository.update(resume.id, {
        parsingStatus: 'PARSED',
        parsedAt: new Date().toISOString()
      });

      // Update candidate profile skills
      const extractedSkillNames = parsedOutput.skills.map(s => s.name);
      candidateRepository.update(profile.id, {
        skills: extractedSkillNames,
        summary: parsedOutput.summary,
        experienceYears: 5
      });

      res.status(201).json({
        success: true,
        message: 'Sample professional resume loaded and parsed successfully',
        data: {
          resume,
          resumeData
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DEMO_RESUME_ERROR', message: err.message }
      });
    }
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

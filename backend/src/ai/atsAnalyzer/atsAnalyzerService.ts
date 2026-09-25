import { getGeminiClient } from '../geminiClient';
import { ATSReport, Job, ResumeData } from '../../types';
import { extractSkillsFromText } from '../../services/dataImporter';

export interface ATSAnalysisRequest {
  candidateProfileId: string;
  resumeId: string;
  resumeData: ResumeData;
  job: Job;
}

export class ATSAnalyzerService {
  private readonly SCORING_WEIGHTS = {
    skills: 0.35,
    keywords: 0.25,
    experience: 0.20,
    education: 0.10,
    title: 0.10
  };

  private readonly DISCLAIMER = 
    "This ATS compatibility score is an algorithmic estimation based on semantic keyword density, skill overlap, and structural parsing best practices. It is designed as an optimization tool and does not guarantee an interview, assessment, or job offer.";

  async analyzeJobATS(req: ATSAnalysisRequest): Promise<ATSReport> {
    const { resumeData, job, candidateProfileId, resumeId } = req;
    const gemini = getGeminiClient();

    // 1. Calculate deterministic baseline metrics
    const candidateSkills = resumeData.skills.map(s => s.name.toLowerCase());
    const jobSkills = job.extractedSkills.map(s => s.toLowerCase());

    const matchedSkillsRaw = job.extractedSkills.filter(js => 
      candidateSkills.some(cs => cs === js.toLowerCase() || cs.includes(js.toLowerCase()) || js.toLowerCase().includes(cs))
    );

    const missingSkillsRaw = job.extractedSkills.filter(js => 
      !matchedSkillsRaw.includes(js)
    );

    // Keyword matching
    const resumeTextBlob = [
      resumeData.summary,
      ...resumeData.skills.map(s => s.name),
      ...resumeData.experience.flatMap(e => [e.title, e.company, ...e.responsibilities, ...e.technologies]),
      ...resumeData.projects.flatMap(p => [p.name, p.description, ...p.technologies])
    ].join(' ').toLowerCase();

    const matchedKeywords = job.keywords.filter(kw => resumeTextBlob.includes(kw.toLowerCase()));
    const missingKeywords = job.keywords.filter(kw => !matchedKeywords.includes(kw)).slice(0, 8);

    // Component scores - strictly based on real resume content vs job posting
    const skillRatio = jobSkills.length > 0 ? (matchedSkillsRaw.length / jobSkills.length) : (candidateSkills.length > 0 ? 0.5 : 0);
    const skillScore = Math.min(100, Math.max(0, Math.round(skillRatio * 100)));

    const keywordRatio = job.keywords.length > 0 ? (matchedKeywords.length / job.keywords.length) : 0;
    const keywordScore = Math.min(100, Math.max(0, Math.round(keywordRatio * 100)));

    // Title relevance - based strictly on candidate's real experience
    const candidateTitles = (resumeData.experience || []).map(e => (e.title || '').toLowerCase());
    const jobTitleLower = job.title.toLowerCase();
    const hasDirectTitleMatch = candidateTitles.some(ct => 
      ct && (jobTitleLower.includes(ct) || ct.includes(jobTitleLower))
    );
    const hasPartialTitleMatch = candidateTitles.some(ct => {
      const words = jobTitleLower.split(/[\s/()]+/).filter(w => w.length > 3);
      return words.some(w => ct.includes(w));
    });

    let titleScore = 0;
    if (candidateTitles.length === 0) {
      titleScore = 0;
    } else if (hasDirectTitleMatch) {
      titleScore = 95;
    } else if (hasPartialTitleMatch) {
      titleScore = 65;
    } else {
      titleScore = 20;
    }

    // Experience relevance - strictly based on uploaded experience records
    let experienceScore = 0;
    const expCount = (resumeData.experience || []).length;
    if (expCount === 0) {
      experienceScore = 0;
    } else if (expCount >= 3) {
      experienceScore = hasDirectTitleMatch ? 95 : 85;
    } else if (expCount >= 1) {
      experienceScore = hasDirectTitleMatch ? 80 : 65;
    }

    // Education relevance - strictly based on uploaded education records
    const eduCount = (resumeData.education || []).length;
    const educationScore = eduCount > 0 ? 90 : 0;

    const weightedScore = Math.round(
      skillScore * this.SCORING_WEIGHTS.skills +
      keywordScore * this.SCORING_WEIGHTS.keywords +
      experienceScore * this.SCORING_WEIGHTS.experience +
      educationScore * this.SCORING_WEIGHTS.education +
      titleScore * this.SCORING_WEIGHTS.title
    );

    const atsScore = Math.min(100, Math.max(0, weightedScore));

    let suggestions: string[] = [];
    let strengths: string[] = [];

    // 2. If Gemini is available, enhance with rich AI recommendations
    if (gemini) {
      const prompt = `
You are an expert ATS (Applicant Tracking System) optimization advisor.
Analyze this resume vs job description comparison and produce 3 actionable bullet suggestions for tailoring the resume, plus 2 specific strengths.
Strict rule: Do NOT invent false praise or fabricated experiences. Ground all observations strictly in the provided resume data.

Job Title: ${job.title}
Job Company: ${job.company}
Job Requirements Summary: ${job.description.slice(0, 1500)}

Candidate Summary: ${resumeData.summary || 'None provided'}
Candidate Skills: ${resumeData.skills.map(s => s.name).join(', ') || 'None listed'}
Candidate Experience: ${resumeData.experience.map(e => `${e.title} at ${e.company}`).join('; ') || 'No experience listed'}

Matched Skills: ${matchedSkillsRaw.join(', ') || 'None'}
Missing Skills: ${missingSkillsRaw.join(', ') || 'None'}
Missing Keywords: ${missingKeywords.join(', ') || 'None'}

Return valid JSON with:
{
  "suggestions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "strengths": [
    "Key verified strength 1",
    "Key verified strength 2"
  ]
}
`;

      const tryGenerate = async (model: string) => {
        const response = await gemini.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        const jsonText = response.text?.trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
            suggestions = parsed.suggestions;
          }
          if (Array.isArray(parsed.strengths) && parsed.strengths.length > 0) {
            strengths = parsed.strengths;
          }
        }
      };

      try {
        await tryGenerate('gemini-3.8-flash');
      } catch (err: any) {
        try {
          await tryGenerate('gemini-3.1-flash-lite');
        } catch (fallbackErr: any) {
          console.info('Gemini ATS feedback model unavailable (using deterministic rules):', fallbackErr?.message || 'High demand');
        }
      }
    }

    // Authentic deterministic fallback suggestions if model didn't return them
    if (suggestions.length === 0) {
      if (missingSkillsRaw.length > 0) {
        suggestions.push(`Incorporate key required technical competencies into your resume: ${missingSkillsRaw.slice(0, 3).join(', ')}.`);
      }
      if (missingKeywords.length > 0) {
        suggestions.push(`Align terminology with employer keywords: ${missingKeywords.slice(0, 3).join(', ')}.`);
      }
      if (expCount === 0) {
        suggestions.push(`Add your professional work history or relevant internships to satisfy ATS experience screening.`);
      } else {
        suggestions.push(`Quantify impact in your role bullets (e.g. latency reduction %, throughput, team size, or revenue).`);
      }
    }

    if (strengths.length === 0) {
      if (matchedSkillsRaw.length > 0) {
        strengths.push(`Direct skill match for ${matchedSkillsRaw.length} requirements: ${matchedSkillsRaw.slice(0, 4).join(', ')}.`);
      }
      if (hasDirectTitleMatch) {
        strengths.push(`Direct title and role alignment with target ${job.title} specification.`);
      }
      if (eduCount > 0) {
        strengths.push(`Academic credentials documented in resume.`);
      }
      if (strengths.length === 0) {
        strengths.push(`Resume parsed with ${resumeData.skills.length} skills. Note: Specific job requirements differ from current profile skills.`);
      }
    }

    const report: ATSReport = {
      id: `ats_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      candidateProfileId,
      jobId: job.id,
      resumeId,
      atsScore,
      skillScore,
      keywordScore,
      experienceScore,
      educationScore,
      matchedSkills: matchedSkillsRaw,
      missingSkills: missingSkillsRaw,
      matchedKeywords,
      missingKeywords,
      suggestions,
      strengths,
      scoringWeights: {
        skills: 35,
        keywords: 25,
        experience: 20,
        education: 10,
        title: 10
      },
      disclaimer: this.DISCLAIMER,
      createdAt: new Date().toISOString()
    };

    return report;
  }
}

export const atsAnalyzerService = new ATSAnalyzerService();

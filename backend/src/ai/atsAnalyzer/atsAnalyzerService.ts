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

    // Component scores
    const skillRatio = jobSkills.length > 0 ? (matchedSkillsRaw.length / jobSkills.length) : 0.8;
    const skillScore = Math.round(Math.min(100, Math.max(30, skillRatio * 100)));

    const keywordRatio = job.keywords.length > 0 ? (matchedKeywords.length / job.keywords.length) : 0.75;
    const keywordScore = Math.round(Math.min(100, Math.max(25, keywordRatio * 100)));

    // Experience relevance
    let experienceScore = 75;
    if (resumeData.experience.length >= 3) experienceScore = 90;
    else if (resumeData.experience.length >= 1) experienceScore = 80;
    else experienceScore = 60;

    // Education relevance
    const educationScore = resumeData.education.length > 0 ? 90 : 70;

    // Title relevance
    const candidateTitles = resumeData.experience.map(e => e.title.toLowerCase());
    const titleMatch = candidateTitles.some(ct => 
      job.title.toLowerCase().includes(ct) || ct.includes(job.title.toLowerCase()) ||
      (job.title.toLowerCase().includes('engineer') && ct.includes('engineer'))
    );
    const titleScore = titleMatch ? 90 : 70;

    const weightedScore = Math.round(
      skillScore * this.SCORING_WEIGHTS.skills +
      keywordScore * this.SCORING_WEIGHTS.keywords +
      experienceScore * this.SCORING_WEIGHTS.experience +
      educationScore * this.SCORING_WEIGHTS.education +
      titleScore * this.SCORING_WEIGHTS.title
    );

    const atsScore = Math.min(99, Math.max(35, weightedScore));

    let suggestions: string[] = [];
    let strengths: string[] = [];

    // 2. If Gemini is available, enhance with rich AI recommendations
    if (gemini) {
      const prompt = `
You are an expert ATS (Applicant Tracking System) optimization advisor.
Analyze this resume vs job description comparison and produce 3 actionable bullet suggestions for tailoring the resume, plus 2 specific strengths.

Job Title: ${job.title}
Job Company: ${job.company}
Job Requirements Summary: ${job.description.slice(0, 1500)}

Candidate Summary: ${resumeData.summary}
Candidate Skills: ${resumeData.skills.map(s => s.name).join(', ')}
Candidate Experience: ${resumeData.experience.map(e => `${e.title} at ${e.company}`).join('; ')}

Matched Skills: ${matchedSkillsRaw.join(', ')}
Missing Skills: ${missingSkillsRaw.join(', ')}
Missing Keywords: ${missingKeywords.join(', ')}

Return valid JSON with:
{
  "suggestions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "strengths": [
    "Key strength 1",
    "Key strength 2"
  ]
}
`;

      const tryGenerate = async (model: string) => {
        const response = await gemini.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
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
        await tryGenerate('gemini-3.7-flash');
      } catch (err: any) {
        // If primary model experiences high load (503 / 429) or transient error, attempt flash-lite
        try {
          await tryGenerate('gemini-3.1-flash-lite');
        } catch (fallbackErr: any) {
          // Gracefully fallback to deterministic suggestions
          console.info('Gemini ATS feedback model unavailable (using deterministic rules):', fallbackErr?.message || 'High demand');
        }
      }
    }

    // Default suggestions if needed
    if (suggestions.length === 0) {
      if (missingSkillsRaw.length > 0) {
        suggestions.push(`Integrate key required competencies: ${missingSkillsRaw.slice(0, 3).join(', ')} into your project or summary sections.`);
      }
      suggestions.push(`Quantify impact in your recent roles by highlighting latency reduction, revenue impact, or system throughput.`);
      suggestions.push(`Ensure standard terminology matching "${job.title}" is clearly visible in your professional headline.`);
    }

    if (strengths.length === 0) {
      strengths.push(`Strong overlap with core stack: ${matchedSkillsRaw.slice(0, 4).join(', ') || 'Software Engineering fundamentals'}.`);
      strengths.push(`Demonstrated professional experience relevant to ${job.title} role.`);
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

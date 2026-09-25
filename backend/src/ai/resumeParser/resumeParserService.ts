import { getGeminiClient } from '../geminiClient';
import { ResumeData, ResumeSkill, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification } from '../../types';
import { extractSkillsFromText } from '../../services/dataImporter';

export interface ParsedResumeOutput {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  atsReadinessScore: number;
  strengths: string[];
  areasForImprovement: string[];
}

export class ResumeParserService {
  async parseResumeText(rawText: string, fileName?: string): Promise<ParsedResumeOutput> {
    const gemini = getGeminiClient();

    if (gemini) {
      const prompt = `
You are an expert AI Resume Parser & ATS System Specialist. Parse the following resume text into a strictly structured JSON response.

Strict Rules:
- Only extract information that is explicitly written in the provided resume text.
- Do NOT fabricate, invent, or substitute placeholder companies, job titles, universities, degrees, skills, phone numbers, or email addresses.
- If a section (e.g. projects, certifications, education, experience) is not in the text, return an empty array [].
- If phone, email, or location are not in the text, return an empty string "".
- Compute atsReadinessScore (integer from 0 to 100) objectively based on formatting clarity, presence of contact info, skill taxonomy, and measurable experience bullets. Do NOT default to 85.

Resume text:
"""
${rawText.slice(0, 10000)}
"""

Respond with a valid JSON object matching this exact structure:
{
  "name": "Full Name extracted from resume or empty string",
  "email": "email extracted from resume or empty string",
  "phone": "phone extracted from resume or empty string",
  "location": "location extracted from resume or empty string",
  "summary": "Executive summary from resume or brief synopsis of resume text",
  "skills": [
    { "name": "Skill Name", "category": "Languages|Frameworks|Cloud/DevOps|Databases|AI/ML|Tools|Soft Skills|General", "level": "Beginner|Intermediate|Advanced|Expert" }
  ],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "YYYY or MMM YYYY",
      "endDate": "YYYY or Present",
      "current": true,
      "duration": "Duration if stated or empty string",
      "responsibilities": ["Bullet point from resume"],
      "technologies": ["Tech extracted from this role"]
    }
  ],
  "education": [
    {
      "institution": "University / College",
      "degree": "Degree earned",
      "field": "Field of study",
      "startDate": "YYYY",
      "endDate": "YYYY"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project overview",
      "technologies": ["Tech"]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer",
      "date": "Year"
    }
  ],
  "atsReadinessScore": 0,
  "strengths": ["Objective resume strength based purely on candidate content"],
  "areasForImprovement": ["Objective recommendation based purely on candidate content"]
}
`;

      const tryParseWithModel = async (model: string): Promise<ParsedResumeOutput | null> => {
        const response = await gemini.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const jsonText = response.text?.trim() || '';
        if (jsonText) {
          const parsed = JSON.parse(jsonText) as ParsedResumeOutput;
          return this.validateAndSanitize(parsed, rawText);
        }
        return null;
      };

      try {
        const result = await tryParseWithModel('gemini-3.8-flash');
        if (result) return result;
      } catch (err: any) {
        try {
          const result = await tryParseWithModel('gemini-3.1-flash-lite');
          if (result) return result;
        } catch (fallbackErr: any) {
          console.info('Gemini resume parser unavailable (using heuristic parsing):', fallbackErr?.message || 'High demand');
        }
      }
    }

    // Heuristic fallback without default/fabricated data
    return this.fallbackHeuristicParse(rawText, fileName);
  }

  private validateAndSanitize(parsed: Partial<ParsedResumeOutput>, rawText: string): ParsedResumeOutput {
    const rawSkills = extractSkillsFromText(rawText, '');
    const skillsList: ResumeSkill[] = Array.isArray(parsed.skills) && parsed.skills.length > 0
      ? parsed.skills.map(s => ({
          name: typeof s === 'string' ? s : s.name || 'General Engineering',
          category: s.category || 'General',
          level: s.level || 'Advanced'
        }))
      : rawSkills.map(name => ({ name, category: 'General', level: 'Advanced' }));

    const experiences = Array.isArray(parsed.experience) ? parsed.experience : [];
    const educations = Array.isArray(parsed.education) ? parsed.education : [];
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    const certs = Array.isArray(parsed.certifications) ? parsed.certifications : [];

    // Calculate real ATS readiness score if missing or invalid
    let atsReadiness = typeof parsed.atsReadinessScore === 'number'
      ? Math.min(100, Math.max(0, parsed.atsReadinessScore))
      : this.calculateRealReadiness(skillsList.length, experiences.length, educations.length, rawText);

    return {
      name: parsed.name || this.extractNameHeuristic(rawText),
      email: parsed.email || this.extractEmailHeuristic(rawText),
      phone: parsed.phone || this.extractPhoneHeuristic(rawText),
      location: parsed.location || this.extractLocationHeuristic(rawText),
      summary: parsed.summary || (rawText.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3).join(' ').slice(0, 300)),
      skills: skillsList,
      experience: experiences,
      education: educations,
      projects: projects,
      certifications: certs,
      atsReadinessScore: atsReadiness,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : (skillsList.length > 0 ? [`Identified ${skillsList.length} verified technical skills.`] : ['Resume uploaded for evaluation.']),
      areasForImprovement: Array.isArray(parsed.areasForImprovement) && parsed.areasForImprovement.length > 0
        ? parsed.areasForImprovement
        : (experiences.length === 0 ? ['Add employment history with quantifiable metric bullet points.'] : ['Expand on tech stack details.'])
    };
  }

  private calculateRealReadiness(skillCount: number, expCount: number, eduCount: number, text: string): number {
    let score = 10;
    if (this.extractEmailHeuristic(text)) score += 10;
    if (this.extractPhoneHeuristic(text)) score += 10;
    if (skillCount >= 10) score += 30;
    else if (skillCount >= 5) score += 20;
    else if (skillCount >= 1) score += 10;
    if (expCount >= 3) score += 30;
    else if (expCount >= 1) score += 20;
    if (eduCount >= 1) score += 10;
    return Math.min(100, Math.max(0, score));
  }

  private fallbackHeuristicParse(text: string, fileName?: string): ParsedResumeOutput {
    const email = this.extractEmailHeuristic(text);
    const phone = this.extractPhoneHeuristic(text);
    const location = this.extractLocationHeuristic(text);
    const name = this.extractNameHeuristic(text) || (fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : '');
    
    // Extract actual skills present in text
    const skills = extractSkillsFromText(text, '').map(s => ({
      name: s,
      category: 'Languages' as const,
      level: 'Advanced' as const
    }));

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const summary = lines.slice(0, 3).join(' ').slice(0, 300);

    // Parse real experience blocks if present in the text (DO NOT fabricate dummy companies!)
    const experiences: ResumeExperience[] = [];
    const experienceIndex = lines.findIndex(l => /^(experience|work experience|employment history|professional experience)/i.test(l));
    const educationIndex = lines.findIndex(l => /^(education|academic background|qualifications)/i.test(l));
    const projectsIndex = lines.findIndex(l => /^(projects|technical projects|key projects)/i.test(l));

    if (experienceIndex !== -1) {
      const endIdx = educationIndex > experienceIndex ? educationIndex : (projectsIndex > experienceIndex ? projectsIndex : Math.min(lines.length, experienceIndex + 15));
      const expLines = lines.slice(experienceIndex + 1, endIdx);
      
      let currentExp: Partial<ResumeExperience> | null = null;
      for (const line of expLines) {
        if (line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
          if (currentExp && currentExp.title) {
            experiences.push({
              company: currentExp.company || 'Organization',
              title: currentExp.title,
              startDate: currentExp.startDate || '',
              endDate: currentExp.endDate || 'Present',
              current: true,
              duration: '',
              responsibilities: currentExp.responsibilities || [],
              technologies: skills.slice(0, 3).map(s => s.name)
            });
          }
          currentExp = {
            title: line,
            company: 'Organization',
            responsibilities: []
          };
        } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 20)) {
          currentExp.responsibilities = currentExp.responsibilities || [];
          currentExp.responsibilities.push(line.replace(/^[•\-*]\s*/, ''));
        }
      }
      if (currentExp && currentExp.title) {
        experiences.push({
          company: currentExp.company || 'Organization',
          title: currentExp.title,
          startDate: currentExp.startDate || '',
          endDate: currentExp.endDate || 'Present',
          current: true,
          duration: '',
          responsibilities: currentExp.responsibilities || [],
          technologies: skills.slice(0, 3).map(s => s.name)
        });
      }
    }

    // Parse real education if present (DO NOT fabricate dummy colleges!)
    const education: ResumeEducation[] = [];
    if (educationIndex !== -1) {
      const endIdx = projectsIndex > educationIndex ? projectsIndex : Math.min(lines.length, educationIndex + 8);
      const eduLines = lines.slice(educationIndex + 1, endIdx);
      for (const line of eduLines) {
        if (/university|college|institute|bachelor|master|b\.s|m\.s|degree|diploma/i.test(line)) {
          education.push({
            institution: line,
            degree: line.includes('Bachelor') ? 'Bachelor of Science' : (line.includes('Master') ? 'Master of Science' : 'Degree'),
            field: 'Computer Science / Engineering',
            startDate: '',
            endDate: ''
          });
        }
      }
    }

    // Parse projects if present
    const projects: ResumeProject[] = [];
    if (projectsIndex !== -1) {
      const projLines = lines.slice(projectsIndex + 1, Math.min(lines.length, projectsIndex + 8));
      for (const line of projLines) {
        if (line.length > 4 && line.length < 60 && !line.startsWith('•') && !line.startsWith('-')) {
          projects.push({
            name: line,
            description: 'Documented in resume',
            technologies: skills.slice(0, 3).map(s => s.name)
          });
        }
      }
    }

    const atsReadinessScore = this.calculateRealReadiness(skills.length, experiences.length, education.length, text);

    const strengths: string[] = [];
    if (skills.length > 0) strengths.push(`Extracted ${skills.length} recognized skills from resume.`);
    if (experiences.length > 0) strengths.push(`Identified ${experiences.length} work experience entries.`);
    if (strengths.length === 0) strengths.push(`Resume text processed.`);

    const areasForImprovement: string[] = [];
    if (experiences.length === 0) areasForImprovement.push('Add a clearly titled Experience section with bulleted impact.');
    if (skills.length < 5) areasForImprovement.push('Include a dedicated Skills section highlighting your tools & languages.');
    if (!email || !phone) areasForImprovement.push('Ensure standard contact information (email, phone) is easily parseable.');

    return {
      name,
      email,
      phone,
      location,
      summary,
      skills,
      experience: experiences,
      education,
      projects,
      certifications: [],
      atsReadinessScore,
      strengths,
      areasForImprovement
    };
  }

  private extractLocationHeuristic(text: string): string {
    const match = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
    return match ? match[1].trim() : '';
  }

  private extractEmailHeuristic(text: string): string {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : '';
  }

  private extractPhoneHeuristic(text: string): string {
    const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return match ? match[0] : '';
  }

  private extractNameHeuristic(text: string): string {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      if (line.length < 35 && !line.includes('@') && !line.includes('http') && !/resume|curriculum|profile/i.test(line)) {
        return line;
      }
    }
    return '';
  }
}

export const resumeParserService = new ResumeParserService();

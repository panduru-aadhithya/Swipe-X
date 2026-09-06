import { Job, CandidateProfile, ResumeData, JobRecommendation } from '../../types';

export class JobMatcherService {
  calculateMatch(
    candidate: CandidateProfile,
    resumeData: ResumeData | undefined,
    job: Job
  ): {
    matchScore: number;
    skillMatchScore: number;
    experienceMatchScore: number;
    titleSimilarityScore: number;
    locationMatchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    whyItMatches: string[];
    potentialGaps: string[];
  } {
    const candidateSkillsList = [
      ...(candidate.skills || []),
      ...(resumeData ? resumeData.skills.map(s => s.name) : [])
    ];
    const candidateSkills = Array.from(new Set(candidateSkillsList.map(s => s.toLowerCase())));
    const jobSkills = job.extractedSkills || [];

    const matchedSkills = jobSkills.filter(js =>
      candidateSkills.some(cs => cs === js.toLowerCase() || cs.includes(js.toLowerCase()) || js.toLowerCase().includes(cs))
    );

    const missingSkills = jobSkills.filter(js => !matchedSkills.includes(js));

    // 1. Skill Score (40% weight)
    const skillRatio = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.7;
    const skillMatchScore = Math.round(Math.min(100, Math.max(30, skillRatio * 100)));

    // 2. Title & Role Score (25% weight)
    let titleSimilarityScore = 65;
    const targetTitle = (candidate.preferredRole || '').toLowerCase();
    const candidateTitles = resumeData ? resumeData.experience.map(e => e.title.toLowerCase()) : [];
    const allCandidateTitles = [targetTitle, ...candidateTitles].filter(Boolean);

    const jobTitleLower = job.title.toLowerCase();
    const hasDirectTitleMatch = allCandidateTitles.some(t => jobTitleLower.includes(t) || t.includes(jobTitleLower));

    if (hasDirectTitleMatch) {
      titleSimilarityScore = 95;
    } else {
      const words = jobTitleLower.split(/[\s/()]+/).filter(w => w.length > 3);
      const overlap = words.filter(w => allCandidateTitles.some(t => t.includes(w)));
      if (overlap.length > 0) {
        titleSimilarityScore = 80 + overlap.length * 5;
      }
    }
    titleSimilarityScore = Math.min(100, titleSimilarityScore);

    // 3. Experience Score (20% weight)
    let experienceMatchScore = 75;
    const years = candidate.experienceYears || (resumeData ? resumeData.experience.length * 2 : 3);
    if (jobTitleLower.includes('senior') || jobTitleLower.includes('lead')) {
      experienceMatchScore = years >= 5 ? 95 : (years >= 3 ? 80 : 60);
    } else if (jobTitleLower.includes('junior') || jobTitleLower.includes('entry')) {
      experienceMatchScore = years <= 3 ? 95 : 80;
    } else {
      experienceMatchScore = years >= 2 ? 90 : 70;
    }

    // 4. Location & Work Type Score (15% weight)
    let locationMatchScore = 80;
    if (job.workType === 'Remote' || candidate.preferredWorkType === 'Remote') {
      locationMatchScore = 100;
    } else if (candidate.preferredLocation && job.location.toLowerCase().includes(candidate.preferredLocation.toLowerCase())) {
      locationMatchScore = 95;
    } else if (candidate.preferredWorkType && candidate.preferredWorkType === job.workType) {
      locationMatchScore = 90;
    }

    // Overall Weighted Score
    const totalScore = Math.round(
      skillMatchScore * 0.40 +
      titleSimilarityScore * 0.25 +
      experienceMatchScore * 0.20 +
      locationMatchScore * 0.15
    );

    const matchScore = Math.min(99, Math.max(40, totalScore));

    // Why it matches
    const whyItMatches: string[] = [];
    if (matchedSkills.length > 0) {
      whyItMatches.push(`Strong skill match: ${matchedSkills.slice(0, 4).join(', ')}`);
    }
    if (hasDirectTitleMatch) {
      whyItMatches.push(`Direct alignment with your career background (${job.title})`);
    }
    if (job.workType === 'Remote') {
      whyItMatches.push('Offers full remote flexibility');
    }
    if (experienceMatchScore >= 85) {
      whyItMatches.push(`Matches your ${years}+ years of experience profile`);
    }

    const potentialGaps: string[] = [];
    if (missingSkills.length > 0) {
      potentialGaps.push(`Missing listed skill: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    if (job.workType !== 'Remote' && candidate.preferredWorkType === 'Remote') {
      potentialGaps.push(`Role is ${job.workType} rather than fully Remote`);
    }

    return {
      matchScore,
      skillMatchScore,
      experienceMatchScore,
      titleSimilarityScore,
      locationMatchScore,
      matchedSkills,
      missingSkills,
      whyItMatches,
      potentialGaps
    };
  }
}

export const jobMatcherService = new JobMatcherService();

import { 
  CandidateProfile, 
  ResumeData, 
  Job, 
  JobRecommendation, 
  SwipeDecision,
  BehavioralProfile
} from '../../types';
import { db } from '../../database/db';
import { jobRepository, swipeRepository, applicationRepository } from '../../repositories/jobRepository';
import { jobMatcherService } from '../jobMatcher/jobMatcherService';

export class RecommendationEngineService {
  /**
   * Generates prioritized, personalized job recommendations dynamically trained on swipe history
   */
  async getRecommendations(
    candidate: CandidateProfile,
    resumeData: ResumeData | undefined,
    options?: { limit?: number; offset?: number; includeSwiped?: boolean }
  ): Promise<{
    recommendations: JobRecommendation[];
    totalAvailable: number;
    behavioralProfile: BehavioralProfile;
  }> {
    const limit = options?.limit || 25;
    const allJobs = db.jobs;

    // 1. Collect past candidate interactions
    const swipedJobIds = swipeRepository.getSwipedJobIds(candidate.id);
    const candidateApplications = applicationRepository.findByCandidate(candidate.id);
    const appliedJobIds = new Set(candidateApplications.map(a => a.jobId));
    const allCandidateSwipes = swipeRepository.findByCandidate(candidate.id);

    // 2. Behavioral swipe history modeling
    // Sort swipes by newest first for recency-decay weighting
    const sortedSwipes = [...allCandidateSwipes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const rightSwipes = allCandidateSwipes.filter(s => s.decision === 'RIGHT');
    const leftSwipes = allCandidateSwipes.filter(s => s.decision === 'LEFT');
    const savedSwipes = allCandidateSwipes.filter(s => s.decision === 'SAVE');

    // Multi-dimensional preference accumulators
    const skillAffinityMap: Record<string, { positiveScore: number; negativeScore: number; count: number }> = {};
    const workModeCounts: Record<string, { positive: number; negative: number }> = {
      'Remote': { positive: 0, negative: 0 },
      'Hybrid': { positive: 0, negative: 0 },
      'On-site': { positive: 0, negative: 0 }
    };
    const titleTokenAffinities: Record<string, number> = {};

    sortedSwipes.forEach((swipe, index) => {
      const job = db.jobs.find(j => j.id === swipe.jobId);
      if (!job) return;

      // Recency multiplier: most recent 5 swipes have 1.5x impact, next 10 have 1.2x impact
      const recencyWeight = index < 5 ? 1.5 : index < 15 ? 1.2 : 1.0;
      const isPositive = swipe.decision === 'RIGHT' || swipe.decision === 'SAVE';
      const isApplied = appliedJobIds.has(swipe.jobId);

      // Score magnitude: RIGHT = 2.0, SAVE = 1.6, APPLIED = +3.0, LEFT = -1.8
      const baseWeight = isApplied ? 3.0 : swipe.decision === 'RIGHT' ? 2.0 : swipe.decision === 'SAVE' ? 1.6 : 1.8;
      const effectiveWeight = baseWeight * recencyWeight;

      // Track skills & keywords
      const allJobKeywords = Array.from(new Set([...(job.extractedSkills || []), ...(job.keywords || [])]));
      for (const kw of allJobKeywords) {
        const normalized = kw.trim();
        if (!skillAffinityMap[normalized]) {
          skillAffinityMap[normalized] = { positiveScore: 0, negativeScore: 0, count: 0 };
        }
        skillAffinityMap[normalized].count += 1;
        if (isPositive) {
          skillAffinityMap[normalized].positiveScore += effectiveWeight;
        } else {
          skillAffinityMap[normalized].negativeScore += effectiveWeight;
        }
      }

      // Track work type preference
      if (job.workType && workModeCounts[job.workType]) {
        if (isPositive) {
          workModeCounts[job.workType].positive += 1;
        } else {
          workModeCounts[job.workType].negative += 1;
        }
      }

      // Track role title tokens
      const titleWords = job.title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      for (const w of titleWords) {
        if (['the', 'and', 'for', 'with', 'job', 'developer', 'engineer'].includes(w)) continue;
        titleTokenAffinities[w] = (titleTokenAffinities[w] || 0) + (isPositive ? effectiveWeight : -effectiveWeight);
      }
    });

    // Also include applied jobs without swipe records as positive signals
    for (const app of candidateApplications) {
      if (!swipedJobIds.has(app.jobId)) {
        const job = db.jobs.find(j => j.id === app.jobId);
        if (job) {
          const allJobKeywords = Array.from(new Set([...(job.extractedSkills || []), ...(job.keywords || [])]));
          for (const kw of allJobKeywords) {
            const normalized = kw.trim();
            if (!skillAffinityMap[normalized]) {
              skillAffinityMap[normalized] = { positiveScore: 0, negativeScore: 0, count: 0 };
            }
            skillAffinityMap[normalized].positiveScore += 3.0;
            skillAffinityMap[normalized].count += 1;
          }
          if (job.workType && workModeCounts[job.workType]) {
            workModeCounts[job.workType].positive += 1;
          }
        }
      }
    }

    // Determine top boosted and penalized keywords
    const computedSkillList = Object.entries(skillAffinityMap).map(([skill, data]) => {
      const netAffinity = data.positiveScore - data.negativeScore;
      return { skill, netAffinity, count: data.count, positiveScore: data.positiveScore };
    });

    const topBoostedSkills = computedSkillList
      .filter(s => s.netAffinity > 0.5)
      .sort((a, b) => b.netAffinity - a.netAffinity)
      .slice(0, 8)
      .map(s => ({ skill: s.skill, weight: Math.round(s.netAffinity * 10) / 10, count: s.count }));

    const penalizedKeywords = computedSkillList
      .filter(s => s.netAffinity < -1.0)
      .sort((a, b) => a.netAffinity - b.netAffinity)
      .slice(0, 6)
      .map(s => s.skill);

    const boostedKeywords = topBoostedSkills.map(s => s.skill);

    // Determine preferred work mode
    let preferredWorkMode: string | undefined = undefined;
    const workModeRankings = Object.entries(workModeCounts)
      .map(([mode, counts]) => ({
        mode,
        pos: counts.positive,
        neg: counts.negative,
        net: counts.positive - counts.negative,
        ratio: (counts.positive + counts.negative > 0) ? counts.positive / (counts.positive + counts.negative) : 0
      }))
      .sort((a, b) => b.net - a.net);

    if (workModeRankings[0] && workModeRankings[0].pos > 0 && workModeRankings[0].ratio >= 0.5) {
      const topMode = workModeRankings[0];
      const percent = Math.round(topMode.ratio * 100);
      preferredWorkMode = `${topMode.mode} (${percent}%)`;
    }

    // Determine preferred role categories
    const preferredRoles = Object.entries(titleTokenAffinities)
      .filter(([_, score]) => score > 1.5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([token]) => token.charAt(0).toUpperCase() + token.slice(1));

    // Signal strength calculation
    const totalSwipesCount = allCandidateSwipes.length;
    const learningSignalStrength: 'COLD_START' | 'LEARNING' | 'OPTIMIZED' = 
      totalSwipesCount >= 12 ? 'OPTIMIZED' : totalSwipesCount >= 3 ? 'LEARNING' : 'COLD_START';

    const acceptanceRate = totalSwipesCount > 0 
      ? Math.round(((rightSwipes.length + savedSwipes.length) / totalSwipesCount) * 100) 
      : 0;

    // 3. Filter eligible candidate jobs
    const eligibleJobs = allJobs.filter(job => {
      if (options?.includeSwiped) return true;
      if (swipedJobIds.has(job.id)) return false;
      if (appliedJobIds.has(job.id)) return false;
      return true;
    });

    // 4. Score each candidate job combining ATS match with deep Swipe Affinity
    const scoredList: Array<{
      job: Job;
      matchResult: ReturnType<typeof jobMatcherService.calculateMatch>;
      baseScore: number;
      adjustedScore: number;
      swipeBoost: number;
      swipeReasons: string[];
    }> = [];

    for (const job of eligibleJobs) {
      const matchResult = jobMatcherService.calculateMatch(candidate, resumeData, job);
      const baseScore = matchResult.matchScore;
      let swipeBoost = 0;
      const swipeReasons: string[] = [];

      // A. Skill affinity adjustment
      const allJobKeywords = Array.from(new Set([...(job.extractedSkills || []), ...(job.keywords || [])]));
      const matchedLikedSkills: string[] = [];
      const matchedDislikedSkills: string[] = [];
      let netSkillPoints = 0;

      for (const kw of allJobKeywords) {
        const entry = skillAffinityMap[kw];
        if (entry) {
          const net = entry.positiveScore - entry.negativeScore;
          if (net > 0.8) {
            matchedLikedSkills.push(kw);
            netSkillPoints += Math.min(4, net * 1.2);
          } else if (net < -1.0) {
            matchedDislikedSkills.push(kw);
            netSkillPoints -= Math.min(5, Math.abs(net) * 1.5);
          }
        }
      }

      swipeBoost += Math.round(netSkillPoints);

      if (matchedLikedSkills.length > 0) {
        swipeReasons.push(`Matches ${matchedLikedSkills.length} skill${matchedLikedSkills.length > 1 ? 's' : ''} you right-swiped (${matchedLikedSkills.slice(0, 3).join(', ')})`);
      }
      if (matchedDislikedSkills.length > 0) {
        swipeReasons.push(`Contains keywords you previously passed on (${matchedDislikedSkills.slice(0, 2).join(', ')})`);
      }

      // B. Work Mode Adjustment
      if (job.workType && workModeCounts[job.workType]) {
        const counts = workModeCounts[job.workType];
        if (counts.positive >= 2 && counts.positive > counts.negative * 2) {
          swipeBoost += 6;
          swipeReasons.push(`Matches your strong preference for ${job.workType} roles (${counts.positive} positive swipes)`);
        } else if (counts.negative >= 3 && counts.negative > counts.positive * 2) {
          swipeBoost -= 8;
          swipeReasons.push(`De-prioritized based on previous left-swipes on ${job.workType} roles`);
        }
      }

      // C. Role Title & Seniority affinity
      const titleWords = job.title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      let titleBoost = 0;
      for (const w of titleWords) {
        if (titleTokenAffinities[w]) {
          titleBoost += titleTokenAffinities[w] > 0 ? 2 : -2.5;
        }
      }
      if (titleBoost !== 0) {
        const clampedTitle = Math.max(-8, Math.min(8, Math.round(titleBoost)));
        swipeBoost += clampedTitle;
        if (clampedTitle > 3) {
          swipeReasons.push(`Role title matches patterns from jobs you swiped right on`);
        }
      }

      // Clamp swipe boost between -30 and +25
      swipeBoost = Math.max(-30, Math.min(25, swipeBoost));

      // Final adjusted score
      const adjustedScore = Math.max(25, Math.min(99, baseScore + swipeBoost));

      scoredList.push({
        job,
        matchResult,
        baseScore,
        adjustedScore,
        swipeBoost,
        swipeReasons
      });
    }

    // 5. Rank by adjusted score descending
    scoredList.sort((a, b) => b.adjustedScore - a.adjustedScore);

    const offset = options?.offset || 0;
    const paginated = scoredList.slice(offset, offset + limit);

    const recommendations: JobRecommendation[] = paginated.map(item => {
      const whyList = [...item.matchResult.whyItMatches];
      
      // Add explicit swipe-history explanation at the top if significant boost exists
      if (item.swipeBoost > 3) {
        whyList.unshift(`⚡ Boosted +${item.swipeBoost}% from your swipe history preferences`);
      }

      return {
        id: `rec_${candidate.id}_${item.job.id}`,
        candidateProfileId: candidate.id,
        jobId: item.job.id,
        job: item.job,
        matchScore: item.adjustedScore,
        skillMatchScore: item.matchResult.skillMatchScore,
        experienceMatchScore: item.matchResult.experienceMatchScore,
        titleSimilarityScore: item.matchResult.titleSimilarityScore,
        locationMatchScore: item.matchResult.locationMatchScore,
        matchedSkills: item.matchResult.matchedSkills,
        missingSkills: item.matchResult.missingSkills,
        whyItMatches: whyList,
        potentialGaps: item.matchResult.potentialGaps,
        swipeBoost: item.swipeBoost,
        swipeReasons: item.swipeReasons,
        createdAt: new Date().toISOString()
      };
    });

    const behavioralProfile: BehavioralProfile = {
      totalSwipes: totalSwipesCount,
      leftSwipesCount: leftSwipes.length,
      rightSwipesCount: rightSwipes.length,
      savedCount: savedSwipes.length,
      appliedCount: candidateApplications.length,
      acceptanceRate,
      learningSignalStrength,
      topBoostedSkills,
      penalizedKeywords,
      boostedKeywords,
      preferredWorkMode,
      preferredRoles
    };

    return {
      recommendations,
      totalAvailable: eligibleJobs.length,
      behavioralProfile
    };
  }
}

export const recommendationEngineService = new RecommendationEngineService();


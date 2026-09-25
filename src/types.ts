export type UserRole = 'CANDIDATE' | 'RECRUITER';

export type WorkType = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
export type CompanyType = 'MNC' | 'Startup' | 'Newly Founded' | 'Enterprise';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';

export type SwipeActionType = 'right_swipe' | 'left_swipe' | 'save_swipe';
export type SwipeDecisionType = 'LEFT' | 'SAVE' | 'RIGHT' | 'left_swipe' | 'right_swipe';

export type ApplicationStatus = 
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioLinks {
  github?: string;
  linkedin?: string;
  portfolioWebsite?: string;
  dribbble?: string;
  kaggle?: string;
  twitter?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  preferredRole?: string;
  preferredLocation?: string;
  preferredWorkType?: WorkType;
  experienceLevel?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  targetSalary?: number;
  skills: string[];
  experienceYears?: number;
  profileCompletionScore: number; // 0 to 100
  portfolioLinks?: PortfolioLinks;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  atsScore: number;
  isActive: boolean;
  uploadedAt: string;
  extractedSkillsCount: number;
}

export interface Resume {
  id: string;
  userId: string;
  candidateProfileId: string;
  title?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  rawText: string;
  parsingStatus: 'PENDING' | 'PARSED' | 'FAILED';
  parsedAt?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSkill {
  name: string;
  category?: 'Languages' | 'Frameworks' | 'Cloud/DevOps' | 'Databases' | 'AI/ML' | 'Tools' | 'Soft Skills' | 'General';
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ResumeExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  duration?: string;
  responsibilities: string[];
  technologies: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date?: string;
  credentialId?: string;
}

export interface ResumeData {
  id: string;
  resumeId: string;
  candidateProfileId: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  atsReadinessScore: number; // 0 - 100
  strengths: string[];
  areasForImprovement: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  source: string;
  datePosted: string;
  workType: WorkType;
  employmentType: EmploymentType;
  companyType?: CompanyType;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  extractedSkills: string[];
  experienceRequirements?: string;
  educationRequirements?: string;
  experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Internship';
  normalizedTitle: string;
  normalizedCompany: string;
  normalizedLocation: string;
  keywords: string[];
  // Real-time freshness & competition fields
  applicantsCount?: number;
  competitionLevel?: CompetitionLevel;
  isEarlyApplicant?: boolean;
  isFresherFriendly?: boolean;
  postedTimeAgo?: string;
  isFresh?: boolean;
  recruiterId?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'HIGH_MATCH' 
  | 'STARTUP_ALERT' 
  | 'LOW_COMPETITION' 
  | 'APPLICATION_UPDATE' 
  | 'RECOMMENDATION'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  matchScore?: number;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface RecruiterApplicant {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  status: ApplicationStatus;
  appliedDate: string;
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  coverLetter?: string;
  candidateNotes?: string;
  resumeFileName?: string;
  experienceYears?: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalJobs: number;
  verifiedJobsCount: number;
  totalApplications: number;
  totalSwipes: number;
  averageAtsScore: number;
  systemHealth: {
    uptime: string;
    aiEngineStatus: 'OPERATIONAL' | 'DEGRADED';
    avgAiLatencyMs: number;
    dbConnections: number;
  };
}

export interface JobRecommendation {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: Job;
  matchScore: number; // 0 - 100
  skillMatchScore: number;
  experienceMatchScore: number;
  titleSimilarityScore: number;
  locationMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  whyItMatches: string[];
  potentialGaps: string[];
  swipeBoost?: number;
  swipeReasons?: string[];
  createdAt: string;
}

export interface SwipeDecision {
  id: string;
  userId?: string;
  candidateProfileId: string;
  jobId: string;
  action?: SwipeActionType;
  decision: SwipeDecisionType;
  timestamp?: string;
  createdAt: string;

  // Job snapshot attributes at time of swipe
  jobTitle?: string;
  company?: string;
  skills?: string[];
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: string;
  jobCategory?: string;

  job?: Job;
  applied?: boolean;
  applicationId?: string;
  applicationStatus?: ApplicationStatus | string;
  appliedDate?: string;
}

export interface BehavioralProfile {
  totalSwipes: number;
  leftSwipesCount: number;
  rightSwipesCount: number;
  savedCount: number;
  appliedCount: number;
  acceptanceRate: number;
  learningSignalStrength: 'COLD_START' | 'LEARNING' | 'OPTIMIZED';
  topBoostedSkills: { skill: string; weight: number; count: number }[];
  penalizedKeywords: string[];
  boostedKeywords: string[];
  preferredWorkMode?: string;
  preferredRoles?: string[];
}

export interface SavedJob {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: Job;
  matchScore?: number;
  notes?: string;
  createdAt: string;
}

export interface ATSReport {
  id: string;
  candidateProfileId: string;
  jobId: string;
  resumeId: string;
  atsScore: number; // 0 - 100
  skillScore: number; // 0 - 100
  keywordScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  educationScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  scoringWeights: {
    skills: number;
    keywords: number;
    experience: number;
    education: number;
    title: number;
  };
  disclaimer: string;
  createdAt: string;
}

export interface Application {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: Job;
  resumeId: string;
  atsReportId?: string;
  atsScore?: number;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate: string;
  coverLetter?: string;
  candidateNotes?: string;
  statusHistory: Array<{
    status: ApplicationStatus;
    timestamp: string;
    note?: string;
  }>;
}

export function formatApplicationId(appOrId?: Application | string | null): string {
  if (!appOrId) return 'SWX-2026-00125';
  const idStr = typeof appOrId === 'string' ? appOrId : appOrId.id;
  if (!idStr) return 'SWX-2026-00125';
  if (idStr.startsWith('SWX-')) return idStr;
  if (idStr.startsWith('app_demo_')) {
    const num = idStr.replace('app_demo_', '');
    return `SWX-2026-0010${num}`;
  }
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash) % 90000 + 10000;
  return `SWX-2026-${positive}`;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'CODING' | 'PRODUCT';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starGuidance?: string;
  hints?: string[];
  expectedKeyPoints?: string[];
  userResponse?: string;
  feedback?: {
    clarityScore: number;
    depthScore: number;
    impactScore: number;
    overallScore: number;
    keyStrengths: string[];
    improvementSuggestions: string[];
    sampleStarAnswer?: string;
  };
}

export interface MockInterviewSession {
  id: string;
  roleTitle: string;
  companyName?: string;
  jobId?: string;
  category: string;
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  overallScore?: number;
  clarityScore?: number;
  depthScore?: number;
  impactScore?: number;
  xpEarned: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
}

export interface UserGamification {
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  mockInterviewsCompleted: number;
  resumesScanned: number;
  rolesApplied: number;
  marketReadinessIndex: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockedAt?: string;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

import { apiRequest } from './client';
import { 
  User, 
  CandidateProfile, 
  Resume, 
  ResumeData, 
  ResumeVersion,
  Job, 
  JobRecommendation, 
  SwipeDecision, 
  SavedJob, 
  ATSReport, 
  Application, 
  ApplicationStatus,
  AppNotification,
  RecruiterApplicant,
  BehavioralProfile
} from '../types';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ token: string; user: User; profile: CandidateProfile; hasActiveResume?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (data: { email: string; password: string; name: string; preferredRole?: string }) =>
    apiRequest<{ token: string; user: User; profile: CandidateProfile; hasActiveResume?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () =>
    apiRequest<{ user: User; profile: CandidateProfile; hasActiveResume?: boolean }>('/auth/me')
};

export const profileApi = {
  getProfile: () =>
    apiRequest<CandidateProfile>('/profile'),

  updateProfile: (updates: Partial<CandidateProfile>) =>
    apiRequest<CandidateProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  getDashboardSummary: () =>
    apiRequest<{
      profileCompletion: number;
      resumeStatus: string;
      hasActiveResume?: boolean;
      resumeFileName?: string;
      atsScore: number | null;
      recommendedJobsCount: number;
      savedJobsCount: number;
      applicationsCount: number;
      swipesCount: number;
      behavioralInsights: {
        leftSwipesCount: number;
        rightSwipesCount: number;
        savedCount: number;
        appliedCount: number;
        penalizedKeywords: string[];
        boostedKeywords: string[];
      };
      recentApplications: Application[];
      topRecommendations: JobRecommendation[];
    }>('/profile/dashboard')
};

export const resumeApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<{ resume: Resume; resumeData: ResumeData }>('/resumes/upload', {
      method: 'POST',
      body: formData
    });
  },

  uploadText: (text: string, fileName?: string) =>
    apiRequest<{ resume: Resume; resumeData: ResumeData }>('/resumes/upload', {
      method: 'POST',
      body: JSON.stringify({ text, fileName })
    }),

  getActiveResume: () =>
    apiRequest<{ resume: Resume; resumeData: ResumeData } | null>('/resumes/active'),

  getVersions: () =>
    apiRequest<{ versions: ResumeVersion[]; total: number }>('/resumes/versions'),

  setActiveVersion: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/resumes/versions/${id}/active`, {
      method: 'POST'
    })
};

export const atsApi = {
  analyzeJob: (jobId: string, forceRefresh?: boolean) =>
    apiRequest<ATSReport>('/ats/analyze', {
      method: 'POST',
      body: JSON.stringify({ jobId, forceRefresh })
    }),

  getReports: () =>
    apiRequest<ATSReport[]>('/ats/reports'),

  getReportById: (id: string) =>
    apiRequest<ATSReport>(`/ats/reports/${id}`)
};

export const jobApi = {
  getJobs: (params?: { 
    search?: string; 
    workType?: string; 
    employmentType?: string; 
    companyType?: string;
    competitionLevel?: string;
    experienceLevel?: string;
    isFresherFriendly?: boolean;
    isEarlyApplicant?: boolean;
    limit?: number; 
    offset?: number; 
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.workType) query.set('workType', params.workType);
    if (params?.employmentType) query.set('employmentType', params.employmentType);
    if (params?.companyType) query.set('companyType', params.companyType);
    if (params?.competitionLevel) query.set('competitionLevel', params.competitionLevel);
    if (params?.experienceLevel) query.set('experienceLevel', params.experienceLevel);
    if (params?.isFresherFriendly) query.set('isFresherFriendly', 'true');
    if (params?.isEarlyApplicant) query.set('isEarlyApplicant', 'true');
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    return apiRequest<{ jobs: Job[]; total: number; limit: number; offset: number; appliedJobIds?: string[] }>(`/jobs?${query.toString()}`);
  },

  getJobById: (id: string) =>
    apiRequest<{ job: Job; matchInfo?: any; isSaved: boolean; applicationStatus?: ApplicationStatus; application?: Application }>(`/jobs/${id}`),

  getStats: () =>
    apiRequest<{ totalJobs: number; datasetSource: string; verifiedSources: string[] }>('/jobs/stats/summary')
};

export const recommendationApi = {
  getRecommendations: (params?: { limit?: number; offset?: number; includeSwiped?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.includeSwiped) query.set('includeSwiped', 'true');
    return apiRequest<{
      recommendations: JobRecommendation[];
      totalAvailable: number;
      behavioralProfile: BehavioralProfile;
    }>(`/recommendations?${query.toString()}`);
  }
};

export const swipeApi = {
  recordSwipe: (
    jobId: string, 
    actionOrDecision: 'right_swipe' | 'left_swipe' | 'save_swipe' | 'RIGHT' | 'LEFT' | 'SAVE',
    snapshot?: {
      jobTitle?: string;
      company?: string;
      skills?: string[];
      location?: string;
      employmentType?: string;
      experienceLevel?: string;
      salary?: string;
      jobCategory?: string;
    }
  ) => {
    const isRight = actionOrDecision === 'right_swipe' || actionOrDecision === 'RIGHT';
    const isLeft = actionOrDecision === 'left_swipe' || actionOrDecision === 'LEFT';
    const action = isRight ? 'right_swipe' : isLeft ? 'left_swipe' : 'save_swipe';
    const decision = isRight ? 'RIGHT' : isLeft ? 'LEFT' : 'SAVE';

    return apiRequest<{ 
      swipe: SwipeDecision; 
      action: string;
      isInterested: boolean;
      isRejected: boolean;
      proceedToApply: boolean;
    }>('/swipes', {
      method: 'POST',
      body: JSON.stringify({ jobId, action, decision, ...snapshot })
    });
  },

  undoSwipe: (jobId?: string) =>
    apiRequest<{ jobId: string; undone: boolean }>('/swipes/undo', {
      method: 'POST',
      body: JSON.stringify({ jobId })
    }),

  getHistory: (filter?: 'all' | 'interested' | 'rejected' | 'right_swipe' | 'left_swipe') => {
    const query = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    return apiRequest<SwipeDecision[]>(`/swipes/history${query}`);
  },

  getInterestedJobs: () =>
    apiRequest<SwipeDecision[]>('/swipes/interested'),

  getRejectedJobs: () =>
    apiRequest<SwipeDecision[]>('/swipes/rejected'),

  deleteSwipe: (jobId: string) =>
    apiRequest<{ jobId: string; removed: boolean }>(`/swipes/${jobId}`, {
      method: 'DELETE'
    }),

  clearHistory: () =>
    apiRequest<{ clearedCount: number }>('/swipes/history', {
      method: 'DELETE'
    })
};

export const savedJobApi = {
  getSavedJobs: () =>
    apiRequest<SavedJob[]>('/saved-jobs'),

  saveJob: (jobId: string, notes?: string) =>
    apiRequest<SavedJob>('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId, notes })
    }),

  removeSavedJob: (jobId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/saved-jobs/${jobId}`, {
      method: 'DELETE'
    })
};

export const applicationApi = {
  submitApplication: (data: { jobId: string; coverLetter?: string; candidateNotes?: string }) =>
    apiRequest<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getApplications: () =>
    apiRequest<Application[]>('/applications'),

  getApplicationById: (id: string) =>
    apiRequest<Application>(`/applications/${id}`),

  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    apiRequest<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    }),

  updateNotes: (id: string, candidateNotes: string) =>
    apiRequest<Application>(`/applications/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ candidateNotes })
    }),

  withdrawApplication: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: 'DELETE'
    })
};

export const recruiterApi = {
  postJob: (jobData: any) =>
    apiRequest<Job>('/recruiter/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),

  getPostedJobs: () =>
    apiRequest<{ jobs: Job[]; total: number }>('/recruiter/jobs'),

  deleteJob: (jobId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/recruiter/jobs/${jobId}`, {
      method: 'DELETE'
    }),

  getApplicants: () =>
    apiRequest<{
      applicants: RecruiterApplicant[];
      total: number;
      pipelineSummary: {
        applied: number;
        underReview: number;
        shortlisted: number;
        interview: number;
        accepted: number;
        rejected: number;
      };
    }>('/recruiter/applicants'),

  updateApplicantStatus: (applicationId: string, status: ApplicationStatus, note?: string) =>
    apiRequest<{ success: boolean; message: string }>(`/recruiter/applicants/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    })
};

export const notificationApi = {
  getNotifications: () =>
    apiRequest<{ notifications: AppNotification[]; unreadCount: number; total: number }>('/notifications'),

  markAsRead: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  markAllAsRead: () =>
    apiRequest<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'POST'
    })
};

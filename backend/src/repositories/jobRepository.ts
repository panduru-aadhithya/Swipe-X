import { Job, SwipeDecision, SavedJob, ATSReport, Application, ApplicationStatus } from '../types';
import { db } from '../database/db';

export const jobRepository = {
  findAll(options?: {
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
  }): { jobs: Job[]; total: number } {
    let list = db.jobs;

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.extractedSkills.some(s => s.toLowerCase().includes(q)) ||
        j.keywords.some(k => k.includes(q))
      );
    }

    if (options?.workType && options.workType !== 'ALL') {
      list = list.filter(j => j.workType.toLowerCase() === options.workType!.toLowerCase());
    }

    if (options?.employmentType && options.employmentType !== 'ALL') {
      list = list.filter(j => j.employmentType.toLowerCase() === options.employmentType!.toLowerCase());
    }

    if (options?.companyType && options.companyType !== 'ALL') {
      list = list.filter(j => j.companyType?.toLowerCase() === options.companyType!.toLowerCase());
    }

    if (options?.competitionLevel && options.competitionLevel !== 'ALL') {
      list = list.filter(j => j.competitionLevel?.toLowerCase() === options.competitionLevel!.toLowerCase());
    }

    if (options?.experienceLevel && options.experienceLevel !== 'ALL') {
      list = list.filter(j => j.experienceLevel?.toLowerCase() === options.experienceLevel!.toLowerCase());
    }

    if (options?.isFresherFriendly) {
      list = list.filter(j => j.isFresherFriendly === true);
    }

    if (options?.isEarlyApplicant) {
      list = list.filter(j => j.isEarlyApplicant === true);
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return {
      jobs: list.slice(offset, offset + limit),
      total
    };
  },

  findById(id: string): Job | undefined {
    return db.jobs.find(j => j.id === id);
  },

  count(): number {
    return db.jobs.length;
  }
};

export const swipeRepository = {
  findByCandidate(candidateProfileId: string): SwipeDecision[] {
    return db.swipeDecisions.filter(s => s.candidateProfileId === candidateProfileId);
  },

  getDecision(candidateProfileId: string, jobId: string): SwipeDecision | undefined {
    return db.swipeDecisions.find(s => s.candidateProfileId === candidateProfileId && s.jobId === jobId);
  },

  record(decision: SwipeDecision): SwipeDecision {
    const existingIdx = db.swipeDecisions.findIndex(
      s => s.candidateProfileId === decision.candidateProfileId && s.jobId === decision.jobId
    );
    if (existingIdx >= 0) {
      db.swipeDecisions[existingIdx] = decision;
    } else {
      db.swipeDecisions.push(decision);
    }
    db.saveState();
    db.persistSwipeDecision(decision).catch(() => {});
    return decision;
  },

  remove(candidateProfileId: string, jobId: string): boolean {
    const idx = db.swipeDecisions.findIndex(
      s => s.candidateProfileId === candidateProfileId && s.jobId === jobId
    );
    if (idx >= 0) {
      db.swipeDecisions.splice(idx, 1);
      db.saveState();
      db.deleteSwipeDecision(candidateProfileId, jobId).catch(() => {});
      return true;
    }
    return false;
  },

  clearCandidate(candidateProfileId: string): number {
    const remaining = db.swipeDecisions.filter(s => s.candidateProfileId !== candidateProfileId);
    const removedCount = db.swipeDecisions.length - remaining.length;
    if (removedCount > 0) {
      db.swipeDecisions.length = 0;
      db.swipeDecisions.push(...remaining);
      db.saveState();
      db.clearCandidateSwipes(candidateProfileId).catch(() => {});
    }
    return removedCount;
  },

  getSwipedJobIds(candidateProfileId: string): Set<string> {
    const set = new Set<string>();
    for (const s of db.swipeDecisions) {
      if (s.candidateProfileId === candidateProfileId) {
        set.add(s.jobId);
      }
    }
    return set;
  }
};

export const savedJobRepository = {
  findByCandidate(candidateProfileId: string): SavedJob[] {
    return db.savedJobs.filter(s => s.candidateProfileId === candidateProfileId);
  },

  isSaved(candidateProfileId: string, jobId: string): boolean {
    return db.savedJobs.some(s => s.candidateProfileId === candidateProfileId && s.jobId === jobId);
  },

  save(savedJob: SavedJob): SavedJob {
    const existing = db.savedJobs.find(
      s => s.candidateProfileId === savedJob.candidateProfileId && s.jobId === savedJob.jobId
    );
    if (!existing) {
      db.savedJobs.push(savedJob);
      db.saveState();
      db.persistSavedJob(savedJob).catch(() => {});
    }
    return savedJob;
  },

  remove(candidateProfileId: string, jobId: string): boolean {
    const idx = db.savedJobs.findIndex(
      s => s.candidateProfileId === candidateProfileId && s.jobId === jobId
    );
    if (idx >= 0) {
      db.savedJobs.splice(idx, 1);
      db.saveState();
      db.deleteSavedJob(candidateProfileId, jobId).catch(() => {});
      return true;
    }
    return false;
  }
};

export const atsRepository = {
  findByCandidate(candidateProfileId: string): ATSReport[] {
    return db.atsReports.filter(r => r.candidateProfileId === candidateProfileId);
  },

  findById(id: string): ATSReport | undefined {
    return db.atsReports.find(r => r.id === id);
  },

  findByCandidateAndJob(candidateProfileId: string, jobId: string): ATSReport | undefined {
    return db.atsReports.find(
      r => r.candidateProfileId === candidateProfileId && r.jobId === jobId
    );
  },

  save(report: ATSReport): ATSReport {
    const existingIdx = db.atsReports.findIndex(
      r => r.candidateProfileId === report.candidateProfileId && r.jobId === report.jobId
    );
    if (existingIdx >= 0) {
      db.atsReports[existingIdx] = report;
    } else {
      db.atsReports.push(report);
    }
    db.saveState();
    db.persistATSReport(report).catch(() => {});
    return report;
  }
};

export const applicationRepository = {
  findByCandidate(candidateProfileId: string): Application[] {
    return db.applications.filter(a => a.candidateProfileId === candidateProfileId);
  },

  findById(id: string): Application | undefined {
    return db.applications.find(a => a.id === id);
  },

  findByCandidateAndJob(candidateProfileId: string, jobId: string): Application | undefined {
    return db.applications.find(
      a => a.candidateProfileId === candidateProfileId && a.jobId === jobId
    );
  },

  async create(app: Application): Promise<Application> {
    await db.persistApplication(app);
    db.applications.push(app);
    db.saveState();
    return app;
  },

  updateStatus(id: string, status: ApplicationStatus, note?: string): Application | undefined {
    const app = db.applications.find(a => a.id === id);
    if (!app) return undefined;
    
    app.status = status;
    app.updatedDate = new Date().toISOString();
    app.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Application updated to ${status}`
    });
    
    db.saveState();
    db.persistApplication(app).catch(() => {});
    return app;
  },

  updateNotes(id: string, candidateNotes: string): Application | undefined {
    const app = db.applications.find(a => a.id === id);
    if (!app) return undefined;

    app.candidateNotes = candidateNotes;
    app.updatedDate = new Date().toISOString();
    db.saveState();
    db.persistApplication(app).catch(() => {});
    return app;
  },

  delete(id: string): boolean {
    const idx = db.applications.findIndex(a => a.id === id);
    if (idx === -1) return false;
    db.applications.splice(idx, 1);
    db.saveState();
    db.deleteApplication(id).catch(() => {});
    return true;
  }
};

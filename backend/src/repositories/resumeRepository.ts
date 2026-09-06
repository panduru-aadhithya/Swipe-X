import { Resume, ResumeData } from '../types';
import { db } from '../database/db';

export const resumeRepository = {
  findByCandidateId(candidateProfileId: string): Resume[] {
    return db.resumes.filter(r => r.candidateProfileId === candidateProfileId);
  },

  findActiveByCandidateId(candidateProfileId: string): Resume | undefined {
    const list = db.resumes.filter(r => r.candidateProfileId === candidateProfileId);
    return list[list.length - 1]; // most recent
  },

  findById(id: string): Resume | undefined {
    return db.resumes.find(r => r.id === id);
  },

  create(resume: Resume): Resume {
    db.resumes.push(resume);
    db.saveState();
    db.persistResume(resume).catch(() => {});
    return resume;
  },

  update(id: string, updates: Partial<Resume>): Resume | undefined {
    const index = db.resumes.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    db.resumes[index] = { ...db.resumes[index], ...updates, updatedAt: new Date().toISOString() };
    db.saveState();
    db.persistResume(db.resumes[index]).catch(() => {});
    return db.resumes[index];
  },

  getResumeDataByResumeId(resumeId: string): ResumeData | undefined {
    return db.resumeData.find(rd => rd.resumeId === resumeId);
  },

  getResumeDataByCandidateId(candidateProfileId: string): ResumeData | undefined {
    const list = db.resumeData.filter(rd => rd.candidateProfileId === candidateProfileId);
    return list[list.length - 1];
  },

  saveResumeData(data: ResumeData): ResumeData {
    const existingIndex = db.resumeData.findIndex(rd => rd.resumeId === data.resumeId);
    if (existingIndex >= 0) {
      db.resumeData[existingIndex] = { ...data, updatedAt: new Date().toISOString() };
    } else {
      db.resumeData.push(data);
    }
    db.saveState();
    db.persistResumeData(data).catch(() => {});
    return data;
  }
};

import { User, CandidateProfile } from '../types';
import { db } from '../database/db';

export const userRepository = {
  findByEmail(email: string): User | undefined {
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findById(id: string): User | undefined {
    return db.users.find(u => u.id === id);
  },

  create(user: User): User {
    db.users.push(user);
    db.saveState();
    db.persistUser(user).catch(() => {});
    return user;
  },

  update(id: string, updates: Partial<User>): User | undefined {
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = { ...db.users[index], ...updates, updatedAt: new Date().toISOString() };
    db.saveState();
    db.persistUser(db.users[index]).catch(() => {});
    return db.users[index];
  }
};

export const candidateRepository = {
  findByUserId(userId: string): CandidateProfile | undefined {
    return db.candidateProfiles.find(c => c.userId === userId);
  },

  findById(id: string): CandidateProfile | undefined {
    return db.candidateProfiles.find(c => c.id === id);
  },

  create(profile: CandidateProfile): CandidateProfile {
    db.candidateProfiles.push(profile);
    db.saveState();
    db.persistCandidateProfile(profile).catch(() => {});
    return profile;
  },

  update(id: string, updates: Partial<CandidateProfile>): CandidateProfile | undefined {
    const index = db.candidateProfiles.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    const updated = {
      ...db.candidateProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate profile completion score
    updated.profileCompletionScore = calculateProfileCompletion(updated);

    db.candidateProfiles[index] = updated;
    db.saveState();
    db.persistCandidateProfile(updated).catch(() => {});
    return updated;
  }
};

export function calculateProfileCompletion(profile: CandidateProfile): number {
  let score = 0;
  if (profile.name && profile.name.trim().length > 0) score += 15;
  if (profile.email && profile.email.trim().length > 0) score += 15;
  if (profile.phone && profile.phone.trim().length > 0) score += 10;
  if (profile.location && profile.location.trim().length > 0) score += 10;
  if (profile.summary && profile.summary.trim().length > 20) score += 15;
  if (profile.skills && profile.skills.length >= 3) score += 20;
  else if (profile.skills && profile.skills.length > 0) score += 10;
  if (profile.preferredRole) score += 10;
  if (profile.experienceLevel) score += 5;
  return Math.min(100, score);
}

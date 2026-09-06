import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppNotification } from '../types';
import { db } from '../database/db';

// Initial dynamic smart notifications generator based on candidate profile and live jobs
export function generateCandidateNotifications(userId: string, candidateProfileId: string): AppNotification[] {
  const jobs = db.jobs;
  const notifications: AppNotification[] = [];
  const now = new Date();

  // 1. High-Match Job Alert (>85%)
  const highMatchJob = jobs.find(j => j.extractedSkills.some(s => ['React', 'TypeScript', 'Node.js', 'Python'].includes(s)));
  if (highMatchJob) {
    notifications.push({
      id: `notif_match_${highMatchJob.id}`,
      userId,
      title: '🎯 High Match Opportunity (94%)',
      message: `${highMatchJob.title} at ${highMatchJob.company} matches 94% of your verified skills.`,
      type: 'HIGH_MATCH',
      jobId: highMatchJob.id,
      jobTitle: highMatchJob.title,
      company: highMatchJob.company,
      matchScore: 94,
      isRead: false,
      link: `/candidate/jobs/${highMatchJob.id}`,
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString() // 25m ago
    });
  }

  // 2. Early-Stage Startup Alert
  const startupJob = jobs.find(j => j.companyType === 'Newly Founded' || j.companyType === 'Startup');
  if (startupJob) {
    notifications.push({
      id: `notif_startup_${startupJob.id}`,
      userId,
      title: '🚀 Startup Hiring Alert',
      message: `${startupJob.company} just opened a new role: "${startupJob.title}". Be one of the first 10 applicants!`,
      type: 'STARTUP_ALERT',
      jobId: startupJob.id,
      jobTitle: startupJob.title,
      company: startupJob.company,
      matchScore: 89,
      isRead: false,
      link: `/candidate/jobs/${startupJob.id}`,
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString() // 2h ago
    });
  }

  // 3. Low-Competition Opportunity (<15 applicants)
  const lowCompJob = jobs.find(j => (j.applicantsCount || 0) < 12);
  if (lowCompJob) {
    notifications.push({
      id: `notif_comp_${lowCompJob.id}`,
      userId,
      title: '🔥 Low Competition Advantage',
      message: `Only ${lowCompJob.applicantsCount || 6} applicants have applied for ${lowCompJob.title} at ${lowCompJob.company}.`,
      type: 'LOW_COMPETITION',
      jobId: lowCompJob.id,
      jobTitle: lowCompJob.title,
      company: lowCompJob.company,
      matchScore: 91,
      isRead: false,
      link: `/candidate/jobs/${lowCompJob.id}`,
      createdAt: new Date(now.getTime() - 5 * 3600 * 1000).toISOString() // 5h ago
    });
  }

  // 4. Application Status Update
  const applications = db.applications.filter(a => a.candidateProfileId === candidateProfileId);
  if (applications.length > 0) {
    const app = applications[0];
    notifications.push({
      id: `notif_app_${app.id}`,
      userId,
      title: '📬 Application Status Updated',
      message: `Your application for ${app.job.title} at ${app.job.company} moved to "Under Review".`,
      type: 'APPLICATION_UPDATE',
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.company,
      isRead: true,
      link: '/candidate/applications',
      createdAt: new Date(now.getTime() - 18 * 3600 * 1000).toISOString()
    });
  } else {
    notifications.push({
      id: `notif_system_welcome`,
      userId,
      title: '✨ Welcome to SwipeX Job Intelligence',
      message: 'Upload or generate your resume to activate automated ATS scoring and personalized card feeds.',
      type: 'SYSTEM',
      isRead: true,
      link: '/candidate/resume',
      createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
    });
  }

  return notifications;
}

// In-memory store for read states per session
const userNotificationsStore = new Map<string, AppNotification[]>();

export const notificationController = {
  getNotifications(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const candidateProfileId = req.candidateProfile?.id || userId;

    if (!userNotificationsStore.has(userId)) {
      const initial = generateCandidateNotifications(userId, candidateProfileId);
      userNotificationsStore.set(userId, initial);
    }

    const notifs = userNotificationsStore.get(userId) || [];
    const unreadCount = notifs.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications: notifs,
        unreadCount,
        total: notifs.length
      }
    });
  },

  markAsRead(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const { id } = req.params;

    const notifs = userNotificationsStore.get(userId) || [];
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.isRead = true;
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  },

  markAllAsRead(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const notifs = userNotificationsStore.get(userId) || [];
    notifs.forEach(n => { n.isRead = true; });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  }
};

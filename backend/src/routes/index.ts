import { Router } from 'express';
import multer from 'multer';
import { authController } from '../controllers/authController';
import { candidateController } from '../controllers/candidateController';
import { resumeController } from '../controllers/resumeController';
import { atsController } from '../controllers/atsController';
import { jobController, recommendationController } from '../controllers/jobController';
import { swipeController, savedJobController, applicationController } from '../controllers/swipeController';
import { recruiterController } from '../controllers/recruiterController';
import { adminController } from '../controllers/adminController';
import { notificationController } from '../controllers/notificationController';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage()
});

// Auth Routes
export const authRoutes = Router();
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/demo-login', authController.demoLogin);
authRoutes.get('/me', requireAuth, authController.getMe);

// Candidate Profile Routes
export const candidateRoutes = Router();
candidateRoutes.get('/', requireAuth, candidateController.getProfile);
candidateRoutes.put('/', requireAuth, candidateController.updateProfile);
candidateRoutes.get('/dashboard', requireAuth, candidateController.getDashboardSummary);

// Resume Routes
export const resumeRoutes = Router();
resumeRoutes.post('/upload', requireAuth, upload.single('file'), resumeController.uploadResume);
resumeRoutes.get('/active', requireAuth, resumeController.getActiveResume);
resumeRoutes.post('/demo-load', requireAuth, resumeController.loadDemoResume);
resumeRoutes.get('/versions', requireAuth, resumeController.getAllVersions);
resumeRoutes.post('/versions/:id/active', requireAuth, resumeController.setActiveVersion);

// ATS Routes
export const atsRoutes = Router();
atsRoutes.post('/analyze', requireAuth, atsController.analyzeJobATS);
atsRoutes.get('/reports', requireAuth, atsController.getReports);
atsRoutes.get('/reports/:id', requireAuth, atsController.getReportById);

// Job Routes
export const jobRoutes = Router();
jobRoutes.get('/', optionalAuth, jobController.getJobs);
jobRoutes.get('/stats/summary', jobController.getJobStats);
jobRoutes.get('/:id', optionalAuth, jobController.getJobById);

// Recommendation Routes
export const recommendationRoutes = Router();
recommendationRoutes.get('/', requireAuth, recommendationController.getRecommendations);

// Swipe Routes
export const swipeRoutes = Router();
swipeRoutes.post('/', requireAuth, swipeController.recordSwipe);
swipeRoutes.post('/undo', requireAuth, swipeController.undoSwipe);
swipeRoutes.get('/history', requireAuth, swipeController.getSwipeHistory);
swipeRoutes.get('/interested', requireAuth, swipeController.getInterestedJobs);
swipeRoutes.get('/rejected', requireAuth, swipeController.getRejectedJobs);
swipeRoutes.delete('/history', requireAuth, swipeController.clearHistory);
swipeRoutes.delete('/:jobId', requireAuth, swipeController.deleteSwipe);

// Saved Jobs Routes
export const savedJobRoutes = Router();
savedJobRoutes.get('/', requireAuth, savedJobController.getSavedJobs);
savedJobRoutes.post('/', requireAuth, savedJobController.saveJob);
savedJobRoutes.delete('/:jobId', requireAuth, savedJobController.removeSavedJob);

// Application Routes
export const applicationRoutes = Router();
applicationRoutes.post('/', requireAuth, applicationController.submitApplication);
applicationRoutes.get('/', requireAuth, applicationController.getApplications);
applicationRoutes.get('/:id', requireAuth, applicationController.getApplicationById);
applicationRoutes.patch('/:id/status', requireAuth, applicationController.updateApplicationStatus);
applicationRoutes.patch('/:id/notes', requireAuth, applicationController.updateApplicationNotes);
applicationRoutes.delete('/:id', requireAuth, applicationController.withdrawApplication);

// Recruiter Routes
export const recruiterRoutes = Router();
recruiterRoutes.post('/jobs', requireAuth, recruiterController.postJob);
recruiterRoutes.get('/jobs', requireAuth, recruiterController.getPostedJobs);
recruiterRoutes.delete('/jobs/:id', requireAuth, recruiterController.deleteJob);
recruiterRoutes.get('/applicants', requireAuth, recruiterController.getApplicants);
recruiterRoutes.patch('/applicants/:id/status', requireAuth, recruiterController.updateApplicantStatus);

// Admin Routes
export const adminRoutes = Router();
adminRoutes.get('/stats', requireAuth, adminController.getStats);
adminRoutes.get('/users', requireAuth, adminController.getUsers);
adminRoutes.get('/activity', requireAuth, adminController.getActivityLogs);

// Notification Routes
export const notificationRoutes = Router();
notificationRoutes.get('/', requireAuth, notificationController.getNotifications);
notificationRoutes.patch('/:id/read', requireAuth, notificationController.markAsRead);
notificationRoutes.post('/read-all', requireAuth, notificationController.markAllAsRead);

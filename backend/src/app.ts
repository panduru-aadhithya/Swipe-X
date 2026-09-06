import express from 'express';
import cors from 'cors';
import { 
  authRoutes, 
  candidateRoutes, 
  resumeRoutes, 
  atsRoutes, 
  jobRoutes, 
  recommendationRoutes, 
  swipeRoutes, 
  savedJobRoutes, 
  applicationRoutes,
  recruiterRoutes,
  adminRoutes,
  notificationRoutes
} from './routes';
import { errorHandler } from './middleware/errorMiddleware';
import { importJobsFromCSV } from './services/dataImporter';
import { db } from './database/db';
import { connectMongoDB, isMongoConnected, getMongoStatus } from './database/mongoDb';
import { JobModel } from './models';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

let dbInitPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      // 1. Establish MongoDB Atlas connection if MONGODB_URI is provided
      try {
        const connected = await connectMongoDB();
        if (connected) {
          // 2. Synchronize active state from MongoDB Atlas
          await db.syncFromMongo();
        }
      } catch (err: any) {
        console.error('[SwipeX Boot] MongoDB connection warning:', err?.message || err);
      }

      // 3. Initial dataset check and auto-seed/enrich
      if (db.jobs.length === 0 || !db.jobs[0]?.companyType || !db.jobs[0]?.competitionLevel) {
        console.log('[SwipeX Boot] Seeding/refreshing enriched job database with competition metrics...');
        importJobsFromCSV();
      }
    })();
  }
  return dbInitPromise;
}

// Kick off initialization immediately
initializeDatabase().catch(err => {
  console.error('[SwipeX Boot] Background initialization warning:', err);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let totalJobsInDB = db.jobs.length;
  const mongoStatus = getMongoStatus();

  if (isMongoConnected()) {
    try {
      totalJobsInDB = await JobModel.countDocuments();
    } catch (err: any) {
      console.warn('[Health Check] Error querying JobModel count:', err.message);
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwipeX Backend API',
    totalJobsInDB,
    database: {
      provider: isMongoConnected() ? 'MongoDB Atlas' : 'Local JSON Store (Fallback)',
      connected: isMongoConnected(),
      mongoStatus: mongoStatus.status,
      uriConfigured: mongoStatus.uriConfigured,
      ...(mongoStatus.dbName && { databaseName: mongoStatus.dbName })
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/profile', candidateRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Middleware
app.use(errorHandler);

export default app;

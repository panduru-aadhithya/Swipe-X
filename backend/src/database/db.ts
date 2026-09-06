import fs from 'fs';
import path from 'path';
import { 
  User, 
  CandidateProfile, 
  Resume, 
  ResumeData, 
  Job, 
  JobRecommendation, 
  SwipeDecision, 
  SavedJob, 
  ATSReport, 
  Application 
} from '../types';
import { isMongoConnected } from './mongoDb';
import {
  UserModel,
  CandidateProfileModel,
  ResumeModel,
  ResumeDataModel,
  JobModel,
  JobRecommendationModel,
  SwipeDecisionModel,
  SavedJobModel,
  ATSReportModel,
  ApplicationModel
} from '../models';

export interface DatabaseState {
  users: User[];
  candidateProfiles: CandidateProfile[];
  resumes: Resume[];
  resumeData: ResumeData[];
  jobs: Job[];
  jobRecommendations: JobRecommendation[];
  swipeDecisions: SwipeDecision[];
  savedJobs: SavedJob[];
  atsReports: ATSReport[];
  applications: Application[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db_store.json');

class DatabaseService {
  private state: DatabaseState = {
    users: [],
    candidateProfiles: [],
    resumes: [],
    resumeData: [],
    jobs: [],
    jobRecommendations: [],
    swipeDecisions: [],
    savedJobs: [],
    atsReports: [],
    applications: []
  };

  private isMongoSynced = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        this.state = {
          users: parsed.users || [],
          candidateProfiles: parsed.candidateProfiles || [],
          resumes: parsed.resumes || [],
          resumeData: parsed.resumeData || [],
          jobs: parsed.jobs || [],
          jobRecommendations: parsed.jobRecommendations || [],
          swipeDecisions: parsed.swipeDecisions || [],
          savedJobs: parsed.savedJobs || [],
          atsReports: parsed.atsReports || [],
          applications: parsed.applications || []
        };
      }
    } catch (err) {
      console.warn('Could not read existing db_store.json, initializing fresh store:', err);
    }
  }

  public saveState() {
    // When MongoDB is connected, MongoDB is the primary database.
    // Local db_store.json is NOT written when MongoDB Atlas is active.
    if (isMongoConnected()) {
      return;
    }
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save db state to local file:', err);
    }
  }

  /**
   * Synchronizes database state with MongoDB Atlas when connection is established.
   */
  public async syncFromMongo(): Promise<void> {
    if (!isMongoConnected()) return;

    try {
      console.log('[DatabaseService] Synchronizing collections from MongoDB Atlas...');

      const mongoJobCount = await JobModel.countDocuments();

      if (mongoJobCount > 0) {
        // Load collections from MongoDB Atlas into active state
        const [
          mongoUsers,
          mongoCandidates,
          mongoResumes,
          mongoResumeData,
          mongoJobs,
          mongoJobRecommendations,
          mongoSwipes,
          mongoSavedJobs,
          mongoAtsReports,
          mongoApplications
        ] = await Promise.all([
          UserModel.find().lean(),
          CandidateProfileModel.find().lean(),
          ResumeModel.find().lean(),
          ResumeDataModel.find().lean(),
          JobModel.find().lean(),
          JobRecommendationModel.find().lean(),
          SwipeDecisionModel.find().lean(),
          SavedJobModel.find().lean(),
          ATSReportModel.find().lean(),
          ApplicationModel.find().lean()
        ]);

        const sanitize = (items: any[]) => items.map(item => {
          const id = item.id || item._id;
          const { _id, __v, ...rest } = item;
          return { ...rest, id };
        });

        this.state.users = sanitize(mongoUsers) as User[];
        this.state.candidateProfiles = sanitize(mongoCandidates) as CandidateProfile[];
        this.state.resumes = sanitize(mongoResumes) as Resume[];
        this.state.resumeData = sanitize(mongoResumeData) as ResumeData[];
        this.state.jobs = sanitize(mongoJobs) as Job[];
        this.state.jobRecommendations = sanitize(mongoJobRecommendations) as JobRecommendation[];
        this.state.swipeDecisions = sanitize(mongoSwipes) as SwipeDecision[];
        this.state.savedJobs = sanitize(mongoSavedJobs) as SavedJob[];
        this.state.atsReports = sanitize(mongoAtsReports) as ATSReport[];
        this.state.applications = sanitize(mongoApplications) as Application[];

        this.isMongoSynced = true;
        console.log(`[DatabaseService] Synced from MongoDB Atlas: ${this.state.jobs.length} jobs, ${this.state.users.length} users.`);
      } else if (this.state.jobs.length > 0) {
        // Seed MongoDB from existing local store
        console.log('[DatabaseService] MongoDB Atlas is fresh. Auto-migrating current dataset to MongoDB...');
        await this.autoSeedMongo();
        this.isMongoSynced = true;
      }
    } catch (err: any) {
      console.error('[DatabaseService] Error syncing from MongoDB:', err.message);
    }
  }

  private async autoSeedMongo(): Promise<void> {
    try {
      const ops = [
        this.persistMany(UserModel, this.state.users),
        this.persistMany(CandidateProfileModel, this.state.candidateProfiles),
        this.persistMany(ResumeModel, this.state.resumes),
        this.persistMany(ResumeDataModel, this.state.resumeData),
        this.persistMany(JobModel, this.state.jobs),
        this.persistMany(JobRecommendationModel, this.state.jobRecommendations),
        this.persistMany(SwipeDecisionModel, this.state.swipeDecisions),
        this.persistMany(SavedJobModel, this.state.savedJobs),
        this.persistMany(ATSReportModel, this.state.atsReports),
        this.persistMany(ApplicationModel, this.state.applications)
      ];
      await Promise.all(ops);
      console.log('[DatabaseService] Auto-seed to MongoDB Atlas completed successfully.');
    } catch (err: any) {
      console.error('[DatabaseService] Failed auto-seeding to MongoDB Atlas:', err.message);
    }
  }

  private async persistMany(model: any, items: any[]): Promise<void> {
    if (!items || items.length === 0) return;
    const bulkOps = items.map(item => {
      const { _id, ...rest } = item;
      const docId = item.id || _id;
      return {
        updateOne: {
          filter: { id: docId },
          update: {
            $set: { ...rest, id: docId },
            $setOnInsert: { _id: docId }
          },
          upsert: true
        }
      };
    });
    await model.bulkWrite(bulkOps, { ordered: false });
  }

  // --- MongoDB Async Persistence Helpers ---

  public async persistUser(user: User): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = user as any;
      await UserModel.updateOne(
        { id: user.id },
        { $set: { ...rest, id: user.id }, $setOnInsert: { _id: user.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting user to Mongo:', err.message);
    }
  }

  public async persistCandidateProfile(profile: CandidateProfile): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = profile as any;
      await CandidateProfileModel.updateOne(
        { id: profile.id },
        { $set: { ...rest, id: profile.id }, $setOnInsert: { _id: profile.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting candidate profile to Mongo:', err.message);
    }
  }

  public async persistResume(resume: Resume): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = resume as any;
      await ResumeModel.updateOne(
        { id: resume.id },
        { $set: { ...rest, id: resume.id }, $setOnInsert: { _id: resume.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting resume to Mongo:', err.message);
    }
  }

  public async persistResumeData(data: ResumeData): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = data as any;
      await ResumeDataModel.updateOne(
        { id: data.id },
        { $set: { ...rest, id: data.id }, $setOnInsert: { _id: data.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting resume data to Mongo:', err.message);
    }
  }

  public async persistJob(job: Job): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = job as any;
      await JobModel.updateOne(
        { id: job.id },
        { $set: { ...rest, id: job.id }, $setOnInsert: { _id: job.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting job to Mongo:', err.message);
    }
  }

  public async persistJobs(jobs: Job[]): Promise<void> {
    if (!isMongoConnected() || jobs.length === 0) return;
    try {
      const bulkOps = jobs.map(job => {
        const { _id, ...rest } = job as any;
        return {
          updateOne: {
            filter: { id: job.id },
            update: { $set: { ...rest, id: job.id }, $setOnInsert: { _id: job.id } },
            upsert: true
          }
        };
      });
      await JobModel.bulkWrite(bulkOps, { ordered: false });
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting jobs to Mongo:', err.message);
    }
  }

  public async persistSwipeDecision(swipe: SwipeDecision): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = swipe as any;
      await SwipeDecisionModel.updateOne(
        { candidateProfileId: swipe.candidateProfileId, jobId: swipe.jobId },
        { $set: { ...rest, id: swipe.id }, $setOnInsert: { _id: swipe.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting swipe decision to Mongo:', err.message);
    }
  }

  public async deleteSwipeDecision(candidateProfileId: string, jobId: string): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      await SwipeDecisionModel.deleteOne({ candidateProfileId, jobId });
    } catch (err: any) {
      console.error('[DatabaseService] Error deleting swipe decision from Mongo:', err.message);
    }
  }

  public async clearCandidateSwipes(candidateProfileId: string): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      await SwipeDecisionModel.deleteMany({ candidateProfileId });
    } catch (err: any) {
      console.error('[DatabaseService] Error clearing candidate swipes from Mongo:', err.message);
    }
  }

  public async persistSavedJob(savedJob: SavedJob): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = savedJob as any;
      await SavedJobModel.updateOne(
        { candidateProfileId: savedJob.candidateProfileId, jobId: savedJob.jobId },
        { $set: { ...rest, id: savedJob.id }, $setOnInsert: { _id: savedJob.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting saved job to Mongo:', err.message);
    }
  }

  public async deleteSavedJob(candidateProfileId: string, jobId: string): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      await SavedJobModel.deleteOne({ candidateProfileId, jobId });
    } catch (err: any) {
      console.error('[DatabaseService] Error deleting saved job from Mongo:', err.message);
    }
  }

  public async persistATSReport(report: ATSReport): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = report as any;
      await ATSReportModel.updateOne(
        { candidateProfileId: report.candidateProfileId, jobId: report.jobId },
        { $set: { ...rest, id: report.id }, $setOnInsert: { _id: report.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting ATS report to Mongo:', err.message);
    }
  }

  public async persistApplication(application: Application): Promise<void> {
    if (!isMongoConnected()) return;
    try {
      const { _id, ...rest } = application as any;
      await ApplicationModel.updateOne(
        { id: application.id },
        { $set: { ...rest, id: application.id }, $setOnInsert: { _id: application.id } },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('[DatabaseService] Error persisting application to Mongo:', err.message);
    }
  }

  // --- Getters ---

  public get users() { return this.state.users; }
  public get candidateProfiles() { return this.state.candidateProfiles; }
  public get resumes() { return this.state.resumes; }
  public get resumeData() { return this.state.resumeData; }
  public get jobs() { return this.state.jobs; }
  public get jobRecommendations() { return this.state.jobRecommendations; }
  public get swipeDecisions() { return this.state.swipeDecisions; }
  public get savedJobs() { return this.state.savedJobs; }
  public get atsReports() { return this.state.atsReports; }
  public get applications() { return this.state.applications; }

  public setJobs(jobs: Job[]) {
    this.state.jobs = jobs;
    this.saveState();
    this.persistJobs(jobs).catch(() => {});
  }

  public resetAll() {
    this.state = {
      users: [],
      candidateProfiles: [],
      resumes: [],
      resumeData: [],
      jobs: [],
      jobRecommendations: [],
      swipeDecisions: [],
      savedJobs: [],
      atsReports: [],
      applications: []
    };
    this.saveState();
  }
}

export const db = new DatabaseService();

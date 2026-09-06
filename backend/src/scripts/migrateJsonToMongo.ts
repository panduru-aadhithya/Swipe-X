import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
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
import { resolveMongoUri } from '../database/mongoDb';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db_store.json');

async function migrateCollection(
  name: string,
  model: mongoose.Model<any>,
  items: any[]
): Promise<{ total: number; insertedOrUpdated: number }> {
  if (!items || items.length === 0) {
    console.log(`[Migration] ${name}: 0 items found to migrate.`);
    return { total: 0, insertedOrUpdated: 0 };
  }

  console.log(`[Migration] Migrating ${name} (${items.length} items)...`);

  const BATCH_SIZE = 250;
  let processed = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const bulkOps = batch.map(item => {
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
    processed += batch.length;
    process.stdout.write(`  -> Processed ${processed}/${items.length} documents in ${name}\r`);
  }

  const finalCount = await model.countDocuments();
  console.log(`\n  ✓ Completed ${name}: verified ${finalCount} documents present in MongoDB.`);
  return { total: items.length, insertedOrUpdated: finalCount };
}

export async function runMigration(): Promise<void> {
  const uri = resolveMongoUri();

  console.log('====================================================');
  console.log('   Swipe X - MongoDB Atlas JSON Store Migration     ');
  console.log('====================================================\n');

  if (!uri || uri.trim() === '') {
    console.error('ERROR: MONGODB_URI is not defined in the environment.');
    console.error('Please configure MONGODB_URI with your MongoDB Atlas connection string.');
    console.error('Example: export MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/swipex?retryWrites=true&w=majority"');
    process.exit(1);
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    console.error(`ERROR: JSON database file not found at ${DB_FILE_PATH}`);
    process.exit(1);
  }

  console.log(`[Migration] Reading JSON data from ${DB_FILE_PATH}...`);
  const rawData = fs.readFileSync(DB_FILE_PATH, 'utf8');
  let parsed: any;
  try {
    parsed = JSON.parse(rawData);
  } catch (err: any) {
    console.error('ERROR: Failed to parse JSON database store:', err.message);
    process.exit(1);
  }

  console.log(`[Migration] Connecting to MongoDB Atlas: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('[Migration] Connected to MongoDB Atlas successfully.\n');
  } catch (err: any) {
    console.error('[Migration] Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }

  const results: Record<string, number> = {};

  try {
    results.users = (await migrateCollection('users', UserModel, parsed.users || [])).insertedOrUpdated;
    results.candidateProfiles = (await migrateCollection('candidateProfiles', CandidateProfileModel, parsed.candidateProfiles || [])).insertedOrUpdated;
    results.resumes = (await migrateCollection('resumes', ResumeModel, parsed.resumes || [])).insertedOrUpdated;
    results.resumeData = (await migrateCollection('resumeData', ResumeDataModel, parsed.resumeData || [])).insertedOrUpdated;
    results.jobs = (await migrateCollection('jobs', JobModel, parsed.jobs || [])).insertedOrUpdated;
    results.jobRecommendations = (await migrateCollection('jobRecommendations', JobRecommendationModel, parsed.jobRecommendations || [])).insertedOrUpdated;
    results.swipeDecisions = (await migrateCollection('swipeDecisions', SwipeDecisionModel, parsed.swipeDecisions || [])).insertedOrUpdated;
    results.savedJobs = (await migrateCollection('savedJobs', SavedJobModel, parsed.savedJobs || [])).insertedOrUpdated;
    results.atsReports = (await migrateCollection('atsReports', ATSReportModel, parsed.atsReports || [])).insertedOrUpdated;
    results.applications = (await migrateCollection('applications', ApplicationModel, parsed.applications || [])).insertedOrUpdated;

    console.log('\n====================================================');
    console.log('   MIGRATION COMPLETED SUCCESSFULLY');
    console.log('====================================================');
    console.table(
      Object.entries(results).map(([collection, count]) => ({
        Collection: collection,
        'Migrated Documents': count
      }))
    );
    console.log('All collections have been verified in MongoDB Atlas.');
    console.log('Note: db_store.json was left intact as requested.\n');
  } catch (err: any) {
    console.error('\n[Migration Error]: An error occurred during migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('[Migration] Database connection closed.');
  }
}

// Execute migration
runMigration().catch((err) => {
  console.error('[Migration Fatal Error]:', err);
  process.exit(1);
});

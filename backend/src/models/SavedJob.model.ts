import mongoose, { Schema, Model } from 'mongoose';
import { SavedJob } from '../types';

export interface ISavedJob extends Omit<SavedJob, 'id'> {
  _id?: string;
  id: string;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    job: { type: Schema.Types.Mixed, required: true },
    matchScore: { type: Number },
    notes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'saved_jobs',
    timestamps: false,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.id || ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

savedJobSchema.index({ candidateProfileId: 1, jobId: 1 }, { unique: true });

export const SavedJobModel: Model<ISavedJob> =
  mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', savedJobSchema);

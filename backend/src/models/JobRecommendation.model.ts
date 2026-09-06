import mongoose, { Schema, Model } from 'mongoose';
import { JobRecommendation } from '../types';

export interface IJobRecommendation extends Omit<JobRecommendation, 'id'> {
  _id?: string;
  id: string;
}

const jobRecommendationSchema = new Schema<IJobRecommendation>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    job: { type: Schema.Types.Mixed, required: true },
    matchScore: { type: Number, required: true },
    skillMatchScore: { type: Number, default: 0 },
    experienceMatchScore: { type: Number, default: 0 },
    titleSimilarityScore: { type: Number, default: 0 },
    locationMatchScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    whyItMatches: { type: [String], default: [] },
    potentialGaps: { type: [String], default: [] },
    swipeBoost: { type: Number },
    swipeReasons: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'job_recommendations',
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

export const JobRecommendationModel: Model<IJobRecommendation> =
  mongoose.models.JobRecommendation || mongoose.model<IJobRecommendation>('JobRecommendation', jobRecommendationSchema);

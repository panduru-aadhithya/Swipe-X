import mongoose, { Schema, Model } from 'mongoose';
import { CandidateProfile } from '../types';

export interface ICandidateProfile extends Omit<CandidateProfile, 'id'> {
  _id?: string;
  id: string;
}

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    summary: { type: String, trim: true },
    preferredRole: { type: String, trim: true },
    preferredLocation: { type: String, trim: true },
    preferredWorkType: { type: String, enum: ['Remote', 'Hybrid', 'On-site'] },
    experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'] },
    targetSalary: { type: Number },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number },
    profileCompletionScore: { type: Number, default: 0 },
    portfolioLinks: {
      github: { type: String },
      linkedin: { type: String },
      portfolioWebsite: { type: String },
      dribbble: { type: String },
      kaggle: { type: String },
      twitter: { type: String }
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'candidate_profiles',
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

export const CandidateProfileModel: Model<ICandidateProfile> =
  mongoose.models.CandidateProfile || mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);

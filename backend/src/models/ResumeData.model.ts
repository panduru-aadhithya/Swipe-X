import mongoose, { Schema, Model } from 'mongoose';
import { ResumeData } from '../types';

export interface IResumeData extends Omit<ResumeData, 'id'> {
  _id?: string;
  id: string;
}

const resumeDataSchema = new Schema<IResumeData>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    resumeId: { type: String, required: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    summary: { type: String },
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String },
        level: { type: String }
      }
    ],
    experience: [
      {
        company: { type: String, required: true },
        title: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String },
        current: { type: Boolean, default: false },
        duration: { type: String },
        responsibilities: { type: [String], default: [] },
        technologies: { type: [String], default: [] }
      }
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String, required: true },
        startDate: { type: String },
        endDate: { type: String },
        gpa: { type: String }
      }
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        technologies: { type: [String], default: [] },
        link: { type: String }
      }
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String },
        credentialId: { type: String }
      }
    ],
    atsReadinessScore: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    areasForImprovement: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'resume_data',
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

export const ResumeDataModel: Model<IResumeData> =
  mongoose.models.ResumeData || mongoose.model<IResumeData>('ResumeData', resumeDataSchema);

import mongoose, { Schema, Model } from 'mongoose';
import { Job } from '../types';

export interface IJob extends Omit<Job, 'id'> {
  _id?: string;
  id: string;
}

const jobSchema = new Schema<IJob>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    source: { type: String, default: 'Direct' },
    datePosted: { type: String, required: true },
    workType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
      required: true
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Contract', 'Part-time', 'Internship'],
      default: 'Full-time',
      required: true
    },
    companyType: {
      type: String,
      enum: ['MNC', 'Startup', 'Newly Founded', 'Enterprise'],
      default: 'Startup'
    },
    description: { type: String, required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'USD' },
    extractedSkills: { type: [String], default: [], index: true },
    experienceRequirements: { type: String },
    educationRequirements: { type: String },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Internship']
    },
    normalizedTitle: { type: String, default: '' },
    normalizedCompany: { type: String, default: '' },
    normalizedLocation: { type: String, default: '' },
    keywords: { type: [String], default: [], index: true },
    applicantsCount: { type: Number, default: 5 },
    competitionLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    isEarlyApplicant: { type: Boolean, default: true },
    isFresherFriendly: { type: Boolean, default: false },
    postedTimeAgo: { type: String, default: '1d ago' },
    isFresh: { type: Boolean, default: true },
    recruiterId: { type: String, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'jobs',
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

export const JobModel: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

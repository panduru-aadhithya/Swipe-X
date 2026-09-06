import mongoose, { Schema, Model } from 'mongoose';
import { Application } from '../types';

export interface IApplication extends Omit<Application, 'id'> {
  _id?: string;
  id: string;
}

const applicationSchema = new Schema<IApplication>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    job: { type: Schema.Types.Mixed, required: true },
    resumeId: { type: String, required: true },
    atsReportId: { type: String },
    atsScore: { type: Number },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'],
      default: 'APPLIED',
      required: true
    },
    appliedDate: { type: String, default: () => new Date().toISOString() },
    updatedDate: { type: String, default: () => new Date().toISOString() },
    coverLetter: { type: String },
    candidateNotes: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: String, required: true },
        note: { type: String }
      }
    ]
  },
  {
    collection: 'applications',
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

applicationSchema.index({ candidateProfileId: 1, jobId: 1 });

export const ApplicationModel: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);

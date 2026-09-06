import mongoose, { Schema, Model } from 'mongoose';
import { Resume } from '../types';

export interface IResume extends Omit<Resume, 'id'> {
  _id?: string;
  id: string;
}

const resumeSchema = new Schema<IResume>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    title: { type: String },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    rawText: { type: String, required: true },
    parsingStatus: {
      type: String,
      enum: ['PENDING', 'PARSED', 'FAILED'],
      default: 'PENDING',
      required: true
    },
    parsedAt: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'resumes',
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

export const ResumeModel: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>('Resume', resumeSchema);

import mongoose, { Schema, Model } from 'mongoose';
import { ATSReport } from '../types';

export interface IATSReport extends Omit<ATSReport, 'id'> {
  _id?: string;
  id: string;
}

const atsReportSchema = new Schema<IATSReport>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    resumeId: { type: String, required: true, index: true },
    atsScore: { type: Number, required: true },
    skillScore: { type: Number, default: 0 },
    keywordScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    scoringWeights: {
      skills: { type: Number, default: 35 },
      keywords: { type: Number, default: 25 },
      experience: { type: Number, default: 20 },
      education: { type: Number, default: 10 },
      title: { type: Number, default: 10 }
    },
    disclaimer: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'ats_reports',
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

atsReportSchema.index({ candidateProfileId: 1, jobId: 1 });

export const ATSReportModel: Model<IATSReport> =
  mongoose.models.ATSReport || mongoose.model<IATSReport>('ATSReport', atsReportSchema);

import mongoose, { Schema, Model } from 'mongoose';
import { SwipeDecision } from '../types';

export interface ISwipeDecision extends Omit<SwipeDecision, 'id'> {
  _id?: string;
  id: string;
}

const swipeDecisionSchema = new Schema<ISwipeDecision>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['right_swipe', 'left_swipe', 'save_swipe', 'RIGHT', 'LEFT', 'SAVE'],
      default: 'right_swipe'
    },
    decision: {
      type: String,
      enum: ['LEFT', 'SAVE', 'RIGHT', 'left_swipe', 'right_swipe'],
      required: true
    },
    timestamp: { type: String, default: () => new Date().toISOString() },
    createdAt: { type: String, default: () => new Date().toISOString() },

    // Job attributes snapshot at the time of swipe
    jobTitle: { type: String },
    company: { type: String },
    skills: [{ type: String }],
    location: { type: String },
    employmentType: { type: String },
    experienceLevel: { type: String },
    salary: { type: String },
    jobCategory: { type: String },

    // Job reference and Application linkage
    job: { type: Schema.Types.Mixed },
    applied: { type: Boolean, default: false },
    applicationId: { type: String },
    applicationStatus: { type: String },
    appliedDate: { type: String }
  },
  {
    collection: 'swipe_decisions',
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

swipeDecisionSchema.index({ candidateProfileId: 1, jobId: 1 }, { unique: true });

export const SwipeDecisionModel: Model<ISwipeDecision> =
  mongoose.models.SwipeDecision || mongoose.model<ISwipeDecision>('SwipeDecision', swipeDecisionSchema);

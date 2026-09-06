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
    candidateProfileId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    decision: {
      type: String,
      enum: ['LEFT', 'SAVE', 'RIGHT'],
      required: true
    },
    job: { type: Schema.Types.Mixed },
    applied: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() }
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

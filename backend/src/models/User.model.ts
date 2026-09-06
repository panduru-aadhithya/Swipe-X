import mongoose, { Schema, Model } from 'mongoose';
import { User } from '../types';

export interface IUser extends Omit<User, 'id'> {
  _id?: string;
  id: string;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: function (this: any) { return this.id; } },
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { 
      type: String, 
      enum: ['CANDIDATE', 'RECRUITER', 'ADMIN'], 
      default: 'CANDIDATE',
      required: true 
    },
    companyName: { type: String, trim: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'users',
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

export const UserModel: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

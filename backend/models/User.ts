import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatar?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  theme?: 'dark' | 'light' | 'system';
  role: 'interviewer' | 'candidate';
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  interviewCount: number;
  totalInterviewTime: number; // in seconds
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    resetPasswordToken: { type: String, select: false, default: undefined },
    resetPasswordExpires: { type: Date, select: false, default: undefined },
    avatar: { type: String },
    title: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    timezone: { type: String, trim: true, default: '' },
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    role: {
      type: String,
      enum: ['interviewer', 'candidate'],
      default: 'candidate',
    },
    profileCompleted: { type: Boolean, default: false },
    interviewCount: { type: Number, default: 0 },
    totalInterviewTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

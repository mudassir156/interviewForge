import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  roomId: string;
  title: string;
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'rust';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  participants: mongoose.Types.ObjectId[];
  code: string;
  codeHistory: Array<{
    timestamp: Date;
    code: string;
    userId: mongoose.Types.ObjectId;
  }>;
}

const InterviewSchema = new Schema<IInterview>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'go', 'rust'],
      default: 'javascript',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    description: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    code: { type: String, default: '' },
    codeHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        code: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

export const Interview = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IExecution extends Document {
  roomId: string;
  code: string;
  language: string;
  output: string;
  error?: string;
  executionTime: number; // in milliseconds
  memory?: number; // in MB
  timestamp: Date;
  success: boolean;
  userId: mongoose.Types.ObjectId;
}

const ExecutionSchema = new Schema<IExecution>(
  {
    roomId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    output: { type: String, default: '' },
    error: { type: String },
    executionTime: { type: Number, required: true },
    memory: { type: Number },
    success: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const Execution = mongoose.models.Execution || mongoose.model<IExecution>('Execution', ExecutionSchema);

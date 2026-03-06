import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'system'], default: 'text' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// TTL index to auto-delete messages after 30 days
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

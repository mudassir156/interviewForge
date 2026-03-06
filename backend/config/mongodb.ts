import mongoose from 'mongoose';

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewforge';

  try {
    if (mongoose.connections[0].readyState) {
      console.log('[v0] MongoDB already connected');
      return mongoose.connections[0];
    }

    await mongoose.connect(MONGODB_URI);
    console.log('[v0] MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[v0] MongoDB disconnected');
  } catch (error) {
    console.error('[v0] Error disconnecting MongoDB:', error);
    throw error;
  }
}

export default mongoose;

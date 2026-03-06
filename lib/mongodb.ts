/**
 * MongoDB connection helper for Next.js API Routes.
 * Re-uses an existing connection across hot-reloads in dev mode.
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn && mongoose.connection.readyState === 1) {
    return global._mongooseConn;
  }

  const conn = await mongoose.connect(MONGODB_URI);
  global._mongooseConn = conn;
  return conn;
}

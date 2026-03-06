import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { setupSocketHandlers } from './socket/handlers';
import { connectDB, disconnectDB } from './config/mongodb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SOCKET_IO_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Setup Socket handlers
setupSocketHandlers(io);

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('[v0] Connected to MongoDB');
  })
  .catch(error => {
    console.error('[v0] Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Start server
server.listen(PORT, () => {
  console.log(`[v0] Socket.io server running on port ${PORT}`);
  console.log(`[v0] Environment: ${process.env.NODE_ENV}`);
  console.log(`[v0] CORS origin: ${process.env.NEXT_PUBLIC_API_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[v0] SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[v0] SIGINT received, shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

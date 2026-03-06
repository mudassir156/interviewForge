import { Server as SocketIOServer, Socket } from 'socket.io';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '../config/mongodb';
import { Interview } from '../models/Interview';
import { Message } from '../models/Message';
import { codeExecutor } from '../services/codeExecutor';

interface RoomData {
  roomId: string;
  participants: Map<string, any>;
  code: string;
  language: string;
}

interface WebRTCSignalPayload {
  roomId: string;
  targetSocketId: string;
  sdp?: Record<string, unknown>;
  candidate?: Record<string, unknown>;
}

interface ParticipantMediaPayload {
  roomId: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

const roomsData = new Map<string, RoomData>();

export function setupSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log('[v0] New client connected:', socket.id);

    // Room Join
    socket.on('room:join', async (data: any) => {
      try {
        const { roomId, user, role } = data;
        console.log('[v0] User joined room:', roomId, user.name, role);

        socket.join(roomId);

        await connectDB();
        if (user?.id && isValidObjectId(user.id)) {
          await Interview.findOneAndUpdate(
            { roomId },
            { $addToSet: { participants: user.id } },
            { new: false }
          );
        }

        // Initialize or get room data
        if (!roomsData.has(roomId)) {
          const interview = await Interview.findOne({ roomId });

          if (interview) {
            roomsData.set(roomId, {
              roomId,
              participants: new Map(),
              code: interview.code || '',
              language: interview.language || 'javascript',
            });
          }
        }

        const room = roomsData.get(roomId);
        if (room) {
          room.participants.set(socket.id, {
            id: socket.id,
            userId: user.id,
            name: user.name,
            role,
            isActive: true,
            hasVideo: false,
            hasAudio: true,
            joinedAt: new Date(),
          });

          // Notify others
          socket.to(roomId).emit('participant:join', {
            participant: {
              id: socket.id,
              userId: user.id,
              name: user.name,
              role,
              isActive: true,
              hasVideo: false,
              hasAudio: true,
            },
          });

          // Send current state to newly joined user
          socket.emit('room:state', {
            participants: Array.from(room.participants.values()),
            code: room.code,
            language: room.language,
          });

          io.to(roomId).emit('room:update', {
            participantCount: room.participants.size,
          });
        }
      } catch (error) {
        console.error('[v0] Error in room:join:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Code Update
    socket.on('code:update', async (data: any) => {
      try {
        const { roomId, code, language } = data;
        console.log('[v0] Code updated in room:', roomId);

        const room = roomsData.get(roomId);
        if (room) {
          room.code = code;
          room.language = language;

          // Broadcast to all in room except sender
          socket.to(roomId).emit('code:update', {
            code,
            language,
            userId: socket.id,
          });

          // Save to database periodically (debounced)
          // This would be handled by a debounce mechanism in production
        }
      } catch (error) {
        console.error('[v0] Error in code:update:', error);
      }
    });

    // Code Execution
    socket.on('code:execute', async (data: any) => {
      try {
        const { roomId, code, language } = data;
        console.log('[v0] Executing code in room:', roomId);

        const result = await codeExecutor.execute({
          code,
          language,
        });

        // Broadcast result to all in room
        io.to(roomId).emit('execution:result', {
          output: result.output,
          error: result.error,
          success: result.success,
          executionTime: result.executionTime,
          userId: socket.id,
        });
      } catch (error) {
        console.error('[v0] Error in code:execute:', error);
        socket.emit('error', { message: 'Failed to execute code' });
      }
    });

    // Chat Message
    socket.on('chat:message', async (data: any, callback?: (response: any) => void) => {
      try {
        const { roomId, content, sender, clientMessageId } = data;
        console.log('[v0] Chat message in room:', roomId);

        // Save to database
        await connectDB();
        const message = new Message({
          roomId,
          sender: sender.id,
          content,
          type: 'text',
        });
        await message.save();

        // Broadcast to all in room
        io.to(roomId).emit('chat:message', {
          id: message._id,
          clientMessageId,
          roomId,
          sender: sender.name,
          content,
          timestamp: message.timestamp,
        });

        callback?.({
          success: true,
          id: message._id,
          timestamp: message.timestamp,
          clientMessageId,
        });
      } catch (error) {
        console.error('[v0] Error in chat:message:', error);
        callback?.({ success: false, error: 'Failed to send message' });
      }
    });

    // WebRTC Signaling: Offer
    socket.on('webrtc:offer', (data: WebRTCSignalPayload) => {
      try {
        const { roomId, targetSocketId, sdp } = data;
        if (!roomId || !targetSocketId || !sdp) {
          return;
        }

        io.to(targetSocketId).emit('webrtc:offer', {
          roomId,
          fromSocketId: socket.id,
          sdp,
        });
      } catch (error) {
        console.error('[v0] Error in webrtc:offer:', error);
      }
    });

    // WebRTC Signaling: Answer
    socket.on('webrtc:answer', (data: WebRTCSignalPayload) => {
      try {
        const { roomId, targetSocketId, sdp } = data;
        if (!roomId || !targetSocketId || !sdp) {
          return;
        }

        io.to(targetSocketId).emit('webrtc:answer', {
          roomId,
          fromSocketId: socket.id,
          sdp,
        });
      } catch (error) {
        console.error('[v0] Error in webrtc:answer:', error);
      }
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('webrtc:ice-candidate', (data: WebRTCSignalPayload) => {
      try {
        const { roomId, targetSocketId, candidate } = data;
        if (!roomId || !targetSocketId || !candidate) {
          return;
        }

        io.to(targetSocketId).emit('webrtc:ice-candidate', {
          roomId,
          fromSocketId: socket.id,
          candidate,
        });
      } catch (error) {
        console.error('[v0] Error in webrtc:ice-candidate:', error);
      }
    });

    // Participant media status update
    socket.on('participant:media', (data: ParticipantMediaPayload) => {
      try {
        const { roomId, hasAudio, hasVideo } = data;
        if (!roomId) {
          return;
        }

        const room = roomsData.get(roomId);
        if (!room) {
          return;
        }

        const participant = room.participants.get(socket.id);
        if (!participant) {
          return;
        }

        if (typeof hasAudio === 'boolean') {
          participant.hasAudio = hasAudio;
        }

        if (typeof hasVideo === 'boolean') {
          participant.hasVideo = hasVideo;
        }

        room.participants.set(socket.id, participant);

        io.to(roomId).emit('participant:update', {
          participant: {
            id: socket.id,
            userId: participant.userId,
            name: participant.name,
            role: participant.role,
            isActive: participant.isActive,
            hasAudio: participant.hasAudio,
            hasVideo: participant.hasVideo,
          },
        });
      } catch (error) {
        console.error('[v0] Error in participant:media:', error);
      }
    });

    // Room Leave
    socket.on('room:leave', (data: any) => {
      try {
        const { roomId } = data;
        console.log('[v0] User left room:', roomId);

        const room = roomsData.get(roomId);
        if (room) {
          room.participants.delete(socket.id);

          socket.leave(roomId);

          // Notify others
          socket.to(roomId).emit('participant:leave', {
            userId: socket.id,
          });

          io.to(roomId).emit('room:update', {
            participantCount: room.participants.size,
          });

          // Clean up empty rooms
          if (room.participants.size === 0) {
            roomsData.delete(roomId);
          }
        }
      } catch (error) {
        console.error('[v0] Error in room:leave:', error);
      }
    });

    // Room Close
    socket.on('room:close', async (data: any) => {
      try {
        const { roomId, reason } = data;
        console.log('[v0] Room closed:', roomId, reason);

        io.to(roomId).emit('room:close', {
          roomId,
          reason: reason || 'Session ended by host',
        });

        const room = roomsData.get(roomId);
        if (room) {
          room.participants.clear();
          roomsData.delete(roomId);
        }
      } catch (error) {
        console.error('[v0] Error in room:close:', error);
        socket.emit('error', { message: 'Failed to close room' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('[v0] Client disconnected:', socket.id);

      // Clean up user from all rooms
      for (const [roomId, room] of roomsData.entries()) {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);

          socket.to(roomId).emit('participant:leave', {
            userId: socket.id,
          });

          io.to(roomId).emit('room:update', {
            participantCount: room.participants.size,
          });

          // Clean up empty rooms
          if (room.participants.size === 0) {
            roomsData.delete(roomId);
          }
        }
      }
    });
  });
}

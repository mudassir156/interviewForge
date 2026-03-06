import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/mongodb';
import { Interview } from '@/backend/models/Interview';
import { Execution } from '@/backend/models/Execution';
import { Message } from '@/backend/models/Message';
import { User } from '@/backend/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { title, description, language, difficulty, createdBy } = await request.json();

    // Validate required fields
    if (!title || !language || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new interview room
    const room = new Interview({
      roomId,
      title,
      description,
      language,
      difficulty: difficulty || 'medium',
      createdBy,
      participants: [createdBy],
    });

    await room.save();

    console.log('[v0] Room created:', roomId);

    return NextResponse.json(
      {
        success: true,
        room: {
          _id: room._id,
          roomId: room.roomId,
          title: room.title,
          language: room.language,
          difficulty: room.difficulty,
          status: room.status,
          createdAt: room.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const roomId = searchParams.get('roomId');

    const query: any = {};
    if (userId) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      query.$or = [{ createdBy: userObjectId }, { participants: userObjectId }];
    }
    if (status) query.status = status;
    if (roomId) query.roomId = roomId;

    const rooms = await Interview.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error('[v0] Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { roomId, status } = await request.json();

    if (!roomId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['active', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const room = await Interview.findOneAndUpdate(
      { roomId },
      { status },
      { new: true }
    );

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('[v0] Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { roomId, userId } = await request.json();

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user id' },
        { status: 400 }
      );
    }

    const room = await Interview.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (String(room.createdBy) !== userId) {
      return NextResponse.json(
        { error: 'Only the room owner can delete this history entry' },
        { status: 403 }
      );
    }

    await Promise.all([
      Interview.deleteOne({ roomId }),
      Message.deleteMany({ roomId }),
      Execution.deleteMany({ roomId }),
    ]);

    return NextResponse.json({
      success: true,
      roomId,
    });
  } catch (error) {
    console.error('[v0] Error deleting room history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/mongodb';
import { Message } from '@/backend/models/Message';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { roomId, sender, content, type } = await request.json();

    // Validate required fields
    if (!roomId || !sender || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new message
    const message = new Message({
      roomId,
      sender,
      content,
      type: type || 'text',
    });

    await message.save();

    console.log('[v0] Message saved for room:', roomId);

    return NextResponse.json(
      {
        success: true,
        message: {
          _id: message._id,
          roomId: message.roomId,
          content: message.content,
          timestamp: message.timestamp,
          type: message.type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing roomId parameter' },
        { status: 400 }
      );
    }

    const messages = await Message.find({ roomId })
      .populate('sender', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('[v0] Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/mongodb';
import { Execution } from '@/backend/models/Execution';
import { codeExecutor } from '@/backend/services/codeExecutor';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { code, language, roomId, userId, input } = await request.json();

    // Validate required fields
    if (!code || !language || !roomId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[v0] Executing code for room:', roomId);

    // Execute code
    const result = await codeExecutor.execute({
      code,
      language,
      input,
    });

    // Save execution result to database
    const execution = new Execution({
      roomId,
      code,
      language,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      success: result.success,
      userId,
    });

    await execution.save();

    console.log('[v0] Code execution result saved');

    return NextResponse.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      executionId: execution._id,
    });
  } catch (error) {
    console.error('[v0] Error executing code:', error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}

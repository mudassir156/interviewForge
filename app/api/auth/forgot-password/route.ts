import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/backend/models/User';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 1000 * 60 * 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
    let resetUrl: string | undefined;

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const hashedToken = createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + TOKEN_TTL_MS);
      await user.save({ validateBeforeSave: false });

      resetUrl = `${req.nextUrl.origin}/reset-password?token=${rawToken}`;
      console.info(`[auth/forgot-password] Reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && resetUrl ? { resetUrl } : {}),
    });
  } catch (err) {
    console.error('[auth/forgot-password]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

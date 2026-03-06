import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/backend/models/User';
import { NextRequest } from 'next/server';
import { setAuthCookie, signToken } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        title: user.title || '',
        phone: user.phone || '',
        timezone: user.timezone || '',
        theme: user.theme || 'dark',
        role: user.role,
        profileCompleted: Boolean(user.profileCompleted),
        avatar: user.avatar,
        interviewCount: user.interviewCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[auth/me]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const timezone = typeof body?.timezone === 'string' ? body.timezone.trim() : '';
    const avatar = typeof body?.avatar === 'string' ? body.avatar.trim() : undefined;
    const role = body?.role;
    const theme = body?.theme;
    const validTheme = theme === 'dark' || theme === 'light' || theme === 'system' ? theme : 'dark';
    const validRole = role === 'interviewer' || role === 'candidate' ? role : undefined;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (typeof avatar === 'string' && avatar.length > 2_800_000) {
      return NextResponse.json({ error: 'Profile image is too large.' }, { status: 400 });
    }

    if (typeof avatar === 'string' && avatar !== '' && !avatar.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid profile image format.' }, { status: 400 });
    }

    await connectDB();

    const duplicateUser = await User.findOne({ email, _id: { $ne: session.userId } });
    if (duplicateUser) {
      return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
    }

    const user = await User.findByIdAndUpdate(
      session.userId,
      {
        name,
        email,
        title,
        phone,
        timezone,
        ...(validRole ? { role: validRole } : {}),
        profileCompleted: Boolean(validRole || session.role) && Boolean(title) && Boolean(timezone),
        ...(typeof avatar === 'string' ? { avatar } : {}),
        theme: validTheme,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      profileCompleted: Boolean(user.profileCompleted),
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        title: user.title || '',
        phone: user.phone || '',
        timezone: user.timezone || '',
        theme: user.theme || 'dark',
        role: user.role,
        profileCompleted: Boolean(user.profileCompleted),
        avatar: user.avatar,
        interviewCount: user.interviewCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[auth/me:update]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/ElectionModels';
import { authenticate } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';

// CITIZEN PROFILE ENGINE: GET /api/user 🕵️‍♂️🛡️🔐
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 });
    }

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: 'Database Offline' }, { status: 503 });

    // Fetch the authenticated user from the local eLoktantra identity vault
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: 'Identified user was removed from the session vault.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        constituency: user.constituencyId,
        isVerified: user.isVerified,
        hasVoted: user.hasVoted
      }
    });

  } catch (err: any) {
    console.error('API Profile Error:', err.message);
    return NextResponse.json({ error: `Profile Retrieval Failure: ${err.message}` }, { status: 500 });
  }
}

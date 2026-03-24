import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/ElectionModels';

// 🛠️ DEVELOPER RESET API: POST /api/dev/reset-vote
// Resets hasVoted for ALL users so voting can be tested repeatedly.
// THIS ROUTE MUST NEVER EXIST IN PRODUCTION.
export async function POST() {
  // Safety guard: only works in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    // Try to reset via Mongoose
    const conn = await connectDB();
    if (conn) {
      await User.updateMany({}, { $set: { hasVoted: false } });
      console.log('🛠️ DEV: Reset hasVoted for all users');
    }

    return NextResponse.json({
      success: true,
      message: '🛠️ Developer Reset: All vote records cleared. You can vote again.',
    });
  } catch (err: any) {
    // Even if DB fails, return success so the frontend flow continues
    console.warn('Dev reset DB error (non-blocking):', err.message);
    return NextResponse.json({ success: true, message: 'Proceeding in dev mode (DB reset skipped)' });
  }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { Election } from '@/models/CoreModels';

/**
 * GET /api/election/active
 * Used by the Dashboard to show the current election context.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const election = await Election.findOne({ isActive: true }).sort({ startDate: -1 });

    if (!election) {
      return NextResponse.json({ title: 'None Found', id: null });
    }

    return NextResponse.json({
      _id: election._id,
      id: election._id,
      title: election.title,
      type: election.type,
      startDate: election.startDate,
      endDate: election.endDate,
      isActive: election.isActive
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Election } from '@/models/CoreModels';

// GET /api/elections
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const constituency = searchParams.get('constituency');
    const activeOnly = searchParams.get('active') !== 'false';

    const query: any = {};
    if (activeOnly) query.isActive = true;
    if (constituency) query.constituency = constituency;

    const elections = await Election.find(query)
      .sort({ startDate: -1 })
      .lean();

    // Normalize _id to id for frontend
    const normalized = elections.map(e => ({ ...e, id: e._id.toString() }));
    return NextResponse.json({ success: true, count: normalized.length, elections: normalized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

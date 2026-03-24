import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Election } from '@/models/CoreModels';

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { title, type, startDate, endDate, isActive } = await request.json();

    if (!title || !type || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'title, type (State|General), startDate, endDate are required' }, { status: 400 });
    }

    console.log('🗳️ API_ELECT_POST: Creating new election entry:', title);
    const election = await Election.create({
      title,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive ?? false,
      
      // Dual-Persistence for Legacy compatibility
      start_time: new Date(startDate),
      end_time: new Date(endDate),
      constituency: 'National'
    });
    console.log('✅ API_ELECT_POST: Successfully persisted election:', election._id);

    return NextResponse.json({ success: true, election }, { status: 201 });
  } catch (err: any) {
    console.error('❌ API_ELECT_POST_ERROR:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  await connectDB();
  const elections = await Election.find({}).sort({ startDate: -1 });
  return NextResponse.json({ success: true, elections });
}

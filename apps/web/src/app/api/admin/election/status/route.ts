import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Election } from '@/models/CoreModels';

/**
 * POST /api/admin/election/status
 * Body: { id, isActive }
 */
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Election ID is required' }, { status: 400 });
    }

    const election = await Election.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );

    if (!election) {
      return NextResponse.json({ success: false, error: 'Election not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, election });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

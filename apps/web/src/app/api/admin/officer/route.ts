import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { BoothOfficer } from '@/models/CoreModels';

/**
 * GET /api/admin/officer
 * Returns all booth officers for administrative tracking.
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const officers = await BoothOfficer.find({}).lean();
    return NextResponse.json({ success: true, count: officers.length, data: officers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/officer
 * Onboards a new booth officer.
 */
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();
    
    // Simple validation
    if (!body.name || !body.username || !body.booth_id || !body.device_id) {
       return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const officer = await BoothOfficer.create(body);
    return NextResponse.json({ success: true, officer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/officer
 * Updates an officer's data.
 */
export async function PUT(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await connectDB();
    const body = await request.json();
    const officer = await BoothOfficer.findByIdAndUpdate(id, body, { new: true });
    
    return NextResponse.json({ success: true, officer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/officer
 * Revokes access for a booth officer.
 */
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    await connectDB();
    await BoothOfficer.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Officer removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

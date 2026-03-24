import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Party } from '@/models/CoreModels';

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();
    const { name, abbreviation } = body;

    if (!name || !abbreviation) {
      return NextResponse.json({ success: false, error: 'name and abbreviation are required' }, { status: 400 });
    }

    const party = await Party.findOneAndUpdate(
      { name },
      { $set: { ...body } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: party }, { status: 201 });
  } catch (err: any) {
    console.error('API_POST_PARTY_ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/party
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  
  try {
    await connectDB();
    const parties = await Party.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: parties });
  } catch (err: any) {
    console.error('API_GET_PARTY_ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


/**
 * DELETE /api/admin/party?id=xxx
 */
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  
  await connectDB();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  
  await Party.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: 'Party removed' });
}

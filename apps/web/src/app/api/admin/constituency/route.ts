import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Constituency } from '@/models/CoreModels';

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();

    // Bulk upload support
    if (Array.isArray(body)) {
      const constituencies = await Constituency.insertMany(body);
      return NextResponse.json({ success: true, count: constituencies.length, constituencies }, { status: 201 });
    }

    const { name, electionId, state } = body;
    if (!name || !electionId || !state) {
      return NextResponse.json({ success: false, error: 'name, electionId, state are required' }, { status: 400 });
    }

    const constituency = await Constituency.create({ name, electionId, state });
    return NextResponse.json({ success: true, constituency }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  await connectDB();
  const { searchParams } = new URL(request.url);
  const electionId = searchParams.get('electionId');
  const query = electionId ? { electionId } : {};
  const constituencies = await Constituency.find(query).sort({ name: 1 });
  return NextResponse.json({ success: true, constituencies });
}

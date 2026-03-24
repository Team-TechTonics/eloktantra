import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Promise as PromiseModel } from '@/models/CoreModels';

// GET /api/promises
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const constituency = searchParams.get('constituency');
    const status = searchParams.get('status');

    const query: any = {};
    if (candidateId) query.candidateId = candidateId;
    if (constituency) query.constituency = constituency;
    if (status) query.status = status;

    const promises = await PromiseModel.find(query)
      .populate('candidateId', 'name party') // join candidate name+party
      .sort({ createdAt: -1 })
      .lean();

    const normalized = promises.map(p => ({ ...p, id: p._id.toString() }));
    return NextResponse.json({ success: true, count: normalized.length, promises: normalized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

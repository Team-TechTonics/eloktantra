import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Promise as PromiseModel } from '@/models/CoreModels';

// POST /api/admin/promise
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { candidateId, electionId, constituency, title, description, deadline } = await request.json();
    if (!candidateId || !constituency || !title || !description) {
      return NextResponse.json({ success: false, error: 'candidateId, constituency, title, description are required' }, { status: 400 });
    }
    const promise = await PromiseModel.create({
      candidateId, electionId, constituency, title, description,
      deadline: deadline ? new Date(deadline) : undefined,
    });
    return NextResponse.json({ success: true, promise }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/promise?id=xxx — update progress and status
export async function PATCH(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  await connectDB();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  const body = await request.json();
  const promise = await PromiseModel.findByIdAndUpdate(id, { $set: body }, { new: true });
  return NextResponse.json({ success: true, promise });
}

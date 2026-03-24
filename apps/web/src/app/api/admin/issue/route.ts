import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Issue } from '@/models/CoreModels';

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, electionId, constituencyId } = body;

    if (!title || !description || !electionId || !constituencyId) {
      return NextResponse.json({ success: false, error: 'title, description, electionId, constituencyId are required' }, { status: 400 });
    }

    let issue;
    if (id) {
      issue = await Issue.findByIdAndUpdate(id, { title, description, electionId, constituencyId }, { new: true });
    } else {
      issue = await Issue.create({ title, description, electionId, constituencyId });
    }

    return NextResponse.json({ success: true, issue }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  await connectDB();
  const { searchParams } = new URL(request.url);
  const constituencyId = searchParams.get('constituencyId');
  const electionId = searchParams.get('electionId');
  
  const query: any = {};
  if (constituencyId) query.constituencyId = constituencyId;
  if (electionId) query.electionId = electionId;

  const issues = await Issue.find(query).sort({ reportedCount: -1 });

  return NextResponse.json({ success: true, issues });
}

/**
 * DELETE /api/admin/issue?id=
 */
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await Issue.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Issue removed from regional concerns' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Manifesto, Candidate } from '@/models/CoreModels';

/**
 * POST /api/admin/manifesto — Create or update a policy blueprint for a candidate.
 */
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();
    const { id, title, content, candidateId, electionId, constituencyId, priorities } = body;

    if (!title || !content || !candidateId || !electionId || !constituencyId) {
      return NextResponse.json({ success: false, error: 'title, content, candidateId, electionId, constituencyId are required' }, { status: 400 });
    }

    let manifesto;
    if (id) {
       manifesto = await Manifesto.findByIdAndUpdate(id, {
          title, content, candidateId, electionId, constituencyId, priorities
       }, { new: true });
    } else {
       manifesto = await Manifesto.create({
          title, content, candidateId, electionId, constituencyId, priorities
       });
    }

    return NextResponse.json({ success: true, manifesto }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/manifesto?id=
 */
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await Manifesto.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Manifesto removed from regional blueprints' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/manifesto
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');
    const candidateId = searchParams.get('candidateId');

    const query: any = {};
    if (electionId) query.electionId = electionId;
    if (constituencyId) query.constituencyId = constituencyId;
    if (candidateId) query.candidateId = candidateId;

    const manifestos = await Manifesto.find(query)
      .populate('candidateId', 'name photo_url partyId')
      .populate('electionId', 'title')
      .populate('constituencyId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, manifestos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

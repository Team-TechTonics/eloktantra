import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Candidate } from '@/models/CoreModels';

/**
 * POST /api/admin/candidate — Create or update a candidate in the electoral hierarchy.
 */
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();
    const { id, name, partyId, electionId, constituencyId, photo_url, assets, criminalCases, education, biography } = body;

    if (!name || !partyId || !electionId || !constituencyId) {
       return NextResponse.json({ success: false, error: 'name, partyId, electionId, constituencyId are required' }, { status: 400 });
    }

    let candidate;
    if (id) {
       candidate = await Candidate.findByIdAndUpdate(id, {
          name, partyId, electionId, constituencyId, photo_url, assets, criminalCases, education, biography
       }, { new: true });
    } else {
       candidate = await Candidate.create({
          name, partyId, electionId, constituencyId, photo_url, assets, criminalCases, education, biography
       });
    }

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (err: any) {
    console.error('API_ADMIN_CANDIDATE_POST_ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/candidate?id=
 */
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await Candidate.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Candidate removed from ledger' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

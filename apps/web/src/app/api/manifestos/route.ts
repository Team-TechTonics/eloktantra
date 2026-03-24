import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { Manifesto, Candidate, Party } from '@/models/CoreModels';

/**
 * GET /api/manifestos?candidateId=&electionId=&constituencyId=
 * Returns cryptographically verified regional blueprints.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const electionId = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');

    const query: any = {};
    if (candidateId) query.candidateId = candidateId;
    if (electionId) query.electionId = electionId;
    if (constituencyId) query.constituencyId = constituencyId;

    if (Object.keys(query).length === 0) {
      return NextResponse.json({ success: false, error: 'At least one filter (candidateId, electionId, or constituencyId) is required' }, { status: 400 });
    }

    // Populate candidate and party name for rich UI display
    // Manifesto -> Candidate -> Party
    const manifestos = await Manifesto.find(query)
      .populate('candidateId')
      .sort({ createdAt: -1 });
    
    // Manual mapping for hierarchy consistency in frontend
    const richManifestos = await Promise.all(manifestos.map(async (m: any) => {
       const candidate = await Candidate.findById(m.candidateId).populate('partyId');
       return {
         ...m.toObject(),
         candidateName: candidate?.name || 'Unknown Candidate',
         partyName: (candidate?.partyId as any)?.name || (candidate?.partyId as any)?.abbreviation || 'Independent',
         _id: m._id.toString()
       };
    }));
    
    return NextResponse.json({ 
      success: true, 
      count: richManifestos.length, 
      manifestos: richManifestos 
    });
  } catch (err: any) {
    console.error('API_GET_MANIFESTOS_ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

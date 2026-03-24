import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { Candidate } from '@/models/CoreModels';

/**
 * GET /api/candidates?electionId=&constituencyId=
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');

    if (!electionId) {
      return NextResponse.json({ success: false, error: 'electionId is required' }, { status: 400 });
    }

    const query: any = { electionId };
    if (constituencyId) query.constituencyId = constituencyId;

    const candidates = await Candidate.find(query).sort({ name: 1 });
    
    return NextResponse.json({ 
      success: true, 
      count: candidates.length, 
      candidates: candidates.map(c => ({ 
        ...c.toObject(), 
        id: c._id.toString() 
      })) 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

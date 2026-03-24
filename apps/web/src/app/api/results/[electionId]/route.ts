import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Vote } from '@/models/CoreModels';
import { Election } from '@/models/CoreModels';
import Candidate from '@/models/Candidate';

// GET /api/results/[electionId]
export async function GET(
  _request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  try {
    await connectDB();
    const { electionId } = params;
    if (!electionId) return NextResponse.json({ success: false, error: 'electionId required' }, { status: 400 });

    const election = await Election.findById(electionId).lean();
    if (!election) return NextResponse.json({ success: false, error: 'Election not found' }, { status: 404 });

    // Aggregate votes by candidateId
    const tally = await Vote.aggregate([
      { $match: { electionId: (election as any)._id } },
      { $group: { _id: '$candidateId', votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    // Enrich with candidate details
    const enriched = await Promise.all(
      tally.map(async (t) => {
        const candidate = await Candidate.findById(t._id).lean();
        return {
          candidateId: t._id.toString(),
          candidateName: (candidate as any)?.name || 'Unknown',
          party: (candidate as any)?.party || 'Unknown',
          votes: t.votes,
        };
      })
    );

    const totalVotes = enriched.reduce((sum, r) => sum + r.votes, 0);

    return NextResponse.json({
      success: true,
      election: { ...(election as any), id: (election as any)._id.toString() },
      totalVotes,
      results: enriched,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

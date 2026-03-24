import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Vote, Candidate, Constituency } from '@/models/CoreModels';

/**
 * GET /api/admin/results
 * Aggregates all votes by constituency to reveal the current electoral standing.
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    if (!electionId) {
      return NextResponse.json({ success: false, error: 'electionId is required' }, { status: 400 });
    }

    // 1. Fetch all votes for the election
    const votes = await Vote.find({ electionId }).lean();

    // 2. Fetch all constituencies for the election
    const constituencies = await Constituency.find({ electionId }).lean();

    // 3. Aggregate Votes by Constituency and Candidate
    const results = await Promise.all(constituencies.map(async (con: any) => {
      const conVotes = votes.filter((v: any) => v.constituencyId.toString() === con._id.toString());
      
      // Candidate tally
      const candidates = await Candidate.find({ constituencyId: con._id });
      const tally = candidates.map((cand: any) => {
        const count = conVotes.filter((v: any) => v.candidateId.toString() === cand._id.toString()).length;
        return {
          candidateId: cand._id,
          name: cand.name,
          party: cand.party,
          voteCount: count
        };
      });

      // Find winner
      const sorted = [...tally].sort((a,b) => b.voteCount - a.voteCount);
      const winner = sorted[0]?.voteCount > 0 ? sorted[0] : null;

      return {
        constituency: con.name,
        state: con.state,
        totalVotes: conVotes.length,
        winner: winner ? {
            name: winner.name,
            party: winner.party,
            votes: winner.voteCount
        } : "NO_VOTES_CAST",
        standings: tally
      };
    }));

    return NextResponse.json({
      success: true,
      electionId,
      totalVotesCast: votes.length,
      constituencies: results
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { Vote } from '@/models/CoreModels';

/**
 * GET /api/admin/vote
 * Returns the stream of cryptographic ballots for monitoring.
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    const query = electionId ? { electionId } : {};
    
    // Fetch recent votes
    const votes = await Vote.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Map to expected frontend format if needed
    const formattedVotes = votes.map((v: any) => ({
      _id: v._id,
      vote_hash: v.blockchainHash,
      booth_id: v.constituencyId, // Fallback to constituency id for now
      status: 'COMMITTED', // All DB votes are committed for now
      tx_hash: v.blockchainHash, // Assuming hash is the tx hash
      submitted_at: v.createdAt,
    }));

    return NextResponse.json({ success: true, count: formattedVotes.length, data: formattedVotes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

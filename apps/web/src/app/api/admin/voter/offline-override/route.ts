import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { User, ElectoralRoll } from '@/models/ElectionModels';

/**
 * POST /api/admin/voter/offline-override
 * Logic: Manually flags a citizen as having voted offline at a physical booth.
 * This revokes their online SOL token and prevents double-voting.
 */
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const { phone, voterId } = await request.json();

    if (!phone && !voterId) {
      return NextResponse.json({ success: false, error: 'phone or voterId required' }, { status: 400 });
    }

    // 1. Mark in the National Electoral Roll
    const voter = await ElectoralRoll.findOneAndUpdate(
      { $or: [{ phone }, { voterId }] },
      { $set: { solTokenUsed: true } }, // "Spent" the token offline
      { new: true }
    );

    if (!voter) {
      return NextResponse.json({ success: false, error: 'Identity record not found' }, { status: 404 });
    }

    // 2. Override any existing online session
    const session = await User.findOneAndUpdate(
      { phone: voter.phone },
      { $set: { votedOffline: true, hasVoted: true } },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Offline vote override applied. Online ballot for this identity is now REVOKED.',
      voter: voter.name,
      id: voter.voterId
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

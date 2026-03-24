import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { ElectoralRoll, User } from '@/models/ElectionModels';
import crypto from 'crypto';

/**
 * POST /api/verify/token
 * Step 4: Finalize 4-step biometric + security 
 * TOKEN BINDING: Re-calculates token hash based on sessionId + deviceId.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, deviceId } = await request.json();

    if (!userId || !deviceId) {
      return NextResponse.json({ success: false, error: 'userId and deviceId required for alignment' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Identity record not found' }, { status: 404 });
    }

    // ─── 🛡️ SESSION BINDING ARCHITECTURE ─────────────────────
    // Recalculate the bound token hash to ensure consistency
    const expectedTokenHash = crypto.createHash('sha256').update([user.phone, deviceId, user.sessionId].join('|')).digest('hex');

    // If the hash has changed (hijacked, or session manipulated), REJECT.
    if (user.tokenHash && user.tokenHash !== expectedTokenHash) {
      await User.findByIdAndUpdate(userId, { suspicious: true });
      return NextResponse.json({ 
        success: false, 
        error: 'Cryptographic Binding mismatch: Token is assigned to a different session or device instance. Action reported.' 
      }, { status: 403 });
    }

    // ─── Fetch Pre-generated SOL Token ──────────────────────
    const voter = await ElectoralRoll.findOne({ phone: user.phone });
    if (!voter || !voter.solToken) {
      return NextResponse.json({ success: false, error: 'No Sol Token assigned. Contact Administration.' }, { status: 500 });
    }
    
    // Check for double-voting/spent token again
    if (voter.solTokenUsed) {
      return NextResponse.json({ success: false, error: 'Electoral SOL Token already redeemed. Duplicate vote attempt blocked.' }, { status: 403 });
    }

    // ─── Mark User Verified ─────────────────────────────────
    await User.findByIdAndUpdate(userId, { 
      isVerified: true,
      tokenHash: expectedTokenHash // Refresh/Finalize if needed
    });

    return NextResponse.json({ 
      success: true, 
      voterIdHash: user.aadhaarHash, 
      ready: true,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

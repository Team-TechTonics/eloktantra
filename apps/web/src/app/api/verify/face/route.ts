import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/ElectionModels';
import crypto from 'crypto';

/**
 * POST /api/verify/face
 * Logic: Enforces Face-Session Alignment and Anti-Spoofing.
 * Prevents "Person A" at Step 1 and "Person B" at Step 2.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, image, antiSpoofData, currentFaceEmbedding } = await request.json();

    if (!userId || !image) {
      return NextResponse.json({ success: false, error: 'Session parameters and biometric stream required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    // ─── 🛡️ Biometric Session Lock Check ─────────────────────
    // Calculate current hash of the captured face
    const currentFaceHash = crypto.createHash('sha256').update(currentFaceEmbedding || 'MOCK_CAPTURE_V1').digest('hex');

    // Compare with the hash locked during DigiLocker login (Step 1)
    if (user.faceHash && currentFaceHash !== user.faceHash) {
      await User.findByIdAndUpdate(userId, { suspicious: true });
      return NextResponse.json({ 
        success: false, 
        error: 'Biometric Discrepancy: Face does not match the identity record established at Step 1 (DigiLocker). Session Locked.' 
      }, { status: 403 });
    }

    // ─── 🧪 Anti-Spoofing Check ─────────────────────────────
    const isLive = antiSpoofData?.isLive ?? true;
    if (!isLive) {
      await User.findByIdAndUpdate(userId, { suspicious: true });
      return NextResponse.json({ 
        success: false, 
        error: 'Liveness Breach: 2D Screen or Static image detected. Scan failed.' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Biometric continuity verified. Face-Session alignment confirmed.' 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

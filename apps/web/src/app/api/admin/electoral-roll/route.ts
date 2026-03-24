import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { ElectoralRoll } from '@/models/ElectionModels';
import crypto from 'crypto';

/**
 * Helper to generate a unique, non-guessable SOL Token
 */
function generateSolToken(voterId: string): string {
  const secret = process.env.TOKEN_SECRET || 'eLoktantra-Secret-2024';
  return crypto.createHmac('sha256', secret)
    .update(`${voterId}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .slice(0, 32);
}

// POST /api/admin/electoral-roll
// Body: { name, phone, voterId, constituencyId, aadhaarHash, address, faceEmbedding }
export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const body = await request.json();

    // ─── Bulk Upload Support ──────────────────────────────────
    if (Array.isArray(body.voters)) {
      const votersToInsert = body.voters.map((v: any) => {
        const voterData = {
          name: v.name,
          phone: v.phone,
          voterId: v.voterId || `IND-${Math.floor(Math.random() * 90000000 + 10000000)}`,
          constituencyId: v.constituencyId,
          electionId: v.electionId || body.electionId,
          aadhaarHash: v.aadhaarHash || crypto.createHash('sha256').update(v.phone).digest('hex'),
          address: v.address || 'New Delhi, India',
          faceEmbedding: v.faceEmbedding || `EMBED_${Math.random().toString(16).slice(2, 10)}`,
          solToken: generateSolToken(v.voterId || v.phone),
          isActive: true
        };
        return voterData;
      });

      // Use upsert to avoid duplicates by phone
      for (const v of votersToInsert) {
        await ElectoralRoll.findOneAndUpdate(
          { phone: v.phone },
          { $set: v },
          { upsert: true, new: true }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Electoral roll updated with ${votersToInsert.length} voters. SOL tokens generated.`,
      });
    }

    // ─── Single Voter ─────────────────────────────────────────
    const { name, phone, voterId, constituencyId, electionId } = body;
    if (!name || !phone || !constituencyId) {
      return NextResponse.json({ success: false, error: 'name, phone, constituencyId are required' }, { status: 400 });
    }

    const solToken = generateSolToken(voterId || phone);
    const voter = await ElectoralRoll.findOneAndUpdate(
      { phone },
      { 
        $set: { 
          name, 
          phone, 
          voterId: voterId || `IND-${Math.floor(Math.random() * 90000000 + 10000000)}`, 
          constituencyId,
          electionId,
          aadhaarHash: body.aadhaarHash || crypto.createHash('sha256').update(phone).digest('hex'),
          address: body.address || 'New Delhi, India',
          faceEmbedding: body.faceEmbedding || `EMBED_${Math.random().toString(16).slice(2, 10)}`,
          solToken,
          isActive: true 
        } 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, voter });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET /api/admin/electoral-roll — list all voters
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  const { searchParams } = new URL(request.url);
  const electionId = searchParams.get('electionId');
  const query: any = { isActive: true };
  if (electionId) query.electionId = electionId;

  await connectDB();
  const voters = await ElectoralRoll.find(query).sort({ name: 1 });
  return NextResponse.json({ success: true, count: voters.length, voters });
}

// DELETE /api/admin/electoral-roll?phone=xxx — deactivate voter
export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  await connectDB();
  const phone = new URL(request.url).searchParams.get('phone');
  if (!phone) return NextResponse.json({ success: false, error: 'phone required' }, { status: 400 });
  await ElectoralRoll.findOneAndUpdate({ phone }, { isActive: false });
  return NextResponse.json({ success: true, message: 'Voter deactivated' });
}

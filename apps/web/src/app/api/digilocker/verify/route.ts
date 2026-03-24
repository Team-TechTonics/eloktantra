import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ElectoralRoll, User } from '@/models/ElectionModels';
import crypto from 'crypto';

/**
 * Helper to create a cryptographic bind hash
 */
function createBindHash(parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
}

/**
 * POST /api/digilocker/verify
 * Fetches real citizen data from MongoDB (Electoral Roll) 
 * to power the DigiLocker Mock.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { identifier, deviceId } = await request.json(); // aadhaar/phone + device fingerprint

    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Identifier required' }, { status: 400 });
    }

    // 1. Search in Electoral Roll
    const voter = await ElectoralRoll.findOne({
      $or: [
        { phone: identifier },
        { voterId: identifier },
        { phone: identifier.replace(/\s/g, '') }
      ],
      isActive: true
    });

    if (!voter) {
      return NextResponse.json({ 
        success: false, 
        error: 'Identity not found in National Electoral Roll' 
      }, { status: 404 });
    }

    // 2. Initialize Session Binding (SESSION LOCK)
    const sessionId = crypto.randomUUID();
    const faceHash = createBindHash([voter.faceEmbedding]);
    const tokenHash = createBindHash([voter.voterId, deviceId || 'UNKNOWN_DEVICE', sessionId]);

    // 3. Register/Update Active User Session
    const userSession = await User.findOneAndUpdate(
      { phone: voter.phone },
      { 
        $set: { 
          name: voter.name,
          phone: voter.phone,
          aadhaarHash: voter.aadhaarHash,
          constituencyId: voter.constituencyId,
          isVerified: false,
          suspicious: false,
          lastLoginIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
          
          deviceId: deviceId || 'UNKNOWN_DEVICE',
          sessionId,
          faceHash,
          tokenHash,
          
          locationStatus: 'PENDING',
          sessionFaceEmbedding: voter.faceEmbedding 
        }
      },
      { upsert: true, new: true }
    );

    // 3. Return real data to the mock UI
    return NextResponse.json({
      success: true,
      user: {
        id: userSession._id,
        name: voter.name,
        aadhaarNumber: `XXXX XXXX ${voter.phone.slice(-4)}`,
        mobileNumber: voter.phone,
        address: voter.address,
        constituencyId: voter.constituencyId,
        faceEmbedding: voter.faceEmbedding,
        deviceId: userSession.deviceId,
        sessionId: userSession.sessionId,
        documents: [
          {
            id: 'aadhaar-1',
            name: `${voter.name} Aadhaar Card`,
            type: 'Aadhaar',
            verified: true,
            uploadedAt: (voter as any).createdAt?.toISOString() || new Date().toISOString()
          },
          {
            id: 'voter-1',
            name: `Voter ID CARD - ${voter.voterId}`,
            type: 'Voter ID',
            verified: true,
            uploadedAt: (voter as any).createdAt?.toISOString() || new Date().toISOString()
          }
        ]
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

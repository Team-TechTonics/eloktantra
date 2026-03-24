import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

// RE-CONFIGURABLE SECURITY TOKEN GENERATOR 🕵️‍♂️🛡️
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Generate Secure Voting Token 🔐
    const token = crypto.randomBytes(32).toString('hex').toUpperCase();
    
    // ATTEMPT CLOUD AUDIT (With tight timeout)
    const tryCloudLog = async () => {
      const client = await clientPromise;
      if (!client) throw new Error('OFFLINE');
      
      const db = client.db('eloktantra');
      await db.collection('audit_logs').insertOne({
        userId,
        event: 'VOTING_TOKEN_ISSUED',
        tokenPrefix: token.substring(0, 8),
        timestamp: new Date(),
        status: 'SECURE'
      });
      return true;
    };

    const timeout = new Promise((_, reject) => setTimeout(() => reject('TIMEOUT'), 1500));

    try {
       await Promise.race([tryCloudLog(), timeout]);
       console.log('✅ Audit Event Logged: Voting Token Issued.');
    } catch (err) {
       console.warn('⚠️ Cloud Audit Bypass: Emitting Secure Token (Session State Only).');
    }

    // Always issue the token to prevent blocking the user
    return NextResponse.json({
      success: true,
      token: `VOT-2024-${token.substring(0, 16)}`,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      governance: 'NPCI/Election Commission Mock-Verification Bridge'
    });

  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: 'Token Engine Offline. Security parameters unstable.' 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { decryptVault } from '@/lib/crypto';

// "RECOVERABLE VAULT" RETRIEVAL 🕵️‍♂️🛡️🔐
// Implements ROADMAP Section 3: Secure Data Flows & Decryption
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ success: false, error: 'Atlas Connection Failure' }, { status: 503 });
    }

    const db = client.db('eloktantra');
    let query = {};
    if (userId) query = { id: userId };

    const docs = await db.collection('documents').find(query).toArray();
    
    // 🛡️ DECRYPTION LAYER: Decrypting cloud blobs for localized browser previews
    return NextResponse.json({ 
      success: true, 
      documents: docs.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        uploadedAt: d.uploadedAt,
        verified: d.verified,
        preview: d.content ? `data:${d.contentType};base64,${decryptVault(d.content)}` : '/placeholder.jpg'
      }))
    });

  } catch (err: any) {
    console.error('API Retrieval Error:', err.message);
    return NextResponse.json({ success: false, error: `Vault Sync Failure: ${err.message}` }, { status: 500 });
  }
}

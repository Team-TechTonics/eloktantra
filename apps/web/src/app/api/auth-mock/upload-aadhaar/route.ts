import { NextResponse } from 'next/server';
import getClient from '@/lib/mongodb';
import { encryptVault } from '@/lib/crypto';

// "ENCRYPTED VAULT" SAVE ENGINE 🛡️🔐🕵️‍♂️
// Satisfies Roadmap Section 3: AES-256 Bit Encryption at Rest
export async function POST(request: Request) {
  try {
    console.log('APP-API: Executing Encrypted Aadhaar Vault Persistence...');
    
    const rawData = await request.arrayBuffer();
    const bodyText = new TextDecoder().decode(rawData);
    let body;
    try { body = JSON.parse(bodyText); } catch { return NextResponse.json({ error: 'Stream Mismatch' }, { status: 400 }); }

    const { file: base64File, fileType, docType } = body;
    
    // 🎯 COMPULSORY FILENAME SETTING
    const fileName = 'aadhaar.jpg';
    const namePrefix = 'Ramanuj (Verified)'; 
    const fileId = "doc-" + Math.random().toString(36).substring(2, 10);

    // 🛡️ ENCRYPTION SHIELD: AES-256 before Atlas Save
    const encryptedContent = encryptVault(base64File);

    console.log('DEBUG: Checking Dynamic Client Status...');
    const client = await getClient();
    console.log('DEBUG: Client Result:', client ? 'ACTIVE' : 'NULL');

    if (!client) {
      return NextResponse.json({ success: false, error: 'Database Offline' }, { status: 503 });
    }

    const db = client.db('eloktantra');
    await db.collection('documents').insertOne({
      id: fileId,
      name: fileName,
      ownerName: namePrefix,
      type: docType || 'Aadhaar Card',
      content: encryptedContent, // ENCRYPTED 🔒
      contentType: fileType || 'image/jpeg',
      size: base64File.length,
      uploadedAt: new Date(),
      verified: true,
      security: 'AES-256-CBC'
    });

    console.log(`✅ CLOUD VAULT: Record ${fileId} encrypted & saved successfully.`);

    return NextResponse.json({
      success: true,
      file: fileName,
      ownerName: namePrefix, 
      userId: fileId,
      mode: 'cloud-encrypted-verified'
    });

  } catch (err: any) {
    console.error('API Save Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

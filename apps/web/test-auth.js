const { MongoClient } = require('mongodb');

// FINAL SECURE AUTH TEST 🕵️‍♂️🛡️✨
// testing the user-provided credentials: eloktantra:tonicsteamtech
const uri = "mongodb+srv://eloktantra:tonicsteamtech@cluster0.bzfsujx.mongodb.net/eloktantra?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  console.log('--- 🛡️ NEW CREDENTIALS VERIFICATION ---');
  
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000 
  });

  try {
    console.log('1. Handshaking with New Identity Credentials...');
    await client.connect();
    console.log('✅ 2. IDENTIFIED: Handshake successful!');
    
    const db = client.db('eloktantra');
    const result = await db.command({ ping: 1 });
    console.log('✅ 3. AUTHENTICATED: Cloud interaction verified!', result);

  } catch (err) {
    console.error('❌ FAIL:', err.message);
  } finally {
    await client.close();
  }
}

test();

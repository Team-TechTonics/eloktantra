const { MongoClient } = require('mongodb');

// STANDALONE CONNECTIVITY TEST 🕵️‍♂️⚡ 
const uri = "mongodb+srv://tonics_team_tech_db_user:8ldFgRXplJ3itScFF@cluster0.bzfsujx.mongodb.net/eloktantra?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  console.log('🧪 CONNECTIVITY SHIELD TEST (PORT 27017/443) 🧪');
  
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000 
  });

  try {
    console.log('1. Handshaking with Atlas Shards...');
    await client.connect();
    console.log('✅ 2. STAGE 1: TCP/SSL Handshake Success!');
    
    const db = client.db('eloktantra');
    const result = await db.command({ ping: 1 });
    console.log('✅ 3. STAGE 2: PING AUTHENTICATED!', result);

    const count = await db.collection('documents').countDocuments();
    console.log('✅ 4. STAGE 3: DATA COUNT:', count);

  } catch (err) {
    console.error('❌ FAIL:', err.message);
  } finally {
    await client.close();
  }
}

test();

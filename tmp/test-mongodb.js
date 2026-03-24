const { MongoClient } = require('mongodb');

// DEBUGGER: Test your connection directly from the terminal to see why Atlas is hanging! 🕵️‍♂️⚡
const uri = "mongodb+srv://tonics_team_tech_db_user:8ldFgRXplJ3itScFF@cluster0.bzfsujx.mongodb.net/eloktantra?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  console.log('--- MONGODB CONNECTIVITY TEST (Direct) ---');
  console.log('URI:', uri.split('@')[1]); // Log host only for security
  
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000 
  });

  try {
    console.log('1. Attempting DNS/SRV Resolution...');
    await client.connect();
    console.log('✅ 2. STAGE 1: TCP Handshake Successful!');
    
    const db = client.db('admin');
    const result = await db.command({ ping: 1 });
    console.log('✅ 3. STAGE 2: Database PING Successful!', result);

    const databases = await client.db().admin().listDatabases();
    console.log('✅ 4. STAGE 3: Authorization Successful! Databases found:', databases.databases.map(d => d.name));

  } catch (err) {
    console.error('❌ CONNECTION FAILED ERROR:', err.code || 'UNKNOWN');
    console.error('MESSAGE:', err.message);
    if (err.message.includes('whitelist')) console.error('🕵️‍♂️ CAUSE: Atlas IP Whitelist (0.0.0.0/0 is required).');
    if (err.message.includes('getaddrinfo')) console.error('🕵️‍♂️ CAUSE: DNS Blocking. Your ISP/Router is hiding Atlas.');
    if (err.message.includes('ETIMEDOUT')) console.error('🕵️‍♂️ CAUSE: Port 27017 is blocked by Windows Firewall or Router.');
  } finally {
    await client.close();
  }
}

test();

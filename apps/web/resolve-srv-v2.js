const dns = require('dns').promises;
const fs = require('fs');

async function resolveAtlas() {
  console.log('--- 🛡️ ATLAS SRV DIAGNOSTIC ---');
  const srvDomain = '_mongodb._tcp.cluster0.bzfsujx.mongodb.net';
  
  try {
    const results = await dns.resolveSrv(srvDomain);
    const nodes = results.map(r => `${r.name}:${r.port}`).join(',');
    
    // Construct the REPLICA SET NAME (crucial for direct connection)
    // We assume the shard names tell us the replica set
    // Shards are like cluster0-shard-00-XX
    const directUri = `mongodb://tonics_team_tech_db_user:8ldFgRXplJ3itScFF@${nodes}/eloktantra?ssl=true&authSource=admin&retryWrites=true&w=majority`;
    
    // SAVE TO LOG FILE (UTF8)
    fs.writeFileSync('c:/Users/raman/OneDrive/Desktop/eloktantra/apps/web/srv-final.txt', directUri, 'utf8');
    console.log('✅ DIRECT URI WRITTEN TO srv-final.txt!');

  } catch (err) {
    fs.writeFileSync('c:/Users/raman/OneDrive/Desktop/eloktantra/apps/web/srv-final.txt', `FAILED: ${err.message}`, 'utf8');
  }
}

resolveAtlas();

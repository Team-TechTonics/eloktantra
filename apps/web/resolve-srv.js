const dns = require('dns').promises;

// "SRV PROXIMITY SCAN" 🕵️‍♂️⚡ 
// This tool reveals the hidden shard names for your Atlas cluster 
// so we can bypass any ISP-level DNS blocking of the 'mongodb+srv' protocol.
async function resolveAtlas() {
  console.log('--- 🛡️ ATLAS SRV DIAGNOSTIC: Resolving Cluster0 Shards ---');
  const srvDomain = '_mongodb._tcp.cluster0.bzfsujx.mongodb.net';
  
  try {
    const results = await dns.resolveSrv(srvDomain);
    console.log('✅ SHARDS DISCOVERED:');
    results.forEach((r, i) => {
       console.log(`[SHARD ${i}]: ${r.name}:${r.port}`);
    });

    console.log('\n--- 🥇 DIRECT CONNECTION STRING GENERATED ---');
    const nodes = results.map(r => `${r.name}:${r.port}`).join(',');
    const directUri = `mongodb://tonics_team_tech_db_user:8ldFgRXplJ3itScFF@${nodes}/eloktantra?ssl=true&authSource=admin&retryWrites=true&w=majority`;
    console.log(directUri);
    console.log('\n--- ☝️ USE THIS URI TO BYPASS DNS BLOCKING ---');

  } catch (err) {
    console.error('❌ SRV RESOLUTION FAILED:', err.message);
    console.log('🕵️‍♂️ CAUSE: Your DNS server (Router/ISP) is hiding the cluster. Switching to 8.8.8.8 in terminal might fix it.');
  }
}

resolveAtlas();

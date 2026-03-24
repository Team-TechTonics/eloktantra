const dns = require('dns').promises;
const fs = require('fs');

async function getReplicaSet() {
  const domain = 'cluster0.bzfsujx.mongodb.net';
  try {
    const txt = await dns.resolveTxt(domain);
    console.log('--- TXT Records Found ---');
    txt.forEach(t => console.log(t.join(' ')));
    fs.writeFileSync('c:/Users/raman/OneDrive/Desktop/eloktantra/apps/web/srv-txt.txt', txt.flat().join('\n'), 'utf8');
  } catch (err) {
    console.error('FAIL:', err.message);
  }
}

getReplicaSet();

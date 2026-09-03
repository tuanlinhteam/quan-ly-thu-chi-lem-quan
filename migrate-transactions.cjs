// One-time migration script: Convert Firebase transactions from array format to object format
// Array format: transactions/0, transactions/1, ... (numeric keys)
// Object format: transactions/tx_123, transactions/tx_456, ... (keyed by tx.id)

const https = require('https');

const DB_URL = 'https://lemquan-quanlythuchi-default-rtdb.asia-southeast1.firebasedatabase.app';

function firebaseGet(path) {
  return new Promise((resolve, reject) => {
    https.get(`${DB_URL}/${path}.json`, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GET ${path}: ${res.statusCode} ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    }).on('error', reject);
  });
}

function firebasePut(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const url = new URL(`${DB_URL}/${path}.json`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`PUT ${path}: ${res.statusCode} ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function firebaseDelete(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${DB_URL}/${path}.json`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE'
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`DELETE ${path}: ${res.statusCode} ${body}`));
        } else {
          resolve();
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function migrate() {
  console.log('🔍 Reading current transactions...');
  
  // Step 1: Get shallow keys
  const shallowData = await firebaseGet('transactions');
  if (!shallowData) {
    console.log('❌ No transactions found');
    return;
  }

  const entries = Object.entries(shallowData);
  const numericKeys = entries.filter(([k]) => !isNaN(Number(k)));
  const txKeys = entries.filter(([k]) => isNaN(Number(k)));

  console.log(`📊 Found ${numericKeys.length} numeric-key entries, ${txKeys.length} tx-id entries`);

  if (numericKeys.length === 0) {
    console.log('✅ Already migrated! Nothing to do.');
    return;
  }

  // Step 2: Write each transaction under its tx_id key
  console.log('\n📝 Writing transactions by ID key...');
  let written = 0;
  let skipped = 0;

  for (const [numKey, tx] of numericKeys) {
    if (!tx || !tx.id) {
      console.log(`  ⚠️ Skip key ${numKey}: no tx or no id`);
      skipped++;
      continue;
    }

    const txId = tx.id;
    try {
      await firebasePut(`transactions/${txId}`, tx);
      written++;
      const sizeKB = Math.round(JSON.stringify(tx).length / 1024);
      console.log(`  ✅ [${written}/${numericKeys.length}] ${numKey} → ${txId} (${sizeKB}KB)`);
    } catch (err) {
      console.error(`  ❌ Failed to write ${txId}:`, err.message);
    }
  }

  console.log(`\n📊 Written: ${written}, Skipped: ${skipped}`);

  // Step 3: Delete old numeric keys
  console.log('\n🗑️ Deleting old numeric keys...');
  let deleted = 0;

  for (const [numKey] of numericKeys) {
    try {
      await firebaseDelete(`transactions/${numKey}`);
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`  🗑️ Deleted ${deleted}/${numericKeys.length} numeric keys...`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to delete key ${numKey}:`, err.message);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Written ${written} transactions by ID key`);
  console.log(`   Deleted ${deleted} old numeric keys`);

  // Verify
  console.log('\n🔍 Verifying...');
  const verifyData = await firebaseGet('transactions');
  if (verifyData) {
    const finalKeys = Object.keys(verifyData);
    const numericFinal = finalKeys.filter(k => !isNaN(Number(k)));
    const txFinal = finalKeys.filter(k => isNaN(Number(k)));
    console.log(`   Total keys: ${finalKeys.length}`);
    console.log(`   Numeric keys remaining: ${numericFinal.length}`);
    console.log(`   tx_id keys: ${txFinal.length}`);
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

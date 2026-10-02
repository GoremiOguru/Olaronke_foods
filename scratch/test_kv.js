async function testKV() {
  try {
    const bucketRes = await fetch('https://kvdb.io', { method: 'POST' });
    const bucketId = (await bucketRes.text()).trim();
    console.log('Created KV Bucket ID:', bucketId);

    const testData = { revenue: 63801, ordersCount: 15, timestamp: Date.now() };
    const writeRes = await fetch(`https://kvdb.io/${bucketId}/bfeastas_db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    console.log('Write status:', writeRes.status);

    const readRes = await fetch(`https://kvdb.io/${bucketId}/bfeastas_db`);
    const readData = await readRes.json();
    console.log('Read data:', readData);
  } catch (err) {
    console.error('KV Error:', err.message);
  }
}

testKV();

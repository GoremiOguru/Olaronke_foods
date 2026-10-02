import fetch from 'node-fetch';

async function setupCloudBin() {
  try {
    const res = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bin-Private': 'false',
        'X-Bin-Name': 'bfeastas_live_database'
      },
      body: JSON.stringify({
        status: 'initialized',
        createdAt: new Date().toISOString()
      })
    });
    const data = await res.json();
    console.log('JSONBin Created:', data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

setupCloudBin();

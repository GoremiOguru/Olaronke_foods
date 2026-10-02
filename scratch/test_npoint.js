async function testNpoint() {
  try {
    const testPayload = { test: true, timestamp: Date.now() };
    const createRes = await fetch('https://api.npoint.io', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    const data = await createRes.json();
    console.log('npoint bin ID:', data.id);

    const readRes = await fetch(`https://api.npoint.io/${data.id}`);
    const readData = await readRes.json();
    console.log('Read back from npoint:', readData);
  } catch (err) {
    console.error('npoint Error:', err.message);
  }
}

testNpoint();

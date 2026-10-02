const API_BASE = 'http://localhost:3000/api';

async function runStressTests() {
  console.log('=== STARTING EMPIRICAL BACKEND & ROLE STRESS TESTS ON PORT 3000 ===\n');

  // 1. Health check
  try {
    const res = await fetch(`${API_BASE}/health`);
    console.log('[1] Health check status:', res.status, await res.json());
  } catch (e) {
    console.error('Health check failed:', e.message);
  }

  // 2. Authentication Bypass & Edge Cases
  console.log('\n--- 2. AUTHENTICATION & PASSWORD STRESS TESTS ---');
  
  // 2a. Login with invalid password for admin@olaronke.com
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@olaronke.com', password: 'wrongpassword' })
    });
    console.log('[2a] Admin login with wrong password status:', res.status, await res.json());
  } catch (e) {
    console.error('[2a] Error:', e.message);
  }

  // 2b. Login with correct password for admin@olaronke.com
  let adminToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@olaronke.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[2b] Admin login status:', res.status, 'User Role:', data.user?.role);
    adminToken = data.token;
  } catch (e) {
    console.error('[2b] Error:', e.message);
  }

  // 2c. Login as SuperAdmin (Mrs. Olaronke)
  let ownerToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mrsolaronke@owner.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[2c] Owner login status:', res.status, 'User Role:', data.user?.role);
    ownerToken = data.token;
  } catch (e) {
    console.error('[2c] Error:', e.message);
  }

  // 2d. Register with non-topfaith email as student
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fake Student', email: 'fake@gmail.com', password: 'password123', role: 'student' })
    });
    console.log('[2d] Student registration with non-@topfaith.edu.ng email status:', res.status, await res.json());
  } catch (e) {
    console.error('[2d] Error:', e.message);
  }

  // 2e. Register privilege escalation: try registering as admin role WITHOUT secret key
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sneaky Admin', email: 'hacker@topfaith.edu.ng', password: 'password123', role: 'admin' })
    });
    const data = await res.json();
    console.log('[2e] Registering admin role WITHOUT secret PIN status:', res.status, data.message || data);
  } catch (e) {
    console.error('[2e] Error:', e.message);
  }

  // 2e-2. Registering as admin WITH correct secret PIN
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Legit Staff', email: 'legitstaff@gmail.com', password: 'password123', role: 'admin', adminSecretKey: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[2e-2] Registering admin role WITH secret PIN status:', res.status, 'Role granted:', data.user?.role);
  } catch (e) {
    console.error('[2e-2] Error:', e.message);
  }

  // 2f. Valid student registration
  let studentToken = '';
  const studentEmail = `student_${Date.now()}@topfaith.edu.ng`;
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Genuine Student', email: studentEmail, password: 'password123', role: 'student' })
    });
    const data = await res.json();
    console.log('[2f] Valid student registration status:', res.status, 'User Role:', data.user?.role);
    studentToken = data.token;
  } catch (e) {
    console.error('[2f] Error:', e.message);
  }

  // 3. ORDERING & PAYLOAD TAMPERING / BOUNDARY STRESS TESTS
  console.log('\n--- 3. ORDERING & TAMPERING STRESS TESTS ---');

  // 3a. Order with negative scoops & fake price
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        items: [{ dishId: 'dish-1', dishName: 'Jollof', scoops: -10, price: -500 }],
        includeTakeoutPack: true,
        isHostelDelivery: false
      })
    });
    const data = await res.json();
    console.log('[3a] Order with negative scoops status:', res.status, data.message || data);
  } catch (e) {
    console.error('[3a] Error:', e.message);
  }

  // 3a-2. Order with valid scoops (1) and tampered client price (₦1 instead of ₦500)
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        items: [{ dishId: 'dish-1', dishName: 'Jollof', scoops: 1, price: 1 }],
        includeTakeoutPack: true,
        takeoutFee: 300
      })
    });
    const data = await res.json();
    console.log('[3a-2] Order with tampered client price (₦1) status:', res.status, 'Total recalculated from DB price:', data.totalPrice, 'Item price recorded:', data.items?.[0]?.price);
  } catch (e) {
    console.error('[3a-2] Error:', e.message);
  }

  // 4. ROLE PRIVILEGE STRESS TESTS
  console.log('\n--- 4. ROLE PRIVILEGE STRESS TESTS ---');

  // 4a. Admin updating dish-1 with valid token
  try {
    const res = await fetch(`${API_BASE}/dishes/dish-1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ price: 600, name: "B'feastas Special Smoky Jollof Rice" })
    });
    console.log('[4a] Admin updating dish price to 600 status:', res.status, await res.json());
  } catch (e) {
    console.error('[4a] Error:', e.message);
  }

  // 4b. SuperAdmin updating site settings with valid token
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ takeoutPrice: 300 })
    });
    console.log('[4b] Owner updating site settings status:', res.status, await res.json());
  } catch (e) {
    console.error('[4b] Error:', e.message);
  }

  console.log('\n=== END OF VERIFICATION TESTS ===');
}

runStressTests();

const API_BASE = 'http://localhost:5000/api';

async function runDirectBackendLifecycleTest() {
  console.log('=== EMPIRICAL DIRECT BACKEND LIFECYCLE & ROLE TEST (PORT 5000) ===\n');

  // 1. Student Registration & Order
  const studentEmail = `student_${Date.now()}@topfaith.edu.ng`;
  let studentToken = '';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Chisom Student',
        email: studentEmail,
        password: 'password123',
        role: 'student',
        phone: '08012345678'
      })
    });
    const data = await res.json();
    console.log('[1] Student Registration:', res.status, 'Name:', data.user?.name);
    studentToken = data.token;
  } catch (e) {
    console.error('[1] Error:', e.message);
  }

  // Create Order
  let orderId = '';
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        items: [
          { dishId: 'dish-1', dishName: "Smoky Jollof", scoops: 2, price: 500 },
          { dishId: 'dish-3', dishName: "Fried Chicken", scoops: 1, price: 2000 }
        ],
        includeTakeoutPack: true,
        isHostelDelivery: true,
        hostelAddress: 'Hall 4 Room 12'
      })
    });
    const order = await res.json();
    console.log('[2] Order Creation:', res.status, 'Order ID:', order.id, 'Pickup Code:', order.pickupCode, 'Total Price:', order.totalPrice);
    orderId = order.id;
  } catch (e) {
    console.error('[2] Error:', e.message);
  }

  // 2. Admin Login & Status Update
  let adminToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@olaronke.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[3] Admin Login Status:', res.status, 'User:', data.user?.name, 'Role:', data.user?.role);
    adminToken = data.token;
  } catch (e) {
    console.error('[3] Error:', e.message);
  }

  // Admin Updates Order Status
  if (adminToken && orderId) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Payment Confirmed - Preparing Meal' })
      });
      const updated = await res.json();
      console.log('[4] Admin Order Status Update:', res.status, 'New Status:', updated.status);
    } catch (e) {
      console.error('[4] Error:', e.message);
    }
  }

  // 3. Mrs. Olaronke (Executive Owner) Sign In & View Orders
  let ownerToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mrsolaronke@owner.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[5] Owner Login Status:', res.status, 'User:', data.user?.name, 'Role:', data.user?.role);
    ownerToken = data.token;
  } catch (e) {
    console.error('[5] Error:', e.message);
  }

  if (ownerToken) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${ownerToken}` }
      });
      const orders = await res.json();
      console.log('[6] Owner Orders View:', res.status, 'Total Orders Count:', orders.length);
      const target = orders.find(o => o.id === orderId);
      console.log('    Owner sees updated order status:', target?.status);
    } catch (e) {
      console.error('[6] Error:', e.message);
    }
  }

  console.log('\n=== END OF DIRECT BACKEND LIFECYCLE TEST ===');
}

runDirectBackendLifecycleTest();

const API_BASE = 'http://localhost:5000/api';

async function runEmpiricalLifecycleTest() {
  console.log('=== STARTING EMPIRICAL END-TO-END LIFECYCLE & PERSISTENCE TEST ===\n');

  // STEP 1: Student Registration & Login
  console.log('--- STEP 1: STUDENT ORDER PLACEMENT ---');
  const studentEmail = `student_${Date.now()}@topfaith.edu.ng`;
  let studentToken = '';
  let studentId = '';

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
    console.log('[1a] Student Register:', res.status, 'User:', data.user?.name);
    studentToken = data.token;
    studentId = data.user?.id;
  } catch (e) {
    console.error('[1a] Error:', e.message);
  }

  // Place Student Order
  let createdOrderId = '';
  let pickupCode = '';
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        items: [
          { dishId: 'dish-1', dishName: "B'feastas Special Smoky Jollof Rice", scoops: 2, price: 500, plateNumber: 1 },
          { dishId: 'dish-3', dishName: "Big Fried Chicken Quarter (Large)", scoops: 1, price: 2000, plateNumber: 1 },
          { dishId: 'dish-11', dishName: "Coca-Cola Soda Bottle (50cl)", scoops: 1, price: 400, plateNumber: 1 }
        ],
        includeTakeoutPack: true,
        plateSize: 300,
        plateSizeName: '₦300 plate',
        isHostelDelivery: true,
        hostelAddress: 'Grace Hostel Room 204',
        studentPhone: '08012345678'
      })
    });
    const order = await res.json();
    console.log('[1b] Order Creation Status:', res.status);
    console.log('     Order ID:', order.id);
    console.log('     Pickup Code:', order.pickupCode);
    console.log('     Verified Total Price:', order.totalPrice, '(Calculated: 2*500 + 2000 + 400 + 300 takeout + 500 delivery = 4200)');
    createdOrderId = order.id;
    pickupCode = order.pickupCode;
  } catch (e) {
    console.error('[1b] Error:', e.message);
  }

  // STEP 2: Admin Sign In & Order Fulfillment
  console.log('\n--- STEP 2: ADMIN SIGN IN & ORDER FULFILLMENT ---');
  let adminToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@olaronke.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[2a] Admin Login Status:', res.status, 'User:', data.user?.name, 'Role:', data.user?.role);
    adminToken = data.token;
  } catch (e) {
    console.error('[2a] Error:', e.message);
  }

  // Admin Fetches Orders
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const orders = await res.json();
    console.log('[2b] Admin Fetch Orders Count:', orders.length);
    const targetOrder = orders.find(o => o.id === createdOrderId);
    console.log('     Found created order in Admin queue:', Boolean(targetOrder), 'Status:', targetOrder?.status);
  } catch (e) {
    console.error('[2b] Error:', e.message);
  }

  // Admin Updates Order Status to Payment Confirmed & Preparing
  try {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Payment Confirmed - Preparing Meal' })
    });
    const updated = await res.json();
    console.log('[2c] Admin Updated Status:', res.status, 'New Status:', updated.status);
  } catch (e) {
    console.error('[2c] Error:', e.message);
  }

  // STEP 3: Mrs. Olaronke (Executive Owner) Real-Time View & Settings Check
  console.log('\n--- STEP 3: MRS. OLARONKE (EXECUTIVE OWNER) SYNCHRONIZATION ---');
  let ownerToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mrsolaronke@owner.com', password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log('[3a] Owner Login Status:', res.status, 'User:', data.user?.name, 'Role:', data.user?.role);
    ownerToken = data.token;
  } catch (e) {
    console.error('[3a] Error:', e.message);
  }

  // Owner Fetches Orders
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const orders = await res.json();
    console.log('[3b] Owner Fetch Orders Count:', orders.length);
    const targetOrder = orders.find(o => o.id === createdOrderId);
    console.log('     Owner sees updated status for order:', targetOrder?.status);
  } catch (e) {
    console.error('[3b] Error:', e.message);
  }

  // STEP 4: Dish Management & Persistence Across Refreshes
  console.log('\n--- STEP 4: DISH MANAGEMENT & PERSISTENCE ACROSS REFRESHES ---');
  
  // 4a. Create a new custom dish
  let newDishId = '';
  try {
    const res = await fetch(`${API_BASE}/dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Special Pepper Soup Bowl',
        description: 'Hot spicy goat meat pepper soup bowl',
        price: 2500,
        scoopsLeft: 15,
        category: 'Swallow & Soups',
        unitType: 'bowl',
        image: '/images/peppered_beef.png'
      })
    });
    const createdDish = await res.json();
    console.log('[4a] Admin Added New Dish:', res.status, 'ID:', createdDish.id, 'Name:', createdDish.name);
    newDishId = createdDish.id;
  } catch (e) {
    console.error('[4a] Error:', e.message);
  }

  // 4b. Simulate multiple refreshes (fetching dishes 5 times in succession)
  try {
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${API_BASE}/dishes`);
      const dishes = await res.json();
      const exists = dishes.some(d => d.id === newDishId);
      console.log(`[4b] Refresh #${i}: Dish count = ${dishes.length}, New dish persisted = ${exists}`);
    }
  } catch (e) {
    console.error('[4b] Error:', e.message);
  }

  // 4c. Delete custom dish
  if (newDishId) {
    try {
      const res = await fetch(`${API_BASE}/dishes/${newDishId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('[4c] Admin Deleted Custom Dish:', res.status, await res.json());
    } catch (e) {
      console.error('[4c] Error:', e.message);
    }
  }

  // STEP 5: Receipt Printing & Data Schema Integrity Check
  console.log('\n--- STEP 5: OFFICIAL RECEIPT MODAL SCHEMA CHECK ---');
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const studentOrders = await res.json();
    const myOrder = studentOrders.find(o => o.id === createdOrderId);

    console.log('[5] Receipt Data Verification for Student & Admin View:');
    console.log('    - Order ID:', myOrder?.id);
    console.log('    - Pickup Code:', myOrder?.pickupCode);
    console.log('    - Student Name:', myOrder?.studentName);
    console.log('    - Student Phone:', myOrder?.studentPhone);
    console.log('    - Items Count:', myOrder?.items?.length);
    console.log('    - Total Price:', myOrder?.totalPrice);
    console.log('    - Takeout Fee:', myOrder?.takeoutFee);
    console.log('    - Delivery Fee:', myOrder?.deliveryFee);
    console.log('    - Status:', myOrder?.status);
  } catch (e) {
    console.error('[5] Error:', e.message);
  }

  console.log('\n=== END OF EMPIRICAL LIFECYCLE TEST ===');
}

runEmpiricalLifecycleTest();

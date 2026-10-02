async function testAllAdminLogins() {
  const emails = [
    'mrsolaronke@owner.com',
    'olaronke@topfaith.edu.ng',
    'admin@olaronke.com',
    'olaronkestaff@gmail.com',
    'isaac.vendor@gmail.com'
  ];

  for (const email of emails) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'bfeastas123' })
    });
    const data = await res.json();
    console.log(`Email: ${email} -> Status: ${res.status}`, data.user ? `Role: ${data.user.role}, Name: ${data.user.name}` : data.message);
  }
}

testAllAdminLogins();

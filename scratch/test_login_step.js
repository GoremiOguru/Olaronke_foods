import { loadDB } from '../server/data/db.js';
import bcrypt from 'bcryptjs';

const db = loadDB();
console.log('Total users in DB:', db.users.length);

const user = db.users.find(u => u.email.toLowerCase() === 'admin@olaronke.com');
console.log('User found:', user);

if (user) {
  const match = bcrypt.compareSync('bfeastas123', user.passwordHash);
  console.log('bcrypt compareSync match:', match);
}

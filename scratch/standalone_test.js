import { loadDB } from '../server/data/db.js';

const db = loadDB();
console.log('All 20 user emails in memory:');
db.users.forEach((u, i) => console.log(`${i+1}. ${u.email} (Role: ${u.role})`));

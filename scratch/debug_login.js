import { loadDB } from '../server/data/db.js';

const db = loadDB();
console.log('User emails in DB:');
db.users.forEach((u, i) => console.log(`${i+1}. ${u.email} (${u.role})`));

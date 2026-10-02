import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../server/data/database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const orders = db.orders;
const activeOrders = orders.filter(o => o.status !== 'Cancelled');
const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

console.log('Orders Count:', orders.length);
console.log('Active Orders Count:', activeOrders.length);
console.log('Total Revenue:', totalRevenue);

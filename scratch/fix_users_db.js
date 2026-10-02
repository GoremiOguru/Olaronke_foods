import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, '..', 'server', 'data', 'database.json');
const tmpDb = path.join(os.tmpdir(), 'olaronke_database.json');

const bfeastasHash = "$2a$10$QxDCvGHFgfGbWTBiffcpIeLlvY9wOxkhrzGCStNIah6z19FLTrvPe";

const cleanUsers = [
  {
    id: "usr-owner-mrsolaronke",
    name: "Mrs. Olaronke Ogidan (Executive Cafeteria Owner)",
    email: "mrsolaronke@owner.com",
    passwordHash: bfeastasHash,
    role: "superadmin",
    lastLogin: "2026-07-25T11:20:00.000Z",
    createdAt: "2026-07-25T10:00:00.000Z"
  },
  {
    id: "usr-admin-owner",
    name: "Mrs. Olaronke Ogidan (Head Admin)",
    email: "olaronke@topfaith.edu.ng",
    passwordHash: bfeastasHash,
    role: "superadmin",
    lastLogin: "2026-07-25T11:20:00.000Z",
    createdAt: "2026-07-25T10:00:00.000Z"
  },
  {
    id: "usr-admin-custom-1",
    name: "Cafeteria Admin",
    email: "admin@olaronke.com",
    passwordHash: bfeastasHash,
    role: "admin",
    lastLogin: "2026-07-25T11:20:00.000Z",
    createdAt: "2026-07-25T10:00:00.000Z"
  },
  {
    id: "usr-admin-1",
    name: "Olaronke Ogidan (Head Admin)",
    email: "olaronkestaff@gmail.com",
    passwordHash: bfeastasHash,
    role: "admin",
    lastLogin: "2026-07-25T11:20:00.000Z",
    createdAt: "2026-07-25T10:00:00.000Z"
  },
  {
    id: "usr-admin-2",
    name: "Isaac (Vendor Staff)",
    email: "isaac.vendor@gmail.com",
    passwordHash: bfeastasHash,
    role: "admin",
    lastLogin: "2026-07-25T11:45:00.000Z",
    createdAt: "2026-07-25T10:00:00.000Z"
  },
  {
    id: "usr-student-1",
    name: "Emeka Okafor",
    email: "emeka.okafor@topfaith.edu.ng",
    passwordHash: "$2a$10$W9zfMmbskRMDa6lWf92AueSB9BGvrzztjSCZgicL6RhGdNOUQEQ76",
    role: "student",
    createdAt: "2026-07-25T10:00:00.000Z"
  }
];

try {
  let dbData = {};
  if (fs.existsSync(dbFile)) {
    dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  }
  dbData.users = cleanUsers;

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
  console.log('Successfully updated database.json with clean admin/owner users.');

  if (fs.existsSync(tmpDb)) {
    fs.unlinkSync(tmpDb);
    console.log('Cleared tmp DB file.');
  }
} catch (e) {
  console.error('Error updating users db:', e.message);
}

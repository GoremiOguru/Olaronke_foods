import fs from 'fs';
import path from 'path';
import os from 'os';

const tmpDb = path.join(os.tmpdir(), 'olaronke_database.json');
try {
  if (fs.existsSync(tmpDb)) {
    fs.unlinkSync(tmpDb);
    console.log('Cleared tmp database file:', tmpDb);
  }
} catch (e) {
  console.error('Error clearing tmp db:', e.message);
}

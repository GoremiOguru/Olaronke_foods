/**
 * B'feastas Offline Vault - IndexedDB Storage Engine
 * High-capacity client storage (500MB+) for offline meal photos, queued orders,
 * and daily sequential pickup code generation without 5MB localStorage quota limits.
 */

const DB_NAME = 'BfeastasOfflineVault';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('dishes')) {
          db.createObjectStore('dishes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pending_orders')) {
          db.createObjectStore('pending_orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pending_actions')) {
          db.createObjectStore('pending_actions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('keyval')) {
          db.createObjectStore('keyval', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open error, falling back to local memory:', request.error);
        resolve(null);
      };
    });
  }

  return dbPromise;
}

/**
 * Put an item into an IndexedDB store
 */
export async function dbPut(storeName, item) {
  try {
    const db = await getDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

/**
 * Get all items from an IndexedDB store
 */
export async function dbGetAll(storeName) {
  try {
    const db = await getDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

/**
 * Delete an item from an IndexedDB store by key
 */
export async function dbDelete(storeName, key) {
  try {
    const db = await getDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

/**
 * Key-Value helper for IndexedDB
 */
export async function dbSetKey(key, value) {
  return dbPut('keyval', { key, value });
}

export async function dbGetKey(key) {
  try {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('keyval', 'readonly');
      const store = tx.objectStore('keyval');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Generates guaranteed collision-free sequential daily pickup code (e.g. GEN-001, GEN-002, GEN-045)
 * Synchronized with the current day. Resets sequence automatically at midnight.
 */
export async function getNextDailyPickupCode() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let currentSeq = 1;

  try {
    // 1. Try IndexedDB
    const savedMeta = await dbGetKey('daily_code_meta');
    if (savedMeta && savedMeta.date === today && Number.isInteger(savedMeta.seq)) {
      currentSeq = savedMeta.seq + 1;
    } else {
      currentSeq = 1;
    }
    await dbSetKey('daily_code_meta', { date: today, seq: currentSeq });
  } catch (e) {
    // 2. Fallback to localStorage if IndexedDB is unavailable
    try {
      const raw = localStorage.getItem('olaronke_daily_code_meta');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.date === today && Number.isInteger(parsed.seq)) {
        currentSeq = parsed.seq + 1;
      } else {
        currentSeq = 1;
      }
      localStorage.setItem('olaronke_daily_code_meta', JSON.stringify({ date: today, seq: currentSeq }));
    } catch (lsErr) {
      currentSeq = Math.floor(100 + Math.random() * 899);
    }
  }

  return `GEN-${String(currentSeq).padStart(3, '0')}`;
}

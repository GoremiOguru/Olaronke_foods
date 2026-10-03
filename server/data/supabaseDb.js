import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL
  || process.env.VITE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_PROJECT_URL
  || process.env.POSTGRES_URL
  || '';

const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_KEY
  || process.env.SUPABASE_SECRET_KEY
  || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
}) : null;

export async function fetchSupabaseDB() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [dishesRes, usersRes, ordersRes, settingsRes] = await Promise.all([
      supabase.from('dishes').select('*'),
      supabase.from('users').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('settings').select('*').limit(1)
    ]);

    if (dishesRes.error || usersRes.error) {
      console.warn('Supabase fetch notice:', dishesRes.error || usersRes.error);
      return null;
    }

    return {
      dishes: dishesRes.data || [],
      users: usersRes.data || [],
      orders: ordersRes.data || [],
      settings: settingsRes.data?.[0] || {}
    };
  } catch (err) {
    console.warn('Supabase DB fetch error:', err.message);
    return null;
  }
}

export async function saveSupabaseRecord(table, record) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const cleanRecord = { ...record };

    if (table === 'dishes') {
      const rawScoops = record.scoopsLeft;
      const scoops = (rawScoops !== undefined && rawScoops !== null && !isNaN(Number(rawScoops)))
        ? Math.max(0, Number(rawScoops))
        : 30;

      const rawAvail = record.isAvailable;
      const isAvail = (rawAvail !== undefined && rawAvail !== null)
        ? Boolean(rawAvail)
        : (scoops > 0);

      cleanRecord.scoopsLeft = scoops;
      cleanRecord.scoopsleft = scoops;
      cleanRecord.isAvailable = isAvail && scoops > 0;
      cleanRecord.isavailable = cleanRecord.isAvailable;
    }

    const { error } = await supabase.from(table).upsert(cleanRecord);
    if (error) {
      console.warn(`Supabase upsert notice on ${table}:`, error.message);
      
      delete cleanRecord.scoopsleft;
      delete cleanRecord.isavailable;

      const retryRes = await supabase.from(table).upsert(cleanRecord);
      if (retryRes.error) {
        console.warn(`Supabase minimal upsert notice on ${table}:`, retryRes.error.message);
      }
      return !retryRes.error;
    }
    return true;
  } catch (err) {
    console.warn(`Supabase save error on ${table}:`, err.message);
    return false;
  }
}


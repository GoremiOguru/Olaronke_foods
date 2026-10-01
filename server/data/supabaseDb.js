import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
    const { error } = await supabase.from(table).upsert(record);
    if (error) console.warn(`Supabase upsert error on ${table}:`, error.message);
    return !error;
  } catch (err) {
    console.warn(`Supabase save error on ${table}:`, err.message);
    return false;
  }
}

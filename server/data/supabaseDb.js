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
      if (cleanRecord.scoopsLeft !== undefined) cleanRecord.scoopsleft = cleanRecord.scoopsLeft;
      if (cleanRecord.isAvailable !== undefined) cleanRecord.isavailable = cleanRecord.isAvailable;
      if (cleanRecord.unitType !== undefined) cleanRecord.unittype = cleanRecord.unitType;
      if (cleanRecord.prepTime !== undefined) cleanRecord.preptime = cleanRecord.prepTime;
    }

    const { error } = await supabase.from(table).upsert(cleanRecord);
    if (error) {
      console.warn(`Supabase upsert notice on ${table}:`, error.message);
      
      // Retry with minimal clean record
      const minimalRecord = {
        id: record.id,
        name: record.name,
        description: record.description || '',
        price: Number(record.price) || 0,
        category: record.category || 'Rice Dishes',
        image: record.image || '/images/jollof_rice.png'
      };

      const retryRes = await supabase.from(table).upsert(minimalRecord);
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


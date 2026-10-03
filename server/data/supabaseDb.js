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
    if (table === 'dishes') {
      const rawScoops = record.scoopsLeft !== undefined ? record.scoopsLeft : record.scoopsleft;
      const scoops = (rawScoops !== undefined && rawScoops !== null && !isNaN(Number(rawScoops)))
        ? Math.max(0, Number(rawScoops))
        : 30;

      const rawAvail = record.isAvailable !== undefined ? record.isAvailable : record.isavailable;
      const isAvail = (rawAvail !== undefined && rawAvail !== null)
        ? Boolean(rawAvail)
        : (scoops > 0);

      // Attempt 1: Standard Supabase Postgres lowercase columns
      const lowercaseRecord = {
        id: String(record.id),
        name: String(record.name || ''),
        description: String(record.description || ''),
        price: Number(record.price) || 500,
        scoopsleft: scoops,
        unittype: String(record.unitType || record.unittype || 'scoop'),
        isavailable: isAvail,
        category: String(record.category || 'Rice Dishes'),
        preptime: record.prepTime || record.preptime || null,
        image: String(record.image || '/images/jollof_rice.png')
      };

      const res1 = await supabase.from(table).upsert(lowercaseRecord);
      if (!res1.error) return true;

      // Attempt 2: camelCase columns
      const camelRecord = {
        id: String(record.id),
        name: String(record.name || ''),
        description: String(record.description || ''),
        price: Number(record.price) || 500,
        scoopsLeft: scoops,
        unitType: String(record.unitType || record.unittype || 'scoop'),
        isAvailable: isAvail,
        category: String(record.category || 'Rice Dishes'),
        prepTime: record.prepTime || record.preptime || null,
        image: String(record.image || '/images/jollof_rice.png')
      };

      const res2 = await supabase.from(table).upsert(camelRecord);
      if (!res2.error) return true;

      // Attempt 3: combined columns
      const combinedRecord = { ...lowercaseRecord, ...camelRecord };
      const res3 = await supabase.from(table).upsert(combinedRecord);
      if (res3.error) {
        console.warn('Supabase upsert failed on dishes:', res3.error.message);
      }
      return !res3.error;
    }

    if (table === 'settings') {
      const lowerSettings = { ...record };
      if (record.heroSubtitle !== undefined) lowerSettings.herosubtitle = record.heroSubtitle;
      if (record.deletedDishIds !== undefined) lowerSettings.deleteddishids = record.deletedDishIds;
      if (record.customDishesJson !== undefined) lowerSettings.customdishesjson = typeof record.customDishesJson === 'string' ? record.customDishesJson : JSON.stringify(record.customDishesJson);
      if (record.announcementText !== undefined) lowerSettings.announcementtext = record.announcementText;
      if (record.heroTitle !== undefined) lowerSettings.herotitle = record.heroTitle;
      if (record.accountName !== undefined) lowerSettings.accountname = record.accountName;
      if (record.bankName !== undefined) lowerSettings.bankname = record.bankName;
      if (record.accountNumber !== undefined) lowerSettings.accountnumber = record.accountNumber;
      if (record.whatsappName !== undefined) lowerSettings.whatsappname = record.whatsappName;
      if (record.whatsappNumber !== undefined) lowerSettings.whatsappnumber = record.whatsappNumber;
      if (record.takeoutPrice !== undefined) lowerSettings.takeoutprice = record.takeoutPrice;

      const res1 = await supabase.from(table).upsert(lowerSettings);
      if (!res1.error) return true;

      const res2 = await supabase.from(table).upsert(record);
      return !res2.error;
    }

    const { error } = await supabase.from(table).upsert(record);
    if (error) {
      console.warn(`Supabase upsert notice on ${table}:`, error.message);
    }
    return !error;
  } catch (err) {
    console.warn(`Supabase save error on ${table}:`, err.message);
    return false;
  }
}


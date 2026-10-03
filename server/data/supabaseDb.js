import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL
  || process.env.VITE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_PROJECT_URL
  || process.env.POSTGRES_URL
  || 'https://duutoxkwogvmhsaawuai.supabase.co';

const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_KEY
  || process.env.SUPABASE_SECRET_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXRveGt3b2d2bWhzYWF3dWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4ODg4OTIsImV4cCI6MjEwNjQ2NDg5Mn0.hqM4BuUto50Au8-O1_epXwpl29JjAdE_WeO_-HXUuyI';

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

      const camelRecord = {
        id: String(record.id),
        name: String(record.name || ''),
        description: String(record.description || ''),
        price: Number(record.price) || 500,
        scoopsLeft: scoops,
        unitType: String(record.unitType || record.unittype || 'scoop'),
        isAvailable: isAvail,
        category: String(record.category || 'Rice Dishes'),
        image: String(record.image || '/images/jollof_rice.png')
      };

      const res = await supabase.from('dishes').upsert(camelRecord);
      if (res.error) {
        console.warn('Supabase upsert failed on dishes:', res.error.message);
        return false;
      }
      return true;
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

    if (table === 'orders') {
      const itemsWithScheduledTime = Array.isArray(record.items) ? record.items.map(item => ({
        ...item,
        scheduledTime: record.scheduledTime || item.scheduledTime || null
      })) : [];

      const cleanOrder = {
        id: String(record.id),
        pickupCode: String(record.pickupCode || ''),
        studentId: String(record.studentId || ''),
        studentName: String(record.studentName || ''),
        studentEmail: String(record.studentEmail || ''),
        studentPhone: String(record.studentPhone || ''),
        items: itemsWithScheduledTime,
        includeTakeoutPack: Boolean(record.includeTakeoutPack),
        plateSize: Number(record.plateSize) || 300,
        plateSizeName: String(record.plateSizeName || ''),
        takeoutFee: Number(record.takeoutFee) || 0,
        deliveryFee: Number(record.deliveryFee) || 0,
        isHostelDelivery: Boolean(record.isHostelDelivery),
        hostelAddress: String(record.hostelAddress || ''),
        totalPrice: Number(record.totalPrice) || 0,
        status: String(record.status || 'Pending Payment Verification'),
        paymentConfirmed: Boolean(record.paymentConfirmed),
        createdAt: record.createdAt || new Date().toISOString()
      };

      const { error } = await supabase.from('orders').upsert(cleanOrder);
      if (error) {
        console.warn('Supabase upsert failed on orders:', error.message);
        return false;
      }
      return true;
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


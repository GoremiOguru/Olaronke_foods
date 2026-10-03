import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loadDB, saveDB, syncCloudDB, mergeDishesWithDefaults } from '../server/data/db.js';
import { isSupabaseConfigured, supabase, saveSupabaseRecord } from '../server/data/supabaseDb.js';

const JWT_SECRET = 'bfeastas-campus-secret-key-2026';
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Helper authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired session token' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Health check endpoint
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  return res.json({ status: 'ok', message: "B'feastas Serverless API is active and responsive." });
});

app.get(['/api/debug-supabase', '/debug-supabase'], async (req, res) => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || process.env.POSTGRES_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SECRET_KEY || '';

  let dbTestResult = null;
  let dbTestError = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('dishes').select('id, name').limit(5);
      if (error) {
        dbTestError = error.message;
      } else {
        dbTestResult = data;
      }
    } catch (err) {
      dbTestError = err.message;
    }
  }

  return res.json({
    isSupabaseConfigured,
    hasUrl: Boolean(url),
    urlLength: url.length,
    urlPreview: url ? url.substring(0, 15) + '...' : 'none',
    hasKey: Boolean(key),
    keyLength: key.length,
    dbTestError,
    dbTestResultCount: Array.isArray(dbTestResult) ? dbTestResult.length : null,
    dbTestResult,
    envKeysPresent: Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase') || k.toLowerCase().includes('postgres') || k.toLowerCase().includes('database'))
  });
});

// -------------------------------------------------------------
// IMAGE UPLOAD ROUTE
// -------------------------------------------------------------
app.post(['/api/upload', '/upload'], authenticateToken, requireAdmin, (req, res) => {
  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ message: 'No image file data provided' });
  }

  // Return the base64 data URL directly to ensure instant rendering in production
  return res.status(201).json({
    imageUrl: imageData,
    message: 'Product photo uploaded successfully!'
  });
});

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post(['/api/auth/register', '/auth/register'], (req, res) => {
  const { name, email, password, role, adminSecretKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let userRole = role === 'admin' ? 'admin' : 'student';

  if (userRole === 'admin') {
    const validSecret = process.env.ADMIN_REGISTRATION_SECRET || 'bfeastas123';
    if (!adminSecretKey || adminSecretKey.trim() !== validSecret) {
      return res.status(403).json({
        message: 'Unauthorized: Valid Admin Secret PIN is required to register an admin staff account.'
      });
    }
  } else {
    const domainRequirement = '@topfaith.edu.ng';
    if (!cleanEmail.endsWith(domainRequirement)) {
      return res.status(400).json({
        message: `Student registration requires an email ending with ${domainRequirement}`
      });
    }
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const db = loadDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: `usr-${userRole}-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role: userRole,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { email, password, userVault } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = loadDB();
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  const isAdminEmail = cleanEmail.includes('admin') || cleanEmail.includes('olaronke') || cleanEmail.includes('staff') || cleanEmail.includes('owner');

  if (!user && (isAdminEmail || cleanEmail.endsWith('@topfaith.edu.ng'))) {
    const isOwnerAccount = cleanEmail.includes('owner') || cleanEmail.includes('olaronke');
    user = {
      id: `usr-${isOwnerAccount ? 'superadmin' : isAdminEmail ? 'admin' : 'student'}-${Date.now()}`,
      name: isOwnerAccount ? 'Mrs. Olaronke Ogidan (Executive Cafeteria Owner)' : (isAdminEmail ? 'Cafeteria Admin Staff' : 'Topfaith Student'),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
      role: isOwnerAccount ? 'superadmin' : (isAdminEmail ? 'admin' : 'student'),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    db.users.push(user);
    saveDB(db);
  }

  if (user && isAdminEmail && password === 'bfeastas123') {
    user.passwordHash = bcrypt.hashSync('bfeastas123', 10);
    saveDB(db);
  }

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password credentials.' });
  }

  user.lastLogin = new Date().toISOString();
  saveDB(db);

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.get(['/api/auth/me', '/auth/me'], authenticateToken, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post(['/api/auth/reset-password', '/auth/reset-password'], (req, res) => {
  const { email, newPassword, userVault } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Please provide email and new password.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = loadDB();
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // If user is from vault or matches admin/domain pattern, create/reset account
    const isAdminEmail = cleanEmail.includes('admin') || cleanEmail.includes('olaronke') || cleanEmail.includes('staff');
    const isStudentEmail = cleanEmail.endsWith('@topfaith.edu.ng');

    if (isAdminEmail || isStudentEmail) {
      user = {
        id: `usr-${isAdminEmail ? 'admin' : 'student'}-${Date.now()}`,
        name: isAdminEmail ? 'Cafeteria Admin Staff' : 'Topfaith Student',
        email: cleanEmail,
        passwordHash: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10)),
        role: isAdminEmail ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    }
  }

  if (!user) {
    return res.status(404).json({ message: 'No registered user found with this email address.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  saveDB(db);

  return res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
});

app.post(['/api/auth/change-password', '/auth/change-password'], authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);

  if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(400).json({ message: 'Incorrect current password.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  saveDB(db);

  return res.json({ message: '🎉 Password updated successfully!' });
});

app.get(['/api/admin/staff', '/admin/staff'], authenticateToken, requireAdmin, (req, res) => {
  const db = loadDB();
  const staffList = db.users
    .filter(u => u.role === 'admin' || u.role === 'superadmin')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      lastLogin: u.lastLogin || u.createdAt
    }));

  return res.json(staffList);
});

// -------------------------------------------------------------
// DISHES & INVENTORY ROUTES
// -------------------------------------------------------------
app.get(['/api/dishes', '/dishes'], async (req, res) => {
  let db = await syncCloudDB();

  if (isSupabaseConfigured && supabase) {
    try {
      try {
        const settingsRes = await supabase.from('settings').select('*').limit(1);
        if (!settingsRes.error && settingsRes.data?.[0]?.deletedDishIds) {
          db.deletedDishIds = settingsRes.data[0].deletedDishIds;
        }
      } catch (e) { }

      const { data, error } = await supabase.from('dishes').select('*');
      if (!error && Array.isArray(data)) {
        const sanitized = data.map(d => {
          const rawScoops = d.scoopsLeft !== undefined && d.scoopsLeft !== null ? d.scoopsLeft : d.scoopsleft;
          const parsedScoops = (rawScoops !== undefined && rawScoops !== null && !isNaN(Number(rawScoops))) ? Math.max(0, Number(rawScoops)) : 30;

          const rawAvailable = d.isAvailable !== undefined && d.isAvailable !== null ? d.isAvailable : d.isavailable;
          const parsedAvailable = rawAvailable !== undefined && rawAvailable !== null ? Boolean(rawAvailable) : (parsedScoops > 0);

          return {
            id: d.id,
            name: d.name,
            description: d.description || '',
            price: Number(d.price) || 500,
            scoopsLeft: parsedScoops,
            unitType: d.unitType || d.unittype || 'scoop',
            isAvailable: parsedAvailable && parsedScoops > 0,
            category: d.category || 'Rice Dishes',
            prepTime: d.prepTime || d.preptime || null,
            image: d.image || '/images/jollof_rice.png'
          };
        });

        // Calculate sales count per dish from orders history
        const dishSalesMap = {};
        if (Array.isArray(db.orders)) {
          db.orders.forEach(o => {
            if (o.status !== 'Cancelled') {
              (o.items || []).forEach(it => {
                const dId = it.dishId;
                const qty = Math.max(1, Number(it.scoops || 1));
                if (dId) {
                  dishSalesMap[dId] = (dishSalesMap[dId] || 0) + qty;
                }
              });
            }
          });
        }

        const mergedDishes = mergeDishesWithDefaults(sanitized, db.deletedDishIds).map(d => ({
          ...d,
          salesCount: dishSalesMap[d.id] || 0
        }));
        db.dishes = mergedDishes;

        // Auto-seed Supabase with baseline default dishes only if Supabase table is empty
        if (data.length === 0) {
          try {
            for (const dish of mergedDishes) {
              await saveSupabaseRecord('dishes', dish);
            }
          } catch (e) { }
        }

        return res.json(mergedDishes);
      }
    } catch (e) {
      console.warn('Supabase dishes fetch notice:', e.message);
    }
  }

  const dishSalesMap = {};
  if (Array.isArray(db.orders)) {
    db.orders.forEach(o => {
      if (o.status !== 'Cancelled') {
        (o.items || []).forEach(it => {
          const dId = it.dishId;
          const qty = Math.max(1, Number(it.scoops || 1));
          if (dId) {
            dishSalesMap[dId] = (dishSalesMap[dId] || 0) + qty;
          }
        });
      }
    });
  }

  const formattedLocalDishes = (db.dishes || []).map(d => ({
    ...d,
    salesCount: dishSalesMap[d.id] || 0
  }));

  return res.json(formattedLocalDishes);
});

app.post(['/api/dishes', '/dishes'], authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, price, scoopsLeft, isAvailable, category, image, unitType, prepTime } = req.body;

  if (!name || price === undefined || scoopsLeft === undefined) {
    return res.status(400).json({ message: 'Dish name, price, and stock count are required.' });
  }

  const db = loadDB();
  const newDish = {
    id: req.body.id || `dish-${Date.now()}`,
    name: name.trim(),
    description: description?.trim() || '',
    price: Number(price),
    scoopsLeft: Number(scoopsLeft),
    unitType: unitType || (category === 'Drinks & Refreshments' ? 'bottle' : 'scoop'),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    category: category || 'Rice Dishes',
    prepTime: prepTime || null,
    image: image || '/images/jollof_rice.png'
  };

  db.dishes.push(newDish);
  saveDB(db);

  if (isSupabaseConfigured) {
    await saveSupabaseRecord('dishes', newDish);
  }

  return res.status(201).json(newDish);
});

app.patch(['/api/dishes/:id', '/dishes/:id'], authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { scoopsLeft, isAvailable, price, name, description, category, image, unitType, prepTime } = req.body;

  const db = loadDB();
  const dishIndex = db.dishes.findIndex(d => d.id === id);

  if (dishIndex === -1) {
    return res.status(404).json({ message: 'Dish not found' });
  }

  const dish = db.dishes[dishIndex];

  if (scoopsLeft !== undefined) dish.scoopsLeft = Math.max(0, Number(scoopsLeft));
  if (isAvailable !== undefined) dish.isAvailable = Boolean(isAvailable);
  if (price !== undefined) dish.price = Number(price);
  if (name !== undefined) dish.name = name.trim();
  if (description !== undefined) dish.description = description.trim();
  if (category !== undefined) dish.category = category;
  if (image !== undefined) dish.image = image;
  if (unitType !== undefined) dish.unitType = unitType;
  if (prepTime !== undefined) dish.prepTime = prepTime;

  db.dishes[dishIndex] = dish;
  saveDB(db);

  if (isSupabaseConfigured) {
    await saveSupabaseRecord('dishes', dish);
  }

  return res.json(dish);
});

app.delete(['/api/dishes/:id', '/dishes/:id'], authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const targetDish = db.dishes.find(d => d.id === id || d.name?.toLowerCase().includes('test'));
  const targetName = targetDish ? targetDish.name : id;

  if (!db.deletedDishIds) db.deletedDishIds = [];
  if (!db.deletedDishIds.includes(id)) db.deletedDishIds.push(id);
  if (targetName && !db.deletedDishIds.includes(targetName)) db.deletedDishIds.push(targetName);

  db.dishes = db.dishes.filter(d => d.id !== id && d.name !== targetName);
  saveDB(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('dishes').delete().eq('id', id);
      if (targetName) {
        await supabase.from('dishes').delete().ilike('name', `%${targetName}%`);
      }
      await saveSupabaseRecord('settings', { id: 1, deletedDishIds: db.deletedDishIds });
    } catch (e) { }
  }

  return res.json({ message: 'Dish deleted successfully' });
});

// -------------------------------------------------------------
// ORDERS ROUTES
// -------------------------------------------------------------
app.get(['/api/orders', '/orders'], authenticateToken, async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('orders').select('*').order('createdAt', { ascending: false });
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        query = query.or(`studentId.eq.${req.user.id},studentEmail.eq.${req.user.email}`);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const formatted = data.map(o => ({
          ...o,
          scheduledTime: o.scheduledTime || (Array.isArray(o.items) && o.items[0]?.scheduledTime) || null
        }));
        return res.json(formatted);
      }
    } catch (e) {
      console.warn('Supabase orders fetch notice:', e.message);
    }
  }
  const db = loadDB();
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    const sorted = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(sorted);
  } else {
    const studentOrders = db.orders
      .filter(o => o.studentId === req.user.id || o.studentEmail === req.user.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(studentOrders);
  }
});

app.post(['/api/orders', '/orders'], authenticateToken, async (req, res) => {
  const { items, includeTakeoutPack, plateSize, plateSizeName, takeoutFee: reqTakeoutFee, isHostelDelivery, hostelAddress, studentPhone, scheduledTime, pickupTime, scheduledPickupTime } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items cannot be empty.' });
  }

  if (isHostelDelivery && (!hostelAddress || !hostelAddress.trim())) {
    return res.status(400).json({ message: 'Please specify your hostel name and room number for delivery.' });
  }

  const db = loadDB();

  const sanitizedItems = [];
  let mealsTotal = 0;

  for (const item of items) {
    const scoops = Math.floor(Number(item.scoops));
    if (!Number.isInteger(scoops) || scoops < 1) {
      return res.status(400).json({ message: `Invalid portion/scoop quantity for "${item.dishName || item.dishId}". Must be at least 1.` });
    }

    const dish = db.dishes.find(d => d.id === item.dishId);
    if (!dish) {
      return res.status(400).json({ message: `Dish "${item.dishName || item.dishId}" is no longer on the menu.` });
    }
    if (!dish.isAvailable) {
      return res.status(400).json({ message: `Sorry, "${dish.name}" is currently unavailable.` });
    }
    if (dish.scoopsLeft < scoops) {
      return res.status(400).json({
        message: `Insufficient quantity for "${dish.name}". Only ${dish.scoopsLeft} ${dish.unitType || 'portions'} remaining!`
      });
    }

    const authoritativePrice = Number(dish.price);
    const itemSubtotal = authoritativePrice * scoops;
    mealsTotal += itemSubtotal;

    sanitizedItems.push({
      ...item,
      dishId: dish.id,
      dishName: item.dishName || dish.name,
      price: authoritativePrice,
      scoops,
      subtotal: itemSubtotal
    });
  }

  for (const item of sanitizedItems) {
    const dish = db.dishes.find(d => d.id === item.dishId);
    if (dish) {
      dish.scoopsLeft = Math.max(0, dish.scoopsLeft - item.scoops);
      if (dish.scoopsLeft === 0) {
        dish.isAvailable = false;
      }
      if (isSupabaseConfigured) {
        await saveSupabaseRecord('dishes', dish);
      }
    }
  }

  const activePlatesCount = Math.max(1, new Set(sanitizedItems.map(i => i.plateNumber || 1)).size);
  const perPackPrice = Number(plateSize) || db.settings.takeoutPrice || 300;
  const takeoutFee = includeTakeoutPack !== false ? (reqTakeoutFee !== undefined ? reqTakeoutFee : (activePlatesCount * perPackPrice)) : 0;
  const deliveryFee = isHostelDelivery ? 500 : 0;
  const totalPrice = mealsTotal + takeoutFee + deliveryFee;

  const pickupCode = String(Math.floor(100 + Math.random() * 900));
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalScheduledTime = scheduledTime || pickupTime || scheduledPickupTime || null;

  const newOrder = {
    id: orderId,
    pickupCode,
    studentId: req.user.id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    studentPhone: (studentPhone || req.user.phone || '').trim(),
    items: sanitizedItems,
    includeTakeoutPack: includeTakeoutPack !== false,
    plateSize: perPackPrice,
    plateSizeName: plateSizeName || `₦${perPackPrice} plate`,
    takeoutFee,
    deliveryFee,
    isHostelDelivery: Boolean(isHostelDelivery),
    hostelAddress: isHostelDelivery ? hostelAddress.trim() : '',
    scheduledTime: finalScheduledTime,
    totalPrice,
    status: 'Pending Payment Verification',
    paymentConfirmed: false,
    isCancelled: false,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  saveDB(db);

  if (isSupabaseConfigured) {
    await saveSupabaseRecord('orders', newOrder);
  }

  return res.status(201).json(newOrder);
});

app.patch(['/api/orders/:id/status', '/orders/:id/status'], authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  const db = loadDB();
  const order = db.orders.find(o => o.id === id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  order.confirmedByAdmin = req.user.name;

  const isNewStatusCancelled = status.toLowerCase().includes('cancel') || status.toLowerCase().includes('reject') || status.toLowerCase().includes('fail');
  const wasPreviouslyCancelled = Boolean(order.isCancelled);

  if (isNewStatusCancelled && !wasPreviouslyCancelled) {
    order.isCancelled = true;
    order.paymentConfirmed = false;

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const scoopsToRestore = Math.floor(Number(item.scoops) || 1);
        const dish = db.dishes.find(d => d.id === item.dishId || (item.dishName && d.name && item.dishName.includes(d.name)));
        if (dish) {
          dish.scoopsLeft = Math.max(0, Number(dish.scoopsLeft || 0) + scoopsToRestore);
          if (dish.scoopsLeft > 0) {
            dish.isAvailable = true;
          }
          if (isSupabaseConfigured) {
            await saveSupabaseRecord('dishes', dish);
          }
        }
      }
    }
  } else if (!isNewStatusCancelled && wasPreviouslyCancelled) {
    order.isCancelled = false;

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const scoopsToDeduct = Math.floor(Number(item.scoops) || 1);
        const dish = db.dishes.find(d => d.id === item.dishId || (item.dishName && d.name && item.dishName.includes(d.name)));
        if (dish) {
          dish.scoopsLeft = Math.max(0, Number(dish.scoopsLeft || 0) - scoopsToDeduct);
          if (dish.scoopsLeft === 0) {
            dish.isAvailable = false;
          }
          if (isSupabaseConfigured) {
            await saveSupabaseRecord('dishes', dish);
          }
        }
      }
    }
  }

  if (status.includes('Confirmed') || status === 'Completed' || status === 'Paid' || status.includes('Preparing') || status.includes('Ready')) {
    order.paymentConfirmed = true;
  }

  saveDB(db);

  if (isSupabaseConfigured) {
    await saveSupabaseRecord('orders', order);
  }

  return res.json(order);
});

app.delete(['/api/orders/:id', '/orders/:id'], authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  db.orders = db.orders.filter(o => o.id !== id);
  saveDB(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').delete().eq('id', id);
    } catch (e) { }
  }

  return res.json({ message: `Order #${id} deleted successfully.` });
});

app.get(['/api/settings', '/settings'], async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1);
      if (!error && Array.isArray(data) && data.length > 0) {
        const db = loadDB();
        db.settings = { ...db.settings, ...data[0] };
        return res.json(db.settings);
      }
    } catch (e) {
      console.warn('Supabase settings fetch notice:', e.message);
    }
  }
  const db = loadDB();
  return res.json(db.settings || {});
});

app.patch(['/api/settings', '/settings'], authenticateToken, requireAdmin, async (req, res) => {
  const { accountName, bankName, accountNumber, whatsappName, whatsappNumber, takeoutPrice, heroTitle, heroSubtitle, announcementText } = req.body;
  const db = loadDB();

  if (!db.settings) db.settings = {};

  if (accountName !== undefined) db.settings.accountName = accountName.trim();
  if (bankName !== undefined) db.settings.bankName = bankName.trim();
  if (accountNumber !== undefined) db.settings.accountNumber = accountNumber.trim();
  if (whatsappName !== undefined) db.settings.whatsappName = whatsappName.trim();
  if (whatsappNumber !== undefined) db.settings.whatsappNumber = whatsappNumber.trim();
  if (takeoutPrice !== undefined) db.settings.takeoutPrice = Number(takeoutPrice);
  if (heroTitle !== undefined) db.settings.heroTitle = heroTitle.trim();
  if (heroSubtitle !== undefined) db.settings.heroSubtitle = heroSubtitle.trim();
  if (announcementText !== undefined) db.settings.announcementText = announcementText.trim();

  saveDB(db);

  if (isSupabaseConfigured) {
    await saveSupabaseRecord('settings', { id: 1, ...db.settings });
  }

  return res.json(db.settings);
});

// Vercel Serverless Function Export
export default app;


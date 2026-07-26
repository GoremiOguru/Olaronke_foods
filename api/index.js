import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loadDB, saveDB } from '../server/data/db.js';

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
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Health check endpoint
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  return res.json({ status: 'ok', message: "B'feastas Serverless API is active and responsive." });
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
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userRole = role === 'admin' ? 'admin' : 'student';

  if (userRole === 'student') {
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

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

app.get(['/api/admin/staff', '/admin/staff'], authenticateToken, requireAdmin, (req, res) => {
  const db = loadDB();
  const staffList = db.users
    .filter(u => u.role === 'admin')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      lastLogin: u.lastLogin || u.createdAt
    }));

  return res.json(staffList);
});

// -------------------------------------------------------------
// DISHES & INVENTORY ROUTES
// -------------------------------------------------------------
app.get(['/api/dishes', '/dishes'], (req, res) => {
  const db = loadDB();
  return res.json(db.dishes);
});

app.post(['/api/dishes', '/dishes'], authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, scoopsLeft, isAvailable, category, image, unitType } = req.body;

  if (!name || price === undefined || scoopsLeft === undefined) {
    return res.status(400).json({ message: 'Dish name, price, and stock count are required.' });
  }

  const db = loadDB();
  const newDish = {
    id: `dish-${Date.now()}`,
    name: name.trim(),
    description: description?.trim() || '',
    price: Number(price),
    scoopsLeft: Number(scoopsLeft),
    unitType: unitType || (category === 'Drinks & Refreshments' ? 'bottle' : 'scoop'),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    category: category || 'Rice Dishes',
    image: image || '/images/jollof_rice.png'
  };

  db.dishes.push(newDish);
  saveDB(db);

  return res.status(201).json(newDish);
});

app.patch(['/api/dishes/:id', '/dishes/:id'], authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { scoopsLeft, isAvailable, price, name, description, category, image, unitType } = req.body;

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

  db.dishes[dishIndex] = dish;
  saveDB(db);

  return res.json(dish);
});

app.delete(['/api/dishes/:id', '/dishes/:id'], authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = loadDB();

  const exists = db.dishes.some(d => d.id === id);
  if (!exists) return res.status(404).json({ message: 'Dish not found' });

  db.dishes = db.dishes.filter(d => d.id !== id);
  saveDB(db);

  return res.json({ message: 'Dish deleted successfully' });
});

// -------------------------------------------------------------
// ORDERS ROUTES
// -------------------------------------------------------------
app.get(['/api/orders', '/orders'], authenticateToken, (req, res) => {
  const db = loadDB();
  if (req.user.role === 'admin') {
    const sorted = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(sorted);
  } else {
    const studentOrders = db.orders
      .filter(o => o.studentId === req.user.id || o.studentEmail === req.user.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(studentOrders);
  }
});

app.post(['/api/orders', '/orders'], authenticateToken, (req, res) => {
  const { items, includeTakeoutPack, isHostelDelivery, hostelAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items cannot be empty.' });
  }

  if (isHostelDelivery && (!hostelAddress || !hostelAddress.trim())) {
    return res.status(400).json({ message: 'Please specify your hostel name and room number for delivery.' });
  }

  const db = loadDB();

  for (const item of items) {
    const dish = db.dishes.find(d => d.id === item.dishId);
    if (!dish) {
      return res.status(400).json({ message: `Dish "${item.dishName || item.dishId}" is no longer on the menu.` });
    }
    if (!dish.isAvailable) {
      return res.status(400).json({ message: `Sorry, "${dish.name}" is currently unavailable.` });
    }
    if (dish.scoopsLeft < item.scoops) {
      return res.status(400).json({
        message: `Insufficient quantity for "${dish.name}". Only ${dish.scoopsLeft} ${dish.unitType || 'portions'} remaining!`
      });
    }
  }

  items.forEach(item => {
    const dish = db.dishes.find(d => d.id === item.dishId);
    if (dish) {
      dish.scoopsLeft = Math.max(0, dish.scoopsLeft - item.scoops);
      if (dish.scoopsLeft === 0) {
        dish.isAvailable = false;
      }
    }
  });

  const mealsTotal = items.reduce((sum, i) => sum + (i.price * i.scoops), 0);
  const takeoutFee = includeTakeoutPack !== false ? (db.settings.takeoutPrice || 300) : 0;
  const deliveryFee = isHostelDelivery ? 500 : 0;
  const totalPrice = mealsTotal + takeoutFee + deliveryFee;

  const pickupCode = String(Math.floor(100 + Math.random() * 900));
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    pickupCode,
    studentId: req.user.id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    items,
    includeTakeoutPack: includeTakeoutPack !== false,
    takeoutFee,
    deliveryFee,
    isHostelDelivery: Boolean(isHostelDelivery),
    hostelAddress: isHostelDelivery ? hostelAddress.trim() : '',
    totalPrice,
    status: 'Pending Payment Verification',
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  saveDB(db);

  return res.status(201).json(newOrder);
});

app.patch(['/api/orders/:id/status', '/orders/:id/status'], authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  const db = loadDB();
  const order = db.orders.find(o => o.id === id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  order.confirmedByAdmin = req.user.name;
  saveDB(db);

  return res.json(order);
});

// Vercel Serverless Function Export
export default app;


-- =============================================================
-- B'FEASTAS SUPABASE DATABASE SCHEMA SETUP
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- =============================================================

-- 1. Create Dishes Table
CREATE TABLE IF NOT EXISTS public.dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  "scoopsLeft" INT NOT NULL DEFAULT 0,
  "unitType" TEXT DEFAULT 'scoop',
  "isAvailable" BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Rice Dishes',
  image TEXT
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  "lastLogin" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "pickupCode" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "studentPhone" TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  "includeTakeoutPack" BOOLEAN DEFAULT true,
  "plateSize" NUMERIC DEFAULT 300,
  "plateSizeName" TEXT,
  "takeoutFee" NUMERIC DEFAULT 0,
  "deliveryFee" NUMERIC DEFAULT 0,
  "isHostelDelivery" BOOLEAN DEFAULT false,
  "hostelAddress" TEXT,
  "totalPrice" NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Pending Payment Verification',
  "paymentConfirmed" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  "accountName" TEXT DEFAULT 'OLARONKE OGIDAN',
  "bankName" TEXT DEFAULT 'MONIEPOINT',
  "accountNumber" TEXT DEFAULT '8234786544',
  "whatsappName" TEXT DEFAULT 'Isaac',
  "whatsappNumber" TEXT DEFAULT '08133314798',
  "takeoutPrice" NUMERIC DEFAULT 300,
  "studentDomain" TEXT DEFAULT '@topfaith.edu.ng'
);

-- Disable Row Level Security (RLS) or enable public read/write access for API server functions
ALTER TABLE public.dishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Insert default settings row
INSERT INTO public.settings (id, "accountName", "bankName", "accountNumber", "whatsappName", "whatsappNumber", "takeoutPrice")
VALUES (1, 'OLARONKE OGIDAN', 'MONIEPOINT', '8234786544', 'Isaac', '08133314798', 300)
ON CONFLICT (id) DO NOTHING;

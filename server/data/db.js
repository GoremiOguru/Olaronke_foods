import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_FILE = path.join(__dirname, 'database.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'olaronke_database.json');

let cachedDB = null;

// Authentic Nigerian Campus Food Dishes & Drinks for B'feastas
const defaultDishes = [
  {
    id: 'dish-1',
    name: "B'feastas Special Smoky Jollof Rice",
    description: "Classic firewood-smoked Nigerian Jollof rice served hot with golden fried plantain & seasoning.",
    price: 500, // 500 Naira per scoop
    scoopsLeft: 40,
    unitType: "scoop",
    isAvailable: true,
    category: "Rice Dishes",
    image: "/images/jollof_rice.png"
  },
  {
    id: 'dish-2',
    name: "Special Campus Fried Rice",
    description: "Vibrant vegetable fried rice cooked with liver, sweetcorn & spices.",
    price: 500, // 500 Naira per scoop
    scoopsLeft: 35,
    unitType: "scoop",
    isAvailable: true,
    category: "Rice Dishes",
    image: "/images/fried_rice.png"
  },
  {
    id: 'dish-3',
    name: "Big Fried Chicken Quarter (Large)",
    description: "Crispy seasoned large Nigerian chicken quarter.",
    price: 2000,
    scoopsLeft: 15,
    unitType: "portion",
    isAvailable: true,
    category: "Chicken & Proteins",
    image: "/images/fried_chicken.png"
  },
  {
    id: 'dish-4',
    name: "Medium Fried Chicken Thigh",
    description: "Golden fried juicy chicken thigh portion.",
    price: 1500,
    scoopsLeft: 20,
    unitType: "portion",
    isAvailable: true,
    category: "Chicken & Proteins",
    image: "/images/fried_chicken.png"
  },
  {
    id: 'dish-5',
    name: "Small Fried Chicken Piece",
    description: "Tender seasoned fried chicken piece.",
    price: 1000,
    scoopsLeft: 25,
    unitType: "portion",
    isAvailable: true,
    category: "Chicken & Proteins",
    image: "/images/fried_chicken.png"
  },
  {
    id: 'dish-6',
    name: "Spicy Peppered Beef / Suya Meat",
    description: "Tender beef chunks tossed in hot pepper sauce.",
    price: 500, // 500 Naira per piece
    scoopsLeft: 30,
    unitType: "piece",
    isAvailable: true,
    category: "Chicken & Proteins",
    image: "/images/peppered_beef.png"
  },
  {
    id: 'dish-7',
    name: "Pounded Yam & Egusi Soup",
    description: "Smooth pounded yam served with rich melon Egusi soup loaded with stockfish.",
    price: 1500,
    scoopsLeft: 12,
    unitType: "plate",
    isAvailable: true,
    category: "Swallow & Soups",
    image: "/images/egusi_soup.png"
  },
  {
    id: 'dish-8',
    name: "Amala & Gbegiri / Ewedu Soup",
    description: "Authentic fluffy Amala with yellow Gbegiri & silky Ewedu soup.",
    price: 1200,
    scoopsLeft: 15,
    unitType: "plate",
    isAvailable: true,
    category: "Swallow & Soups",
    image: "/images/amala_ewedu.png"
  },
  {
    id: 'dish-9',
    name: "Sweet Fried Plantain Dodo (5 Fingers per Scoop)",
    description: "Golden fried plantain fingers served at ₦500 for 5 fingers. Order 1 scoop (5 fingers - ₦500), 2 scoops (10 fingers - ₦1k), 3 scoops (15 fingers - ₦1.5k), etc.",
    price: 500, // 500 Naira per 5 fingers
    scoopsLeft: 35,
    unitType: "portion",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/fried_plantain.png"
  },
  {
    id: 'dish-10',
    name: "Viju Milk Fruit Drink (50cl)",
    description: "Chilled creamy Viju milk fruit drink.",
    price: 500,
    scoopsLeft: 30,
    unitType: "bottle",
    isAvailable: true,
    category: "Drinks & Refreshments",
    image: "/images/viju_milk.png"
  },
  {
    id: 'dish-11',
    name: "Coca-Cola Soda Bottle (50cl)",
    description: "Ice-cold Coca-Cola sparkling soda bottle.",
    price: 400,
    scoopsLeft: 50,
    unitType: "bottle",
    isAvailable: true,
    category: "Drinks & Refreshments",
    image: "/images/coke.png"
  },
  {
    id: 'dish-12',
    name: "Pepsi Chilled Drink (50cl)",
    description: "Refreshing cold Pepsi cola drink.",
    price: 400,
    scoopsLeft: 45,
    unitType: "bottle",
    isAvailable: true,
    category: "Drinks & Refreshments",
    image: "/images/pepsi.png"
  },
  {
    id: 'dish-13',
    name: "Sosa Orange Juice Drink (50cl)",
    description: "Cold natural Sosa orange fruit juice bottle.",
    price: 500,
    scoopsLeft: 35,
    unitType: "bottle",
    isAvailable: true,
    category: "Drinks & Refreshments",
    image: "/images/sosa_orange.png"
  },
  {
    id: 'dish-14',
    name: "Chilled House Zobo Juice (50cl)",
    description: "Refreshing hibiscus flower drink brewed with ginger & pineapple.",
    price: 500,
    scoopsLeft: 40,
    unitType: "bottle",
    isAvailable: true,
    category: "Drinks & Refreshments",
    image: "/images/zobo_drink.png"
  },
  {
    id: 'dish-15',
    name: "Boiled Hard Egg (1 Piece)",
    description: "Freshly boiled hard egg. Great side add-on for rice or noodles.",
    price: 300,
    scoopsLeft: 30,
    unitType: "piece",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/eggs_sausages.png"
  },
  {
    id: 'dish-16',
    name: "Golden Fried Egg (1 Piece)",
    description: "Seasoned fried egg cooked fresh with onions & peppers.",
    price: 500,
    scoopsLeft: 25,
    unitType: "piece",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/eggs_sausages.png"
  },
  {
    id: 'dish-17',
    name: "Boiled Chicken Franc Sausage (1 Piece)",
    description: "Tender boiled premium Chicken Franc sausage piece.",
    price: 500,
    scoopsLeft: 25,
    unitType: "piece",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/eggs_sausages.png"
  },
  {
    id: 'dish-18',
    name: "Golden Fried Chicken Franc Sausage (1 Piece)",
    description: "Crispy fried juicy Chicken Franc sausage piece.",
    price: 500,
    scoopsLeft: 25,
    unitType: "piece",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/eggs_sausages.png"
  },
  {
    id: 'dish-19',
    name: "Campus Special Indomie Noodles (Single Pack)",
    description: "Hot cooked campus Indomie noodles with chili peppers & spices (40 mins - 1 hr prep time). Note: You can also order 2 packs in 1 plate below to save takeout pack fees!",
    price: 1000,
    scoopsLeft: 30,
    unitType: "plate",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/indomie_noodles.png"
  },
  {
    id: 'dish-24',
    name: "Campus Double Mega Indomie Noodles (2 Packs in 1 Plate)",
    description: "2 full packs of cooked Indomie served in 1 single takeout plate to save packaging costs! (40 mins - 1 hr prep time).",
    price: 2000,
    scoopsLeft: 25,
    unitType: "plate",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/indomie_noodles.png"
  },
  {
    id: 'dish-25',
    name: "Rich Campus Peppered Egg Sauce (1 Scoop)",
    description: "Delicious savory tomato, onion & peppered egg sauce. Great with Yam, Plantain, or Rice. ₦1,000 per scoop (Order multiple scoops).",
    price: 1000,
    scoopsLeft: 30,
    unitType: "scoop",
    isAvailable: true,
    category: "Swallow & Soups",
    image: "/images/egg_sauce.png"
  },
  {
    id: 'dish-26',
    name: "Fresh Campus Bread Loaf (Sliced)",
    description: "Freshly baked soft campus loaf of bread, neatly sliced.",
    price: 2200,
    scoopsLeft: 20,
    unitType: "loaf",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/bread_loaf.png"
  },
  {
    id: 'dish-27',
    name: "Fresh Campus Bread Loaf (Unsliced)",
    description: "Freshly baked soft campus whole unsliced loaf of bread.",
    price: 2200,
    scoopsLeft: 20,
    unitType: "loaf",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/bread_loaf.png"
  },
  {
    id: 'dish-28',
    name: "Fresh Half Loaf Bread (Sliced)",
    description: "Freshly baked half loaf of soft campus bread, neatly sliced.",
    price: 1100,
    scoopsLeft: 20,
    unitType: "half loaf",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/bread_loaf.png"
  },
  {
    id: 'dish-29',
    name: "Fresh Half Loaf Bread (Unsliced)",
    description: "Freshly baked half loaf of soft campus bread, whole unsliced.",
    price: 1100,
    scoopsLeft: 20,
    unitType: "half loaf",
    isAvailable: true,
    category: "Sides & Extras",
    image: "/images/bread_loaf.png"
  },
  {
    id: 'dish-20',
    name: "Classic Chicken Shawarma (1 Sausage)",
    description: "Juicy grilled chicken shawarma wrap with cream sauce & 1 Chicken Franc sausage.",
    price: 3500,
    scoopsLeft: 20,
    unitType: "wrap",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/shawarma.png"
  },
  {
    id: 'dish-21',
    name: "Double Supreme Chicken & Beef Shawarma (2 Sausages)",
    description: "Loaded mixed chicken & beef shawarma wrap with 2 Chicken Franc sausages & double cream sauce.",
    price: 5500,
    scoopsLeft: 20,
    unitType: "wrap",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/shawarma.png"
  },
  {
    id: 'dish-22',
    name: "Toasted Sandwich (Fried Egg + 1 Sausage)",
    description: "Golden toasted sandwich loaded with 1 fried egg & 1 Chicken Franc sausage.",
    price: 1500,
    scoopsLeft: 25,
    unitType: "portion",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/toasted_sandwich.png"
  },
  {
    id: 'dish-23',
    name: "Double Sausage Toasted Sandwich (Fried Egg + 2 Sausages)",
    description: "Deluxe toasted sandwich loaded with 1 fried egg & 2 Chicken Franc sausages.",
    price: 2000,
    scoopsLeft: 25,
    unitType: "portion",
    isAvailable: true,
    category: "Made-to-Order & On-Demand",
    prepTime: "40 mins - 1 hr",
    image: "/images/toasted_sandwich.png"
  }
];

function getInitialDatabase() {
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('adminpassword123', salt);
  const studentPassword = bcrypt.hashSync('studentpassword123', salt);

  return {
    users: [
      {
        id: 'usr-admin-1',
        name: 'Olaronke Ogidan (Head Admin)',
        email: 'olaronkestaff@gmail.com',
        passwordHash: adminPassword,
        role: 'admin',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-admin-2',
        name: 'Isaac (Vendor Staff)',
        email: 'isaac.vendor@gmail.com',
        passwordHash: adminPassword,
        role: 'admin',
        lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-student-1',
        name: 'Emeka Okafor',
        email: 'emeka.okafor@topfaith.edu.ng',
        passwordHash: studentPassword,
        role: 'student',
        createdAt: new Date().toISOString()
      }
    ],
    dishes: defaultDishes,
    orders: [],
    settings: {
      accountName: 'OLARONKE OGIDAN',
      bankName: 'MONIEPOINT',
      accountNumber: '8234786544',
      whatsappName: 'Isaac',
      whatsappNumber: '08133314798',
      takeoutPrice: 300,
      studentDomain: '@topfaith.edu.ng'
    }
  };
}

export function loadDB() {
  if (cachedDB) {
    return cachedDB;
  }

  // 1. Try reading from /tmp/olaronke_database.json (persisted in warm serverless instances)
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = fs.readFileSync(TMP_DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.dishes)) {
        cachedDB = parsed;
        return cachedDB;
      }
    }
  } catch (err) {
    console.warn('Unable to read DB from tmp directory:', err.message);
  }

  // 2. Try reading from local database.json
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.dishes)) {
        cachedDB = parsed;
        return cachedDB;
      }
    }
  } catch (err) {
    console.warn('Unable to read DB from local file:', err.message);
  }

  // 3. Fallback to default in-memory database
  cachedDB = getInitialDatabase();

  // Try persisting to /tmp or local
  saveDB(cachedDB);

  return cachedDB;
}

export function saveDB(data) {
  cachedDB = data;

  // 1. Try writing to local file (works during local dev)
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    // Expected on Vercel read-only filesystem
  }

  // 2. Always write to /tmp file (persists across warm serverless functions on Vercel)
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('Unable to persist DB to tmp:', err.message);
  }
}


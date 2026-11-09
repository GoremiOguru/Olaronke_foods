const fs = require('fs');
const path = require('path');

const guideDir = path.join(__dirname, '..', 'public', 'images', 'guide');
if (!fs.existsSync(guideDir)) fs.mkdirSync(guideDir, { recursive: true });

function wrapSvg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="lemonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#65a30d"/>
      <stop offset="100%" stop-color="#84cc16"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="800" height="450" fill="url(#bgGrad)"/>
  ${content}
</svg>`;
}

// 1. Student: Live Menu & Scoops Countdown
const studentMenuStock = wrapSvg(`
  <!-- Dish Card Mockup -->
  <rect x="220" y="40" width="360" height="370" rx="24" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  
  <!-- Image Banner -->
  <rect x="236" y="56" width="328" height="150" rx="16" fill="#020617" stroke="#1e293b"/>
  <circle cx="400" cy="130" r="45" fill="#ea580c" opacity="0.2"/>
  <text x="400" y="135" text-anchor="middle" font-size="40">🍛</text>
  
  <!-- Live Stock Badge (Glowing) -->
  <rect x="420" y="70" width="130" height="28" rx="14" fill="#84cc16" opacity="0.9" filter="url(#glow)"/>
  <text x="485" y="89" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="middle">⚡ 14 SCOOPS LEFT</text>
  
  <!-- Dish Name & Category -->
  <text x="250" y="240" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">Smoky Party Jollof Rice</text>
  <text x="250" y="260" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Main Dishes • Fresh Pot from Cafeteria</text>
  
  <!-- Price -->
  <text x="250" y="300" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="22">₦1,200 <tspan fill="#64748b" font-size="13" font-weight="600">/ scoop</tspan></text>
  
  <!-- Portion Stepper -->
  <rect x="250" y="330" width="110" height="44" rx="14" fill="#090d16" stroke="#334155"/>
  <text x="270" y="358" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="18">−</text>
  <text x="305" y="357" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16">2</text>
  <text x="340" y="358" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="18">+</text>
  
  <!-- Add to Plate Button -->
  <rect x="375" y="330" width="189" height="44" rx="14" fill="url(#orangeGrad)"/>
  <text x="470" y="357" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="14" text-anchor="middle">Add to Tray • ₦2,400</text>
`);

// 2. Student: Takeout Packs & Multi-Plate Arranger
const studentTakeoutPacks = wrapSvg(`
  <text x="400" y="65" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Smart Takeout Packaging</text>
  <text x="400" y="90" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Max 5 scoops per plate • Choose your container</text>

  <!-- 3 Container Options -->
  <!-- Small -->
  <rect x="90" y="125" width="180" height="230" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <circle cx="180" cy="180" r="32" fill="#0284c7" opacity="0.2"/>
  <text x="180" y="188" text-anchor="middle" font-size="28">🥡</text>
  <text x="180" y="240" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">Small Pack</text>
  <text x="180" y="265" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="800" font-size="14" text-anchor="middle">₦100 fee</text>
  <text x="180" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">1 - 2 scoops rice / soup</text>

  <!-- Medium (Featured) -->
  <rect x="310" y="110" width="180" height="260" rx="20" fill="url(#cardGrad)" stroke="#84cc16" stroke-width="3" filter="url(#glow)"/>
  <rect x="345" y="125" width="110" height="22" rx="11" fill="#84cc16"/>
  <text x="400" y="140" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="10" text-anchor="middle">MOST POPULAR</text>
  <circle cx="400" cy="190" r="36" fill="#84cc16" opacity="0.2"/>
  <text x="400" y="199" text-anchor="middle" font-size="32">🥡</text>
  <text x="400" y="255" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="17" text-anchor="middle">Medium Pack</text>
  <text x="400" y="280" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="800" font-size="15" text-anchor="middle">₦200 fee</text>
  <text x="400" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="12" text-anchor="middle">3 - 4 scoops standard</text>

  <!-- Large -->
  <rect x="530" y="125" width="180" height="230" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <circle cx="620" cy="180" r="32" fill="#f97316" opacity="0.2"/>
  <text x="620" y="188" text-anchor="middle" font-size="28">🍱</text>
  <text x="620" y="240" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">Large Pack</text>
  <text x="620" y="265" fill="#f97316" font-family="system-ui, sans-serif" font-weight="800" font-size="14" text-anchor="middle">₦300 fee</text>
  <text x="620" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Full plate (5 scoops max)</text>
`);

// 3. Student: Delivery Options & ₦100 Multi-Plate Discount
const studentDeliveryOptions = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Campus Delivery & Free Pickup</text>
  
  <!-- Discount Banner Ribbon -->
  <rect x="180" y="75" width="440" height="34" rx="17" fill="url(#lemonGrad)"/>
  <text x="400" y="97" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">🎉 ₦100 OFF Delivery when ordering 2 or more plates!</text>

  <!-- Option 1: Pickup -->
  <rect x="80" y="130" width="200" height="250" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <text x="180" y="185" text-anchor="middle" font-size="34">🥡</text>
  <text x="180" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">Cafeteria Pickup</text>
  <text x="180" y="265" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle">FREE (₦0)</text>
  <text x="180" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Express Fast Counter</text>
  <text x="180" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Collect in 2 seconds</text>

  <!-- Option 2: Hostels -->
  <rect x="300" y="130" width="200" height="250" rx="20" fill="url(#cardGrad)" stroke="#38bdf8" stroke-width="2"/>
  <text x="400" y="185" text-anchor="middle" font-size="34">🏫</text>
  <text x="400" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">4 Student Hostels</text>
  <text x="400" y="265" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle">₦500 <tspan fill="#84cc16" font-size="13">(₦400 for 2+)</tspan></text>
  <text x="400" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Clock, Thomas Abraham</text>
  <text x="400" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Psalm One, Maria Abraham</text>

  <!-- Option 3: Faculties -->
  <rect x="520" y="130" width="200" height="250" rx="20" fill="url(#cardGrad)" stroke="#f97316" stroke-width="2"/>
  <text x="620" y="185" text-anchor="middle" font-size="34">🏢</text>
  <text x="620" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">Faculty Buildings</text>
  <text x="620" y="265" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle">₦700 <tspan fill="#84cc16" font-size="13">(₦600 for 2+)</tspan></text>
  <text x="620" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Mass Comm & Engr.</text>
  <text x="620" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="500" font-size="11" text-anchor="middle">Ground Floor Lobby Pickup</text>
`);

// 4. Student: Morning Pre-Order Scheduler
const studentPreorderTime = wrapSvg(`
  <text x="400" y="60" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Schedule Morning Pre-Orders</text>
  <text x="400" y="85" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Order during lectures • Skip the 20-minute peak queue</text>

  <!-- 4 Time Slot Buttons -->
  <rect x="120" y="130" width="250" height="100" rx="18" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <text x="150" y="175" text-anchor="start" font-size="28">⏰</text>
  <text x="195" y="172" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">12:30 PM Slot</text>
  <text x="195" y="195" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12">First Lunch Break</text>

  <rect x="430" y="130" width="250" height="100" rx="18" fill="url(#cardGrad)" stroke="#f97316" stroke-width="2" filter="url(#glow)"/>
  <text x="460" y="175" text-anchor="start" font-size="28">🔥</text>
  <text x="505" y="172" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">1:15 PM Slot</text>
  <text x="505" y="195" fill="#f97316" font-family="system-ui, sans-serif" font-weight="700" font-size="12">Peak Cafeteria Rush</text>

  <rect x="120" y="260" width="250" height="100" rx="18" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <text x="150" y="305" text-anchor="start" font-size="28">⏳</text>
  <text x="195" y="302" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">2:00 PM Slot</text>
  <text x="195" y="325" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Afternoon Break</text>

  <rect x="430" y="260" width="250" height="100" rx="18" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  <text x="460" y="305" text-anchor="start" font-size="28">🌙</text>
  <text x="505" y="302" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">5:30 PM Slot</text>
  <text x="505" y="325" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Evening Dinner Pack</text>
`);

// 5. Student: Secret Pickup Code & E-Receipt
const studentPickupCode = wrapSvg(`
  <!-- Receipt Card Frame -->
  <rect x="240" y="40" width="320" height="370" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  
  <text x="400" y="75" fill="#0f172a" font-family="system-ui, sans-serif" font-weight="900" font-size="14" text-anchor="middle">BENEFEASTAS NIG ENTERPRISE</text>
  <text x="400" y="93" fill="#64748b" font-family="monospace" font-size="10" text-anchor="middle">Official Student Cafeteria Receipt</text>

  <!-- Big Neon Secret Code Box -->
  <rect x="270" y="110" width="260" height="70" rx="14" fill="#0f172a"/>
  <text x="400" y="133" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="800" font-size="10" text-anchor="middle">SECRET PICKUP CODE</text>
  <text x="400" y="165" fill="#fbbf24" font-family="monospace" font-weight="900" font-size="26" text-anchor="middle">#GEN-005</text>

  <!-- Verified Stamp Badge -->
  <rect x="310" y="195" width="180" height="30" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="400" y="215" fill="#15803d" font-family="system-ui, sans-serif" font-weight="900" font-size="11" text-anchor="middle">PAID &amp; VERIFIED</text>

  <!-- Order Items Line -->
  <line x1="270" y1="245" x2="530" y2="245" stroke="#cbd5e1" stroke-dasharray="4,4"/>
  <text x="270" y="270" fill="#0f172a" font-family="monospace" font-size="11">2x Jollof Rice</text>
  <text x="530" y="270" fill="#0f172a" font-family="monospace" font-size="11" text-anchor="end">₦2,400</text>
  <text x="270" y="290" fill="#0f172a" font-family="monospace" font-size="11">1x Fried Chicken</text>
  <text x="530" y="290" fill="#0f172a" font-family="monospace" font-size="11" text-anchor="end">₦1,500</text>
  
  <line x1="270" y1="310" x2="530" y2="310" stroke="#0f172a" stroke-width="1.5"/>
  <text x="270" y="335" fill="#0f172a" font-family="monospace" font-weight="900" font-size="13">TOTAL</text>
  <text x="530" y="335" fill="#0f172a" font-family="monospace" font-weight="900" font-size="15" text-anchor="end">₦3,900</text>

  <!-- Simulated Barcode -->
  <rect x="310" y="355" width="4" height="25" fill="#0f172a"/>
  <rect x="320" y="355" width="8" height="25" fill="#0f172a"/>
  <rect x="334" y="355" width="3" height="25" fill="#0f172a"/>
  <rect x="343" y="355" width="7" height="25" fill="#0f172a"/>
  <rect x="356" y="355" width="5" height="25" fill="#0f172a"/>
  <rect x="367" y="355" width="8" height="25" fill="#0f172a"/>
  <rect x="381" y="355" width="3" height="25" fill="#0f172a"/>
  <rect x="390" y="355" width="9" height="25" fill="#0f172a"/>
  <rect x="405" y="355" width="4" height="25" fill="#0f172a"/>
  <rect x="415" y="355" width="6" height="25" fill="#0f172a"/>
  <rect x="427" y="355" width="4" height="25" fill="#0f172a"/>
  <rect x="437" y="355" width="8" height="25" fill="#0f172a"/>
  <rect x="451" y="355" width="5" height="25" fill="#0f172a"/>
  <rect x="462" y="355" width="8" height="25" fill="#0f172a"/>
  <rect x="476" y="355" width="4" height="25" fill="#0f172a"/>
`);

// 6. Student: Live 4-Step Order Progress Tracker in My Orders
const studentOrderTracker = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Live Order Progress in 'My Orders'</text>
  <text x="400" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Track kitchen cooking stages in real-time on your phone</text>

  <!-- My Orders Ticket Card -->
  <rect x="100" y="110" width="600" height="290" rx="24" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>

  <!-- Ticket Header -->
  <text x="130" y="145" fill="#fbbf24" font-family="monospace" font-weight="900" font-size="14">#17348912</text>
  <text x="240" y="145" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">• Secret Code: <tspan fill="#f97316" font-weight="900">#GEN-005</tspan></text>
  <rect x="520" y="130" width="150" height="24" rx="12" fill="#84cc16" opacity="0.2"/>
  <text x="595" y="146" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="800" font-size="11" text-anchor="middle">Cooking in Kitchen</text>

  <!-- 4-STEP PROGRESS STEPPER BAR -->
  <line x1="160" y1="210" x2="640" y2="210" stroke="#334155" stroke-width="4"/>
  <line x1="160" y1="210" x2="320" y2="210" stroke="#f97316" stroke-width="4"/>

  <!-- Step 1: Placed -->
  <circle cx="160" cy="210" r="22" fill="#10b981"/>
  <text x="160" y="217" text-anchor="middle" font-size="16">✓</text>
  <text x="160" y="250" fill="#10b981" font-family="system-ui, sans-serif" font-weight="800" font-size="12" text-anchor="middle">Order Placed</text>

  <!-- Step 2: Cooking (Active Glow) -->
  <circle cx="320" cy="210" r="26" fill="#f97316" filter="url(#glow)"/>
  <text x="320" y="217" text-anchor="middle" font-size="18">👨‍🍳</text>
  <text x="320" y="255" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">Cooking &amp; Packing</text>

  <!-- Step 3: Ready -->
  <circle cx="480" cy="210" r="20" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="480" y="216" text-anchor="middle" font-size="15">🔔</text>
  <text x="480" y="250" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12" text-anchor="middle">Ready for Pickup</text>

  <!-- Step 4: Completed -->
  <circle cx="640" cy="210" r="20" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="640" y="216" text-anchor="middle" font-size="15">✅</text>
  <text x="640" y="250" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="12" text-anchor="middle">Completed</text>

  <!-- Realtime Description Banner -->
  <rect x="130" y="280" width="540" height="42" rx="12" fill="#090d16" stroke="#1e293b"/>
  <circle cx="150" cy="301" r="5" fill="#84cc16"/>
  <text x="170" y="306" fill="#cbd5e1" font-family="system-ui, sans-serif" font-weight="600" font-size="12">Payment verified! Cafeteria chef is now dishing your meal hot. Receipt is unlocked!</text>

  <!-- Print Receipt Action Button -->
  <rect x="470" y="340" width="200" height="40" rx="12" fill="#f59e0b"/>
  <text x="570" y="365" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="middle">🖨️ View &amp; Print Official Receipt</text>
`);

// 7. Student: 100% Offline Save
const studentOfflineSave = wrapSvg(`
  <text x="400" y="60" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">100% Offline Meal Vault</text>
  <text x="400" y="85" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">No internet? Orders &amp; pickup codes save safely on your phone</text>

  <!-- Phone Mockup Frame -->
  <rect x="260" y="115" width="280" height="290" rx="26" fill="url(#cardGrad)" stroke="#10b981" stroke-width="2" filter="url(#glow)"/>
  
  <rect x="290" y="140" width="220" height="30" rx="15" fill="#10b981" opacity="0.2"/>
  <text x="400" y="160" fill="#10b981" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="middle">⚡ OFFLINE PASS READY</text>

  <text x="400" y="210" text-anchor="middle" font-size="38">📱</text>
  <text x="400" y="245" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="15" text-anchor="middle">Saved on Your Device</text>
  <text x="400" y="270" fill="#fbbf24" font-family="monospace" font-weight="900" font-size="22" text-anchor="middle">#GEN-012</text>
  <text x="400" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Show this code at cafeteria counter</text>

  <!-- Sync pill -->
  <rect x="300" y="325" width="200" height="34" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="400" y="347" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="11" text-anchor="middle">🔄 Auto-syncs to cloud when online</text>
`);

// 8. Staff: Order Queue & Real-Time Status Management
const staffStatusManagement = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Order Queue &amp; Real-Time Status Flow</text>
  <text x="400" y="80" fill="#fbbf24" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">⚠️ Crucial: Updating status updates student phones &amp; unlocks receipts in real-time!</text>

  <!-- Status Steps Workflow Card -->
  <rect x="80" y="110" width="640" height="290" rx="24" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>

  <!-- Step 1 Column -->
  <rect x="105" y="135" width="140" height="230" rx="16" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
  <text x="175" y="170" fill="#f59e0b" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">1. Verify Payment</text>
  <text x="175" y="190" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Check student bank alert</text>
  <rect x="120" y="210" width="110" height="60" rx="10" fill="#1e293b"/>
  <text x="175" y="235" fill="#fbbf24" font-family="monospace" font-weight="800" font-size="12" text-anchor="middle">#GEN-001</text>
  <text x="175" y="255" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">₦2,500 (Transfer)</text>
  <rect x="120" y="295" width="110" height="32" rx="8" fill="#f59e0b"/>
  <text x="175" y="315" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="10" text-anchor="middle">Confirm &amp; Cook ➔</text>

  <!-- Step 2 Column -->
  <rect x="260" y="135" width="140" height="230" rx="16" fill="#090d16" stroke="#ea580c" stroke-width="2"/>
  <text x="330" y="170" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">2. Preparing</text>
  <text x="330" y="190" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Kitchen cooking &amp; dishing</text>
  <rect x="275" y="210" width="110" height="60" rx="10" fill="#1e293b"/>
  <text x="330" y="235" fill="#fbbf24" font-family="monospace" font-weight="800" font-size="12" text-anchor="middle">#GEN-002</text>
  <text x="330" y="255" fill="#84cc16" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Receipt Unlocked ✓</text>
  <rect x="275" y="295" width="110" height="32" rx="8" fill="#ea580c"/>
  <text x="330" y="315" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="10" text-anchor="middle">Mark Ready ➔</text>

  <!-- Step 3 Column -->
  <rect x="415" y="135" width="140" height="230" rx="16" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
  <text x="485" y="170" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">3. Ready / Delivery</text>
  <text x="485" y="190" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Call student or rider</text>
  <rect x="430" y="210" width="110" height="60" rx="10" fill="#1e293b"/>
  <text x="485" y="235" fill="#fbbf24" font-family="monospace" font-weight="800" font-size="12" text-anchor="middle">#GEN-003</text>
  <text x="485" y="255" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Bell Ringing 🔔</text>
  <rect x="430" y="295" width="110" height="32" rx="8" fill="#38bdf8"/>
  <text x="485" y="315" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="10" text-anchor="middle">Complete ➔</text>

  <!-- Step 4 Column -->
  <rect x="570" y="135" width="135" height="230" rx="16" fill="#090d16" stroke="#10b981" stroke-width="2"/>
  <text x="637" y="170" fill="#10b981" font-family="system-ui, sans-serif" font-weight="900" font-size="13" text-anchor="middle">4. Completed</text>
  <text x="637" y="190" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Handed to customer</text>
  <rect x="585" y="210" width="105" height="60" rx="10" fill="#1e293b"/>
  <text x="637" y="235" text-anchor="middle" font-size="20">✅</text>
  <text x="637" y="255" fill="#10b981" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Done &amp; Logged</text>
  <rect x="585" y="295" width="105" height="32" rx="8" fill="#1e293b"/>
  <text x="637" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="700" font-size="10" text-anchor="middle">Final State</text>
`);

// 9. Staff: Counter Walk-in POS (100% Offline)
const staffWalkinPos = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Counter Walk-in POS Register</text>
  <text x="400" y="80" fill="#10b981" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">100% Offline • Cash, POS, or Transfer sales at the counter</text>

  <!-- POS Register Modal Frame -->
  <rect x="140" y="105" width="520" height="305" rx="22" fill="url(#cardGrad)" stroke="#10b981" stroke-width="2"/>

  <!-- Customer Name Input -->
  <rect x="170" y="130" width="460" height="38" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="190" y="154" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Walk-in Customer Name (e.g. Samuel, Law Faculty)...</text>

  <!-- Payment Method Selector -->
  <text x="170" y="195" fill="#cbd5e1" font-family="system-ui, sans-serif" font-weight="800" font-size="12">Payment Method:</text>
  <rect x="290" y="180" width="90" height="32" rx="8" fill="#10b981"/>
  <text x="335" y="201" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="middle">💵 Cash</text>
  <rect x="390" y="180" width="90" height="32" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="435" y="201" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">💳 POS</text>
  <rect x="490" y="180" width="90" height="32" rx="8" fill="#1e293b" stroke="#334155"/>
  <text x="535" y="201" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">📱 Transfer</text>

  <!-- Options: Takeout Pack & Direct Handover -->
  <rect x="170" y="230" width="220" height="40" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="190" y="255" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="12">☑ Takeout Pack (+₦300)</text>

  <rect x="410" y="230" width="220" height="40" rx="10" fill="#090d16" stroke="#10b981"/>
  <text x="430" y="255" fill="#10b981" font-family="system-ui, sans-serif" font-weight="900" font-size="12">☑ Direct Handover (Done)</text>

  <!-- Submit & Print Button -->
  <rect x="170" y="290" width="460" height="52" rx="14" fill="url(#lemonGrad)"/>
  <text x="400" y="322" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">Confirm Sale &amp; Print Thermal Receipt • ₦2,700</text>
  <text x="400" y="375" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">⚡ Works offline! Auto-syncs to cloud records when connected</text>
`);

// 10. Staff: Menu Management - Sold Out vs Delete
const staffMenuDeleteSoldout = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Sold Out Toggle vs. Permanent Deletion</text>
  <text x="400" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Maintain your catalog cleanly without losing dish history</text>

  <!-- Left: Sold Out Toggle -->
  <rect x="100" y="115" width="280" height="280" rx="22" fill="url(#cardGrad)" stroke="#84cc16" stroke-width="2"/>
  <text x="240" y="155" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">🟡 MARK SOLD OUT</text>
  <text x="240" y="180" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">For when today's food pot finishes</text>
  
  <!-- Green to Gray Toggle Switch Mockup -->
  <rect x="180" y="210" width="120" height="50" rx="25" fill="#334155"/>
  <circle cx="210" cy="235" r="20" fill="#94a3b8"/>
  <text x="255" y="240" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="900" font-size="12">OFF</text>

  <text x="240" y="295" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Meal stays in catalog</text>
  <text x="240" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Easily turn back ON tomorrow morning</text>
  <text x="240" y="355" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="800" font-size="11" text-anchor="middle">✓ Recommended for daily specials</text>

  <!-- Right: Permanent Delete -->
  <rect x="420" y="115" width="280" height="280" rx="22" fill="url(#cardGrad)" stroke="#ef4444" stroke-width="2"/>
  <text x="560" y="155" fill="#ef4444" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">🔴 PERMANENT DELETE</text>
  <text x="560" y="180" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Click red trash icon &amp; confirm</text>

  <!-- Trash Icon Mockup -->
  <circle cx="560" cy="235" r="28" fill="#ef4444" opacity="0.2"/>
  <text x="560" y="245" text-anchor="middle" font-size="28">🗑️</text>

  <text x="560" y="295" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Removes food completely</text>
  <text x="560" y="315" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Disappears from database</text>
  <text x="560" y="355" fill="#f87171" font-family="system-ui, sans-serif" font-weight="800" font-size="11" text-anchor="middle">⚠️ Use only for cancelled dishes</text>
`);

// 11. Staff: Uploading New Meals & Camera Photo Upload
const staffUploadFood = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Add New Dish &amp; Camera Upload</text>
  <text x="400" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Works 100% offline • Photos compress directly on device</text>

  <rect x="140" y="110" width="520" height="295" rx="22" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>

  <!-- Left: Photo Upload Zone -->
  <rect x="170" y="135" width="180" height="180" rx="16" fill="#090d16" stroke="#f97316" stroke-width="2" stroke-dasharray="6,6"/>
  <text x="260" y="210" text-anchor="middle" font-size="34">📸</text>
  <text x="260" y="245" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="12" text-anchor="middle">Snap or Pick Photo</text>
  <text x="260" y="265" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Auto-compressed offline</text>

  <!-- Right: Form Fields -->
  <rect x="375" y="135" width="255" height="38" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="390" y="158" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12">Dish Name: Egusi Soup with Goat Meat</text>

  <rect x="375" y="185" width="120" height="38" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="390" y="208" fill="#f97316" font-family="system-ui, sans-serif" font-weight="900" font-size="13">₦1,500</text>

  <rect x="505" y="185" width="125" height="38" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="520" y="208" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12">Portion: scoop</text>

  <rect x="375" y="235" width="255" height="38" rx="10" fill="#090d16" stroke="#334155"/>
  <text x="390" y="258" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="900" font-size="12">Initial Stock: 30 scoops</text>

  <!-- Publish Button -->
  <rect x="170" y="335" width="460" height="48" rx="14" fill="url(#orangeGrad)"/>
  <text x="400" y="365" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="15" text-anchor="middle">Publish to Student Phones ⚡</text>
`);

// 12. Staff: 1-Second Counter Lookup & Thermal Printing
const staffQuickHandover = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Counter 1-Second Code Handover</text>
  <text x="400" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Type customer 3-digit code to instantly dispense food in 1 second</text>

  <!-- Quick Code Input Box -->
  <rect x="140" y="105" width="520" height="65" rx="18" fill="#020617" stroke="#10b981" stroke-width="2" filter="url(#glow)"/>
  <text x="180" y="147" fill="#10b981" font-family="monospace" font-weight="900" font-size="24">#</text>
  <text x="210" y="148" fill="#fbbf24" font-family="monospace" font-weight="900" font-size="22">005</text>
  <rect x="520" y="117" width="120" height="40" rx="10" fill="#10b981"/>
  <text x="580" y="142" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="middle">MATCH FOUND</text>

  <!-- Instant Pop-up Order Ticket -->
  <rect x="140" y="190" width="520" height="195" rx="20" fill="url(#cardGrad)" stroke="#10b981" stroke-width="2"/>
  
  <rect x="165" y="210" width="110" height="34" rx="8" fill="#020617" stroke="#fbbf24"/>
  <text x="220" y="233" fill="#fbbf24" font-family="monospace" font-weight="900" font-size="16" text-anchor="middle">#GEN-005</text>

  <text x="290" y="225" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="15">Victor Edet (Mass Comm)</text>
  <text x="290" y="243" fill="#10b981" font-family="system-ui, sans-serif" font-weight="800" font-size="12">₦3,900 (Transfer Verified ✓)</text>

  <text x="165" y="280" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="13">Items: 2x Smoky Jollof Rice • 1x Fried Chicken • Takeout Pack</text>

  <!-- Two Quick Action Buttons -->
  <rect x="165" y="310" width="370" height="50" rx="14" fill="url(#lemonGrad)"/>
  <text x="350" y="341" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="15" text-anchor="middle">✓ Dispense &amp; Mark Handed Over (1-Sec)</text>

  <rect x="550" y="310" width="85" height="50" rx="14" fill="#1e293b" stroke="#334155"/>
  <text x="592" y="341" text-anchor="middle" font-size="20">🖨️</text>
`);

// 13. Staff: Daily Cashflow Summary & WhatsApp Broadcast
const staffCashflowSummary = wrapSvg(`
  <text x="400" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" text-anchor="middle">Daily Cashflow &amp; WhatsApp Broadcast</text>
  <text x="400" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">End-of-day financial reconciliation at cafeteria closing time</text>

  <!-- Total Revenue Big Card -->
  <rect x="120" y="110" width="560" height="140" rx="20" fill="url(#cardGrad)" stroke="#84cc16" stroke-width="2"/>
  <text x="150" y="145" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="800" font-size="12">TODAY'S TOTAL CAFETERIA REVENUE</text>
  <text x="150" y="190" fill="#84cc16" font-family="system-ui, sans-serif" font-weight="900" font-size="34">₦142,500</text>
  
  <line x1="150" y1="210" x2="650" y2="210" stroke="#334155"/>
  <text x="150" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13">💵 Physical (Cash &amp; POS): <tspan fill="#10b981">₦58,000</tspan></text>
  <text x="420" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13">📱 Online (Transfers): <tspan fill="#38bdf8">₦84,500</tspan></text>

  <!-- WhatsApp Send Button -->
  <rect x="120" y="275" width="560" height="60" rx="16" fill="#10b981"/>
  <text x="400" y="312" fill="#020617" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">📲 Send Full Daily Report to Mrs. Olaronke on WhatsApp</text>
  <text x="400" y="365" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Includes breakdown of portions sold, packaging fees, and cashier handover</text>
`);

// Write all SVGs
const files = {
  'student_menu_stock.svg': studentMenuStock,
  'student_takeout_packs.svg': studentTakeoutPacks,
  'student_delivery_options.svg': studentDeliveryOptions,
  'student_preorder_time.svg': studentPreorderTime,
  'student_pickup_code.svg': studentPickupCode,
  'student_order_tracker.svg': studentOrderTracker,
  'student_offline_save.svg': studentOfflineSave,
  'staff_status_management.svg': staffStatusManagement,
  'staff_walkin_pos.svg': staffWalkinPos,
  'staff_menu_delete_soldout.svg': staffMenuDeleteSoldout,
  'staff_upload_food.svg': staffUploadFood,
  'staff_quick_handover.svg': staffQuickHandover,
  'staff_cashflow_summary.svg': staffCashflowSummary
};

Object.entries(files).forEach(([name, content]) => {
  const filePath = path.join(guideDir, name);
  fs.writeFileSync(filePath, content.trim(), 'utf-8');
  console.log('Generated:', name);
});

console.log('All 13 guide SVGs generated successfully!');

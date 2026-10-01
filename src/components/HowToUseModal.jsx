import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles, UtensilsCrossed, ShieldCheck, Flame, Package, MapPin, Key, Printer, Phone, CheckCircle2, Play, Pause, Eye } from 'lucide-react';

export default function HowToUseModal({ isOpen, onClose, onOpenAdmin }) {
  const [roleMode, setRoleMode] = useState('student'); // 'student' | 'admin'
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const studentSteps = [
    {
      id: 'step-menu',
      targetId: 'catalog-section',
      title: "1. Live Kitchen Menu & Scoop Counters",
      badge: "Real-Time Inventory",
      color: "from-brand-orange to-amber-500",
      description: "Browse authentic Nigerian meals updated live from the kitchen. Watch scoop counters auto-deduct in real-time. Rice & Meat start at ₦500/scoop, and Sweet Fried Plantain Dodo is ₦100 per piece!",
      image: "/images/student_guide.jpg",
      bullets: [
        "🔥 Live portions counter shows exact scoops left in cafeteria pots",
        "🍌 Plantain Dodo available at ₦100 per piece",
        "🔍 Search Jollof, Chicken, Egusi, Swallow, or cold Zobo drinks instantly"
      ]
    },
    {
      id: 'step-plate',
      targetId: 'catalog-section',
      title: "2. Takeout Plates & 5-Scoop Rule",
      badge: "Smart Packaging",
      color: "from-brand-lemon to-lime-500",
      description: "To keep food fresh, 1 Takeout Plate holds a maximum of 5 scoops of rice. Select your desired container size: Small (₦100), Medium (₦200), or Large (₦300).",
      image: "/images/jollof_rice.png",
      bullets: [
        "🍱 Automatic multi-plate organizer splits rice into 5-scoop plates",
        "💰 Choose Small (₦100), Medium (₦200), or Large (₦300) takeout packs",
        "🛒 Easily adjust item quantities per plate"
      ]
    },
    {
      id: 'step-fulfillment',
      targetId: 'catalog-section',
      title: "3. Cafeteria Pickup or Campus Hostel Delivery",
      badge: "Topfaith Hostels",
      color: "from-sky-400 to-blue-600",
      description: "Choose between quick Cafeteria Pickup or doorstep delivery to any of the 4 Topfaith University hostels (+₦500 delivery fee).",
      image: "/images/amala_ewedu.png",
      bullets: [
        "🏫 Official Hostels: Clock Hall, Thomas Abraham Hall, Psalm One Hall & Maryam Abraham Hall",
        "🚪 Specify your room number for direct room delivery",
        "📱 Provide your WhatsApp number so delivery staff can contact you"
      ]
    },
    {
      id: 'step-pickup-code',
      targetId: 'hero-section',
      title: "4. Secret 3-Digit Pickup Code & WhatsApp Receipt",
      badge: "Secure Verification",
      color: "from-amber-400 to-orange-500",
      description: "Every order generates a unique, secret 3-digit code (e.g. #582). Forward your bank transfer payment proof to vendor staff via WhatsApp with 1 tap!",
      image: "/images/student_guide.jpg",
      bullets: [
        "🔑 Secret 3-digit code prevents anyone else from claiming your meal",
        "💬 Direct 1-tap WhatsApp forwarding to vendor staff (Isaac)",
        "💳 Bank transfer details provided with 1-click copy account number"
      ]
    },
    {
      id: 'step-receipt',
      targetId: 'catalog-section',
      title: "5. Payment Confirmation & Official E-Receipt",
      badge: "Receipt Verification",
      color: "from-emerald-400 to-green-600",
      description: "New receipts show 'UNVERIFIED PAYMENT' until staff verifies bank transfer. Once approved, your receipt upgrades to 'PAID & VERIFIED' for instant meal pickup or print out.",
      image: "/images/compay logo.jpeg",
      bullets: [
        "⚠️ Unverified watermark prevents fake payment claims",
        "✅ Real-time badge upgrade when staff approves bank transfer",
        "🖨️ Download or print official receipt anytime from 'My Orders'"
      ]
    }
  ];

  const adminSteps = [
    {
      id: 'admin-stock',
      targetId: 'admin-panel',
      title: "1. Staff Live Stock & Inventory Control",
      badge: "Staff Controls",
      color: "from-brand-lemon to-emerald-500",
      description: "Kitchen staff can adjust remaining scoops or toggle items 'Out of Stock' with 1 tap during busy cafeteria hours. Stock updates instantly for all students.",
      image: "/images/admin_guide.jpg",
      bullets: [
        "⚡ 1-Tap Available / Out of Stock toggle switches",
        "🍲 Edit portion quantities live as new batches are cooked",
        "➕ Add new dishes or drinks to the menu in seconds"
      ]
    },
    {
      id: 'admin-verification',
      targetId: 'admin-panel',
      title: "2. Payment Verification & Order Queue",
      badge: "Bank Transfer Verification",
      color: "from-amber-500 to-orange-600",
      description: "View incoming student orders in real time. Verify bank transfer receipts sent via WhatsApp and tap 'Confirm Payment & Cook' to validate order receipts.",
      image: "/images/admin_guide.jpg",
      bullets: [
        "✅ Tap 'Confirm Payment' to convert student receipt from Draft to PAID",
        "📱 Direct 'WhatsApp Student' button to contact student instantly",
        "🚚 Clear hostel room badges for doorstep delivery orders"
      ]
    },
    {
      id: 'admin-settings',
      targetId: 'admin-panel',
      title: "3. Vendor Bank Settings & Receipt Printing",
      badge: "Store Management",
      color: "from-purple-500 to-indigo-600",
      description: "Update vendor bank account details (Moniepoint/OPay), WhatsApp staff name/number, and print hardcopy receipts for cafeteria accounting.",
      image: "/images/admin_guide.jpg",
      bullets: [
        "💳 Set active bank account name and account number",
        "🖨️ Print official e-receipts for cafeteria record-keeping",
        "🔒 Secure staff PIN authentication"
      ]
    }
  ];

  const steps = roleMode === 'student' ? studentSteps : adminSteps;

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, steps.length]);

  // Scroll target element into view when step changes
  useEffect(() => {
    if (!isOpen) return;
    const activeStepObj = steps[currentStep];
    if (activeStepObj?.targetId) {
      const el = document.getElementById(activeStepObj.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isOpen, roleMode]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const activeStep = steps[currentStep] || steps[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Background Focus Spotlight Overlay */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white backdrop-blur-2xl transition-all duration-300">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-lemon flex items-center justify-center shadow-orange-glow">
              <HelpCircle className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                How to Use B'feastas <Sparkles className="w-4 h-4 text-brand-lemon-glow animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-400">Interactive Visual Tour & App Guide</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                isPlaying
                  ? 'bg-brand-orange/20 border-brand-orange text-brand-orange-glow'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isPlaying ? "Pause Auto-Tour" : "Play Auto-Tour"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Switcher Tabs (Student vs Vendor Staff) */}
        <div className="bg-slate-950/60 p-2 border-b border-slate-800 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setRoleMode('student');
              setCurrentStep(0);
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
              roleMode === 'student'
                ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-orange-glow scale-[1.02]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>🎓 Student Ordering Guide</span>
          </button>

          <button
            onClick={() => {
              setRoleMode('admin');
              setCurrentStep(0);
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
              roleMode === 'admin'
                ? 'bg-gradient-to-r from-brand-lemon to-emerald-500 text-slate-950 shadow-lemon-glow scale-[1.02]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🛡️ Staff & Admin Guide</span>
          </button>
        </div>

        {/* Active Step Progress Indicators */}
        <div className="px-6 pt-4 flex items-center justify-center space-x-1.5">
          {steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === idx
                  ? 'w-8 bg-brand-orange shadow-orange-glow'
                  : idx < currentStep
                  ? 'w-3 bg-brand-lemon/60'
                  : 'w-3 bg-slate-800'
              }`}
              title={st.title}
            />
          ))}
        </div>

        {/* Animated Step Body Card */}
        <div className="p-6 space-y-5 animate-in fade-in duration-300">
          
          {/* Header Badge & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className={`inline-block px-3 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-full bg-gradient-to-r ${activeStep.color} text-slate-950 mb-1`}>
                {activeStep.badge}
              </span>
              <h4 className="text-xl font-black text-white tracking-tight">
                {activeStep.title}
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Screenshot / Mockup Preview Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 group shadow-2xl">
            <img
              src={activeStep.image}
              alt={activeStep.title}
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl backdrop-blur-md">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Key Bullet Features */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h5 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Key Feature Highlights:
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
              {activeStep.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-lemon-glow shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Use <strong className="text-white font-mono">←</strong> <strong className="text-white font-mono">→</strong> keys to navigate
          </span>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-extrabold text-xs shadow-orange-glow transition-all flex items-center gap-1 hover:scale-105"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish Guide' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

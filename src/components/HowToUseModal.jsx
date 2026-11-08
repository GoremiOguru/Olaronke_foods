import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles, UtensilsCrossed, ShieldCheck, Flame, Package, MapPin, Key, Printer, Phone, CheckCircle2, Play, Pause, Eye, ArrowRight, Zap, MousePointer, Bug } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function HowToUseModal({ isOpen, onClose, mode = 'student' }) {
  const { setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Sync mode on open
  useEffect(() => {
    setCurrentStep(0);
  }, [mode, isOpen]);

  const studentSteps = [
    {
      id: 'step-menu',
      targetId: 'catalog-section',
      title: "1. Live Kitchen Menu & Stock Countdown",
      badge: "Live Kitchen Stock",
      color: "from-brand-orange to-amber-500",
      description: "Browse authentic Nigerian meals updated in real time directly from cafeteria pots. Scoop counters auto-deduct live across all student phones as dishes are ordered.",
      image: "/images/student_guide.jpg",
      actionText: "Explore Menu Catalog",
      bullets: [
        "Portion counters count down live (e.g. '14 scoops left')",
        "Clear pricing per scoop, portion, or bottle",
        "Common Confusion: If a food shows '0 left' or is grayed out, the kitchen pot has finished for the day and cannot be ordered"
      ],
      action: () => {
        onClose();
        const el = document.getElementById('catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'step-plate',
      targetId: 'catalog-section',
      title: "2. Takeout Packs & Multi-Plate Arranger",
      badge: "Smart Packaging",
      color: "from-brand-lemon to-lime-500",
      description: "Keep your meals organized! One Takeout Pack holds up to 5 scoops of rice. Select your pack size: Small (₦100), Medium (₦200), or Large (₦300).",
      image: "/images/jollof_rice.png",
      actionText: "Open Order Tray",
      bullets: [
        "Max 5 scoops per plate: Extra scoops automatically spill into Plate #2 or #3",
        "Choose container size: Small (₦100), Medium (₦200), or Large (₦300)",
        "Common Confusion: Takeout fee only applies if you select a plastic container; counter dining can opt out"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-fulfillment',
      targetId: 'catalog-section',
      title: "3. Cafeteria Pickup or Doorstep Delivery",
      badge: "Pickup & Hostels",
      color: "from-sky-400 to-blue-600",
      description: "Choose between FREE Cafeteria Pickup at the counter or fast doorstep delivery across campus.",
      image: "/images/amala_ewedu.png",
      actionText: "Select Delivery Location",
      bullets: [
        "🥡 Cafeteria Counter Pickup: 100% FREE with fast lane handover",
        "🏫 4 Hostels (₦500): Clock Hall, Thomas Abraham Hall, Psalm One Hall, Maria Abraham Hall (room number required)",
        "🏢 Faculty Buildings (₦700): Mass Communication & Engineering Faculty",
        "Common Confusion: Faculty delivery is strictly at the Ground Floor Main Entrance lobby—riders do not enter lecture halls or offices"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-preorder',
      targetId: 'catalog-section',
      title: "4. Beat the Rush: Schedule Morning Pre-Orders",
      badge: "Scheduled Pre-Orders",
      color: "from-amber-400 to-orange-500",
      description: "Order during morning lectures before the rush hour begins! Choose your scheduled pickup slot (12:30 PM, 1:15 PM, 2:00 PM, or 5:30 PM) so kitchen staff prep your takeout plate in advance.",
      image: "/images/student_guide.jpg",
      actionText: "Open Cart & Select Time Slot",
      bullets: [
        "Pick your exact break time during checkout",
        "Skip the 20-minute peak lunch queue at the counter",
        "Common Confusion: If lecture times change, send Mrs. Olaronke a WhatsApp message immediately to adjust your preparation time"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-pickup-code',
      targetId: 'hero-section',
      title: "5. Secret Pickup Code (#GEN-001) & E-Receipt",
      badge: "Secure Handover",
      color: "from-emerald-400 to-green-600",
      description: "Every order gets a sequential code like #GEN-005. Show or say this code at the counter for instant food collection in under 2 seconds.",
      image: "/images/compay logo.jpeg",
      actionText: "View How to Collect",
      bullets: [
        "Sequential code (e.g. #GEN-012) guarantees zero duplicate tickets",
        "Forward payment screenshot to cafeteria staff via WhatsApp with 1 tap",
        "Common Confusion: Receipts show UNVERIFIED until staff confirms your bank transfer, then updates to PAID & VERIFIED automatically"
      ],
      action: () => {
        onClose();
        const el = document.getElementById('hero-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'step-offline',
      targetId: 'catalog-section',
      title: "6. No Internet? Order Saves Offline on Your Phone",
      badge: "100% Offline Ready",
      color: "from-teal-400 to-emerald-600",
      description: "If campus Wi-Fi or cellular network drops, your order and secret pickup code are saved safely on your phone with an offline pass.",
      image: "/images/student_guide.jpg",
      actionText: "Learn Offline Ordering",
      bullets: [
        "Order is safely stored on your device storage even with zero internet",
        "Show your offline code at the counter to claim your food",
        "Common Confusion: Your order will sync automatically to the kitchen the instant your phone catches any network connection"
      ],
      action: () => {
        onClose();
      }
    }
  ];

  const adminSteps = [
    {
      id: 'admin-kds',
      targetId: 'admin-panel',
      title: "1. Kitchen KDS Tablet View & Strobe Alerts",
      badge: "Touchscreen KDS",
      color: "from-brand-orange to-amber-600",
      description: "Launch the full-screen Kitchen Display System (KDS) on wall tablets or kitchen TVs. Cards organize automatically into 3 columns: Awaiting Payment, Cooking & Packing, and Ready for Pickup.",
      image: "/images/admin_guide.jpg",
      actionText: "Launch KDS Tablet View",
      bullets: [
        "🚨 Visual Screen-Flash Strobe: Flashes neon amber for 5 seconds when new orders arrive so cooks never miss tickets in noisy kitchens",
        "1-Second Quick Dispense: Type customer code (e.g. '005' or 'GEN-005') in the top search bar and tap 'Dispense & Hand Over ✓'",
        "Common Confusion: Tap 'Verify Payment & Cook' only after confirming the student's bank transfer alert"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-walkin',
      targetId: 'admin-panel',
      title: "2. Counter Walk-in POS Sales (100% Offline)",
      badge: "Register & POS",
      color: "from-emerald-500 to-teal-600",
      description: "Record sales for walk-in customers paying Cash, POS, or Transfer right at the counter. Works fully offline without an internet connection!",
      image: "/images/admin_guide.jpg",
      actionText: "Open Walk-in Register",
      bullets: [
        "Tap dishes to add portions and choose payment method (Cash, Transfer, or POS)",
        "Optional Takeout Pack checkbox (+₦300) auto-calculates total",
        "Instant thermal receipt generation matching Benefeastas Nig Enterprise paper slips",
        "Common Confusion: If the counter has no internet, sales save locally and sync automatically to the cloud when connected"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-delete-edit',
      targetId: 'admin-panel',
      title: "3. Deleting Meals vs. Marking Sold Out",
      badge: "Menu Management",
      color: "from-rose-500 to-amber-500",
      description: "Maintain your live menu cleanly with separate controls for temporary sold-out dishes vs. permanently deleted items.",
      image: "/images/admin_guide.jpg",
      actionText: "Manage Menu Dishes",
      bullets: [
        "🟡 Marking Sold Out: Toggle the green switch to Gray or set scoops to 0 when today's pot finishes. The meal stays in the catalog for tomorrow!",
        "🔴 Deleting Meals: Click the red Trash icon on any dish card and confirm to permanently remove it from the menu",
        "✏️ Editing Food: Click the pencil icon to update title, price, scoops left, or photo"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-upload',
      targetId: 'admin-panel',
      title: "4. Uploading New Meals & Photos (Offline Supported)",
      badge: "Add New Food",
      color: "from-brand-lemon to-emerald-500",
      description: "Add new foods to the B'feastas catalog directly from your phone or laptop. Supports uploading photos directly from your device camera or gallery even while offline!",
      image: "/images/admin_guide.jpg",
      actionText: "Add New Food Tab",
      bullets: [
        "Enter name, price, initial stock, and select unit type (scoop, bottle, portion, wrap)",
        "📁 Upload Photo: Photos are compressed directly on your device without needing internet",
        "Common Confusion: You can publish new food while offline—it saves locally and updates all student screens once online"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-quick-handover',
      targetId: 'admin-panel',
      title: "5. 1-Second Counter Lookup & Thermal Printing",
      badge: "Speed of Service",
      color: "from-sky-400 to-blue-600",
      description: "Dispense meals in 1 second during peak rush hours using the Quick-Code lookup box at the top of the Orders tab.",
      image: "/images/admin_guide.jpg",
      actionText: "View Quick Handover",
      bullets: [
        "Type code (e.g. '001', '5', or 'GEN-005') to immediately pop up the customer's ticket",
        "Single-tap 'Mark Handed Over' completes the order and removes it from the active kitchen queue",
        "Click the Receipt icon next to any order to print a clean minimalist thermal paper slip with barcode"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-summary',
      targetId: 'admin-panel',
      title: "6. Daily Cashflow Summary & WhatsApp Broadcast",
      badge: "Financial Report",
      color: "from-emerald-500 to-teal-600",
      description: "At closing time, click 'Cashflow Summary' to calculate total daily revenue, cash vs. transfer totals, takeout fees, and delivery earnings.",
      image: "/images/admin_guide.jpg",
      actionText: "Generate Daily WhatsApp Report",
      bullets: [
        "Auto-calculates total daily revenue & verified order count",
        "Separates packaging container fees and hostel delivery fees",
        "1-Click WhatsApp report delivery directly to Cafeteria Owner"
      ],
      action: () => {
        onClose();
      }
    }
  ];

  // Only actual admins can see staff mode; verified students always get student guide
  const isStaffMode = Boolean(isAdmin) && mode === 'admin';
  const steps = isStaffMode ? adminSteps : studentSteps;

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
  }, [currentStep, isOpen, steps]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const activeStep = steps[currentStep] || steps[0];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      
      {/* Background Focus Spotlight Overlay Container */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white backdrop-blur-2xl transition-all duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              isStaffMode ? 'bg-gradient-to-tr from-brand-lemon to-emerald-500 text-slate-950 shadow-lemon-glow' : 'bg-gradient-to-tr from-brand-orange to-brand-lemon text-slate-950 shadow-orange-glow'
            }`}>
              {isStaffMode ? <ShieldCheck className="w-5 h-5 stroke-[2.5]" /> : <HelpCircle className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>{isStaffMode ? "Staff Kitchen Guide" : "Student Ordering Guide"}</span>
                <Sparkles className="w-4 h-4 text-brand-lemon-glow animate-pulse" />
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Interactive Guided Tour & App Assist</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                isPlaying
                  ? 'bg-brand-orange/20 border-brand-orange text-brand-orange-glow'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isPlaying ? "Pause Auto-Tour" : "Play Auto-Tour"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            {/* High-visibility Close Exit Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95"
              title="Close Guide"
            >
              <X className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in duration-300 flex-1 overflow-y-auto">
          
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
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
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

            {/* Interactive Try Feature Button */}
            {activeStep.action && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={activeStep.action}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <MousePointer className="w-4 h-4" />
                  <span>{activeStep.actionText || 'Try This Feature Now'}</span>
                </button>
              </div>
            )}

            {/* Tech Support / Bug Report Banner */}
            <div className="pt-2">
              <a
                href="https://wa.me/2348057357728?text=Hello%20Tech%20Support,%20I'm%20experiencing%20an%20issue/bug%20on%20the%20B'feastas%20website:"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 text-xs transition-all hover:bg-slate-800 group"
              >
                <div className="flex items-center space-x-2">
                  <Bug className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 font-medium">Noticed a bug or website issue?</span>
                </div>
                <span className="font-extrabold text-rose-400 group-hover:underline flex items-center gap-1">
                  Message Tech Support <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-xs border border-slate-800 hover:border-rose-800/60 transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Guide</span>
          </button>

          <button
            onClick={currentStep === steps.length - 1 ? onClose : handleNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-extrabold text-xs shadow-orange-glow transition-all flex items-center gap-1 hover:scale-105"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish & Exit' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

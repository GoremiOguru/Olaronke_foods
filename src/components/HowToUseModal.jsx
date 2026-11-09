import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles, UtensilsCrossed, ShieldCheck, Flame, Package, MapPin, Key, Printer, Phone, CheckCircle2, Eye, ArrowRight, Zap, MousePointer, Bug } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { lockScroll, unlockScroll, forceUnlockScroll } from '../utils/scrollLock';

export default function HowToUseModal({ isOpen, onClose, mode = 'student' }) {
  const { setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Disable background scrolling safely without getting stuck on hidden
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    unlockScroll();
    if (typeof onClose === 'function') onClose();
  };

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
      image: "/images/guide/student_menu_stock.svg",
      actionText: "Explore Menu Catalog",
      bullets: [
        "Portion counters count down live (e.g. '14 scoops left')",
        "Clear pricing per scoop, portion, or bottle",
        "Common Confusion: If a food shows '0 left' or is grayed out, the kitchen pot has finished for the day and cannot be ordered"
      ],
      action: () => {
        handleClose();
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
      image: "/images/guide/student_takeout_packs.svg",
      actionText: "Open Order Tray",
      bullets: [
        "Max 5 scoops per plate: Extra scoops automatically spill into Plate #2 or #3",
        "Choose container size: Small (₦100), Medium (₦200), or Large (₦300)",
        "Common Confusion: Takeout fee only applies if you select a plastic container; counter dining can opt out"
      ],
      action: () => {
        handleClose();
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
      image: "/images/guide/student_delivery_options.svg",
      actionText: "Select Delivery Location",
      bullets: [
        "🥡 Cafeteria Counter Pickup: 100% FREE with fast lane handover",
        "🏫 4 Hostels (₦500): Clock Hall, Thomas Abraham Hall, Psalm One Hall, Maria Abraham Hall (₦400 when ordering 2+ plates!)",
        "🏢 Faculty Buildings (₦700): Mass Communication & Engineering Faculty (₦600 when ordering 2+ plates!)",
        "🎁 Multi-Plate Discount: Get ₦100 off delivery automatically whenever you order 2 or more plates of food!",
        "Common Confusion: Faculty delivery is strictly at the Ground Floor Main Entrance lobby—riders do not enter lecture halls or offices"
      ],
      action: () => {
        handleClose();
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
      image: "/images/guide/student_preorder_time.svg",
      actionText: "Open Cart & Select Time Slot",
      bullets: [
        "Pick your exact break time during checkout",
        "Skip the 20-minute peak lunch queue at the counter",
        "Common Confusion: If lecture times change, message Isaac on WhatsApp immediately to adjust your preparation time"
      ],
      action: () => {
        handleClose();
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
      image: "/images/guide/student_pickup_code.svg",
      actionText: "View How to Collect",
      bullets: [
        "Sequential code (e.g. #GEN-012) guarantees zero duplicate tickets",
        "Forward payment screenshot to cafeteria staff via WhatsApp with 1 tap",
        "Common Confusion: Receipts show UNVERIFIED until staff confirms your bank transfer, then updates to PAID & VERIFIED automatically"
      ],
      action: () => {
        handleClose();
        const el = document.getElementById('hero-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'step-order-tracker',
      targetId: 'hero-section',
      title: "6. Track Live Order Progress in 'My Orders'",
      badge: "Live Progress Tracker",
      color: "from-amber-500 to-emerald-500",
      description: "Watch your meal cooking stages live on your phone! Click 'My Orders' in the menu bar to see your visual 4-step progress tracker.",
      image: "/images/guide/student_order_tracker.svg",
      actionText: "Open My Orders Tracker",
      bullets: [
        "4-Step Live Stages: See instantly when your order is Placed ➔ Cooking in Kitchen ➔ Ready for Pickup / Out for Delivery ➔ Completed",
        "Instant Receipt Unlock: As soon as staff verifies your payment and starts cooking, your official printable receipt unlocks with a verified stamp",
        "Phone Lock-Screen Alerts: If you close the app or switch to WhatsApp, a notification pops up on your device screen the moment your food is ready!"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'step-offline',
      targetId: 'catalog-section',
      title: "7. No Internet? Order Saves Offline on Your Phone",
      badge: "100% Offline Ready",
      color: "from-teal-400 to-emerald-600",
      description: "If campus Wi-Fi or cellular network drops, your order and secret pickup code are saved safely on your phone with an offline pass.",
      image: "/images/guide/student_offline_save.svg",
      actionText: "Learn Offline Ordering",
      bullets: [
        "Order is safely stored on your device storage even with zero internet",
        "Show your offline code at the counter to claim your food",
        "Common Confusion: Your order will sync automatically to the kitchen the instant your phone catches any network connection"
      ],
      action: () => {
        handleClose();
      }
    }
  ];

  const adminSteps = [
    {
      id: 'admin-orders',
      targetId: 'admin-panel',
      title: "1. Order Queue & Real-Time Status Management",
      badge: "Live Orders",
      color: "from-brand-orange to-amber-600",
      description: "Manage incoming student orders and counter sales. Updating order status promptly is essential because students watch their phones in real time!",
      image: "/images/guide/staff_status_management.svg",
      actionText: "Go to Student Orders",
      bullets: [
        "Why Status Updates Are Crucial: Students actively watch their live 4-step progress bar on their phones. Updating to 'Preparing' informs them payment was received and cooking has begun!",
        "Receipt Unlocking: Advancing an order to 'Preparing' or 'Ready' automatically unlocks verified printable receipts on the student's device",
        "Status Flow: Advance sequentially: Verify Payment ➔ Preparing & Cooking ➔ Ready for Pickup / Out for Delivery ➔ Completed",
        "1-Second Quick Dispense: Type customer code (e.g. '005' or 'GEN-005') in the top search bar to instantly find and dispense orders"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'admin-walkin',
      targetId: 'admin-panel',
      title: "2. Counter Walk-in POS Sales (100% Offline)",
      badge: "Register & POS",
      color: "from-emerald-500 to-teal-600",
      description: "Record sales for walk-in customers paying Cash, POS, or Transfer right at the counter. Works fully offline without an internet connection!",
      image: "/images/guide/staff_walkin_pos.svg",
      actionText: "Open Walk-in Register",
      bullets: [
        "Tap dishes to add portions and choose payment method (Cash, Transfer, or POS)",
        "Optional Takeout Pack checkbox (+₦300) auto-calculates total",
        "Instant thermal receipt generation matching Benefeastas Nig Enterprise paper slips",
        "Offline Safe: Offline sales remain clearly listed alongside online student orders and sync automatically once internet connects"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'admin-delete-edit',
      targetId: 'admin-panel',
      title: "3. Deleting Meals vs. Marking Sold Out",
      badge: "Menu Management",
      color: "from-rose-500 to-amber-500",
      description: "Maintain your live menu cleanly with separate controls for temporary sold-out dishes vs. permanently deleted items.",
      image: "/images/guide/staff_menu_delete_soldout.svg",
      actionText: "Manage Menu Dishes",
      bullets: [
        "🟡 Marking Sold Out: Toggle the green switch to Gray or set scoops to 0 when today's pot finishes. The meal stays in the catalog for tomorrow!",
        "🔴 Deleting Meals: Click the red Trash icon on any dish card and confirm to permanently remove it from the menu",
        "✏️ Editing Food: Click the pencil icon to update title, price, scoops left, or photo"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'admin-upload',
      targetId: 'admin-panel',
      title: "4. Uploading New Meals & Photos (Offline Supported)",
      badge: "Add New Food",
      color: "from-brand-lemon to-emerald-500",
      description: "Add new foods to the B'feastas catalog directly from your phone or laptop. Supports uploading photos directly from your device camera or gallery even while offline!",
      image: "/images/guide/staff_upload_food.svg",
      actionText: "Add New Food Tab",
      bullets: [
        "Enter name, price, initial stock, and select unit type (scoop, bottle, portion, wrap)",
        "📁 Upload Photo: Photos are compressed directly on your device without needing internet",
        "Common Confusion: You can publish new food while offline—it saves locally and updates all student screens once online"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'admin-quick-handover',
      targetId: 'admin-panel',
      title: "5. 1-Second Counter Lookup & Fast Handover",
      badge: "Speed of Service",
      color: "from-sky-400 to-blue-600",
      description: "Dispense meals in 1 second during peak rush hours using the Quick-Code lookup box at the top of the Orders tab.",
      image: "/images/guide/staff_quick_handover.svg",
      actionText: "View Quick Handover",
      bullets: [
        "Type code (e.g. '001', '5', or 'GEN-005') to immediately pop up the customer's ticket",
        "Single-tap 'Mark Handed Over' completes the order and removes it from the active kitchen queue without any page freeze",
        "Click the Receipt icon next to any order to print a clean minimalist thermal paper slip with barcode"
      ],
      action: () => {
        handleClose();
      }
    },
    {
      id: 'admin-summary',
      targetId: 'admin-panel',
      title: "6. Daily Cashflow Summary & WhatsApp Broadcast",
      badge: "Financial Report",
      color: "from-emerald-500 to-teal-600",
      description: "At closing time, click 'Cashflow Summary' to calculate total daily revenue, physical vs. online totals, takeout fees, and delivery earnings.",
      image: "/images/guide/staff_cashflow_summary.svg",
      actionText: "Generate Daily WhatsApp Report",
      bullets: [
        "Auto-calculates total daily revenue & verified order count",
        "Clearly separates Physical (Cash & POS) from Online (Transfers)",
        "1-Click WhatsApp report delivery directly to Mrs. Olaronke"
      ],
      action: () => {
        handleClose();
      }
    }
  ];

  const steps = mode === 'admin' ? adminSteps : studentSteps;
  const isStaffMode = mode === 'admin';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

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
      className="fixed inset-0 z-[70] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer"
      onClick={handleClose}
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
                <span>{isStaffMode ? "Staff Portal Guide" : "Student Ordering Guide"}</span>
                <Sparkles className="w-4 h-4 text-brand-lemon-glow animate-pulse" />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Interactive Guided Tour & App Assist</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between gap-1.5 bg-slate-950/40 shrink-0">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className="flex-1 group py-1"
            >
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-brand-orange to-brand-lemon shadow-lemon-glow'
                  : idx < currentStep
                  ? 'bg-slate-600 group-hover:bg-slate-500'
                  : 'bg-slate-800 group-hover:bg-slate-700'
              }`} />
            </button>
          ))}
        </div>

        {/* Dynamic Card Content Area */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in duration-300 flex-1 overflow-y-auto">
          
          {/* Step Badge & Step Index */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${activeStep.color} text-slate-950 shadow-md`}>
                {activeStep.badge}
              </span>
              <h4 className="text-xl font-black text-white tracking-tight">
                {activeStep.title}
              </h4>
            </div>
            <span className="text-sm font-bold text-slate-200 font-mono">
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
            
            <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-slate-950/95 border border-slate-800 rounded-xl backdrop-blur-md">
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Key Bullet Features */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Key Feature Highlights:
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
              {activeStep.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-lemon-glow shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Interactive Try Feature Button */}
            {activeStep.action && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Want to test this feature right now?</span>
                <button
                  onClick={activeStep.action}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-brand-orange hover:bg-orange-600 text-white transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>{activeStep.actionText || "Try Feature"}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 flex items-center justify-between border-t border-slate-800 shrink-0">
          <button
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs transition-all flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Use arrow keys &larr; &rarr; to navigate
          </span>

          <div className="flex items-center space-x-2">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-lemon to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs transition-all shadow-lemon-glow flex items-center space-x-1"
              >
                <span>Got It, Let's Eat!</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-xs transition-all shadow-orange-glow flex items-center space-x-1"
              >
                <span>Next Feature</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

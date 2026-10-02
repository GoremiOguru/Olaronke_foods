import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Sparkles, UtensilsCrossed, ShieldCheck, Flame, Package, MapPin, Key, Printer, Phone, CheckCircle2, Play, Pause, Eye, ArrowRight, Zap, MousePointer, Bug } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function HowToUseModal({ isOpen, onClose, mode = 'student' }) {
  const { setIsCartOpen } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync mode on open
  useEffect(() => {
    setCurrentStep(0);
  }, [mode, isOpen]);

  const studentSteps = [
    {
      id: 'step-menu',
      targetId: 'catalog-section',
      title: "1. Live Kitchen Menu & Stock Countdown",
      badge: "Real-Time Inventory",
      color: "from-brand-orange to-amber-500",
      description: "Browse authentic Nigerian meals updated live from cafeteria pots. Scoop counters auto-deduct in real-time across student screens. Smoky Jollof starts at ₦500/scoop, and Sweet Fried Plantain Dodo is ₦100 per piece!",
      image: "/images/student_guide.jpg",
      actionText: "Explore Menu Catalog",
      bullets: [
        "Portion counters deduct live in real-time as meals are ordered",
        "Sweet Fried Plantain Dodo available at ₦100 per piece",
        "Chilled bottle drinks (Coke 50cl ₦600, Viju Milk ₦500, Zobo ₦500)"
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
      title: "2. Takeout Packs & Portion Capacity",
      badge: "Smart Packaging",
      color: "from-brand-lemon to-lime-500",
      description: "To keep food organized, 1 Takeout Pack holds up to 5 scoops of rice. Select your desired container size: Small (₦100), Medium (₦200), or Large (₦300).",
      image: "/images/jollof_rice.png",
      actionText: "Open Order Tray",
      bullets: [
        "Automatic multi-pack organizer splits rice into 5-scoop portions",
        "Choose Small (₦100), Medium (₦200), or Large (₦300) takeout packs",
        "Adjust item quantities per portion easily"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-fulfillment',
      targetId: 'catalog-section',
      title: "3. Cafeteria Pickup or Hostel Delivery",
      badge: "Topfaith Hostels",
      color: "from-sky-400 to-blue-600",
      description: "Choose between quick Cafeteria Pickup or doorstep delivery to any of the 4 Topfaith University hostels (+₦500 delivery fee).",
      image: "/images/amala_ewedu.png",
      actionText: "Select Delivery Location",
      bullets: [
        "4 Hostels: Clock Hall, Thomas Abraham Hall, Psalm One Hall & Maryam Abraham Hall",
        "Specify your room number for direct room delivery",
        "Provide your WhatsApp number so delivery staff can reach you"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-pickup-code',
      targetId: 'hero-section',
      title: "4. Secret Pickup Code & WhatsApp Confirmation",
      badge: "Secure Verification",
      color: "from-amber-400 to-orange-500",
      description: "Every order generates a unique secret pickup code. Forward your bank transfer payment proof to cafeteria staff via WhatsApp with one tap.",
      image: "/images/student_guide.jpg",
      actionText: "View WhatsApp Confirmation",
      bullets: [
        "Secret pickup code prevents unauthorized collection of your meal",
        "Direct one-tap WhatsApp forwarding to cafeteria staff",
        "Copy bank account details with one tap"
      ],
      action: () => {
        onClose();
        const el = document.getElementById('hero-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'step-preorder',
      targetId: 'catalog-section',
      title: "4. Off-Peak Pre-Orders & Time Slots",
      badge: "Pre-Order Scheduled",
      color: "from-brand-orange to-amber-500",
      description: "Pre-order your lunch during morning lectures! Select your preferred time slot (e.g. 12:30 PM Lunch Break, 1:15 PM Afternoon, or 2:00 PM Post-Lecture) so kitchen staff prep your takeout plate in advance.",
      image: "/images/student_guide.jpg",
      actionText: "Open Cart & Select Time Slot",
      bullets: [
        "Select preferred lunch pickup time during checkout",
        "Avoid lunch rush queues by scheduling meals in advance",
        "Add 1-tap Cold Zobo (+₦500) or Sweet Dodo (+₦200) upsells"
      ],
      action: () => {
        onClose();
        setIsCartOpen(true);
      }
    },
    {
      id: 'step-receipt',
      targetId: 'catalog-section',
      title: "5. Payment Confirmation & E-Receipt",
      badge: "Receipt Verification",
      color: "from-emerald-400 to-green-600",
      description: "New receipts display UNVERIFIED PAYMENT until staff verifies the bank transfer. Once approved, your receipt updates to PAID & VERIFIED for meal pickup.",
      image: "/images/compay logo.jpeg",
      actionText: "View Sample Receipt",
      bullets: [
        "Unverified watermark protects against unconfirmed payments",
        "Real-time status updates when staff confirms bank transfer",
        "Download or print receipt anytime from My Orders"
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
      title: "1. Kitchen KDS Full-Screen Tablet View",
      badge: "Wall Tablet KDS",
      color: "from-brand-orange to-amber-600",
      description: "Launch the full-screen Kitchen Display System (KDS) on wall tablets or kitchen TVs. Cards organize automatically into 3 columns: Awaiting Payment, Cooking, and Ready.",
      image: "/images/admin_guide.jpg",
      actionText: "Launch KDS Tablet View",
      bullets: [
        "🔴 Awaiting Payment: 1-Tap 'Verify Payment & Cook'",
        "🟡 Cooking: 1-Tap 'Mark Packed & Ready'",
        "🟢 Ready: Large 3-digit pickup codes (#582) for counter staff"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-stock',
      targetId: 'admin-panel',
      title: "2. Portion & Stock Inventory Management",
      badge: "Kitchen Control",
      color: "from-brand-lemon to-emerald-500",
      description: "Kitchen staff can adjust remaining scoops or toggle items Out of Stock instantly during cafeteria hours. Stock updates live across all connected screens.",
      image: "/images/admin_guide.jpg",
      actionText: "View Inventory Controls",
      bullets: [
        "One-tap Available / Out of Stock toggle switches",
        "Edit portion quantities live as new batches are prepared",
        "Upload custom dish and beverage photos"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-qr',
      targetId: 'admin-panel',
      title: "3. Printable Cafeteria Table QR Cards",
      badge: "QR Tent Cards",
      color: "from-sky-400 to-blue-600",
      description: "Generate and print branded QR code tent cards for cafeteria tables and counter stands. Students scan with their phone cameras to order without app installs.",
      image: "/images/admin_guide.jpg",
      actionText: "Generate Table QR Cards",
      bullets: [
        "Print high-resolution QR tent cards for cafeteria tables",
        "Instant camera scanning opens live menu on student phones",
        "1-Click Copy QR scan link for WhatsApp broadcasting"
      ],
      action: () => {
        onClose();
      }
    },
    {
      id: 'admin-summary',
      targetId: 'admin-panel',
      title: "4. Daily Cashflow WhatsApp Summary",
      badge: "Financial Report",
      color: "from-emerald-500 to-teal-600",
      description: "At closing time, click 'Cashflow Summary' to auto-calculate total daily revenue, bank transfer totals, packaging fees, and delivery fees, and forward directly to the owner's WhatsApp.",
      image: "/images/admin_guide.jpg",
      actionText: "Generate Daily WhatsApp Report",
      bullets: [
        "Auto-calculates total daily revenue & verified order count",
        "Itemizes packaging container fees & hostel delivery earnings",
        "1-Click WhatsApp delivery to Cafeteria Owner"
      ],
      action: () => {
        onClose();
      }
    }
  ];

  const isStaffMode = mode === 'admin';
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

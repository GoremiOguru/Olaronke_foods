import React from 'react';
import { UtensilsCrossed, Zap, Clock, ShieldAlert, Sparkles, MessageCircle, CreditCard, HelpCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';

export default function Hero({ onExploreClick, onOpenHowToUse }) {
  const { dishes } = useSocket();
  const { settings } = useSettings();

  const totalStockAvailable = dishes.reduce((sum, d) => sum + (d.isAvailable ? d.scoopsLeft : 0), 0);
  const activeDishesCount = dishes.filter(d => d.isAvailable && d.scoopsLeft > 0).length;

  const phone = settings.whatsappNumber || '08133314798';
  const cleanPhone = phone.startsWith('0') ? `234${phone.slice(1)}` : phone;
  const rawStaffName = settings.whatsappName || 'Isaac';
  const staffName = (typeof rawStaffName === 'string' && !rawStaffName.trim().startsWith('{') && rawStaffName.length < 30)
    ? rawStaffName
    : 'Isaac';
  const accountName = settings.accountName || 'OLARONKE OGIDAN';
  const bankName = settings.bankName || 'MONIEPOINT';
  const accountNumber = settings.accountNumber || '8234786544';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-brand-bg py-6 sm:py-10 md:py-16 px-3 sm:px-6 lg:px-8 border-b border-slate-800">

      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-lemon/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* Headlines */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">

            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-brand-lemon/10 border border-brand-lemon/30 text-brand-lemon-glow text-[11px] sm:text-xs font-extrabold uppercase tracking-wide max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse shrink-0" />
              <span className="truncate">{settings.announcementText || 'Topfaith University Campus Dining'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {settings.heroTitle || (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-brand-lemon">B'feastas</span></>
              )}
            </h1>

            <p className="text-slate-300 text-xs sm:text-base lg:text-lg font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {settings.heroSubtitle || (
                <>Order Nigerian Jollof, Fried Rice & Peppered Meat at <span className="text-brand-orange font-bold">₦500/scoop</span>, Chicken portions at <span className="text-brand-lemon-glow font-bold">₦2,000 / ₦1,500 / ₦1,000</span>, add takeout packs, and forward your receipt to <strong className="text-white">{staffName} ({phone})</strong> on WhatsApp!</>
              )}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto lg:mx-0 pt-1 sm:pt-2">
              <div className="glass-card p-2 sm:p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-black text-brand-orange">{totalStockAvailable}</p>
                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">Portions Ready</p>
              </div>
              <div className="glass-card p-2 sm:p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-black text-brand-lemon-glow">{activeDishesCount}</p>
                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">Dishes Served</p>
              </div>
              <div className="glass-card p-2 sm:p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-black text-sky-400">Hostel</p>
                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-normal sm:tracking-wider leading-tight">Delivery Open</p>
              </div>
            </div>

            {/* CTA Buttons: Smart Responsive Grid for Small Screens */}
            <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-center lg:sm:justify-start sm:gap-3">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black px-6 py-3 sm:py-3.5 rounded-2xl shadow-orange-glow active:scale-95 transition-all text-xs sm:text-sm"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Explore Menu</span>
              </button>

              <div className="grid grid-cols-2 gap-2 sm:contents">
                <button
                  onClick={onOpenHowToUse}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl border border-slate-700 hover:border-slate-500 active:scale-95 transition-all text-xs sm:text-sm shadow-md"
                >
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-lemon-glow shrink-0" />
                  <span className="truncate">How to Order</span>
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${staffName}! I'm a Topfaith student inquiring about today's B'feastas menu.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 bg-brand-lemon hover:bg-lime-400 text-slate-950 font-black px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-lemon-glow active:scale-95 transition-all text-xs sm:text-sm border border-brand-lemon/30"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 shrink-0" />
                  <span className="truncate">WhatsApp {staffName}</span>
                </a>
              </div>
            </div>

          </div>

          {/* Visual Card */}
          <div className="lg:col-span-5 relative mt-4 sm:mt-6 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 group">
              <img
                src="/images/jollof_rice.png"
                alt="B'feastas Special Smoky Jollof Rice"
                className="w-full h-52 sm:h-80 lg:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-brand-orange text-white text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-200" />
                <span>₦500 / Scoop</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 glass-panel rounded-2xl border border-white/10 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-sm sm:text-lg">Smoky Firewood Jollof Rice</h3>
                  <span className="text-brand-orange font-black text-sm sm:text-lg">₦500 / scoop</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate">{bankName} Transfer: <strong>{accountName} ({accountNumber})</strong></p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <span className="text-[10px] sm:text-[11px] font-bold text-brand-lemon-glow flex items-center gap-1">
                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {bankName} Verified
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-brand-lemon-glow bg-brand-lemon/10 px-2 py-0.5 rounded border border-brand-lemon/30">
                    Hostel Delivery Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { UtensilsCrossed, Zap, Clock, ShieldAlert, Sparkles, MessageCircle, CreditCard } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Hero({ onExploreClick }) {
  const { dishes } = useSocket();

  const totalStockAvailable = dishes.reduce((sum, d) => sum + (d.isAvailable ? d.scoopsLeft : 0), 0);
  const activeDishesCount = dishes.filter(d => d.isAvailable && d.scoopsLeft > 0).length;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-brand-bg py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-lemon/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Headlines */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-lemon/10 border border-brand-lemon/30 text-brand-lemon-glow text-xs font-extrabold uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
              <span>Topfaith University Campus Dining</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-brand-lemon">B'feastas</span> <br className="hidden sm:inline" />
              Fresh Meals, Live Portion Sync!
            </h1>

            <p className="text-slate-300 text-base sm:text-lg font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Order Nigerian Jollof, Fried Rice & Peppered Meat at <span className="text-brand-orange font-bold">₦500/scoop</span>, Chicken portions at <span className="text-brand-lemon-glow font-bold">₦2,000 / ₦1,500 / ₦1,000</span>, add takeout packs, and forward your receipt to <strong className="text-white">Isaac (08133314798)</strong> on WhatsApp!
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 pt-2">
              <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl sm:text-2xl font-black text-brand-orange">{totalStockAvailable}</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Portions Ready</p>
              </div>
              <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl sm:text-2xl font-black text-brand-lemon-glow">{activeDishesCount}</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dishes Served</p>
              </div>
              <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl sm:text-2xl font-black text-sky-400">Hostel</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Delivery Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black px-8 py-4 rounded-2xl shadow-orange-glow hover:scale-105 transition-all text-base"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span>View B'feastas Menu</span>
              </button>

              <a
                href="https://wa.me/2348133314798?text=Hello%20Isaac!%20I'm%20a%20Topfaith%20student%20inquiring%20about%20today's%20B'feastas%20menu."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand-lemon hover:bg-lime-400 text-slate-950 font-black px-6 py-4 rounded-2xl shadow-lemon-glow transition-all text-base border border-brand-lemon/30"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>WhatsApp Isaac (08133314798)</span>
              </a>
            </div>

          </div>

          {/* Visual Card */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 group">
              <img
                src="/images/jollof_rice.png"
                alt="B'feastas Special Smoky Jollof Rice"
                className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <div className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>₦500 / Scoop</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 p-4 glass-panel rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-lg">Smoky Firewood Jollof Rice</h3>
                  <span className="text-brand-orange font-black text-lg">₦500 / scoop</span>
                </div>
                <p className="text-xs text-slate-300">Moniepoint Transfer: <strong>OLARONKE OGIDAN (8234786544)</strong></p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <span className="text-[11px] font-bold text-brand-lemon-glow flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Moniepoint Verified
                  </span>
                  <span className="text-[11px] font-extrabold text-brand-lemon-glow bg-brand-lemon/10 px-2 py-0.5 rounded border border-brand-lemon/30">
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

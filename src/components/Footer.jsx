import React from 'react';
import { UtensilsCrossed, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-lemon flex items-center justify-center text-slate-950">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xl text-white">
                B'<span className="text-brand-orange">fea</span><span className="text-brand-lemon">stas</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Topfaith University's official online gourmet food vendor. Real-time portion tracking, student email authentication, and instant WhatsApp receipt confirmation with Isaac.
            </p>
          </div>

          {/* Quick Info */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Campus Hours</h4>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-orange" /> Monday - Friday: 7:30 AM - 8:00 PM</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-orange" /> Saturdays: 9:00 AM - 6:00 PM</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-lemon" /> Cafeteria Wing B, Topfaith University</p>
          </div>

          {/* WhatsApp & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Vendor Contact</h4>
            <a
              href="https://wa.me/2348133314798"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-brand-lemon-glow hover:underline font-bold"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Isaac: 08133314798
            </a>
            <p>Student Domain: <span className="font-mono text-slate-300">@topfaith.edu.ng</span></p>
            <p>Moniepoint Transfer: <span className="font-bold text-white">OLARONKE OGIDAN (8234786544)</span></p>
          </div>

          {/* Security badge */}
          <div className="space-y-2 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-lemon-glow" /> Real-Time Kitchen Sync
            </h4>
            <p className="text-[11px] text-slate-400">
              Stock portion counters auto-deduct live across all connected student and staff screens.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} B'feastas. All rights reserved. Topfaith University Gourmet Campus Vendor.
        </div>
      </div>
    </footer>
  );
}

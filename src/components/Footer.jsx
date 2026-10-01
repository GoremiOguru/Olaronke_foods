import React from 'react';
import { UtensilsCrossed, MessageCircle, MapPin, Clock, ShieldCheck, HelpCircle, Bug } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer({ onOpenHowToUse }) {
  const { settings } = useSettings();

  const phone = settings.whatsappNumber || '08133314798';
  const cleanPhone = phone.startsWith('0') ? `234${phone.slice(1)}` : phone;
  const staffName = settings.whatsappName || 'Isaac';
  const accountName = settings.accountName || 'OLARONKE OGIDAN';
  const bankName = settings.bankName || 'MONIEPOINT';
  const accountNumber = settings.accountNumber || '8234786544';

  const techSupportPhone = '08057357728';
  const cleanTechPhone = '2348057357728';
  const techSupportUrl = `https://wa.me/${cleanTechPhone}?text=${encodeURIComponent("Hello Tech Support, I'm experiencing an issue/bug on the B'feastas website:")}`;

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <img
                src="/images/compay logo.jpeg"
                alt="B'feastas Logo"
                className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-md"
              />
              <span className="font-black text-xl text-white">
                B'<span className="text-brand-orange">fea</span><span className="text-brand-lemon">stas</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Topfaith University's official online gourmet food vendor. Real-time portion tracking, student email authentication, and instant WhatsApp receipt confirmation with {staffName}.
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
            <div>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-brand-lemon-glow hover:underline font-bold"
              >
                <MessageCircle className="w-4 h-4" /> Cafeteria WhatsApp ({staffName}): {phone}
              </a>
            </div>
            <div>
              <a
                href={techSupportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 font-extrabold hover:underline"
              >
                <Bug className="w-4 h-4 text-rose-500 animate-pulse" /> Report Bug / Tech Support: {techSupportPhone}
              </a>
            </div>
            <div className="pt-1">
              <button
                onClick={onOpenHowToUse}
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white font-extrabold bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>📖 Interactive App Guide</span>
              </button>
            </div>
            <p>Student Domain: <span className="font-mono text-slate-300">{settings.studentDomain || '@topfaith.edu.ng'}</span></p>
            <p>{bankName} Transfer: <span className="font-bold text-white">{accountName} ({accountNumber})</span></p>
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
          © {new Date().getFullYear()} B'feastas. All rights reserved. Topfaith University Gourmet Campus Vendor. Made by Goremi Oguru
        </div>
      </div>
    </footer>
  );
}

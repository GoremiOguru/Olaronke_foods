import React, { useState } from 'react';
import { Bug, MessageSquare, X, Wrench, ShieldAlert } from 'lucide-react';

export default function TechSupportFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const techSupportPhone = '08057357728';
  const cleanPhone = '2348057357728';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello Tech Support, I'm experiencing an issue/bug on the B'feastas website:")}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 w-72 text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Report a Bug / Issue</h4>
                <p className="text-[10px] text-slate-400">Technical Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Encountered a bug, display glitch, or payment system issue? Message Technical Support on WhatsApp.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95 mt-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Tech Support on WhatsApp</span>
            </a>

            <p className="text-[10px] text-slate-500 text-center pt-1 font-mono">
              WhatsApp Support: {techSupportPhone}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 text-slate-200 hover:text-white px-3.5 py-2 rounded-full shadow-2xl transition-all hover:scale-105 group"
          title="Report a Bug / Contact Tech Support"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <Bug className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold hidden sm:inline-block">Report Bug / Support</span>
        </button>
      )}
    </div>
  );
}

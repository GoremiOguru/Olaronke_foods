import React, { useState } from 'react';
import { X, CheckCircle, MessageCircle, Copy, ExternalLink, ShieldCheck, Key, MapPin, Printer } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OfficialReceiptModal from './OfficialReceiptModal';

export default function WhatsAppModal() {
  const { activeReceiptModal, setActiveReceiptModal } = useCart();
  const [copied, setCopied] = useState(false);
  const [showOfficialReceipt, setShowOfficialReceipt] = useState(false);
  const [hasForwardedWhatsapp, setHasForwardedWhatsapp] = useState(false);

  if (!activeReceiptModal) return null;

  const order = activeReceiptModal;
  const whatsappPhone = '08133314798';
  const cleanPhone = '2348133314798';

  // Helper to guarantee 3-digit pickup code
  const getPickupCode = (ord) => {
    if (ord?.pickupCode) return String(ord.pickupCode);
    if (!ord?.id) return '582';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return String(100 + (num % 900));
  };

  const pickupCodeDisplay = getPickupCode(order);

  const itemsFormatted = order.items
    .map(i => `• ${i.dishName} (${i.scoops} ${i.unitType || 'portion'}${i.scoops > 1 ? 's' : ''}) - ₦${(i.price * i.scoops).toLocaleString()}`)
    .join('\n');

  const takeoutLine = order.includeTakeoutPack ? `• Plastic Takeout Container - ₦300\n` : '';
  const deliveryLine = order.isHostelDelivery ? `🚚 Delivery Address: ${order.hostelAddress}` : `📍 Cafeteria Pickup`;

  const rawMessage = `Hello Isaac! 👋\nI have placed an order on B'feastas website:\n\n🔑 Secret 3-Digit Pickup Code: #${pickupCodeDisplay}\n📌 Order Reference: #${order.id}\n👤 Student Name: ${order.studentName}\n📧 Student Email: ${order.studentEmail}\n${deliveryLine}\n\n🛒 Order Breakdown:\n${itemsFormatted}\n${takeoutLine}\n💰 Total Amount Paid: ₦${order.totalPrice.toLocaleString()}\n\nAttached is my payment receipt to OLARONKE OGIDAN (MONIEPOINT). Please verify and prepare my meal!`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8234786544');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsappClick = () => {
    setHasForwardedWhatsapp(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-brand-lemon to-emerald-600 p-6 text-slate-950 text-center relative">
            <button
              onClick={() => setActiveReceiptModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/10 hover:bg-black/20 text-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-slate-950/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-slate-950/20">
              <CheckCircle className="w-9 h-9 text-slate-950 animate-bounce" />
            </div>

            <h3 className="text-2xl font-black">B'feastas Order Created!</h3>
            <p className="text-xs text-slate-900 mt-1 font-extrabold">
              Order Reference: <span className="font-mono bg-slate-950 text-brand-lemon-glow px-2 py-0.5 rounded">#{order.id}</span>
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Secret 3-Digit Pickup Code Box */}
            <div className="bg-gradient-to-r from-brand-orange/20 via-brand-orange/10 to-brand-orange/20 border-2 border-brand-orange/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[11px] font-black uppercase text-brand-orange tracking-wider flex items-center justify-center gap-1.5">
                <Key className="w-4 h-4" /> Secret Pickup Verification Code
              </span>
              <p className="text-4xl font-black text-amber-300 font-mono tracking-widest">
                #{pickupCodeDisplay}
              </p>
              <p className="text-[11px] text-slate-300">
                Only you and B'feastas staff know this code. Mention <strong className="text-white">#{pickupCodeDisplay}</strong> during pickup or delivery!
              </p>
            </div>

            {/* Student Info & Delivery Address */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-extrabold text-white">{order.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Email:</span>
                <span className="font-mono text-brand-lemon-glow font-bold">{order.studentEmail}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Fulfilment:</span>
                <span className="font-bold text-sky-300">
                  {order.isHostelDelivery ? `🚚 Hostel: ${order.hostelAddress}` : '📍 Cafeteria Pickup'}
                </span>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-brand-orange/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-brand-orange">
                <span>💳 Transfer to Moniepoint Account</span>
                <span className="text-[10px] bg-brand-orange/20 text-brand-orange-glow px-2.5 py-0.5 rounded font-black border border-brand-orange/30">MONIEPOINT</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Account Name: <strong className="text-white">OLARONKE OGIDAN</strong></p>
                  <p className="text-lg font-black text-amber-300 font-mono tracking-wider">8234786544</p>
                </div>
                <button
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex justify-between text-xs font-extrabold text-white pt-1">
                <span>Total Amount to Pay:</span>
                <span className="text-brand-orange text-lg">₦{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Step 1: WhatsApp Direct Section */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-brand-lemon-glow" />
                Step 1: Forward Payment Proof on WhatsApp ({whatsappPhone})
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to send Isaac your bank transfer receipt & secret code <strong>#{pickupCodeDisplay}</strong>.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleWhatsappClick}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-lemon to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-lemon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 border border-brand-lemon/30"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>Forward Receipt to Isaac (08133314798)</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </a>

            {/* Step 2: Download / Print Official Receipt (Available after clicking WhatsApp / confirmed) */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-400" />
                Step 2: Print / Download Official B'feastas E-Receipt
              </p>
              
              <button
                onClick={() => setShowOfficialReceipt(true)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Download / Print Official Printable E-Receipt</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
              >
                Close and return to catalog
              </button>
            </div>

          </div>
        </div>
      </div>

      {showOfficialReceipt && (
        <OfficialReceiptModal
          order={order}
          onClose={() => setShowOfficialReceipt(false)}
        />
      )}
    </>
  );
}

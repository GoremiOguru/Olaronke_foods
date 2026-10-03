import React from 'react';
import { X, Printer, ShieldCheck, Key, MapPin, UtensilsCrossed, Calendar, Clock, Download, AlertTriangle, Phone } from 'lucide-react';

export default function OfficialReceiptModal({ order, onClose }) {
  if (!order) return null;

  const getPickupCode = (ord) => {
    if (ord?.pickupCode) return String(ord.pickupCode);
    if (!ord?.id) return '582';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return String(100 + (num % 900));
  };

  const pickupCode = getPickupCode(order);
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isPaymentVerified = Boolean(
    order.paymentConfirmed || 
    order.status === 'Confirmed' || 
    order.status === 'Completed' || 
    order.status === 'Paid'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 print-active-receipt">
      
      {/* Container wrapper with print styling */}
      <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 print-receipt-card print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-6 print:p-4 print:py-3 relative flex items-center justify-between border-b-4 border-amber-500 print:bg-slate-900 print:text-white">
          <div className="flex items-center space-x-3">
            <img
              src="/images/compay logo.jpeg"
              alt="B'feastas Logo"
              className="w-10 h-10 print:w-8 print:h-8 rounded-xl object-cover border border-amber-400/50 shadow"
            />
            <div>
              <h2 className="text-xl print:text-base font-black tracking-tight text-white">B'FEASTAS GOURMET</h2>
              <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Topfaith University Campus Service</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unverified Payment Notice Header if not confirmed */}
        {!isPaymentVerified && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 print:px-4 print:py-1.5 flex items-center justify-between text-xs print:text-[10px] font-black">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
              <span>UNVERIFIED PAYMENT - PENDING VENDOR STAFF APPROVAL</span>
            </div>
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono">Draft</span>
          </div>
        )}

        {/* Receipt Body */}
        <div className="p-6 print:p-4 space-y-6 print:space-y-3 bg-slate-50 print:bg-white">
          
          {/* Status Badge & Secret Code Header */}
          <div className="bg-white p-4 print:p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Official Order Receipt</span>
              <p className="font-mono text-sm print:text-xs font-black text-slate-900">#{order.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Secret Pickup Code</span>
              <span className="font-mono text-xl print:text-lg font-black text-amber-600">#{pickupCode}</span>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="bg-white p-4 print:p-2.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 print:space-y-1 text-xs print:text-[11px]">
            <div className="flex justify-between border-b border-slate-100 pb-2 print:pb-1">
              <span className="text-slate-500 font-medium">Customer Name:</span>
              <span className="font-bold text-slate-900">{order.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 print:pb-1">
              <span className="text-slate-500 font-medium">Campus Email:</span>
              <span className="font-mono font-bold text-slate-800">{order.studentEmail}</span>
            </div>
            {order.studentPhone && (
              <div className="flex justify-between border-b border-slate-100 pb-2 print:pb-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Phone / WhatsApp:
                </span>
                <span className="font-mono font-bold text-amber-700">{order.studentPhone}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-2 print:pb-1">
              <span className="text-slate-500 font-medium">Order Date & Time:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate} at {formattedTime}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 print:pb-1">
              <span className="text-slate-500 font-medium">Fulfillment Mode:</span>
              <span className="font-bold text-amber-600">
                {order.isHostelDelivery ? `🚚 Hostel Delivery: ${order.hostelAddress}` : '📍 Cafeteria Pickup'}
              </span>
            </div>
            {order.scheduledTime && (
              <div className="flex justify-between pt-1 print:pt-0.5">
                <span className="text-slate-500 font-medium">Scheduled Pickup Time:</span>
                <span className="font-extrabold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">⏰ {order.scheduledTime}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs print:text-[11px]">
            <div className="bg-slate-100 px-4 print:px-3 py-2.5 print:py-1.5 font-bold text-slate-600 uppercase text-[10px] print:text-[9px] tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Amount</span>
            </div>

            <div className="p-4 print:p-2.5 space-y-2.5 print:space-y-1 divide-y divide-slate-100">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="pt-2 print:pt-1 first:pt-0 grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-6 font-bold text-slate-800">{item.dishName}</span>
                  <span className="col-span-2 text-center font-mono font-semibold text-slate-600">
                    {item.scoops} {item.unitType || 'portion'}{item.scoops > 1 ? 's' : ''}
                  </span>
                  <span className="col-span-4 text-right font-mono font-bold text-slate-900">
                    ₦{(item.price * item.scoops).toLocaleString()}
                  </span>
                </div>
              ))}

              {order.includeTakeoutPack && (
                <div className="pt-2 print:pt-1 grid grid-cols-12 gap-2 items-center text-slate-600">
                  <span className="col-span-6 font-semibold">
                    Plastic Takeout Container ({order.plateSizeName || (order.plateSize ? `₦${order.plateSize} plate` : 'Takeout pack')})
                  </span>
                  <span className="col-span-2 text-center font-mono">takeout fee</span>
                  <span className="col-span-4 text-right font-mono font-bold text-slate-900">₦{(order.takeoutFee !== undefined ? order.takeoutFee : 300).toLocaleString()}</span>
                </div>
              )}

              {order.isHostelDelivery && (
                <div className="pt-2 print:pt-1 grid grid-cols-12 gap-2 items-center text-sky-700 font-semibold">
                  <span className="col-span-6">Hostel Doorstep Delivery Fee</span>
                  <span className="col-span-2 text-center font-mono">1 delivery</span>
                  <span className="col-span-4 text-right font-mono font-bold text-slate-900">₦500</span>
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="bg-slate-900 text-white px-4 print:px-3 py-3 print:py-2 flex items-center justify-between font-black text-sm print:text-xs">
              <span>TOTAL AMOUNT DUE:</span>
              <span className="text-amber-400 text-base print:text-sm font-mono">₦{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Verification Status Badge */}
          {isPaymentVerified ? (
            <div className="p-3 print:p-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs print:text-[10px] text-emerald-800 font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 print:w-4 print:h-4 text-emerald-600" />
                <span>Payment Verified & Confirmed by B'feastas Staff</span>
              </div>
              <span className="text-[10px] print:text-[9px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">PAID & VERIFIED</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl space-y-1 text-xs text-amber-900">
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Payment Pending Vendor Verification</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">UNVERIFIED</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Staff must verify your bank transfer on WhatsApp/Admin system before meal dispensation.
              </p>
            </div>
          )}

          {/* Print / Save & Share Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 border border-amber-500/30"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>🖨️ Print / Save PDF Receipt</span>
            </button>

            <button
              onClick={() => {
                const text = `🧾 B'FEASTAS OFFICIAL RECEIPT #${order.id}\nSecret Pickup Code: #${pickupCode}\nStudent: ${order.studentName}\nTotal: ₦${order.totalPrice.toLocaleString()}\nStatus: ${order.status}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(text);
                  alert("Receipt summary copied to clipboard!");
                }
              }}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-500/40 font-extrabold text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span>Copy Receipt Summary</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center space-x-1"
            >
              <X className="w-4 h-4 text-slate-600" />
              <span>Close</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

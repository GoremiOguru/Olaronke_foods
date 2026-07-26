import React from 'react';
import { X, Printer, ShieldCheck, Key, MapPin, UtensilsCrossed, Calendar, Clock, Download } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Container wrapper with print styling */}
      <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b-4 border-amber-500 print:bg-slate-900 print:text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">B'FEASTAS GOURMET</h2>
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

        {/* Receipt Body */}
        <div className="p-6 space-y-6 bg-slate-50 print:p-8">
          
          {/* Status Badge & Secret Code Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Official Order Receipt</span>
              <p className="font-mono text-sm font-black text-slate-900">#{order.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Secret Pickup Code</span>
              <span className="font-mono text-xl font-black text-amber-600">#{pickupCode}</span>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Customer Name:</span>
              <span className="font-bold text-slate-900">{order.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Campus Email:</span>
              <span className="font-mono font-bold text-slate-800">{order.studentEmail}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Order Date & Time:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate} at {formattedTime}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Fulfillment Mode:</span>
              <span className="font-bold text-amber-600">
                {order.isHostelDelivery ? `🚚 Hostel Delivery: ${order.hostelAddress}` : '📍 Cafeteria Pickup'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-600 uppercase text-[10px] tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Amount</span>
            </div>

            <div className="p-4 space-y-2.5 divide-y divide-slate-100">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 grid grid-cols-12 gap-2 items-center">
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
                <div className="pt-2 grid grid-cols-12 gap-2 items-center text-slate-600">
                  <span className="col-span-6 font-semibold">Plastic Takeout Container</span>
                  <span className="col-span-2 text-center font-mono">1 pack</span>
                  <span className="col-span-4 text-right font-mono font-bold text-slate-900">₦300</span>
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between font-black text-sm">
              <span>TOTAL AMOUNT PAID:</span>
              <span className="text-amber-400 text-base font-mono">₦{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Verification Watermark Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Payment Verified & Confirmed by B'feastas Staff</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono">PAID</span>
          </div>

          {/* Print / Save Action Buttons */}
          <div className="flex items-center space-x-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>🖨️ Download / Print Official PDF Receipt</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

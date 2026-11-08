import React, { useEffect } from 'react';
import { X, Printer, Copy, Check } from 'lucide-react';

export default function OfficialReceiptModal({ order, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const getPickupCode = (ord) => {
    if (ord?.pickupCode) {
      const code = String(ord.pickupCode);
      return code.startsWith('GEN-') ? code : (/^\d+$/.test(code) ? `GEN-${code.padStart(3, '0')}` : code);
    }
    if (!ord?.id) return 'GEN-001';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return `GEN-${String(100 + (num % 900))}`;
  };

  const pickupCode = getPickupCode(order);
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isPaymentVerified = Boolean(
    order.paymentConfirmed || 
    order.status === 'Confirmed' || 
    order.status === 'Completed' || 
    order.status === 'Paid'
  );

  const deliveryFeeNum = Number(
    order.deliveryFee !== undefined 
      ? order.deliveryFee 
      : (order.hostelAddress && (order.hostelAddress.toLowerCase().includes('mass') || order.hostelAddress.toLowerCase().includes('engineering')) ? 700 : 500)
  );

  const displayOrderId = order.id?.startsWith('WALK-') ? order.id : `GEN-${String(order.id).replace(/\D/g, '').slice(-4) || '1005'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `🧾 Benefeastas Nig Enterprise\nOrder: ${displayOrderId} • Code #${pickupCode}\nDate: ${formattedDate}, ${formattedTime}\nTotal: ₦${Number(order.totalPrice || 0).toLocaleString()}.00\nPayment: ${order.paymentMethod || 'cash'}\nThank you for your purchase!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 print-active-receipt">
      
      {/* Outer Modal Container */}
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 p-6 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none font-mono text-xs selection:bg-slate-300">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors print:hidden"
          title="Close Receipt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header (Centered, Reference Style) */}
        <div className="text-center space-y-0.5 pt-1">
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-950">
            Benefeastas Nig Enterprise
          </h2>
          <p className="text-[11px] text-slate-600">Akwa Ibom State</p>
          <p className="text-[11px] text-slate-600">07032739252</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800 pt-0.5">
            {order.isOfflineOrder ? 'OFFLINE RECEIPT' : 'ORDER RECEIPT'}
          </p>
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-slate-400 my-2.5"></div>

        {/* 2. Order Metadata */}
        <div className="space-y-0.5 text-[11px] text-slate-800">
          <div className="flex justify-between font-bold text-slate-950">
            <span>{displayOrderId}</span>
            <span>Code: #{pickupCode}</span>
          </div>
          <p className="text-slate-600">{formattedDate}, {formattedTime}</p>
          <p className="text-slate-700">
            {order.isWalkInSale ? 'Cashier: Counter Staff' : `Customer: ${order.studentName || 'Student'}`}
          </p>
          {order.isHostelDelivery ? (
            <p className="text-slate-700">Delivery: {order.hostelAddress}</p>
          ) : (
            <p className="text-slate-600">Pickup: Cafeteria Counter</p>
          )}
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-slate-400 my-2.5"></div>

        {/* 3. Items List */}
        <div className="space-y-2 text-[11px]">
          {order.items && order.items.map((item, idx) => {
            const cleanName = (item.dishName || 'Meal').replace(/^\[(Counter Walk-in|Plate #\d+)\]\s*/i, '');
            const itemTotal = Number(item.price || 0) * Number(item.scoops || 1);
            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="truncate pr-2">{cleanName}</span>
                  <span className="shrink-0 font-bold">₦{itemTotal.toLocaleString()}.00</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {item.scoops} {item.unitType || 'piece'}{item.scoops > 1 ? 's' : ''} × ₦{Number(item.price || 0).toLocaleString()}.00
                </div>
              </div>
            );
          })}

          {order.includeTakeoutPack && (
            <div className="flex justify-between font-bold text-slate-900 pt-0.5">
              <span>Takeout Container</span>
              <span>₦{(Number(order.takeoutFee) || 300).toLocaleString()}.00</span>
            </div>
          )}

          {order.isHostelDelivery && (
            <div className="flex justify-between font-bold text-slate-900 pt-0.5">
              <span>Campus Delivery Fee</span>
              <span>₦{deliveryFeeNum.toLocaleString()}.00</span>
            </div>
          )}
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-slate-400 my-2.5"></div>

        {/* 4. Financial Totals */}
        <div className="space-y-1 text-[11px] text-slate-800">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₦{Number(order.totalPrice || 0).toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between text-xs font-black text-slate-950 pt-0.5">
            <span>TOTAL</span>
            <span>₦{Number(order.totalPrice || 0).toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-0.5">
            <span>Payment</span>
            <span className="lowercase font-medium">{order.paymentMethod || 'cash'}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900">
            <span>Paid</span>
            <span>₦{Number(order.totalPrice || 0).toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Status</span>
            <span className="uppercase font-bold">{isPaymentVerified ? 'Verified' : 'Pending'}</span>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-slate-400 my-2.5"></div>

        {/* 5. Barcode (Reference Style) */}
        <div className="text-center py-1 space-y-1">
          <div className="flex items-center justify-center gap-0.5 h-8 px-2 overflow-hidden">
            {[2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,3,1,2,1,3,2,1,4,1,2,3,1,2].map((w, i) => (
              <div 
                key={i} 
                className={`h-full bg-slate-900 ${
                  w === 1 ? 'w-[1px]' : w === 2 ? 'w-[2px]' : w === 3 ? 'w-[3px]' : 'w-[4px]'
                }`} 
              />
            ))}
          </div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-slate-800">
            {displayOrderId}
          </p>
        </div>

        {/* 6. Footer Note */}
        <div className="text-center text-[10px] text-slate-600 pt-1 space-y-0.5">
          <p>Thank you for your purchase</p>
          <p className="text-[9px] text-slate-400">Katalyst Offline • B'feastas</p>
        </div>

        {/* 7. Action Controls (Print, Copy, Close - Hidden in Print) */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            title="Copy Receipt Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
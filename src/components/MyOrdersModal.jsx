import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, PackageCheck, AlertTriangle, Key, Printer, ShoppingBag, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OfficialReceiptModal from './OfficialReceiptModal';

export default function MyOrdersModal({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    setLoading(true);
    fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        // Filter orders for logged in student
        const studentOrders = Array.isArray(data)
          ? data.filter(o => o.studentEmail?.toLowerCase() === user?.email?.toLowerCase())
          : [];
        setOrders(studentOrders);
      })
      .catch(err => console.error('Failed to fetch student order history:', err))
      .finally(() => setLoading(false));
  }, [isOpen, token, user]);

  if (!isOpen) return null;

  const getPickupCode = (ord) => {
    if (ord?.pickupCode) return String(ord.pickupCode);
    if (!ord?.id) return '582';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return String(100 + (num % 900));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✅ Completed</span>;
      case 'Cancelled':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">❌ Cancelled</span>;
      case 'Ready for Pickup':
      case 'Ready for Pickup / Out for Delivery':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">🚚 Ready for Pickup / Delivery</span>;
      case 'Preparing':
      case 'Payment Confirmed & Preparing':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">🍳 Payment Confirmed & Cooking</span>;
      default:
        return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">⏳ Verification Pending</span>;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-orange" /> My Orders & Official Receipts
              </h2>
              <p className="text-xs text-slate-400">Track order progress & download official verified receipts.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                Loading your order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-2 border border-slate-800 rounded-2xl bg-slate-950/50">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-bold text-white text-sm">No past orders found</p>
                <p className="text-xs text-slate-500">Order your favorite meals from the catalog to see them here!</p>
              </div>
            ) : (
              orders.map((ord) => {
                const code = getPickupCode(ord);
                const isConfirmed = ord.status !== 'Pending Payment Verification' && ord.status !== 'Cancelled';

                return (
                  <div key={ord.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-300">#{ord.id}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-300 mt-0.5">
                          Secret Pickup Code: <span className="font-mono text-amber-400 text-sm font-black">#{code}</span>
                        </p>
                      </div>

                      <div>{getStatusBadge(ord.status)}</div>
                    </div>

                    {/* Delivery / Pickup address */}
                    <div className="text-xs text-slate-400">
                      {ord.isHostelDelivery ? (
                        <p className="flex items-center gap-1.5 text-sky-300">
                          <MapPin className="w-3.5 h-3.5" /> Hostel Delivery: <strong className="text-white">{ord.hostelAddress}</strong>
                        </p>
                      ) : (
                        <p className="flex items-center gap-1.5 text-slate-300">
                          📍 Cafeteria Pickup
                        </p>
                      )}
                    </div>

                    {/* Item list */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1 rounded-xl border border-slate-800">
                          {it.dishName} ({it.scoops} {it.unitType || 'portion'}{it.scoops > 1 ? 's' : ''})
                        </span>
                      ))}
                      {ord.includeTakeoutPack && (
                        <span className="bg-brand-orange/10 text-brand-orange-glow text-xs font-semibold px-2.5 py-1 rounded-xl border border-brand-orange/30">
                          Takeout Pack (+₦300)
                        </span>
                      )}
                    </div>

                    {/* Total & Action button */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Paid</span>
                        <span className="text-xl font-black text-white">₦{ord.totalPrice.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-extrabold border border-amber-500/40 transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>🖨️ View / Print Official Receipt</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {selectedReceiptOrder && (
        <OfficialReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </>
  );
}

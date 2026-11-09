import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, PackageCheck, AlertTriangle, Key, Printer, ShoppingBag, MapPin, ChefHat, Truck, Bike, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OfficialReceiptModal from './OfficialReceiptModal';
import { lockScroll, unlockScroll, forceUnlockScroll } from '../utils/scrollLock';

export default function MyOrdersModal({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('olaronke_cached_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && user?.email) {
          return parsed.filter(o => o.studentEmail?.toLowerCase() === user.email.toLowerCase() || o.studentId === user?.id);
        }
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    unlockScroll();
    if (typeof onClose === 'function') onClose();
  };

  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;

    const fetchStudentOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          const studentOrders = Array.isArray(data)
            ? data.filter(o => o.studentEmail?.toLowerCase() === user?.email?.toLowerCase() || o.studentId === user?.id)
            : [];

          // Also check locally pending offline orders
          let localPending = [];
          try {
            const raw = localStorage.getItem('olaronke_pending_offline_orders');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                localPending = parsed.filter(o => o.studentEmail?.toLowerCase() === user?.email?.toLowerCase() || o.studentId === user?.id);
              }
            }
          } catch (e) {}

          setOrders(prev => {
            const map = new Map();
            (Array.isArray(prev) ? prev : []).forEach(o => map.set(o.id, o));
            studentOrders.forEach(o => map.set(o.id, { ...(map.get(o.id) || {}), ...o }));
            localPending.forEach(o => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          });
        } else if (!res.ok && isMounted) {
          // If offline / server unavailable, load from cache
          let cached = [];
          try {
            const raw = localStorage.getItem('olaronke_cached_orders');
            if (raw) cached = JSON.parse(raw);
          } catch (e) {}
          let localPending = [];
          try {
            const raw = localStorage.getItem('olaronke_pending_offline_orders');
            if (raw) localPending = JSON.parse(raw);
          } catch (e) {}
          const studentOrders = [...cached, ...localPending].filter(o => o.studentEmail?.toLowerCase() === user?.email?.toLowerCase() || o.studentId === user?.id);
          if (studentOrders.length > 0) {
            setOrders(studentOrders);
          }
        }
      } catch (err) {
        // Fallback for offline mode
        let cached = [];
        try {
          const raw = localStorage.getItem('olaronke_cached_orders');
          if (raw) cached = JSON.parse(raw);
        } catch (e) {}
        let localPending = [];
        try {
          const raw = localStorage.getItem('olaronke_pending_offline_orders');
          if (raw) localPending = JSON.parse(raw);
        } catch (e) {}
        const studentOrders = [...cached, ...localPending].filter(o => o.studentEmail?.toLowerCase() === user?.email?.toLowerCase() || o.studentId === user?.id);
        if (studentOrders.length > 0 && isMounted) {
          setOrders(studentOrders);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setLoading(orders.length === 0);
    fetchStudentOrders();

    // Poll every 3.5 seconds so students immediately see admin status transitions & receipts
    const intervalId = setInterval(fetchStudentOrders, 3500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isOpen, token, user]);

  if (!isOpen) return null;

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

  const getProgressStep = (status) => {
    if (!status) return 1;
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('delivered') || s.includes('collected')) return 4;
    if (s.includes('ready')) return 3;
    if (s.includes('preparing') || s.includes('cooking') || s.includes('confirmed')) return 2;
    return 1;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">Completed</span>;
      case 'Cancelled':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">Cancelled</span>;
      case 'Ready for Pickup':
      case 'Ready for Pickup / Out for Delivery':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">Ready for Pickup / Delivery</span>;
      case 'Preparing':
      case 'Payment Confirmed & Preparing':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">Payment Confirmed & Cooking</span>;
      default:
        return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">Verification Pending</span>;
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-orange" /> My Orders & Live Order Progress
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">Track meal cooking stages in real time & print verified official receipts.</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-300 text-sm font-bold flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 text-brand-orange animate-spin" />
                <span>Loading your order progress...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-2 border border-slate-800 rounded-2xl bg-slate-950/50">
                <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="font-bold text-white text-base">No past orders found</p>
                <p className="text-sm text-slate-300">Order your favorite meals from the catalog to see them here!</p>
              </div>
            ) : (
              orders.map((ord) => {
                const code = getPickupCode(ord);
                const step = getProgressStep(ord.status);
                const isCancelled = ord.status === 'Cancelled' || Boolean(ord.isCancelled);
                const canPrintReceipt = Boolean(
                  ord.paymentConfirmed || 
                  ord.status === 'Completed' || 
                  ord.status === 'Paid' || 
                  (ord.status && (ord.status.includes('Preparing') || ord.status.includes('Ready') || ord.status.includes('Confirmed')))
                );

                return (
                  <div key={ord.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-300">#{ord.id}</span>
                          {ord.isOfflineOrder && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                              ⚡ Pending Cloud Sync
                            </span>
                          )}
                          <span className="text-xs text-slate-300 font-medium">
                            {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200 mt-1">
                          Secret Pickup Code: <span className="font-mono text-brand-lemon-glow text-base font-black tracking-wide">#{code}</span>
                        </p>
                      </div>

                      <div>{getStatusBadge(ord.status)}</div>
                    </div>

                    {/* LIVE VISUAL PROGRESS STEPPER */}
                    {isCancelled ? (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-rose-300 text-xs">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <p className="font-bold">This order was cancelled</p>
                          <p className="text-xs text-rose-300">Please message Isaac on WhatsApp or speak with the counter cashier.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">
                            Live Order Status:
                          </span>
                          <span className="font-black text-amber-400 text-xs sm:text-sm">
                            {step === 1 && '⏳ Step 1/4: Awaiting Payment Verification'}
                            {step === 2 && '👨‍🍳 Step 2/4: Payment Verified & Cooking in Kitchen'}
                            {step === 3 && (ord.isHostelDelivery ? '🚴 Step 3/4: Ready & Out for Delivery!' : '🔔 Step 3/4: Ready for Counter Pickup!')}
                            {step === 4 && '✅ Step 4/4: Order Completed & Collected'}
                          </span>
                        </div>

                        {/* Progress Stepper Bar */}
                        <div className="relative pt-1 pb-1">
                          {/* Stepper background line */}
                          <div className="absolute top-[18px] left-6 right-6 h-1 bg-slate-800 rounded-full z-0" />
                          
                          {/* Stepper active fill line */}
                          <div
                            className="absolute top-[18px] left-6 h-1 bg-gradient-to-r from-amber-500 via-brand-orange to-emerald-500 rounded-full transition-all duration-700 z-0"
                            style={{
                              width: step === 1 ? '10%' : step === 2 ? '40%' : step === 3 ? '72%' : 'calc(100% - 3rem)'
                            }}
                          />

                          <div className="relative z-10 flex items-center justify-between">
                            {[
                              { label: 'Order Placed', icon: Clock, num: 1 },
                              { label: 'Cooking', icon: ChefHat, num: 2 },
                              { label: ord.isHostelDelivery ? 'Out for Delivery' : 'Ready for Pickup', icon: ord.isHostelDelivery ? Bike : PackageCheck, num: 3 },
                              { label: 'Completed', icon: CheckCircle2, num: 4 }
                            ].map(({ label, icon: Icon, num }) => {
                              const isDone = step >= num;
                              const isCurrent = step === num;

                              return (
                                <div key={num} className="flex flex-col items-center text-center max-w-[85px]">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                      isCurrent
                                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 scale-110'
                                        : isDone
                                        ? 'bg-emerald-500 text-slate-950 font-black'
                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className={`text-xs font-bold mt-1.5 leading-tight ${
                                    isCurrent ? 'text-amber-400 font-black' : isDone ? 'text-emerald-400' : 'text-slate-400'
                                  }`}>
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Real-time Explanatory Banner */}
                        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs text-slate-200 flex items-center gap-2 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-lemon-glow animate-pulse shrink-0"></span>
                          <span>
                            {step === 1 && 'Staff is reviewing your payment. Once confirmed, food preparation begins immediately.'}
                            {step === 2 && 'Your meal is being dished and packed hot. Official receipt is unlocked below!'}
                            {step === 3 && (ord.isHostelDelivery ? 'Courier is in transit to your hall or room. Keep your phone active!' : `Show Secret Pickup Code #${code} at the collection counter.`)}
                            {step === 4 && 'Thank you for dining with Benefeastas Nig Enterprise! Have a wonderful meal.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Delivery / Pickup address */}
                    <div className="text-xs sm:text-sm text-slate-300">
                      {ord.isHostelDelivery ? (
                        <p className="flex items-center gap-1.5 text-sky-300 font-semibold">
                          <MapPin className="w-4 h-4 text-sky-400 shrink-0" /> 
                          {ord.hostelAddress?.toLowerCase().includes('faculty') || ord.hostelAddress?.toLowerCase().includes('house') ? '🏢 Faculty Delivery: ' : '🏫 Hostel Delivery: '}
                          <strong className="text-white font-extrabold">{ord.hostelAddress}</strong>
                        </p>
                      ) : (
                        <p className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <MapPin className="w-4 h-4 text-brand-lemon shrink-0" /> Cafeteria Pickup Counter
                        </p>
                      )}
                    </div>

                    {/* Item list */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="bg-slate-900 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800">
                          {it.dishName} ({it.scoops} {it.unitType || 'portion'}{it.scoops > 1 ? 's' : ''})
                        </span>
                      ))}
                      {ord.includeTakeoutPack && (
                        <span className="bg-brand-orange/15 text-brand-orange-glow text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-orange/30">
                          Takeout Pack (+₦300)
                        </span>
                      )}
                    </div>

                    {/* Total & Action button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-xs uppercase font-extrabold text-slate-300 block">Total Amount</span>
                        <span className="text-xl font-black text-white">₦{ord.totalPrice.toLocaleString()}</span>
                      </div>

                      {canPrintReceipt ? (
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-brand-orange hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Printer className="w-4 h-4" />
                          <span>View & Print Official Receipt</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-amber-500/30 text-xs text-amber-300 font-bold">
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                          <span>⏳ Receipt Unlocks Once Staff Verifies Payment</span>
                        </div>
                      )}
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
          onClose={() => {
            setSelectedReceiptOrder(null);
            forceUnlockScroll();
          }}
        />
      )}
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Tv, X, CheckCircle2, Clock, Flame, ShieldAlert, PackageCheck, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw, Search, WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function KitchenDisplayModal({ isOpen, onClose, orders, onUpdateStatus, token }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const getPickupCode = (ord) => {
    if (ord?.pickupCode) return String(ord.pickupCode);
    if (!ord?.id) return '582';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return String(100 + (num % 900));
  };

  const matchesSearch = (order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase().replace('#', '');
    const code = getPickupCode(order).toLowerCase();
    const name = (order.studentName || '').toLowerCase();
    const id = (order.id || '').toLowerCase();
    return code.includes(q) || name.includes(q) || id.includes(q);
  };

  // 3 Columns: Pending Payment, Preparing, Ready
  const pendingOrders = orders.filter(o => 
    (o.status === 'Pending Payment Verification' || o.status === 'Unverified') && matchesSearch(o)
  );

  const preparingOrders = orders.filter(o => 
    (o.status === 'Preparing' || o.status === 'Paid' || o.status === 'Payment Confirmed') && matchesSearch(o)
  );

  const readyOrders = orders.filter(o => 
    (o.status === 'Ready for Pickup' || o.status === 'Out for Delivery') && matchesSearch(o)
  );

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      
      {/* KDS Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                B'feastas Kitchen Orders Screen
              </h1>
              <span className="bg-brand-lemon/20 text-brand-lemon-glow border border-brand-lemon/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Kitchen Screen
              </span>
            </div>
            <p className="text-xs text-slate-400">Touch Screen Order Display for Cafeteria Staff</p>
          </div>
        </div>

        {/* Fast Code / Ticket Search */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm mx-4 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fast code search: e.g. #314"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio Chimes Active' : 'Sound Muted'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 transition-all"
            title="Toggle Fullscreen Tablet Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-2xl transition-all"
            title="Exit KDS View"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Fast Code / Ticket Search */}
      <div className="sm:hidden px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fast search: e.g. #314"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden bg-slate-950">
        
        {/* COLUMN 1: PENDING PAYMENT (RED) */}
        <div className="bg-slate-900/80 border-2 border-red-500/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-red-500/20 border-b border-red-500/30 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <h2 className="font-black text-red-400 text-base uppercase tracking-wider">Awaiting Payment</h2>
            </div>
            <span className="bg-red-500/30 text-red-300 text-xs font-black px-3 py-1 rounded-full border border-red-500/40">
              {pendingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm font-semibold">
                No orders pending payment
              </div>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} className="bg-slate-950 border-2 border-red-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-red-500 text-white font-black text-lg px-2.5 py-0.5 rounded-lg font-mono">
                          #{getPickupCode(order)}
                        </span>
                        {order.isOfflineOrder && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <WifiOff className="w-2.5 h-2.5" /> Offline Token
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{order.studentName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" /> {formatTimeAgo(order.createdAt)}
                      </span>
                      <p className="text-sm font-black text-white">₦{Number(order.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Scheduled Pre-Order Time Badge */}
                  {order.scheduledTime && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pre-Order Pickup: {order.scheduledTime}</span>
                    </div>
                  )}

                  {/* Destination / Fulfilment Badge */}
                  {order.isHostelDelivery ? (
                    <div className="bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>{order.hostelAddress?.toLowerCase().includes('faculty') || order.hostelAddress?.toLowerCase().includes('house') ? '🏢 Faculty Delivery:' : '🏫 Hostel Delivery:'}</span>
                      <span className="text-white font-extrabold truncate">{order.hostelAddress}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>🥡 Cafeteria Counter Pickup</span>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="space-y-1.5 py-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-bold text-slate-200 bg-slate-900/60 p-2 rounded-xl">
                        <span>{item.dishName}</span>
                        <span className="text-brand-orange font-black">x{item.scoops}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fast Verify Payment Button */}
                  <button
                    onClick={() => onUpdateStatus(order.id, 'Preparing')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verify Payment & Cook ➔</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: COOKING & PREPARING (YELLOW) */}
        <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <h2 className="font-black text-amber-400 text-base uppercase tracking-wider">Cooking & Packing</h2>
            </div>
            <span className="bg-amber-500/30 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/40">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm font-semibold">
                Kitchen queue clear
              </div>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-amber-500 text-slate-950 font-black text-lg px-2.5 py-0.5 rounded-lg font-mono">
                          #{getPickupCode(order)}
                        </span>
                        {order.isOfflineOrder && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <WifiOff className="w-2.5 h-2.5" /> Offline Token
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{order.studentName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" /> {formatTimeAgo(order.createdAt)}
                      </span>
                      <p className="text-xs text-emerald-400 font-bold">✓ Payment Verified</p>
                    </div>
                  </div>

                  {/* Scheduled Pre-Order Time Badge */}
                  {order.scheduledTime && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Scheduled Pickup: {order.scheduledTime}</span>
                    </div>
                  )}

                  {/* Destination / Fulfilment Badge */}
                  {order.isHostelDelivery ? (
                    <div className="bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>{order.hostelAddress?.toLowerCase().includes('faculty') || order.hostelAddress?.toLowerCase().includes('house') ? '🏢 Faculty Delivery:' : '🏫 Hostel Delivery:'}</span>
                      <span className="text-white font-extrabold truncate">{order.hostelAddress}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>🥡 Cafeteria Counter Pickup</span>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="space-y-1.5 py-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-base font-extrabold text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span>{item.dishName}</span>
                        <span className="text-amber-400 font-black">x{item.scoops}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mark Ready Button */}
                  <button
                    onClick={() => onUpdateStatus(order.id, 'Ready for Pickup')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>Mark Packed & Ready ➔</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR PICKUP / DELIVERY (GREEN) */}
        <div className="bg-slate-900/80 border-2 border-emerald-500/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="font-black text-emerald-400 text-base uppercase tracking-wider">Ready for Pickup</h2>
            </div>
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {readyOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm font-semibold">
                No orders waiting at counter
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-500 text-slate-950 font-black text-xl px-3 py-1 rounded-lg font-mono">
                          #{getPickupCode(order)}
                        </span>
                        {order.isOfflineOrder && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <WifiOff className="w-2.5 h-2.5" /> Offline Token
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{order.studentName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">Ready at Counter</span>
                      <p className="text-sm font-black text-white">₦{Number(order.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Destination / Fulfilment Badge */}
                  {order.isHostelDelivery ? (
                    <div className="bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>{order.hostelAddress?.toLowerCase().includes('faculty') || order.hostelAddress?.toLowerCase().includes('house') ? '🏢 Faculty Delivery:' : '🏫 Hostel Delivery:'}</span>
                      <span className="text-white font-extrabold truncate">{order.hostelAddress}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>🥡 Cafeteria Counter Pickup</span>
                    </div>
                  )}

                  {/* Mark Handed Over Button */}
                  <button
                    onClick={() => onUpdateStatus(order.id, 'Completed')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <span>Complete & Handed Over ✓</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

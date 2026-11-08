import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tv, X, CheckCircle2, Clock, Flame, ShieldAlert, PackageCheck, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw, Search, WifiOff, BellRing } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function KitchenDisplayModal({ isOpen, onClose, orders, onUpdateStatus, token }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStrobing, setIsStrobing] = useState(false);
  const [strobeAlertInfo, setStrobeAlertInfo] = useState(null);

  const knownKdsIdsRef = useRef(new Set());
  const isFirstKdsLoadRef = useRef(true);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    if (isFirstKdsLoadRef.current) {
      knownKdsIdsRef.current = new Set(orders.map(o => o.id));
      isFirstKdsLoadRef.current = false;
      return;
    }

    const newArrivals = orders.filter(o => !knownKdsIdsRef.current.has(o.id));
    if (newArrivals.length > 0) {
      const first = newArrivals[0];
      setStrobeAlertInfo({
        code: getPickupCode(first),
        name: first.studentName || 'Student',
        count: newArrivals.length,
        itemsText: first.items?.map(it => `${it.scoops}x ${it.dishName?.replace(/^\[.*?\]\s*/i, '')}`).join(', ')
      });

      setIsStrobing(true);

      if (soundEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
        } catch (e) {}
      }

      const timer = setTimeout(() => {
        setIsStrobing(false);
      }, 5000);

      newArrivals.forEach(o => knownKdsIdsRef.current.add(o.id));
      return () => clearTimeout(timer);
    }
  }, [orders, soundEnabled]);

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
    if (ord?.pickupCode) {
      const code = String(ord.pickupCode);
      return code.startsWith('GEN-') ? code : (/^\d+$/.test(code) ? `GEN-${code.padStart(3, '0')}` : code);
    }
    if (!ord?.id) return 'GEN-001';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return `GEN-${String(100 + (num % 900))}`;
  };

  const matchesSearch = (order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase().replace(/^[#\s]+/, '').replace(/^gen-/, '');
    const code = getPickupCode(order).toLowerCase().replace(/^gen-/, '');
    const fullCode = getPickupCode(order).toLowerCase();
    const name = (order.studentName || '').toLowerCase();
    const id = (order.id || '').toLowerCase();
    return code.includes(q) || fullCode.includes(q) || name.includes(q) || id.includes(q);
  };

  const cleanSearchCode = searchQuery.trim().replace(/^[#\s]+/, '').toUpperCase();
  const matchedExactOrder = cleanSearchCode.length >= 1 
    ? orders.find(o => {
        if (o.status === 'Cancelled') return false;
        const fullCode = getPickupCode(o).toUpperCase();
        const bareCode = fullCode.replace(/^GEN-/, '');
        const bareInput = cleanSearchCode.replace(/^GEN-/, '');
        return fullCode === cleanSearchCode ||
          bareCode === bareInput ||
          (bareInput.length >= 2 && bareCode.endsWith(bareInput)) ||
          fullCode.endsWith(cleanSearchCode) ||
          String(o.id).toUpperCase().includes(cleanSearchCode);
      })
    : null;

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
            placeholder="Fast code search: e.g. 001 or GEN-001"
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
            placeholder="Fast search: e.g. 001 or GEN-001"
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

      {/* Visual Screen Flash Strobe for High-Noise Kitchens */}
      {isStrobing && strobeAlertInfo && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 px-6 py-3.5 flex items-center justify-between shadow-2xl animate-pulse font-black shrink-0 border-b-4 border-amber-300">
          <div className="flex items-center space-x-3">
            <span className="bg-slate-950 text-amber-300 px-3 py-1 rounded-xl font-mono text-xl shadow-md">
              #{strobeAlertInfo.code}
            </span>
            <div>
              <p className="text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>🚨 NEW KITCHEN TICKET!</span>
                <span className="text-slate-900 font-extrabold">{strobeAlertInfo.name}</span>
                {strobeAlertInfo.count > 1 && (
                  <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-full font-bold">(+{strobeAlertInfo.count - 1} more)</span>
                )}
              </p>
              <p className="text-xs text-slate-900 font-bold truncate max-w-xl">
                {strobeAlertInfo.itemsText}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStrobing(false)}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            Acknowledge ✕
          </button>
        </div>
      )}

      {/* 1-Second Instant Dispense Banner */}
      {matchedExactOrder && (
        <div className="mx-4 sm:mx-6 my-2 p-3.5 bg-slate-900 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="bg-emerald-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl font-mono shrink-0">
              #{getPickupCode(matchedExactOrder)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-white text-sm">{matchedExactOrder.studentName}</span>
                <span className="text-xs text-amber-400 font-bold">₦{Number(matchedExactOrder.totalPrice || 0).toLocaleString()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  matchedExactOrder.status === 'Completed' ? 'bg-slate-800 text-slate-400' :
                  matchedExactOrder.status === 'Ready for Pickup' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {matchedExactOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {matchedExactOrder.items?.map(it => `${it.scoops}x ${it.dishName?.replace(/^\[(Counter Walk-in|Plate #\d+)\]\s*/i, '')}`).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {matchedExactOrder.status !== 'Completed' ? (
              <button
                onClick={() => {
                  onUpdateStatus(matchedExactOrder.id, 'Completed');
                  setSearchQuery('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Dispense & Hand Over ✓</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-bold px-3 py-2 bg-slate-800 rounded-xl">Order Already Completed</span>
            )}
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

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

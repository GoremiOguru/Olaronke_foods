import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldAlert, Package, Home, CheckSquare, Square, MapPin, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function CartDrawer({ onOpenAuth }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateScoops,
    assignItemToPlate,
    removeFromCart,
    clearCart,
    autoSplitRicePlates,
    riceExceedsCapacity,
    activePlatesCount,
    mealsTotal,
    takeoutFee,
    deliveryFee,
    grandTotal,
    totalQuantityCount,
    includeTakeoutPack,
    setIncludeTakeoutPack,
    isHostelDelivery,
    setIsHostelDelivery,
    hostelAddress,
    setHostelAddress,
    checkout,
    isSubmitting
  } = useCart();

  const { user } = useAuth();
  const { settings } = useSettings();
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const perPackFee = Number(settings.takeoutPrice) || 300;

  // Group cart items by plate number
  const platesMap = {};
  cart.forEach(item => {
    const pNum = item.plateNumber || 1;
    if (!platesMap[pNum]) platesMap[pNum] = [];
    platesMap[pNum].push(item);
  });

  const sortedPlateNumbers = Object.keys(platesMap).map(Number).sort((a, b) => a - b);
  const maxPlateNum = sortedPlateNumbers.length > 0 ? Math.max(...sortedPlateNumbers) : 1;

  const handleCheckout = async () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please log in with your Topfaith student email first.');
      onOpenAuth();
      return;
    }

    if (isHostelDelivery && (!hostelAddress || !hostelAddress.trim())) {
      setErrorMsg('Please enter your hostel name & room number for delivery.');
      return;
    }

    try {
      await checkout();
    } catch (err) {
      setErrorMsg(err.message || 'Error processing order');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center font-bold shadow-orange-glow">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-lg">B'feastas Tray</h2>
                <p className="text-xs text-slate-400">
                  {totalQuantityCount} item{totalQuantityCount === 1 ? '' : 's'} across {activePlatesCount} Takeout Plate{activePlatesCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Student Auth Status */}
            {user ? (
              <div className="p-3 rounded-2xl bg-brand-lemon/10 border border-brand-lemon/30 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-brand-lemon-glow">Ordering as: {user.name}</p>
                  <p className="text-slate-300 text-[11px] font-mono">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 bg-brand-lemon text-slate-950 font-black rounded text-[10px]">VERIFIED</span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Student Login Required</p>
                  <p className="text-[11px] text-slate-300">Log in with your @topfaith.edu.ng email so staff identify your order.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* RICE CAPACITY EXCEEDED NOTIFICATION CALLOUT */}
            {riceExceedsCapacity && (
              <div className="p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-500/50 text-amber-200 text-xs space-y-2.5 shadow-lg animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-white text-xs">⚠️ Rice Packaging Capacity Notice</p>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                      One Takeout Plate can hold a maximum of <strong>5 scoops of rice</strong>. Anything more than 5 scoops requires another Takeout Plate (e.g. ₦600 for 2 plates, ₦900 for 3 plates).
                    </p>
                  </div>
                </div>

                <button
                  onClick={autoSplitRicePlates}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Organize Rice into Max 5-Scoop Plates</span>
                </button>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
                <p className="font-extrabold text-white text-base">Your tray is empty!</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse B'feastas catalog to select Jollof, Chicken, Egusi or cold Zobo!
                </p>
              </div>
            ) : (
              <>
                {/* Organised Items Grouped by Takeout Plate */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-brand-orange" /> Takeout Plate Arrangement
                    </h4>
                    <span className="text-[11px] font-bold text-brand-lemon-glow">
                      {activePlatesCount} Plate{activePlatesCount === 1 ? '' : 's'} (₦{takeoutFee.toLocaleString()})
                    </span>
                  </div>

                  {sortedPlateNumbers.map((plateNum) => {
                    const plateItems = platesMap[plateNum];
                    const plateRiceScoops = plateItems.filter(i => i.isRice).reduce((sum, i) => sum + i.scoops, 0);

                    return (
                      <div key={plateNum} className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xl">
                        
                        {/* Plate Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-7 h-7 rounded-xl bg-brand-orange/20 text-brand-orange font-black text-xs border border-brand-orange/40 flex items-center justify-center">
                              #{plateNum}
                            </span>
                            <span className="font-extrabold text-white text-sm">
                              🍱 Takeout Plate #{plateNum}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-400 block">
                              Container Fee: <strong className="text-brand-orange">₦{perPackFee}</strong>
                            </span>
                            {plateRiceScoops > 0 && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                plateRiceScoops > 5 
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {plateRiceScoops} / 5 scoops rice max
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Plate Items List */}
                        <div className="space-y-2.5">
                          {plateItems.map((item) => (
                            <div
                              key={item.cartItemId}
                              className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/90 space-y-2"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.image}
                                  alt={item.dishName}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-extrabold text-white text-xs truncate">{item.dishName}</h5>
                                  <p className="text-[11px] text-brand-orange font-bold">
                                    ₦{item.price.toLocaleString()} / {item.unitType || 'portion'}
                                  </p>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-2 mt-1">
                                    <button
                                      onClick={() => updateScoops(item.cartItemId, item.scoops - 1, 99)}
                                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-brand-lemon-glow">
                                      {item.scoops} {item.unitType || 'portion'}{item.scoops > 1 ? 's' : ''}
                                    </span>
                                    <button
                                      onClick={() => updateScoops(item.cartItemId, item.scoops + 1, 99)}
                                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-black text-white">
                                    ₦{(item.price * item.scoops).toLocaleString()}
                                  </p>
                                  <button
                                    onClick={() => removeFromCart(item.cartItemId)}
                                    className="text-slate-500 hover:text-rose-400 p-1 mt-1 inline-block"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Plate Assignment Selector */}
                              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 font-medium">Assign to Plate:</span>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                      key={num}
                                      onClick={() => assignItemToPlate(item.cartItemId, num)}
                                      className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border transition-colors ${
                                        (item.plateNumber || 1) === num
                                          ? 'bg-brand-orange text-white border-brand-orange shadow'
                                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                                      }`}
                                    >
                                      Plate #{num}
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Takeout Options Toggle */}
                <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div
                    onClick={() => setIncludeTakeoutPack(!includeTakeoutPack)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Package className="w-5 h-5 text-brand-lemon-glow" />
                      <div>
                        <p className="text-xs font-extrabold text-white">Plastic Takeout Containers</p>
                        <p className="text-[11px] text-slate-400">
                          {activePlatesCount} container plate{activePlatesCount === 1 ? '' : 's'} (₦{perPackFee} each)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-brand-orange">+₦{takeoutFee.toLocaleString()}</span>
                      {includeTakeoutPack ? (
                        <CheckSquare className="w-5 h-5 text-brand-orange" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <Home className="w-4 h-4 text-sky-400" /> Fulfilment Method
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsHostelDelivery(false)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        !isHostelDelivery
                          ? 'bg-brand-orange/20 border-brand-orange text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Cafeteria Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHostelDelivery(true)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        isHostelDelivery
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Hostel Delivery (+₦500)
                    </button>
                  </div>

                  {isHostelDelivery && (
                    <div className="space-y-1.5 pt-1 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        Enter Hostel Name & Room Number:
                      </label>
                      <input
                        type="text"
                        value={hostelAddress}
                        onChange={(e) => setHostelAddress(e.target.value)}
                        placeholder="e.g. Boys Hostel Block B, Room 204"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Money Breakdown Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
              
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Itemized Price Breakdown:
                </p>

                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-center text-slate-400 gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-[260px]">
                      [Plate #{item.plateNumber || 1}] {item.dishName} ({item.scoops} × ₦{item.price.toLocaleString()})
                    </span>
                    <span className="font-mono font-bold text-slate-200 shrink-0">
                      ₦{(item.price * item.scoops).toLocaleString()}
                    </span>
                  </div>
                ))}

                {takeoutFee > 0 && (
                  <div className="flex justify-between items-center text-brand-orange">
                    <span>Plastic Takeout Containers ({activePlatesCount} plate{activePlatesCount === 1 ? '' : 's'})</span>
                    <span className="font-mono font-bold shrink-0">₦{takeoutFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sky-300">
                  <span className="truncate max-w-[210px] sm:max-w-[270px]">
                    Delivery ({isHostelDelivery ? 'Hostel Room' : 'Cafeteria Pickup'})
                  </span>
                  <span className="font-mono font-bold shrink-0">{isHostelDelivery ? '₦500' : 'FREE'}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-base font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-brand-orange text-lg">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black text-sm shadow-orange-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Creating Order...</span>
                ) : (
                  <>
                    <span>Confirm & Send Receipt to {settings.whatsappName || 'Isaac'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-300"
              >
                Empty Cart
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

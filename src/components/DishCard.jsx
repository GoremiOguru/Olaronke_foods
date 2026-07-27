import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Flame, AlertCircle, Clock, Package, X, Layers, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function DishCard({ dish }) {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const [selectedQty, setSelectedQty] = useState(1);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  // Takeout pack configuration state (for rice dishes)
  const [packs, setPacks] = useState([
    { packNumber: 1, scoops: 3 },
    { packNumber: 2, scoops: 2 }
  ]);

  const { id, name, description, price, scoopsLeft, isAvailable, category, image, unitType, prepTime } = dish;

  const isOutOfStock = !isAvailable || scoopsLeft <= 0;
  const isRiceDish = category === 'Rice Dishes' || unitType === 'scoop' || name.toLowerCase().includes('rice');

  let labelUnit = unitType || 'scoop';
  if (category === 'Drinks & Refreshments') {
    labelUnit = 'bottle';
  } else if (category === 'Chicken & Proteins' && !unitType) {
    labelUnit = price >= 1000 ? 'portion' : 'piece';
  }

  const isMadeToOrder = category === 'Made-to-Order & On-Demand' || prepTime;
  const timeText = prepTime || '40 mins - 1 hr';

  let stockBadgeStyle = "bg-brand-lemon/20 text-brand-lemon-glow border-brand-lemon/40";
  let stockText = `${scoopsLeft} ${labelUnit}${scoopsLeft > 1 ? 's' : ''} left`;

  if (isOutOfStock) {
    stockBadgeStyle = "bg-slate-800 text-slate-400 border-slate-700";
    stockText = "OUT OF STOCK";
  } else if (scoopsLeft <= 5) {
    stockBadgeStyle = "bg-brand-orange/30 text-brand-orange-glow border-brand-orange/60 animate-pulse";
    stockText = `🔥 ONLY ${scoopsLeft} ${labelUnit.toUpperCase()}${scoopsLeft > 1 ? 'S' : ''} LEFT!`;
  } else if (scoopsLeft <= 10) {
    stockBadgeStyle = "bg-amber-500/30 text-amber-300 border-amber-500/50";
    stockText = `⚠️ ${scoopsLeft} ${labelUnit}s remaining`;
  }

  const handleIncrement = () => {
    if (selectedQty < scoopsLeft) {
      setSelectedQty(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedQty > 1) {
      setSelectedQty(prev => prev - 1);
    }
  };

  const handleAddDefault = () => {
    if (isRiceDish) {
      // Auto build initial pack distribution with max 5 scoops per pack
      let remaining = selectedQty;
      const initialPacks = [];
      let packNum = 1;
      while (remaining > 0) {
        const take = Math.min(5, remaining);
        initialPacks.push({ packNumber: packNum++, scoops: take });
        remaining -= take;
      }
      setPacks(initialPacks);
      setIsPackModalOpen(true);
    } else {
      addToCart(dish, selectedQty);
    }
  };

  // Pack modal controls
  const totalPackScoops = packs.reduce((sum, p) => sum + p.scoops, 0);
  const perPackPrice = Number(settings.takeoutPrice) || 300;
  const totalMealCost = totalPackScoops * price;
  const totalContainerCost = packs.length * perPackPrice;
  const grandItemCost = totalMealCost + totalContainerCost;

  const handleUpdatePackScoops = (index, delta) => {
    setPacks(prev => {
      const updated = [...prev];
      const current = updated[index].scoops;
      const nextVal = current + delta;

      // Max 5 scoops per pack constraint
      if (nextVal > 5) {
        alert('⚠️ Maximum 5 scoops of rice allowed per takeout pack!');
        return prev;
      }

      if (nextVal < 1) return prev;

      updated[index] = { ...updated[index], scoops: nextVal };
      return updated;
    });
  };

  const handleAddAnotherPack = () => {
    if (totalPackScoops >= scoopsLeft) {
      alert(`Only ${scoopsLeft} scoops available in kitchen stock!`);
      return;
    }
    setPacks(prev => [
      ...prev,
      { packNumber: prev.length + 1, scoops: Math.min(3, Math.max(1, scoopsLeft - totalPackScoops)) }
    ]);
  };

  const handleRemovePack = (index) => {
    if (packs.length <= 1) {
      alert('You must have at least 1 takeout pack.');
      return;
    }
    setPacks(prev => prev.filter((_, idx) => idx !== index).map((p, i) => ({ ...p, packNumber: i + 1 })));
  };

  const handleConfirmRicePacks = () => {
    if (totalPackScoops > scoopsLeft) {
      alert(`Kitchen stock only has ${scoopsLeft} scoops remaining!`);
      return;
    }
    addToCart(dish, totalPackScoops, packs);
    setIsPackModalOpen(false);
  };

  return (
    <>
      <div className={`group relative bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
        isOutOfStock 
          ? 'border-slate-800 opacity-75' 
          : 'border-slate-800 hover:border-brand-orange/50 hover:shadow-card-hover hover:-translate-y-1'
      }`}>
        
        {/* Top Image Container */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-950">
          <img
            src={image || "/images/jollof_rice.png"}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-110'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

          {/* Category Pill Tag */}
          <span className="absolute top-3 left-3 bg-slate-950/90 text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md">
            {category || 'Campus Meal'}
          </span>

          {/* Stock Counter Badge */}
          <span className={`absolute top-3 right-3 text-xs font-black px-3 py-1 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-1 ${stockBadgeStyle}`}>
            {isOutOfStock ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Flame className="w-3.5 h-3.5" />
            )}
            <span>{stockText}</span>
          </span>
        </div>

        {/* Card Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-extrabold text-white text-lg group-hover:text-brand-orange transition-colors line-clamp-1">
                {name}
              </h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
              {description}
            </p>

            {/* Rice packaging rule note */}
            {isRiceDish && !isOutOfStock && (
              <div className="mt-2 text-[11px] text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Max 5 scoops per pack • Custom pack split allowed</span>
              </div>
            )}

            {/* Made to Order Prep Time Badge */}
            {isMadeToOrder && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Prep Time: {timeText}</span>
              </div>
            )}
          </div>

          {/* Price & Quantity Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Price per {labelUnit}
                </span>
                <span className="text-2xl font-black text-white">
                  ₦{price.toLocaleString()}
                </span>
              </div>

              {/* Quantity Counter */}
              {!isOutOfStock && (
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={handleDecrement}
                    disabled={selectedQty <= 1}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-sm text-brand-lemon-glow">
                    {selectedQty}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={selectedQty >= scoopsLeft}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddDefault}
              disabled={isOutOfStock}
              className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white shadow-orange-glow hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock 
                  ? 'Out of Stock' 
                  : isRiceDish 
                    ? `Configure Takeout Packs (${selectedQty} scoop${selectedQty > 1 ? 's' : ''})`
                    : `Add ${selectedQty} ${labelUnit}${selectedQty > 1 ? 's' : ''} (₦${(price * selectedQty).toLocaleString()})`
                }
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* RICE MULTI-PACK CONFIGURATION MODAL */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-orange/20 text-brand-orange border border-brand-orange/40 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Configure Takeout Packs</h3>
                  <p className="text-[11px] text-slate-400">{name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPackModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rule Callout */}
            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-2xl text-xs text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-300">
                ⚡ Packaging Rule: Max 5 scoops per takeout pack
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Choose how many scoops go into each takeout pack (e.g. 3 scoops in Pack 1, 2 scoops in Pack 2). All packs will be ordered under your single order number!
              </p>
            </div>

            {/* Packs List Builder */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {packs.map((pack, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-white block">
                      Takeout Pack #{pack.packNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {pack.scoops} scoop{pack.scoops > 1 ? 's' : ''} = ₦{(pack.scoops * price).toLocaleString()} (+₦{perPackPrice} pack)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdatePackScoops(idx, -1)}
                        disabled={pack.scoops <= 1}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-black text-sm text-brand-lemon-glow">
                        {pack.scoops}
                      </span>
                      <button
                        onClick={() => handleUpdatePackScoops(idx, 1)}
                        disabled={pack.scoops >= 5}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {packs.length > 1 && (
                      <button
                        onClick={() => handleRemovePack(idx)}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-500/30"
                        title="Remove Pack"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Pack Button */}
            <button
              onClick={handleAddAnotherPack}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Takeout Pack</span>
            </button>

            {/* Price Summary Breakdown */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Rice Scoops:</span>
                <span className="font-bold text-white">{totalPackScoops} scoops (₦{totalMealCost.toLocaleString()})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Takeout Packs ({packs.length} containers):</span>
                <span className="font-bold text-brand-orange">+₦{totalContainerCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm pt-1.5 border-t border-slate-800">
                <span>Total Item Cost:</span>
                <span className="text-brand-lemon-glow">₦{grandItemCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Confirm & Add Button */}
            <button
              onClick={handleConfirmRicePacks}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-black text-sm shadow-orange-glow flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Add {packs.length} Takeout Pack(s) to Cart Tray</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
}

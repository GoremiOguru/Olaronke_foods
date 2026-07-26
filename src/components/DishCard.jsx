import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Flame, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function DishCard({ dish }) {
  const { addToCart } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);

  const { id, name, description, price, scoopsLeft, isAvailable, category, image, unitType } = dish;

  const isOutOfStock = !isAvailable || scoopsLeft <= 0;

  let labelUnit = unitType || 'scoop';
  if (category === 'Drinks & Refreshments') {
    labelUnit = 'bottle';
  } else if (category === 'Chicken & Proteins') {
    labelUnit = price >= 1000 ? 'portion' : 'piece';
  }

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

  const handleAdd = () => {
    addToCart(dish, selectedQty);
  };

  return (
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
            onClick={handleAdd}
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
                : `Add ${selectedQty} ${labelUnit}${selectedQty > 1 ? 's' : ''} (₦${(price * selectedQty).toLocaleString()})`
              }
            </span>
          </button>

        </div>

      </div>

    </div>
  );
}

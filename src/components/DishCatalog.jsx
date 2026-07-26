import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Flame, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import DishCard from './DishCard';

export default function DishCatalog() {
  const { dishes } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['All', 'Rice Dishes', 'Chicken & Proteins', 'Swallow & Soups', 'Sides & Extras', 'Made-to-Order & On-Demand', 'Drinks & Refreshments'];

  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (selectedCategory !== 'All') {
      result = result.filter(d => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'scoops') {
        return b.scoopsLeft - a.scoopsLeft;
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (a.isAvailable !== b.isAvailable) return b.isAvailable ? 1 : -1;
      return b.scoopsLeft - a.scoopsLeft;
    });

    return result;
  }, [dishes, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-brand-orange font-black text-xs uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 animate-bounce" /> Live Kitchen Menu
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Today's B'feastas Dishes & Portions
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Rice & Meat at ₦500. Chicken at ₦2k / ₦1.5k / ₦1k. Drinks in bottles.
          </p>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-slate-950 text-white">Recommended</option>
            <option value="scoops" className="bg-slate-950 text-white">Most Stock Left</option>
            <option value="price-asc" className="bg-slate-950 text-white">Price: Low to High</option>
            <option value="price-desc" className="bg-slate-950 text-white">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 mb-8">
        
        {/* Search Input Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Jollof, Chicken, Egusi, Amala, Dodo, Zobo..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange text-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all placeholder:text-slate-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-orange text-white shadow-orange-glow scale-105'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 my-8">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-white">No dishes match your search</h3>
          <p className="text-slate-400 text-xs mt-1">Try resetting category filters or searching for another campus meal.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}

    </section>
  );
}

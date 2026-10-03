import React, { useState, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal, Flame, Sparkles, ChevronLeft, ChevronRight, ArrowRight, Grid, LayoutList, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import DishCard from './DishCard';

export default function DishCatalog() {
  const { dishes, refreshDishes } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoryList = [
    'Rice Dishes',
    'Chicken & Proteins',
    'Swallow & Soups',
    'Sides & Extras',
    'Drinks & Refreshments',
    'Made-to-Order & On-Demand'
  ];

  const categories = ['All', ...categoryList];

  const categoryCounts = useMemo(() => {
    const counts = { All: dishes.length };
    categoryList.forEach(cat => {
      counts[cat] = dishes.filter(d => d.category === cat).length;
    });
    return counts;
  }, [dishes]);

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

  // Group & sort dishes by category for 'All' view, ordered by best-selling & fast-moving meals
  const groupedDishes = useMemo(() => {
    const map = {};
    categoryList.forEach(cat => {
      let items = filteredDishes.filter(d => d.category === cat);
      if (items.length > 0) {
        items.sort((a, b) => {
          if (a.isAvailable !== b.isAvailable) return b.isAvailable ? 1 : -1;
          const salesA = Number(a.salesCount || a.portionsSold || 0);
          const salesB = Number(b.salesCount || b.portionsSold || 0);
          if (salesB !== salesA) return salesB - salesA;
          return Number(a.scoopsLeft ?? 30) - Number(b.scoopsLeft ?? 30);
        });
        map[cat] = items;
      }
    });
    return map;
  }, [filteredDishes]);

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const scrollContainer = (containerId, direction) => {
    const el = document.getElementById(containerId);
    if (el) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-orange font-black text-xs uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 animate-bounce" /> Live Kitchen Menu & Stock
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Today's B'feastas Dishes & Refreshments
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Smoky Jollof & Meat at ₦500/scoop • Sweet Dodo at ₦100/piece • Swipe sideways to view category menus
          </p>
        </div>

        {/* Controls: Refresh Button, Layout Mode Switch & Sorting */}
        <div className="flex items-center space-x-2">

          {/* 1-Tap Manual Refresh Button */}
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refreshDishes();
              setTimeout(() => setIsRefreshing(false), 600);
            }}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 disabled:opacity-50"
            title="Refresh Live Menu & Stock"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-lemon-glow ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('carousel')}
              className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold ${
                viewMode === 'carousel'
                  ? 'bg-brand-orange text-white shadow-orange-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Horizontal Swipe View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Swipe View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold ${
                viewMode === 'grid'
                  ? 'bg-brand-orange text-white shadow-orange-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Expanded Grid View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
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
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 mb-8">
        
        {/* Search Input Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Jollof, Chicken, Egusi, Amala, Dodo, Zobo..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange text-white pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all placeholder:text-slate-500 shadow-inner"
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

        {/* Category Filter Pills with Item Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-orange to-amber-600 text-white shadow-orange-glow scale-105'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-slate-950 text-brand-lemon-glow' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Catalog Rendering */}
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
            className="mt-4 px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : selectedCategory !== 'All' || viewMode === 'grid' ? (
        
        /* Single Selected Category or Full Grid Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>{selectedCategory === 'All' ? 'All Live Menu Dishes' : selectedCategory}</span>
              <span className="text-xs text-brand-lemon-glow font-mono font-bold">({filteredDishes.length} items)</span>
            </h3>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors flex items-center gap-1"
              >
                <span>View All Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>

      ) : (

        /* ALL CATEGORIES VIEW: Horizontal Swipe Carousels per Category */
        <div className="space-y-10">
          {Object.keys(groupedDishes).map((catName) => {
            const catDishes = groupedDishes[catName];
            const isExpanded = expandedCategories[catName];
            const containerId = `carousel-${catName.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const displayDishes = isExpanded ? catDishes : catDishes.slice(0, 3);

            return (
              <div key={catName} className="space-y-4 border-b border-slate-900 pb-8 last:border-none">
                
                {/* Category Section Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>{catName}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-brand-lemon-glow font-mono font-bold">
                        {catDishes.length <= 3
                          ? `${catDishes.length} ${catDishes.length === 1 ? 'Item' : 'Items'}`
                          : (isExpanded ? `All ${catDishes.length} Items` : `Top 3 Best-Sellers (${catDishes.length} Total)`)}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Horizontal Scroll Control Arrows */}
                    <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => scrollContainer(containerId, 'left')}
                        className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(containerId, 'right')}
                        className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* View All / Expand Category Button */}
                    {catDishes.length > 3 && (
                      <button
                        onClick={() => toggleCategoryExpand(catName)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-orange border border-brand-orange/40 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                      >
                        <span>{isExpanded ? 'Show Top 3 Only' : `View All ${catDishes.length} (+${catDishes.length - 3} More)`}</span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Horizontal Swipe Carousel Container */}
                <div
                  id={containerId}
                  className="flex items-stretch gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scrollbar-none scroll-smooth"
                >
                  {displayDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="w-72 sm:w-80 shrink-0 snap-start flex flex-col"
                    >
                      <DishCard dish={dish} />
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

          {/* Bottom Expand All / View Full Grid Button */}
          <div className="pt-6 border-t border-slate-800 text-center space-y-2">
            <button
              onClick={() => setViewMode('grid')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border border-slate-700 hover:border-brand-orange transition-all inline-flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Grid className="w-4 h-4 text-brand-lemon-glow" />
              <span>Expand Full Menu Grid ({filteredDishes.length} Dishes Available)</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Easily view all campus food, swallow, chicken, extras, and chilled drinks on a single screen.
            </p>
          </div>

        </div>

      )}

    </section>
  );
}


import React, { useState } from 'react';
import { ShoppingBag, User, LogOut, ShieldCheck, Flame, Bell, ChevronDown, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ onOpenAuth, onOpenAdmin, isAdminView, setIsAdminView }) {
  const { user, logout, isAdmin } = useAuth();
  const { totalQuantityCount, setIsCartOpen } = useCart();
  const { isConnected, notifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo: B'feastas */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsAdminView(false)}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-lemon flex items-center justify-center shadow-orange-glow transition-transform hover:scale-105">
              <UtensilsCrossed className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-white font-sans">
                  B'<span className="text-brand-orange">fea</span><span className="text-brand-lemon">stas</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-brand-lemon/20 text-brand-lemon-glow rounded-full border border-brand-lemon/40">
                  Campus Gourmet
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-lemon-glow animate-ping' : 'bg-amber-400'}`}></span>
                {isConnected ? 'Kitchen Live Sync Active' : 'Connecting to Kitchen...'}
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Admin Switcher */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminView(!isAdminView)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-extrabold text-sm transition-all shadow-md ${
                  isAdminView
                    ? 'bg-brand-lemon text-slate-950 hover:bg-lime-400 shadow-lemon-glow'
                    : 'bg-slate-800 text-brand-lemon border border-brand-lemon/40 hover:border-brand-lemon'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAdminView ? 'Switch to Student View' : 'Admin Control Panel'}</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative border border-slate-800"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-[11px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-orange" /> Notifications
                    </h4>
                    <span className="text-xs text-slate-400">{notifications.length} new</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5 mt-3 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                          <p className="font-semibold text-white mb-0.5">{n.title}</p>
                          <p className="text-slate-300">{n.message}</p>
                          {n.timestamp && <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2.5 bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-orange-glow hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Cart</span>
              {totalQuantityCount > 0 && (
                <span className="bg-brand-lemon text-slate-950 px-2 py-0.5 text-xs font-black rounded-full shadow-inner">
                  {totalQuantityCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-brand-lemon/50 text-white px-3.5 py-2 rounded-xl text-sm transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-lemon/20 text-brand-lemon font-extrabold flex items-center justify-center text-xs uppercase border border-brand-lemon/30">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-brand-lemon/20 text-brand-lemon-glow rounded border border-brand-lemon/30">
                        {user.role === 'admin' ? 'Vendor Admin Staff' : 'Topfaith Student Verified'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:border-brand-lemon/60"
              >
                <User className="w-4 h-4 text-brand-lemon" />
                <span>Student Login</span>
              </button>
            )}

          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-brand-orange text-white rounded-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalQuantityCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-lemon text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalQuantityCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          {isAdmin && (
            <button
              onClick={() => {
                setIsAdminView(!isAdminView);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-brand-lemon text-slate-950 font-black py-2.5 rounded-xl text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdminView ? 'Switch to Catalog' : 'Admin Control Panel'}</span>
            </button>
          )}

          {user ? (
            <div className="bg-slate-900 p-3 rounded-xl space-y-2 border border-slate-800">
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-rose-400 flex items-center gap-1.5 pt-2 border-t border-slate-800"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-brand-orange text-white py-2.5 rounded-xl font-extrabold text-sm"
            >
              Student Login / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DishCatalog from './components/DishCatalog';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import WhatsAppModal from './components/WhatsAppModal';
import MyOrdersModal from './components/MyOrdersModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import AdminDashboard from './components/AdminDashboard';
import NotificationToast from './components/NotificationToast';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isAdmin } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-red selection:text-white">
      
      {/* Global Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Main Content Area: Switch between Admin Dashboard and Student View */}
      <main className="flex-1">
        {isAdminView && isAdmin ? (
          <AdminDashboard />
        ) : (
          <>
            <Hero onExploreClick={scrollToCatalog} />
            <DishCatalog />
          </>
        )}
      </main>

      {/* Shared Modals & Overlays */}
      <CartDrawer onOpenAuth={() => setIsAuthOpen(true)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <WhatsAppModal />
      <MyOrdersModal isOpen={isMyOrdersOpen} onClose={() => setIsMyOrdersOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <NotificationToast />

      {/* Footer */}
      <Footer />

    </div>
  );
}

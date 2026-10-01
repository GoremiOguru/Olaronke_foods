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
import HowToUseModal from './components/HowToUseModal';
import NotificationToast from './components/NotificationToast';
import TechSupportFloatingWidget from './components/TechSupportFloatingWidget';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isAdmin } = useAuth();
  const [isAdminView, setIsAdminView] = useState(() => {
    try {
      return localStorage.getItem('olaronke_admin_view') === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [howToUseMode, setHowToUseMode] = useState('student');

  const openHowToUse = (mode = 'student') => {
    setHowToUseMode(mode);
    setIsHowToUseOpen(true);
  };

  const handleSetAdminView = (val) => {
    setIsAdminView(val);
    try {
      localStorage.setItem('olaronke_admin_view', String(val));
    } catch {}
  };

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
        onOpenAdmin={() => handleSetAdminView(true)}
        isAdminView={isAdminView}
        setIsAdminView={handleSetAdminView}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenHowToUse={() => openHowToUse(isAdminView ? 'admin' : 'student')}
      />

      {/* Main Content Area: Switch between Admin Dashboard and Student View */}
      <main className="flex-1">
        {isAdminView && isAdmin ? (
          <AdminDashboard onOpenHowToUse={() => openHowToUse('admin')} />
        ) : (
          <>
            <Hero onExploreClick={scrollToCatalog} onOpenHowToUse={() => openHowToUse('student')} />
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
      <HowToUseModal isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} mode={howToUseMode} />
      <NotificationToast />
      <TechSupportFloatingWidget />

      {/* Footer */}
      <Footer onOpenHowToUse={() => openHowToUse(isAdminView ? 'admin' : 'student')} />

    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  accountName: 'OLARONKE OGIDAN',
  bankName: 'MONIEPOINT',
  accountNumber: '8234786544',
  whatsappName: 'Isaac',
  whatsappNumber: '08133314798',
  takeoutPrice: 300,
  studentDomain: '@topfaith.edu.ng',
  heroTitle: "Welcome to B'feastas",
  heroSubtitle: "Fresh Meals, Live Portion Sync! Order Nigerian Jollof, Fried Rice, Peppered Meat, Chicken & Drinks with fast cafeteria pickup or hostel delivery.",
  announcementText: "Topfaith University Campus Gourmet Dining"
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('olaronke_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = { ...defaultSettings, ...data };
          setSettings(merged);
          localStorage.setItem('olaronke_settings', JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch settings from server:', err);
    }
  };

  useEffect(() => {
    refreshSettings();

    const handleUpdated = () => {
      try {
        const saved = localStorage.getItem('olaronke_settings');
        if (saved) {
          setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {}
    };

    window.addEventListener('olaronke_settings_updated', handleUpdated);
    return () => window.removeEventListener('olaronke_settings_updated', handleUpdated);
  }, []);

  const updateSettingsState = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('olaronke_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings: updateSettingsState, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return { settings: defaultSettings, setSettings: () => {}, refreshSettings: () => {} };
  }
  return context;
}

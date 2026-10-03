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

function sanitizeSettings(settingsObj) {
  if (!settingsObj || typeof settingsObj !== 'object') return defaultSettings;
  const clean = { ...defaultSettings, ...settingsObj };

  // Sanitize whatsappName: if it is JSON, array, or abnormally long string, fallback to 'Isaac'
  if (typeof clean.whatsappName !== 'string' || clean.whatsappName.trim().startsWith('{') || clean.whatsappName.trim().startsWith('[') || clean.whatsappName.length > 40) {
    clean.whatsappName = 'Isaac';
  }
  if (typeof clean.accountName !== 'string' || clean.accountName.trim().startsWith('{') || clean.accountName.length > 80) {
    clean.accountName = defaultSettings.accountName;
  }
  if (typeof clean.bankName !== 'string' || clean.bankName.trim().startsWith('{') || clean.bankName.length > 50) {
    clean.bankName = defaultSettings.bankName;
  }
  if (typeof clean.accountNumber !== 'string' || clean.accountNumber.trim().startsWith('{') || clean.accountNumber.length > 30) {
    clean.accountNumber = defaultSettings.accountNumber;
  }
  if (typeof clean.whatsappNumber !== 'string' || clean.whatsappNumber.trim().startsWith('{') || clean.whatsappNumber.length > 30) {
    clean.whatsappNumber = defaultSettings.whatsappNumber;
  }
  return clean;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('olaronke_settings');
      return saved ? sanitizeSettings(JSON.parse(saved)) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      let localObj = {};
      try {
        const saved = localStorage.getItem('olaronke_settings');
        if (saved) localObj = JSON.parse(saved);
      } catch (e) {}

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = sanitizeSettings({ ...data, ...localObj });
          setSettings(merged);
          localStorage.setItem('olaronke_settings', JSON.stringify(merged));
        }
      } else if (Object.keys(localObj).length > 0) {
        setSettings(prev => sanitizeSettings({ ...prev, ...localObj }));
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
          setSettings(prev => sanitizeSettings({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {}
    };

    window.addEventListener('olaronke_settings_updated', handleUpdated);
    return () => window.removeEventListener('olaronke_settings_updated', handleUpdated);
  }, []);

  const updateSettingsState = (newSettings) => {
    setSettings(prev => {
      const updated = sanitizeSettings({ ...prev, ...newSettings });
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

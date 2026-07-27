import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

// Register Service Worker for Home Screen Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW registration notice:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <SocketProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SocketProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);

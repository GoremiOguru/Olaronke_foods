import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { defaultDishes } from '../data/defaultDishes';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dishes, setDishes] = useState(defaultDishes);
  const [notifications, setNotifications] = useState([]);
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const { user } = useAuth();

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          new Notification("🔔 B'feastas Notifications Active!", {
            body: "You will now receive instant phone alerts when students place new orders.",
            icon: "/images/jollof_rice.png"
          });
        }
        return perm;
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
    return 'denied';
  };

  useEffect(() => {
    // Connect socket safely (avoids crashing on serverless deployments)
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('🌐 Socket connected to B\'feastas server');
      setIsConnected(true);

      // Join appropriate user room
      if (user) {
        newSocket.emit('join:room', {
          userId: user.id,
          role: user.role
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Listen for live inventory updates (scoops left, prices, availability)
    newSocket.on('inventory:update', (updatedDishes) => {
      if (Array.isArray(updatedDishes) && updatedDishes.length > 0) {
        setDishes(updatedDishes);
      }
    });

    // Listen for new student orders (Notify Admin Staff on phone & browser)
    newSocket.on('order:new', (newOrder) => {
      if (user && user.role === 'admin') {
        const toast = {
          id: Date.now(),
          title: `🚨 New Order #${newOrder.id}`,
          message: `${newOrder.studentName} placed an order! Secret Code: #${newOrder.pickupCode || '582'}`,
          type: 'alert',
          timestamp: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [toast, ...prev]);

        // Send Phone Home Screen / Native Web Notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`🚨 B'feastas Order #${newOrder.id}`, {
              body: `Student: ${newOrder.studentName}\nPickup Code: #${newOrder.pickupCode || '582'}\nTotal: ₦${newOrder.totalPrice.toLocaleString()}`,
              icon: "/images/jollof_rice.png",
              badge: "/images/jollof_rice.png"
            });
          } catch (e) {
            console.error('Notification error:', e);
          }
        }
      }
    });

    // Listen for order status updates
    newSocket.on('order:status_updated', (updatedOrder) => {
      if (user && (updatedOrder.studentId === user.id || user.role === 'admin')) {
        const toast = {
          id: Date.now(),
          title: `Order #${updatedOrder.id} Status Updated`,
          message: `Order status is now: "${updatedOrder.status}"`,
          type: 'info',
          timestamp: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [toast, ...prev]);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && updatedOrder.studentId === user.id) {
          try {
            new Notification(`🍱 B'feastas Order #${updatedOrder.id}`, {
              body: `Your order status is now: ${updatedOrder.status}`,
              icon: "/images/jollof_rice.png"
            });
          } catch (e) {}
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Update room membership when user auth changes
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('join:room', {
        userId: user.id,
        role: user.role
      });
    }
  }, [user, socket, isConnected]);

  const refreshDishes = async () => {
    try {
      const res = await fetch('/api/dishes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDishes(data);
        }
      }
    } catch (err) {
      console.warn('Refresh dishes failed:', err);
    }
  };

  // Initial fetch and 5-second polling for real-time catalog & stock sync across all devices
  useEffect(() => {
    refreshDishes();
    const interval = setInterval(refreshDishes, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (toast) => {
    setNotifications(prev => [toast, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      dishes,
      setDishes,
      refreshDishes,
      notifications,
      addNotification,
      removeNotification,
      pushPermission,
      requestPushPermission
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { defaultDishes } from '../data/defaultDishes';
import { dbGetAll, dbPut } from '../utils/offlineDb';
import { sendNativePushNotification } from '../utils/pushNotification';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dishes, setDishes] = useState(() => {
    try {
      const saved = localStorage.getItem('olaronke_custom_dishes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultDishes;
  });

  // Seed dishes from high-capacity IndexedDB on mount
  useEffect(() => {
    dbGetAll('dishes').then(stored => {
      if (Array.isArray(stored) && stored.length > 0) {
        setDishes(prev => {
          const map = new Map();
          (prev || []).forEach(d => map.set(d.id, d));
          stored.forEach(d => map.set(d.id, { ...(map.get(d.id) || {}), ...d }));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});
  }, []);

  // Save custom dish edits & images to IndexedDB and localStorage for persistent state across refreshes & cold starts
  useEffect(() => {
    try {
      localStorage.setItem('olaronke_custom_dishes', JSON.stringify(dishes));
    } catch (e) {}
    if (Array.isArray(dishes)) {
      dishes.forEach(d => dbPut('dishes', d));
    }
  }, [dishes]);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [notifications, setNotifications] = useState([]);
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const { user, token } = useAuth();
  const knownStudentStatusesRef = useRef(new Map());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshDishes();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
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
      const isStudentMatch = user && (
        updatedOrder.studentId === user.id ||
        updatedOrder.studentEmail?.toLowerCase() === user.email?.toLowerCase()
      );

      if (isStudentMatch || (user && (user.role === 'admin' || user.role === 'superadmin'))) {
        let title = `Order #${updatedOrder.id} Status Updated`;
        let desc = `Order status is now: "${updatedOrder.status}"`;
        const s = (updatedOrder.status || '').toLowerCase();
        const code = updatedOrder.pickupCode ? (String(updatedOrder.pickupCode).startsWith('GEN-') ? updatedOrder.pickupCode : `GEN-${String(updatedOrder.pickupCode).padStart(3, '0')}`) : 'GEN-001';

        if (s.includes('preparing') || s.includes('cooking') || s.includes('confirmed')) {
          title = `👨‍🍳 Food Cooking: Order #${updatedOrder.id}`;
          desc = `Payment verified! Cafeteria kitchen is cooking & dishing your hot meal. Official receipt is unlocked!`;
        } else if (s.includes('ready')) {
          if (updatedOrder.isHostelDelivery) {
            title = `🚴 Out for Delivery: Order #${updatedOrder.id}`;
            desc = `Your meal is hot & on the way to your hostel/faculty! Please be ready at the entrance lobby.`;
          } else {
            title = `🔔 Ready for Pickup: Order #${updatedOrder.id}`;
            desc = `Your food is ready! Show Secret Code #${code} at the cafeteria counter to collect.`;
          }
        } else if (s.includes('completed')) {
          title = `✅ Meal Handed Over: Order #${updatedOrder.id}`;
          desc = `Order completed. Thank you for dining with Benefeastas!`;
        }

        const toast = {
          id: Date.now(),
          title,
          message: desc,
          type: 'info',
          timestamp: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [toast, ...prev]);

        if (isStudentMatch) {
          sendNativePushNotification(title, {
            body: desc,
            icon: '/images/compay logo.jpeg',
            badge: '/images/compay logo.jpeg',
            tag: `bfeastas-order-${updatedOrder.id}-${updatedOrder.status}`,
            renotify: true
          });
        }
      }
    });

    // Listen for settings updates
    newSocket.on('settings:update', (newSettings) => {
      try {
        localStorage.setItem('olaronke_settings', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('olaronke_settings_updated'));
      } catch (e) {}
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/dishes', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsConnected(true);
        setIsOnline(true);
        const serverData = await res.json();
        if (Array.isArray(serverData) && serverData.length > 0) {
          // Do not overwrite dishes if admin (Mrs. Olaronke) has pending offline edits waiting to sync
          let hasPendingAdminActions = false;
          try {
            const rawPending = localStorage.getItem('olaronke_pending_admin_actions');
            hasPendingAdminActions = rawPending && JSON.parse(rawPending)?.length > 0;
          } catch (e) {}

          if (!hasPendingAdminActions) {
            setDishes(serverData);
            try {
              localStorage.setItem('olaronke_custom_dishes', JSON.stringify(serverData));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn('Network request timed out on weak connection.');
      } else {
        console.warn('Refresh dishes failed:', err);
      }
    }
  };

  // Adaptive Polling: 5s when tab is active, 45s when phone screen is locked or tab is hidden
  useEffect(() => {
    refreshDishes();
    let intervalId = setInterval(refreshDishes, 5000);

    const handleVisibilityChange = () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined' && document.hidden) {
        // Tab backgrounded or phone locked: throttle to 45s to preserve battery & edge quota
        intervalId = setInterval(refreshDishes, 45000);
      } else {
        // User returned to screen: refresh immediately and resume 5s interval
        refreshDishes();
        intervalId = setInterval(refreshDishes, 5000);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  // Student Background Order Tracker: notifies device homescreen/lockscreen when away from page
  useEffect(() => {
    if (!token || !user) return;
    if (user.role === 'admin' || user.role === 'superadmin') return;

    const checkStudentOrdersStatus = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const list = await res.json();
        if (!Array.isArray(list)) return;

        const myOrders = list.filter(o => 
          o.studentId === user.id || 
          o.studentEmail?.toLowerCase() === user.email?.toLowerCase()
        );

        for (const ord of myOrders) {
          const prevStatus = knownStudentStatusesRef.current.get(ord.id);
          if (prevStatus && prevStatus !== ord.status) {
            const pickupCode = ord.pickupCode ? (String(ord.pickupCode).startsWith('GEN-') ? ord.pickupCode : `GEN-${String(ord.pickupCode).padStart(3, '0')}`) : 'GEN-001';
            let title = `🍱 Order #${ord.id} Updated`;
            let desc = `Your order status is now: ${ord.status}`;

            const s = (ord.status || '').toLowerCase();
            if (s.includes('preparing') || s.includes('cooking') || s.includes('confirmed')) {
              title = `👨‍🍳 Food Cooking: Order #${ord.id}`;
              desc = `Payment verified! Cafeteria kitchen is cooking & dishing your hot meal. Official receipt is unlocked!`;
            } else if (s.includes('ready')) {
              if (ord.isHostelDelivery) {
                title = `🚴 Out for Delivery: Order #${ord.id}`;
                desc = `Your meal is hot & on the way to your hostel/faculty! Please be ready at the entrance lobby.`;
              } else {
                title = `🔔 Ready for Pickup: Order #${ord.id}`;
                desc = `Your food is ready! Show Secret Code #${pickupCode} at the cafeteria counter to collect.`;
              }
            } else if (s.includes('completed')) {
              title = `✅ Meal Handed Over: Order #${ord.id}`;
              desc = `Order completed. Thank you for dining with Benefeastas!`;
            }

            addNotification({
              id: Date.now() + Math.random(),
              title,
              message: desc,
              type: 'success'
            });

            // Native push notification for home screen / device lockscreen
            sendNativePushNotification(title, {
              body: desc,
              icon: '/images/compay logo.jpeg',
              badge: '/images/compay logo.jpeg',
              tag: `bfeastas-poll-${ord.id}-${ord.status}`,
              renotify: true
            });
          }
          knownStudentStatusesRef.current.set(ord.id, ord.status);
        }
      } catch (e) {}
    };

    checkStudentOrdersStatus();
    const studentPollInterval = setInterval(checkStudentOrdersStatus, 4000);
    return () => clearInterval(studentPollInterval);
  }, [user, token]);

  const addNotification = (toast) => {
    const toastId = toast.id || Date.now() + Math.random();
    const newToast = { ...toast, id: toastId };
    setNotifications(prev => [newToast, ...prev.slice(0, 2)]);
    setTimeout(() => {
      removeNotification(toastId);
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      isOnline,
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

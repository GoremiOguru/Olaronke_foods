import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useSettings } from './SettingsContext';
import { getNextDailyPickupCode, dbPut } from '../utils/offlineDb';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('olaronke_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [includeTakeoutPack, setIncludeTakeoutPack] = useState(false);
  const [plateSize, setPlateSize] = useState(200); // 100 | 200 | 300
  const [isHostelDelivery, setIsHostelDelivery] = useState(false);
  const [hostelAddress, setHostelAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState('ASAP'); // 'ASAP' | '12:30 PM' | '1:15 PM' | '2:00 PM' | '5:30 PM'
  const [studentPhone, setStudentPhone] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user } = useAuth();

  useEffect(() => {
    if (user?.phone && !studentPhone) {
      setStudentPhone(user.phone);
    }
  }, [user, studentPhone]);
  const { addNotification, refreshDishes } = useSocket();
  const { settings } = useSettings();

  useEffect(() => {
    try {
      localStorage.setItem('olaronke_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (dish, scoops = 1, targetPlate = 1) => {
    // Safety buffer: prevent offline reservation on critical low stock to prevent kitchen shortages
    if (typeof navigator !== 'undefined' && !navigator.onLine && dish.scoopsLeft <= 2) {
      addNotification({
        id: Date.now(),
        title: '⚠️ Low Kitchen Stock',
        message: `Only ${dish.scoopsLeft} portion(s) left of ${dish.name}. Please connect to internet or order at the counter!`,
        type: 'warning'
      });
      return;
    }

    if (!dish.isAvailable || dish.scoopsLeft <= 0) {
      addNotification({
        id: Date.now(),
        title: 'Item Unavailable',
        message: `Sorry, ${dish.name} is currently out of stock.`,
        type: 'error'
      });
      return;
    }

    const isRice = dish.category === 'Rice Dishes' || dish.unitType === 'scoop' || dish.name.toLowerCase().includes('rice');
    const resolvedUnit = (dish.unitType && dish.unitType !== 'scoop')
      ? dish.unitType
      : (dish.category === 'Drinks & Refreshments' ? 'bottle'
      : (dish.category === 'Sides & Extras' ? 'piece'
      : (dish.category === 'Chicken & Proteins' ? 'portion'
      : (isRice ? 'scoop' : 'portion'))));

    setCart(prev => {
      // Find existing item for this dish in the SAME target plate
      const existingIndex = prev.findIndex(item => item.dishId === dish.id && (item.plateNumber || 1) === targetPlate);
      
      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newScoops = existingItem.scoops + scoops;

        if (newScoops > dish.scoopsLeft) {
          addNotification({
            id: Date.now(),
            title: 'Stock Limit Reached',
            message: `Only ${dish.scoopsLeft} available for ${dish.name}!`,
            type: 'warning'
          });
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existingItem, scoops: newScoops };
        return updated;
      } else {
        if (scoops > dish.scoopsLeft) {
          addNotification({
            id: Date.now(),
            title: 'Stock Limit Exceeded',
            message: `Only ${dish.scoopsLeft} available!`,
            type: 'warning'
          });
          return prev;
        }

        return [...prev, {
          cartItemId: `${dish.id}-plate${targetPlate}-${Date.now()}`,
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          scoops: scoops,
          unitType: resolvedUnit,
          image: dish.image,
          category: dish.category,
          isRice: isRice,
          plateNumber: targetPlate
        }];
      }
    });

    addNotification({
      id: Date.now(),
      title: 'Added to Takeout Tray!',
      message: `${scoops} ${dish.unitType || 'portion'}(s) of ${dish.name} assigned to Plate #${targetPlate}.`,
      type: 'success'
    });
  };

  const updateScoops = (cartItemId, newScoops, maxAvailable) => {
    if (newScoops <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    if (newScoops > maxAvailable) {
      addNotification({
        id: Date.now(),
        title: 'Stock Limit',
        message: `Only ${maxAvailable} available in kitchen!`,
        type: 'warning'
      });
      return;
    }

    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, scoops: newScoops } : item));
  };

  const assignItemToPlate = (cartItemId, targetPlateNumber) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, plateNumber: Math.max(1, Number(targetPlateNumber)) };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Rice 5-scoop plate capacity auto-split helper
  const autoSplitRicePlates = () => {
    setCart(prev => {
      const updatedCart = [];

      prev.forEach(item => {
        if (item.isRice && item.scoops > 5) {
          // Split into multiple entries of max 5 scoops per plate
          let remaining = item.scoops;
          let currentPlate = item.plateNumber || 1;

          while (remaining > 0) {
            const scoopsInThisPlate = Math.min(5, remaining);
            updatedCart.push({
              ...item,
              cartItemId: `${item.dishId}-plate${currentPlate}-${Date.now()}-${Math.random()}`,
              scoops: scoopsInThisPlate,
              plateNumber: currentPlate
            });
            remaining -= scoopsInThisPlate;
            currentPlate += 1;
          }
        } else {
          updatedCart.push(item);
        }
      });

      return updatedCart;
    });

    addNotification({
      id: Date.now(),
      title: '🍱 Takeout Plates Organized!',
      message: 'Rice portions automatically split into Takeout Plates with max 5 scoops each.',
      type: 'success'
    });
  };

  // Auto-sync pending offline orders whenever connection is available
  useEffect(() => {
    const syncPendingOfflineOrders = async () => {
      try {
        const raw = localStorage.getItem('olaronke_pending_offline_orders');
        if (!raw) return;
        const pending = JSON.parse(raw);
        if (!Array.isArray(pending) || pending.length === 0) return;

        const remaining = [];
        for (const order of pending) {
          try {
            const authToken = order.savedToken || token;
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
              },
              body: JSON.stringify({ ...order, isOfflineOrder: true })
            });

            if (res.ok) {
              const syncedData = await res.json();
              addNotification({
                id: Date.now(),
                title: '⚡ Offline Order Synced!',
                message: `Order #${syncedData.id} (Code #${syncedData.pickupCode}) synced to cafeteria kitchen.`,
                type: 'success'
              });

              setActiveReceiptModal(curr => {
                if (curr && (curr.id === order.id || curr.pickupCode === order.pickupCode)) {
                  return { ...curr, ...syncedData, isOfflineOrder: false };
                }
                return curr;
              });
            } else {
              const errRes = await res.json().catch(() => ({}));
              if (errRes.message && errRes.message.toLowerCase().includes('out of stock')) {
                addNotification({
                  id: Date.now(),
                  title: '⚠️ Stock Sold Out',
                  message: errRes.message,
                  type: 'error'
                });
              } else {
                remaining.push(order);
              }
            }
          } catch (err) {
            remaining.push(order);
          }
        }

        localStorage.setItem('olaronke_pending_offline_orders', JSON.stringify(remaining));
      } catch (e) {
        console.error('Error during offline order synchronization:', e);
      }
    };

    window.addEventListener('online', syncPendingOfflineOrders);
    const interval = setInterval(syncPendingOfflineOrders, 4000);
    syncPendingOfflineOrders();

    return () => {
      window.removeEventListener('online', syncPendingOfflineOrders);
      clearInterval(interval);
    };
  }, [token]);

  // Get active plate numbers in cart
  const activePlatesSet = new Set(cart.map(item => item.plateNumber || 1));
  const activePlatesCount = Math.max(1, activePlatesSet.size);

  const perPackPrice = Number(plateSize) || 200;
  const mealsTotal = cart.reduce((sum, item) => sum + (item.price * item.scoops), 0);
  const takeoutFee = includeTakeoutPack ? (activePlatesCount * perPackPrice) : 0;

  // Mass Faculty and Engineering Faculty delivery price is ₦700; other hostels and faculties are ₦500
  const isSpecialFacultyDelivery = isHostelDelivery && hostelAddress && (
    hostelAddress.toLowerCase().includes('mass') || 
    hostelAddress.toLowerCase().includes('engineering')
  );
  const deliveryFee = isHostelDelivery ? (isSpecialFacultyDelivery ? 700 : 500) : 0;
  const grandTotal = mealsTotal + takeoutFee + deliveryFee;
  const totalQuantityCount = cart.reduce((sum, item) => sum + item.scoops, 0);

  // Check if any single plate has more than 5 scoops of rice
  const riceExceedsCapacity = cart.some(item => item.isRice && item.scoops > 5);

  const checkout = async (overridePhone) => {
    if (!token || !user) {
      throw new Error('Please log in with your Topfaith student email to place an order.');
    }

    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const finalPhone = overridePhone || studentPhone || user?.phone || '';
    if (!finalPhone || !finalPhone.trim()) {
      throw new Error('Please enter your Phone / WhatsApp number so kitchen staff can contact you.');
    }

    if (isHostelDelivery && (!hostelAddress || !hostelAddress.trim())) {
      throw new Error('Please select your Faculty building or Hostel for delivery.');
    }

    setIsSubmitting(true);

    try {
      const plateSizeName = perPackPrice === 100 ? 'Small Plate (₦100)' : perPackPrice === 200 ? 'Medium Plate (₦200)' : 'Large Plate (₦300)';

      // Map items for server API format while tagging plate number in dishName
      const formattedItems = cart.map(item => ({
        dishId: item.dishId,
        dishName: `[Plate #${item.plateNumber || 1}] ${item.dishName}`,
        price: item.price,
        scoops: item.scoops,
        unitType: item.unitType,
        category: item.category,
        image: item.image,
        plateNumber: item.plateNumber || 1
      }));

      // Generate sequential daily pickup code (e.g. GEN-001) & offline ID
      const offlinePickupCode = await getNextDailyPickupCode();
      const offlineOrderId = `OFFLINE-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

      const orderPayload = {
        id: offlineOrderId,
        pickupCode: offlinePickupCode,
        studentId: user?.id || 'usr-student-offline',
        studentName: user?.name || 'Student (Offline)',
        studentEmail: user?.email || '',
        studentPhone: finalPhone.trim(),
        items: formattedItems,
        includeTakeoutPack,
        plateSize: perPackPrice,
        plateSizeName,
        takeoutFee,
        deliveryFee,
        totalPrice: grandTotal,
        isHostelDelivery,
        hostelAddress: hostelAddress.trim(),
        scheduledTime: scheduledTime !== 'ASAP' ? scheduledTime : null
      };

      let data = null;
      let usedOfflinePass = false;

      // If phone is disconnected from internet, generate offline pass immediately
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        usedOfflinePass = true;
      } else {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s network timeout

          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            if (res.status >= 400 && res.status < 500) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.message || 'Failed to place order.');
            } else {
              usedOfflinePass = true;
            }
          } else {
            data = await res.json();
          }
        } catch (fetchErr) {
          if (fetchErr.message && !fetchErr.message.includes('fetch') && !fetchErr.message.includes('abort') && !fetchErr.message.includes('network') && !fetchErr.name?.includes('Abort')) {
            throw fetchErr;
          }
          usedOfflinePass = true;
        }
      }

      if (usedOfflinePass) {
        data = {
          id: offlineOrderId,
          pickupCode: offlinePickupCode,
          studentId: user?.id || 'usr-offline',
          studentName: user?.name || 'Student (Offline)',
          studentEmail: user?.email || '',
          studentPhone: finalPhone.trim(),
          items: formattedItems,
          includeTakeoutPack: Boolean(includeTakeoutPack),
          plateSize: perPackPrice,
          plateSizeName,
          takeoutFee,
          deliveryFee,
          isHostelDelivery: Boolean(isHostelDelivery),
          hostelAddress: isHostelDelivery ? hostelAddress.trim() : '',
          scheduledTime: scheduledTime !== 'ASAP' ? scheduledTime : null,
          totalPrice: grandTotal,
          paymentMethod: 'Bank Transfer',
          status: 'Pending Pickup (Saved on Phone)',
          isOfflineOrder: true,
          createdAt: new Date().toISOString()
        };

        try {
          dbPut('pending_orders', { ...orderPayload, savedToken: token });
          const existingPending = JSON.parse(localStorage.getItem('olaronke_pending_offline_orders') || '[]');
          existingPending.push({ ...orderPayload, savedToken: token });
          localStorage.setItem('olaronke_pending_offline_orders', JSON.stringify(existingPending));
        } catch (e) {
          console.error('Error saving pending offline order to storage:', e);
        }

        addNotification({
          id: Date.now(),
          title: '📱 Order Saved on Phone!',
          message: `Show Code #${offlinePickupCode} at the counter. Will send to kitchen automatically when internet connects.`,
          type: 'warning'
        });
      } else {
        addNotification({
          id: Date.now(),
          title: '🎉 Order Placed Successfully!',
          message: `Order #${data.id} created! Pickup Code: #${data.pickupCode}`,
          type: 'success'
        });
      }

      clearCart();
      setIsCartOpen(false);
      setActiveReceiptModal(data);

      if (typeof refreshDishes === 'function') {
        refreshDishes();
      }

      return data;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateScoops,
      assignItemToPlate,
      removeFromCart,
      clearCart,
      autoSplitRicePlates,
      riceExceedsCapacity,
      activePlatesCount,
      mealsTotal,
      takeoutFee,
      deliveryFee,
      grandTotal,
      totalQuantityCount,
      includeTakeoutPack,
      setIncludeTakeoutPack,
      plateSize,
      setPlateSize,
      studentPhone,
      setStudentPhone,
      isHostelDelivery,
      setIsHostelDelivery,
      hostelAddress,
      setHostelAddress,
      scheduledTime,
      setScheduledTime,
      isCartOpen,
      setIsCartOpen,
      activeReceiptModal,
      setActiveReceiptModal,
      checkout,
      isSubmitting
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useSettings } from './SettingsContext';

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

  const [includeTakeoutPack, setIncludeTakeoutPack] = useState(true);
  const [isHostelDelivery, setIsHostelDelivery] = useState(false);
  const [hostelAddress, setHostelAddress] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user } = useAuth();
  const { addNotification, refreshDishes } = useSocket();
  const { settings } = useSettings();

  useEffect(() => {
    try {
      localStorage.setItem('olaronke_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (dish, scoops = 1, targetPlate = 1) => {
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
          unitType: dish.unitType || (isRice ? 'scoop' : 'portion'),
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

  // Get active plate numbers in cart
  const activePlatesSet = new Set(cart.map(item => item.plateNumber || 1));
  const activePlatesCount = Math.max(1, activePlatesSet.size);

  const perPackPrice = Number(settings.takeoutPrice) || 300;
  const mealsTotal = cart.reduce((sum, item) => sum + (item.price * item.scoops), 0);
  const takeoutFee = includeTakeoutPack ? (activePlatesCount * perPackPrice) : 0;
  const deliveryFee = isHostelDelivery ? 500 : 0;
  const grandTotal = mealsTotal + takeoutFee + deliveryFee;
  const totalQuantityCount = cart.reduce((sum, item) => sum + item.scoops, 0);

  // Check if any single plate has more than 5 scoops of rice
  const riceExceedsCapacity = cart.some(item => item.isRice && item.scoops > 5);

  const checkout = async () => {
    if (!token || !user) {
      throw new Error('Please log in with your Topfaith student email to place an order.');
    }

    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    if (isHostelDelivery && (!hostelAddress || !hostelAddress.trim())) {
      throw new Error('Please enter your hostel name and room number for delivery.');
    }

    setIsSubmitting(true);

    try {
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

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: formattedItems,
          includeTakeoutPack,
          takeoutFee,
          isHostelDelivery,
          hostelAddress: hostelAddress.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      clearCart();
      setIsCartOpen(false);
      setActiveReceiptModal(data);

      if (typeof refreshDishes === 'function') {
        refreshDishes();
      }

      addNotification({
        id: Date.now(),
        title: '🎉 Order Placed Successfully!',
        message: `Order #${data.id} created! Secret Pickup Code: #${data.pickupCode}`,
        type: 'success'
      });

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
      isHostelDelivery,
      setIsHostelDelivery,
      hostelAddress,
      setHostelAddress,
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

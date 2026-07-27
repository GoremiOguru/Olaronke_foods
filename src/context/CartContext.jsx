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

  const addToCart = (dish, scoops = 1, packConfig = null) => {
    if (!dish.isAvailable || dish.scoopsLeft <= 0) {
      addNotification({
        id: Date.now(),
        title: 'Item Unavailable',
        message: `Sorry, ${dish.name} is currently out of stock.`,
        type: 'error'
      });
      return;
    }

    if (packConfig && Array.isArray(packConfig) && packConfig.length > 0) {
      // Multi-pack rice adding logic
      const totalScoopsRequested = packConfig.reduce((sum, p) => sum + p.scoops, 0);

      // Check current cart usage for this dish
      const currentInCart = cart
        .filter(item => item.dishId === dish.id)
        .reduce((sum, item) => sum + item.scoops, 0);

      if (currentInCart + totalScoopsRequested > dish.scoopsLeft) {
        addNotification({
          id: Date.now(),
          title: 'Stock Limit Exceeded',
          message: `Only ${dish.scoopsLeft - currentInCart} ${dish.unitType || 'portion'}(s) left for ${dish.name}!`,
          type: 'warning'
        });
        return;
      }

      const newCartEntries = packConfig.map((pack, idx) => ({
        cartItemId: `${dish.id}-pack-${Date.now()}-${idx}-${Math.random()}`,
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        scoops: pack.scoops,
        unitType: dish.unitType || 'scoop',
        image: dish.image,
        category: dish.category,
        packNumber: idx + 1,
        packLabel: `Takeout Pack ${idx + 1} (${pack.scoops} scoops)`
      }));

      setCart(prev => [...prev, ...newCartEntries]);

      addNotification({
        id: Date.now(),
        title: 'Rice Packs Added!',
        message: `Added ${packConfig.length} takeout pack(s) of ${dish.name} (${totalScoopsRequested} scoops total) to tray.`,
        type: 'success'
      });
      return;
    }

    // Default single item add
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.dishId === dish.id && !item.packLabel);
      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newScoops = existingItem.scoops + scoops;

        if (newScoops > dish.scoopsLeft) {
          addNotification({
            id: Date.now(),
            title: 'Stock Limit Reached',
            message: `Only ${dish.scoopsLeft} ${dish.unitType || 'portions'} left for ${dish.name}!`,
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
          cartItemId: `${dish.id}-${Date.now()}`,
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          scoops: scoops,
          unitType: dish.unitType || 'portion',
          image: dish.image,
          category: dish.category
        }];
      }
    });

    addNotification({
      id: Date.now(),
      title: 'Added to Order!',
      message: `${scoops} ${dish.unitType || 'portion'}(s) of ${dish.name} added to tray.`,
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

    setCart(prev => prev.map(item => (item.cartItemId === cartItemId || item.dishId === cartItemId) ? { ...item, scoops: newScoops } : item));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId && item.dishId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate distinct takeout pack count
  const distinctRicePacks = cart.filter(item => item.packLabel).length;
  const nonPackItems = cart.filter(item => !item.packLabel);
  const generalTakeoutPacksCount = (includeTakeoutPack && nonPackItems.length > 0) ? 1 : 0;
  const totalTakeoutPacksCount = distinctRicePacks + generalTakeoutPacksCount;

  const perPackPrice = Number(settings.takeoutPrice) || 300;
  const mealsTotal = cart.reduce((sum, item) => sum + (item.price * item.scoops), 0);
  const takeoutFee = totalTakeoutPacksCount * perPackPrice;
  const deliveryFee = isHostelDelivery ? 500 : 0;
  const grandTotal = mealsTotal + takeoutFee + deliveryFee;
  const totalQuantityCount = cart.reduce((sum, item) => sum + item.scoops, 0);

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
      // Map items for server API format while preserving pack breakdown details in dishName if configured
      const formattedItems = cart.map(item => ({
        dishId: item.dishId,
        dishName: item.packLabel ? `${item.dishName} [${item.packLabel}]` : item.dishName,
        price: item.price,
        scoops: item.scoops,
        unitType: item.unitType,
        category: item.category,
        image: item.image,
        packLabel: item.packLabel
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: formattedItems,
          includeTakeoutPack: totalTakeoutPacksCount > 0,
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
      removeFromCart,
      clearCart,
      mealsTotal,
      takeoutFee,
      deliveryFee,
      grandTotal,
      totalQuantityCount,
      totalTakeoutPacksCount,
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

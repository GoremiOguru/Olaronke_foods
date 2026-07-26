import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('olaronke_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [includeTakeoutPack, setIncludeTakeoutPack] = useState(true); // 300 Naira takeout container
  const [isHostelDelivery, setIsHostelDelivery] = useState(false);
  const [hostelAddress, setHostelAddress] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user } = useAuth();
  const { addNotification } = useSocket();

  useEffect(() => {
    localStorage.setItem('olaronke_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dish, scoops = 1) => {
    if (!dish.isAvailable || dish.scoopsLeft <= 0) {
      addNotification({
        id: Date.now(),
        title: 'Item Unavailable',
        message: `Sorry, ${dish.name} is currently out of stock.`,
        type: 'error'
      });
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.dishId === dish.id);
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

  const updateScoops = (dishId, newScoops, maxAvailable) => {
    if (newScoops <= 0) {
      removeFromCart(dishId);
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

    setCart(prev => prev.map(item => item.dishId === dishId ? { ...item, scoops: newScoops } : item));
  };

  const removeFromCart = (dishId) => {
    setCart(prev => prev.filter(item => item.dishId !== dishId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Price calculations breakdown
  const mealsTotal = cart.reduce((sum, item) => sum + (item.price * item.scoops), 0);
  const takeoutFee = includeTakeoutPack ? 300 : 0;
  const grandTotal = mealsTotal + takeoutFee;
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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          includeTakeoutPack,
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
      setActiveReceiptModal(data); // Opens modal with 3-digit pickup code & Isaac WhatsApp button

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

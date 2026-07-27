import React, { useState, useEffect } from 'react';
import { Flame, Plus, Minus, ToggleLeft, ToggleRight, DollarSign, CheckCircle2, Clock, PackageCheck, AlertTriangle, RefreshCw, Search, ShieldCheck, User, MessageCircle, Trash2, Key, Users, MapPin, Package, UtensilsCrossed, Upload, Image as ImageIcon, Check, Edit3, X, Bell, BellRing, Smartphone, Printer, Calendar, Filter } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import OfficialReceiptModal from './OfficialReceiptModal';

export default function AdminDashboard() {
  const { dishes, setDishes, socket, pushPermission, requestPushPermission } = useSocket();
  const { token, user: currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [orderSearch, setOrderSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Pending Payment Verification', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);
  const [dishSearch, setDishSearch] = useState('');
  const [deletingDishId, setDeletingDishId] = useState(null);

  // Editing Dish Title & Description State
  const [editingDish, setEditingDish] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // File upload state for admin
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const [vendorSettings, setVendorSettings] = useState({
    accountName: 'OLARONKE OGIDAN',
    bankName: 'MONIEPOINT',
    accountNumber: '8234786544',
    whatsappName: 'Isaac',
    whatsappNumber: '08133314798',
    takeoutPrice: 300
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setVendorSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccessMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vendorSettings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update settings');
      setVendorSettings(data);
      setSettingsSuccessMsg('🎉 Vendor Bank Account & Payment Settings saved successfully!');
    } catch (err) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: 500,
    scoopsLeft: 30,
    unitType: 'scoop',
    category: 'Rice Dishes',
    image: '/images/jollof_rice.png'
  });
  const [addingDish, setAddingDish] = useState(false);
  const [dishSuccessMsg, setDishSuccessMsg] = useState('');

  // Helper for guaranteed 3-digit pickup code
  const getPickupCode = (ord) => {
    if (ord?.pickupCode) return String(ord.pickupCode);
    if (!ord?.id) return '582';
    let num = 0;
    for (let i = 0; i < ord.id.length; i++) num += ord.id.charCodeAt(i);
    return String(100 + (num % 900));
  };

  const fetchOrdersAndStaff = async () => {
    if (!token) return;
    try {
      const [resOrders, resStaff] = await Promise.all([
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/staff', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
      }
      if (resStaff.ok) {
        const dataStaff = await resStaff.json();
        setStaffList(dataStaff);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchOrdersAndStaff();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('order:new', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    socket.on('order:status_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    socket.on('orders:deleted', (data) => {
      if (data?.orderId) {
        setOrders(prev => prev.filter(o => o.id !== data.orderId));
      }
    });

    socket.on('orders:update', (updatedOrders) => {
      if (Array.isArray(updatedOrders)) {
        setOrders(updatedOrders);
      }
    });

    return () => {
      socket.off('order:new');
      socket.off('order:status_updated');
      socket.off('orders:deleted');
      socket.off('orders:update');
    };
  }, [socket]);

  // Handle uploading product image file directly from phone or laptop
  const handleFileUpload = async (e, isEditMode = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setUploadingImage(true);
    setUploadSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageData: base64Data, fileName: file.name })
        });

        if (res.ok) {
          const data = await res.json();
          const uploadedUrl = data.imageUrl;

          if (isEditMode && editingDish) {
            setEditingDish(prev => ({ ...prev, image: uploadedUrl }));
          } else {
            setNewDish(prev => ({ ...prev, image: uploadedUrl }));
          }

          setUploadSuccessMsg('✅ Image uploaded successfully!');
          setTimeout(() => setUploadSuccessMsg(''), 4000);
        } else {
          alert('Failed to upload image. Please try again.');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error during image upload:', err);
      alert('Error uploading image file.');
      setUploadingImage(false);
    }
  };

  // Save Dish Title, Description, Price, Stock & Photo Edit
  const handleSaveDishEdit = async (e) => {
    e.preventDefault();
    if (!editingDish) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/dishes/${editingDish.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingDish.name,
          description: editingDish.description,
          price: Number(editingDish.price),
          scoopsLeft: Number(editingDish.scoopsLeft),
          unitType: editingDish.unitType,
          category: editingDish.category,
          image: editingDish.image,
          isAvailable: editingDish.isAvailable
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setDishes(prev => prev.map(d => d.id === updated.id ? updated : d));
        setEditingDish(null);
      }
    } catch (err) {
      console.error('Failed to save dish edits:', err);
      alert('Error saving dish edits');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleScoopChange = async (dishId, newScoops) => {
    const validScoops = Math.max(0, newScoops);
    setDishes(prev => prev.map(d => d.id === dishId ? { ...d, scoopsLeft: validScoops, isAvailable: validScoops > 0 ? d.isAvailable : false } : d));

    try {
      await fetch(`/api/dishes/${dishId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scoopsLeft: validScoops })
      });
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const handleToggleAvailability = async (dishId, currentAvailability) => {
    const nextState = !currentAvailability;
    setDishes(prev => prev.map(d => d.id === dishId ? { ...d, isAvailable: nextState } : d));

    try {
      await fetch(`/api/dishes/${dishId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: nextState })
      });
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handlePriceChange = async (dishId, newPrice) => {
    const priceNum = Math.max(0, Number(newPrice));
    setDishes(prev => prev.map(d => d.id === dishId ? { ...d, price: priceNum } : d));

    try {
      await fetch(`/api/dishes/${dishId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: priceNum })
      });
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from B'feastas catalog?`)) {
      return;
    }

    setDeletingDishId(dishId);
    try {
      const res = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setDishes(prev => prev.filter(d => d.id !== dishId));
      }
    } catch (err) {
      console.error('Failed to delete dish:', err);
    } finally {
      setDeletingDishId(null);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, confirmedByAdmin: currentUser?.name } : o));

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Permanently remove Order #${orderId} from history?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete order from server database.');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Error communicating with server while deleting order.');
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    setAddingDish(true);
    setDishSuccessMsg('');

    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDish)
      });

      if (res.ok) {
        setDishSuccessMsg(`🎉 "${newDish.name}" published to live B'feastas catalog!`);
        setNewDish({
          name: '',
          description: '',
          price: 500,
          scoopsLeft: 30,
          unitType: 'scoop',
          category: 'Rice Dishes',
          image: '/images/jollof_rice.png'
        });
        setTimeout(() => setActiveTab('inventory'), 1200);
      }
    } catch (err) {
      console.error('Error adding dish:', err);
    } finally {
      setAddingDish(false);
    }
  };

  const now = new Date();
  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const isWithinDays = (date, days) => {
    const diff = now.getTime() - date.getTime();
    return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
  };

  const filteredDishes = dishes.filter(d => 
    d.name.toLowerCase().includes(dishSearch.toLowerCase()) || 
    d.category.toLowerCase().includes(dishSearch.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(dishSearch.toLowerCase()))
  );

  const filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || Date.now());

    // 1. Date Filter
    if (dateFilter === 'today' && !isSameDay(orderDate, now)) return false;
    if (dateFilter === 'week' && !isWithinDays(orderDate, 7)) return false;
    if (dateFilter === 'month' && !isWithinDays(orderDate, 30)) return false;

    // 2. Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'Pending Payment Verification' && o.status !== 'Pending Payment Verification') return false;
      if (statusFilter === 'Preparing' && (o.status !== 'Preparing' && o.status !== 'Payment Confirmed & Preparing')) return false;
      if (statusFilter === 'Ready for Pickup' && (!o.status.includes('Ready'))) return false;
      if (statusFilter === 'Completed' && o.status !== 'Completed') return false;
      if (statusFilter === 'Cancelled' && o.status !== 'Cancelled') return false;
    }

    // 3. Search Query Filter
    const q = orderSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (o.studentName && o.studentName.toLowerCase().includes(q)) ||
      (o.studentEmail && o.studentEmail.toLowerCase().includes(q)) ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.hostelAddress && o.hostelAddress.toLowerCase().includes(q)) ||
      (o.pickupCode && String(o.pickupCode).includes(q)) ||
      getPickupCode(o).includes(q)
    );
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalPrice : 0), 0);
  const pendingCount = filteredOrders.filter(o => o.status === 'Pending Payment Verification').length;
  const preparingCount = filteredOrders.filter(o => o.status === 'Preparing' || o.status === 'Payment Confirmed & Preparing').length;
  const readyCount = filteredOrders.filter(o => o.status && o.status.includes('Ready')).length;
  const completedCount = filteredOrders.filter(o => o.status === 'Completed').length;
  const cancelledCount = filteredOrders.filter(o => o.status === 'Cancelled').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header Banner */}
        <div className="glass-card p-6 rounded-3xl border border-brand-orange/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/20 text-brand-orange border border-brand-orange/40 flex items-center justify-center font-black">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">B'feastas Vendor Staff Control Panel</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-brand-lemon/20 text-brand-lemon-glow rounded-full border border-brand-lemon/40">
                  REAL-TIME SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff Account: <strong className="text-brand-orange">{currentUser?.name}</strong> ({currentUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Phone Home Screen Notification Button */}
            <button
              onClick={requestPushPermission}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                pushPermission === 'granted'
                  ? 'bg-brand-lemon/20 text-brand-lemon-glow border border-brand-lemon/40'
                  : 'bg-brand-orange text-white hover:bg-orange-600 shadow-orange-glow'
              }`}
              title="Get phone home screen alerts when new orders arrive"
            >
              <Smartphone className="w-4 h-4" />
              <BellRing className="w-4 h-4" />
              <span>
                {pushPermission === 'granted'
                  ? 'Phone Home Screen Alerts Active'
                  : 'Enable Phone Home Screen Alerts'}
              </span>
            </button>

            <button
              onClick={fetchOrdersAndStaff}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-brand-lemon-glow" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Live Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase">Total Orders</span>
              <PackageCheck className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-3xl font-black text-white">{orders.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Live student order queue</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-brand-lemon-glow" />
            </div>
            <p className="text-3xl font-black text-brand-lemon-glow">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">Includes ₦300 takeout packs</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase">Active Dishes</span>
              <Flame className="w-5 h-5 text-brand-orange" />
            </div>
            <p className="text-3xl font-black text-white">{dishes.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">{dishes.filter(d => d.isAvailable).length} available for order</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase">Vendor Staff</span>
              <Users className="w-5 h-5 text-brand-orange" />
            </div>
            <p className="text-3xl font-black text-brand-orange">{staffList.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Registered admin staff</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-brand-orange text-white shadow-orange-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Portion & Inventory ({dishes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-brand-orange text-white shadow-orange-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Orders ({orders.length})</span>
            {orders.some(o => o.status === 'Pending Payment Verification') && (
              <span className="w-2.5 h-2.5 rounded-full bg-brand-lemon-glow animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-brand-lemon text-slate-950 font-black shadow-lemon-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Vendor Staff Roster ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add-dish')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'add-dish'
                ? 'bg-brand-lemon text-slate-950 font-black shadow-lemon-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Food</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-brand-lemon text-slate-950 font-black shadow-lemon-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>⚙️ Bank & Payment Settings</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGER */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Live Catalog Controls</h2>
                <p className="text-xs text-slate-400">Click "✏️ Edit Info" to change food titles, descriptions, prices or photos.</p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  placeholder="Search food item..."
                  className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => {
                const labelUnit = dish.unitType || (dish.category === 'Drinks & Refreshments' ? 'bottle' : 'scoop');
                return (
                  <div
                    key={dish.id}
                    className={`glass-card p-5 rounded-3xl border transition-all space-y-4 ${
                      !dish.isAvailable || dish.scoopsLeft === 0
                        ? 'border-slate-800 opacity-80'
                        : dish.scoopsLeft <= 5
                        ? 'border-brand-orange/60 shadow-orange-glow'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-white text-base truncate">{dish.name}</h4>
                          <button
                            onClick={() => handleDeleteDish(dish.id, dish.name)}
                            disabled={deletingDishId === dish.id}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Delete food item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-brand-orange font-semibold">{dish.category}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{dish.description}</p>
                      </div>
                    </div>

                    {/* Edit Dish Title & Details Trigger Button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setEditingDish({ ...dish })}
                        className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-lemon-glow rounded-xl text-xs font-bold border border-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Food Title, Description & Photo</span>
                      </button>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">Stock Remaining:</span>
                        <span className={`font-black text-sm ${dish.scoopsLeft <= 5 ? 'text-brand-orange' : 'text-brand-lemon-glow'}`}>
                          {dish.scoopsLeft} {labelUnit}s
                        </span>
                      </div>

                      <div className="flex items-center justify-between space-x-2 pt-1">
                        <button
                          onClick={() => handleScoopChange(dish.id, dish.scoopsLeft - 5)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold rounded-lg"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleScoopChange(dish.id, dish.scoopsLeft - 1)}
                          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          value={dish.scoopsLeft}
                          onChange={(e) => handleScoopChange(dish.id, e.target.value)}
                          className="w-14 text-center bg-slate-900 border border-slate-700 text-amber-300 text-sm font-black py-1 rounded-lg focus:outline-none"
                        />

                        <button
                          onClick={() => handleScoopChange(dish.id, dish.scoopsLeft + 1)}
                          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleScoopChange(dish.id, dish.scoopsLeft + 5)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold rounded-lg"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-400 font-bold">Status:</span>
                      <button
                        onClick={() => handleToggleAvailability(dish.id, dish.isAvailable)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                          dish.isAvailable
                            ? 'bg-brand-lemon/20 text-brand-lemon-glow border border-brand-lemon/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {dish.isAvailable ? <ToggleRight className="w-4 h-4 text-brand-lemon-glow" /> : <ToggleLeft className="w-4 h-4 text-rose-400" />}
                        <span>{dish.isAvailable ? 'Available' : 'Out of Stock'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EDIT DISH TITLE & DESCRIPTION MODAL */}
        {editingDish && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-brand-orange" /> Edit Dish Title & Details
                </h3>
                <button
                  onClick={() => setEditingDish(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDishEdit} className="space-y-4">
                
                {/* Photo uploader */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center space-x-4">
                  <img
                    src={editingDish.image || '/images/jollof_rice.png'}
                    alt="Dish preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Food Image</p>
                    <label className="cursor-pointer bg-brand-orange text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-orange-glow inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload New Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dish Title / Name</label>
                  <input
                    type="text"
                    required
                    value={editingDish.name}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-orange font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dish Description</label>
                  <textarea
                    rows={3}
                    value={editingDish.description}
                    onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={editingDish.price}
                      onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Stock Count</label>
                    <input
                      type="number"
                      required
                      value={editingDish.scoopsLeft}
                      onChange={(e) => setEditingDish({ ...editingDish, scoopsLeft: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={editingDish.category}
                      onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Rice Dishes">Rice Dishes</option>
                      <option value="Chicken & Proteins">Chicken & Proteins</option>
                      <option value="Swallow & Soups">Swallow & Soups</option>
                      <option value="Sides & Extras">Sides & Extras</option>
                      <option value="Made-to-Order & On-Demand">Made-to-Order & On-Demand</option>
                      <option value="Drinks & Refreshments">Drinks & Refreshments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Unit Label</label>
                    <select
                      value={editingDish.unitType}
                      onChange={(e) => setEditingDish({ ...editingDish, unitType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="scoop">scoop</option>
                      <option value="portion">portion</option>
                      <option value="piece">piece</option>
                      <option value="bottle">bottle</option>
                      <option value="plate">plate</option>
                      <option value="wrap">wrap</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDish(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-orange-glow"
                  >
                    {savingEdit ? 'Saving Edits...' : 'Save Live Edits'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* TAB 2: LIVE STUDENT ORDERS QUEUE & HISTORY ANALYTICS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Top Bar: Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-orange" /> Student Order History & Live Queue
                </h2>
                <p className="text-xs text-slate-400">Track orders by date, verify payment, cancel unconfirmed orders, or print receipts.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search name, email, code or hostel..."
                  className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            {/* Filter Bar 1: Date Range Tabs */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" /> Period:
                </span>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' }
                ].map(tf => (
                  <button
                    key={tf.key}
                    onClick={() => setDateFilter(tf.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      dateFilter === tf.key
                        ? 'bg-brand-orange text-white shadow-orange-glow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-amber-300">
                Period Revenue: <strong className="text-white text-sm font-black">₦{totalRevenue.toLocaleString()}</strong> ({filteredOrders.length} orders)
              </div>
            </div>

            {/* Filter Bar 2: Status Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-brand-lemon-glow" /> Status:
              </span>
              {[
                { key: 'all', label: `All (${filteredOrders.length})` },
                { key: 'Pending Payment Verification', label: `⏳ Pending (${pendingCount})` },
                { key: 'Preparing', label: `🍳 Cooking (${preparingCount})` },
                { key: 'Ready for Pickup', label: `🚚 Ready (${readyCount})` },
                { key: 'Completed', label: `✅ Completed (${completedCount})` },
                { key: 'Cancelled', label: `❌ Cancelled (${cancelledCount})` }
              ].map(sf => (
                <button
                  key={sf.key}
                  onClick={() => setStatusFilter(sf.key)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    statusFilter === sf.key
                      ? 'bg-slate-800 text-brand-lemon-glow border border-brand-lemon/50'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>

            {/* Orders Feed List */}
            {filteredOrders.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center border border-slate-800">
                <PackageCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="font-extrabold text-white">No student orders match your selected filters</p>
                <p className="text-xs text-slate-500 mt-1">Try switching date range or status filters above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const codeDisplay = getPickupCode(ord);
                  const orderTimeStr = new Date(ord.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const orderDateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString();

                  return (
                    <div
                      key={ord.id}
                      className="glass-card p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 max-w-xl">
                        
                        {/* Header Badge Row */}
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <span className="font-mono text-xs font-black bg-slate-950 text-brand-orange px-2.5 py-1 rounded-lg border border-slate-800">
                            #{ord.id}
                          </span>

                          <span className="flex items-center gap-1 font-mono text-xs font-black bg-brand-orange/20 text-amber-300 px-3 py-1 rounded-lg border border-brand-orange/50 shadow-inner">
                            <Key className="w-3.5 h-3.5 text-brand-orange" /> Pickup Code: <strong className="text-amber-300 text-sm font-mono">#{codeDisplay}</strong>
                          </span>

                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {orderDateStr} at {orderTimeStr}
                          </span>
                        </div>

                        {/* Customer & Address Details Box */}
                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
                              <User className="w-4 h-4 text-brand-orange" />
                              Student: <span className="text-brand-lemon-glow font-black text-sm">{ord.studentName}</span>
                            </p>

                            <button
                              onClick={() => setSelectedPrintOrder(ord)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30 flex items-center gap-1"
                              title="Print official receipt"
                            >
                              <Printer className="w-3 h-3 text-amber-400" />
                              <span>Print Receipt</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-400 font-mono">{ord.studentEmail}</p>

                          <p className="text-xs font-bold pt-1 text-sky-300 flex items-center gap-1">
                            {ord.isHostelDelivery ? (
                              <>
                                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                                Hostel Delivery: <span className="text-white font-bold">{ord.hostelAddress}</span>
                              </>
                            ) : (
                              <>
                                <Package className="w-3.5 h-3.5 text-brand-lemon-glow" />
                                Cafeteria Pickup
                              </>
                            )}
                          </p>

                          {ord.confirmedByAdmin && (
                            <p className="text-[10px] text-slate-500 pt-0.5">
                              Last updated by: <strong className="text-slate-300">{ord.confirmedByAdmin}</strong>
                            </p>
                          )}
                        </div>

                        {/* Itemized Order Breakdown */}
                        <div className="space-y-1">
                          <p className="text-[11px] uppercase font-bold text-slate-500">Items Ordered:</p>
                          <div className="flex flex-wrap gap-2">
                            {ord.items.map((item, idx) => (
                              <span key={idx} className="bg-slate-950 text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-800">
                                {item.dishName} ({item.scoops} {item.unitType || 'portion'}{item.scoops > 1 ? 's' : ''})
                              </span>
                            ))}
                            {ord.includeTakeoutPack && (
                              <span className="bg-brand-orange/10 text-brand-orange-glow text-xs font-semibold px-2 py-1 rounded-xl border border-brand-orange/30">
                                Plastic Takeout Container (+₦300)
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right Action Column */}
                      <div className="lg:text-right space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount</span>
                          <span className="text-2xl font-black text-white">₦{ord.totalPrice.toLocaleString()}</span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 block">Update Order Status:</span>
                          <div className="flex flex-wrap gap-1.5 lg:justify-end">
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Payment Confirmed & Preparing')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                ord.status === 'Payment Confirmed & Preparing' || ord.status === 'Preparing'
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              ✅ Confirm Payment & Cook
                            </button>

                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Ready for Pickup / Out for Delivery')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                ord.status && ord.status.includes('Ready')
                                  ? 'bg-sky-500 text-slate-950 font-black shadow-lg'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              🚚 Ready / Delivery
                            </button>

                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Completed')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                ord.status === 'Completed'
                                  ? 'bg-brand-lemon text-slate-950 font-black shadow-lemon-glow'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              🎉 Completed
                            </button>

                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Cancelled')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                ord.status === 'Cancelled'
                                  ? 'bg-rose-600 text-white font-black'
                                  : 'bg-slate-950 text-rose-400 hover:bg-rose-500/20 border border-slate-800'
                              }`}
                            >
                              ❌ Cancel Order
                            </button>

                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors flex items-center gap-1"
                              title="Permanently remove order record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Printable Official Receipt Modal Triggered by Admin */}
        {selectedPrintOrder && (
          <OfficialReceiptModal
            order={selectedPrintOrder}
            onClose={() => setSelectedPrintOrder(null)}
          />
        )}

        {/* TAB 3: ADMIN STAFF ROSTER */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-lemon-glow" /> Vendor Staff Roster
              </h2>
              <p className="text-xs text-slate-400">Previously registered and logged-in administrator staff members.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-lemon/20 text-brand-lemon-glow border border-brand-lemon/40 flex items-center justify-center font-black text-lg">
                      {staff.name ? staff.name.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">{staff.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{staff.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Last Logged In:</span>
                    <span className="text-brand-lemon-glow font-semibold">
                      {new Date(staff.lastLogin).toLocaleDateString()} at {new Date(staff.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADD NEW FOOD FORM WITH PHOTO UPLOADER */}
        {activeTab === 'add-dish' && (
          <div className="glass-card p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-lemon-glow" /> Add New Food to B'feastas Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload photos of your dish directly from your phone/device gallery!
              </p>
            </div>

            {dishSuccessMsg && (
              <div className="p-4 rounded-2xl bg-brand-lemon/20 border border-brand-lemon/40 text-brand-lemon-glow font-bold text-sm">
                {dishSuccessMsg}
              </div>
            )}

            {uploadSuccessMsg && (
              <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-200 font-bold text-xs">
                {uploadSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateDish} className="space-y-4">
              
              {/* Product Photo Upload Section (No Code Needed!) */}
              <div className="p-4 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 text-center space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={newDish.image || '/images/jollof_rice.png'}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
                  />
                  <div className="text-left space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-lemon-glow" /> Product Food Photo
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tap below to select a photo from your phone or device gallery.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <label className="cursor-pointer bg-brand-orange hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-orange-glow flex items-center gap-2 transition-transform hover:scale-105">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading Photo...' : '📁 Upload Photo from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dish / Item Name</label>
                <input
                  type="text"
                  required
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                  placeholder="e.g. Viju Milk 50cl / Sosa Orange Juice"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand-orange font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  placeholder="Short appetizing description..."
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newDish.scoopsLeft}
                    onChange={(e) => setNewDish({ ...newDish, scoopsLeft: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unit Type</label>
                  <select
                    value={newDish.unitType}
                    onChange={(e) => setNewDish({ ...newDish, unitType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none font-bold"
                  >
                    <option value="bottle">bottle</option>
                    <option value="scoop">scoop</option>
                    <option value="portion">portion</option>
                    <option value="piece">piece</option>
                    <option value="plate">plate</option>
                    <option value="wrap">wrap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Rice Dishes">Rice Dishes</option>
                    <option value="Chicken & Proteins">Chicken & Proteins</option>
                    <option value="Swallow & Soups">Swallow & Soups</option>
                    <option value="Sides & Extras">Sides & Extras</option>
                    <option value="Made-to-Order & On-Demand">Made-to-Order & On-Demand</option>
                    <option value="Drinks & Refreshments">Drinks & Refreshments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Image Path / URL</label>
                  <input
                    type="text"
                    value={newDish.image}
                    onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                    placeholder="/images/..."
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addingDish}
                className="w-full py-4 rounded-2xl bg-brand-lemon hover:bg-lime-400 text-slate-950 font-black text-sm transition-all shadow-lemon-glow"
              >
                {addingDish ? 'Publishing Food...' : 'Publish Food to Live Catalog'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: VENDOR BANK ACCOUNT & APP SETTINGS (NO CODE NEEDED) */}
        {activeTab === 'settings' && (
          <div className="glass-card p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>⚙️ No-Code Vendor Payment & Contact Settings</span>
              </h2>
              <p className="text-xs text-slate-400">
                Staff can permanently update bank transfer details and WhatsApp numbers directly from this panel without writing any code.
              </p>
            </div>

            {settingsSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{settingsSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bank Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={vendorSettings.accountName || ''}
                  onChange={(e) => setVendorSettings({ ...vendorSettings, accountName: e.target.value })}
                  placeholder="e.g. OLARONKE OGIDAN"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={vendorSettings.bankName || ''}
                    onChange={(e) => setVendorSettings({ ...vendorSettings, bankName: e.target.value })}
                    placeholder="e.g. MONIEPOINT"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Moniepoint Account Number</label>
                  <input
                    type="text"
                    required
                    value={vendorSettings.accountNumber || ''}
                    onChange={(e) => setVendorSettings({ ...vendorSettings, accountNumber: e.target.value })}
                    placeholder="e.g. 8234786544"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Staff WhatsApp Contact Name</label>
                  <input
                    type="text"
                    required
                    value={vendorSettings.whatsappName || ''}
                    onChange={(e) => setVendorSettings({ ...vendorSettings, whatsappName: e.target.value })}
                    placeholder="e.g. Isaac"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Staff WhatsApp Phone Number</label>
                  <input
                    type="text"
                    required
                    value={vendorSettings.whatsappNumber || ''}
                    onChange={(e) => setVendorSettings({ ...vendorSettings, whatsappNumber: e.target.value })}
                    placeholder="e.g. 08133314798"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plastic Takeout Container Fee (₦)</label>
                <input
                  type="number"
                  required
                  value={vendorSettings.takeoutPrice || 300}
                  onChange={(e) => setVendorSettings({ ...vendorSettings, takeoutPrice: Number(e.target.value) })}
                  placeholder="300"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Website Hero Title</label>
                <input
                  type="text"
                  value={vendorSettings.heroTitle || ''}
                  onChange={(e) => setVendorSettings({ ...vendorSettings, heroTitle: e.target.value })}
                  placeholder="e.g. Welcome to B'feastas"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Website Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={vendorSettings.heroSubtitle || ''}
                  onChange={(e) => setVendorSettings({ ...vendorSettings, heroSubtitle: e.target.value })}
                  placeholder="Enter homepage custom subtitle copy..."
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Top Announcement Header</label>
                <input
                  type="text"
                  value={vendorSettings.announcementText || ''}
                  onChange={(e) => setVendorSettings({ ...vendorSettings, announcementText: e.target.value })}
                  placeholder="e.g. Topfaith University Campus Gourmet Dining"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-4 rounded-2xl bg-brand-lemon hover:bg-lime-400 text-slate-950 font-black text-sm transition-all shadow-lemon-glow"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Settings permanently'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

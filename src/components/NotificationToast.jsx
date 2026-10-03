import React from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

function ToastItem({ notification, onRemove }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 6000); // Auto-dismiss after 6.0 seconds for mobile visibility
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto p-3 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start space-x-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        notification.type === 'error'
          ? 'bg-rose-950/95 text-rose-100 border-rose-800'
          : notification.type === 'warning'
          ? 'bg-amber-950/95 text-amber-100 border-amber-800'
          : notification.type === 'success'
          ? 'bg-emerald-950/95 text-emerald-100 border-emerald-800'
          : 'bg-slate-900/95 text-slate-100 border-slate-700'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {notification.type === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
        {notification.type === 'warning' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
        {notification.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
        {(!notification.type || notification.type === 'info') && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h5 className="font-extrabold text-xs sm:text-sm text-white leading-tight">{notification.title}</h5>
        <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">{notification.message}</p>
      </div>

      <button
        onClick={() => onRemove(notification.id)}
        className="text-slate-400 hover:text-white p-1 shrink-0 -mr-1 -mt-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, removeNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-50 space-y-2 pointer-events-none">
      {notifications.slice(0, 3).map((n) => (
        <ToastItem key={n.id} notification={n} onRemove={removeNotification} />
      ))}
    </div>
  );
}

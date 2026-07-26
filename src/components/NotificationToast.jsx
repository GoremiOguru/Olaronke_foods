import React from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function NotificationToast() {
  const { notifications, removeNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start space-x-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            n.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-800'
              : n.type === 'warning'
              ? 'bg-amber-950/90 text-amber-100 border-amber-800'
              : n.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
              : 'bg-brand-navy-light/95 text-slate-100 border-slate-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
            {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {(!n.type || n.type === 'info') && <Info className="w-5 h-5 text-sky-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-extrabold text-sm text-white">{n.title}</h5>
            <p className="text-xs text-slate-300 mt-0.5 leading-normal">{n.message}</p>
          </div>

          <button
            onClick={() => removeNotification(n.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

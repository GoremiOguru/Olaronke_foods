import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, AlertCircle, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'admin-login' | 'admin-register' | 'reset-password'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'reset-password') {
      if (!email || !password) {
        setError('Please enter your account email and new password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      setLoading(true);
      try {
        let vault = [];
        try {
          const v = localStorage.getItem('olaronke_vault');
          if (v) vault = JSON.parse(v);
        } catch {}

        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password, userVault: vault })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Password reset failed');
        setSuccessMsg(data.message);
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
          setPassword('');
        }, 2500);
      } catch (err) {
        setError(err.message || 'Reset failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    const isStudentRegister = mode === 'register';
    const isAdminRegister = mode === 'admin-register';
    const isRegisterMode = isStudentRegister || isAdminRegister;

    if (isStudentRegister) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.endsWith('@topfaith.edu.ng')) {
        setError('Student registration is restricted to @topfaith.edu.ng emails.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(name, email, password, isAdminRegister ? 'admin' : 'student');
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-brand-orange to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-white/30">
            {mode.startsWith('admin') ? <ShieldCheck className="w-6 h-6 text-brand-lemon-glow" /> : <UtensilsCrossed className="w-6 h-6 text-white" />}
          </div>

          <h3 className="text-xl font-black">
            {mode === 'login' && "B'feastas Student Sign In"}
            {mode === 'register' && "B'feastas Student Registration"}
            {mode === 'admin-login' && "Vendor Staff Sign In"}
            {mode === 'admin-register' && "New Admin Staff Signup"}
            {mode === 'reset-password' && "Reset Account Password"}
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            {mode === 'reset-password'
              ? 'Enter registered email & new password'
              : mode.startsWith('admin')
              ? 'Gmail address permitted for Vendor Staff'
              : 'Domain Requirement: @topfaith.edu.ng'}
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setEmail(''); setPassword(''); }}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'login' ? 'border-brand-orange text-white bg-slate-900' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); setEmail(''); setPassword(''); }}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'register' ? 'border-brand-orange text-white bg-slate-900' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Student Join
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin-login');
              setError('');
              setSuccessMsg('');
              setEmail('');
              setPassword('');
            }}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'admin-login' ? 'border-brand-lemon text-brand-lemon-glow bg-slate-900' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin-register');
              setError('');
              setSuccessMsg('');
              setEmail('');
              setPassword('');
            }}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'admin-register' ? 'border-brand-lemon text-brand-lemon-glow bg-slate-900' : 'border-transparent hover:text-slate-200'
            }`}
          >
            Admin Signup
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {(mode === 'register' || mode === 'admin-register') && (
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">
                {mode === 'admin-register' ? 'Staff Full Name' : 'Student Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={mode === 'admin-register' ? 'e.g. Isaac Bfeastas Staff' : 'e.g. Chisom Okafor'}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-brand-orange text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1">
              {mode.startsWith('admin') ? 'Admin Staff Email (Gmail permitted)' : 'Account Email (@topfaith.edu.ng or Staff Gmail)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode.startsWith('admin') ? 'staffname@gmail.com' : 'username@topfaith.edu.ng'}
                className="w-full bg-slate-950 border border-slate-700 focus:border-brand-orange text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none font-mono"
              />
            </div>
            {mode === 'register' && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-lemon-glow" />
                Must end with <strong className="text-white">@topfaith.edu.ng</strong>
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-extrabold text-slate-300">
                {mode === 'reset-password' ? 'New Password' : 'Password'}
              </label>
              {(mode === 'login' || mode === 'admin-login') && (
                <button
                  type="button"
                  onClick={() => { setMode('reset-password'); setError(''); setSuccessMsg(''); setPassword(''); }}
                  className="text-[11px] text-brand-orange hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-brand-orange text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md ${
              mode.startsWith('admin')
                ? 'bg-brand-lemon hover:bg-lime-400 text-slate-950 shadow-lemon-glow'
                : 'bg-brand-orange hover:bg-orange-600 shadow-orange-glow'
            }`}
          >
            {loading ? 'Processing...' : (
              mode === 'reset-password' ? 'Save New Password' :
              mode.includes('register') ? 'Create Account' : 'Log In'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

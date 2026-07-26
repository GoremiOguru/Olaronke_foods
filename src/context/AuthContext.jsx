import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('olaronke_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('olaronke_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('olaronke_user', JSON.stringify(data.user));
        }
      })
      .catch(err => {
        console.warn('Auth session check notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const getUserVault = () => {
    try {
      const v = localStorage.getItem('olaronke_vault');
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  };

  const saveToUserVault = (userObj) => {
    try {
      const vault = getUserVault();
      const exists = vault.find(u => u.email.toLowerCase() === userObj.email.toLowerCase());
      if (!exists) {
        vault.push(userObj);
        localStorage.setItem('olaronke_vault', JSON.stringify(vault));
      }
    } catch {}
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userVault: getUserVault() })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('olaronke_token', data.token);
    localStorage.setItem('olaronke_user', JSON.stringify(data.user));
    saveToUserVault(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role = 'student') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('olaronke_token', data.token);
    localStorage.setItem('olaronke_user', JSON.stringify(data.user));
    saveToUserVault(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('olaronke_token');
    localStorage.removeItem('olaronke_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// src/context/AdminContext.jsx
// ═══════════════════════════════════════════════════════════════
// Contexte Admin — authentification réelle JWT + Socket.io admin
// ═══════════════════════════════════════════════════════════════
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';
import { getSocket, joinAdmin } from '../services/socket.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin,        setAdmin]        = useState(() => {
    try { return JSON.parse(localStorage.getItem('ima_admin_user') || 'null'); }
    catch { return null; }
  });
  const [loginError,   setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Rejoindre la room admin sur Socket.io quand connecté
  useEffect(() => {
    if (admin) {
      const socket = getSocket();
      if (socket.connected) joinAdmin();
      else socket.on('connect', joinAdmin);
    }
  }, [admin]);

  // Vérifier que le token est encore valide au montage
  useEffect(() => {
    const token = localStorage.getItem('ima_admin_token');
    if (token && admin) {
      authAPI.me().catch(() => logout());
    }
  }, []);

  const login = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await authAPI.login(email, password);
      const { user, token } = res.data;

      localStorage.setItem('ima_admin_token', token);
      localStorage.setItem('ima_admin_user',  JSON.stringify(user));
      setAdmin(user);
      setLoginLoading(false);
      return true;
    } catch (err) {
      setLoginError(err.message || 'Email ou mot de passe incorrect.');
      setLoginLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('ima_admin_token');
    localStorage.removeItem('ima_admin_user');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{
      admin,
      login,
      logout,
      loginError,
      loginLoading,
      isAuthenticated: !!admin,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

// src/services/socket.js
// ═══════════════════════════════════════════════════════════════
// Service Socket.io — temps réel
// ═══════════════════════════════════════════════════════════════
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect',    () => console.log('🔌 Socket connecté'));
    socket.on('disconnect', () => console.log('🔌 Socket déconnecté'));
    socket.on('connect_error', (err) => console.warn('⚠️ Socket erreur :', err.message));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

// Rejoindre une room catégorie
export const joinCategory = (categoryId) => {
  const s = getSocket();
  s.emit('join-category', categoryId);
};

// Quitter une room catégorie
export const leaveCategory = (categoryId) => {
  const s = getSocket();
  s.emit('leave-category', categoryId);
};

// Rejoindre le dashboard admin
export const joinAdmin = () => {
  const s = getSocket();
  s.emit('join-admin');
};

export default getSocket;

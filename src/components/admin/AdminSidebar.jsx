import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';
import './AdminSidebar.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '', label: 'Dashboard' },
  { to: '/admin/artistes', icon: '', label: 'Artistes' },
  { to: '/admin/categories', icon: '', label: 'Catégories' },
  { to: '/admin/votes', icon: '', label: 'Votes' },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <>
      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-inner">
            {/* <span className="admin-sidebar-logo-text">IMA</span> */}
            <span className="admin-sidebar-logo-sub">
              <img src="/logo.png" alt="Logo de IMA-AWARD" />
            </span>
          </div>
        </div>

        {/* Admin info */}
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{admin?.name || 'Administrateur'}</div>
            <div className="admin-sidebar-user-role">Super Admin</div>
          </div>
        </div>

        <div className="admin-sidebar-divider" />

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-nav-label">Menu principal</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'admin-sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <span className="admin-sidebar-link-icon">{item.icon}</span>
              <span className="admin-sidebar-link-label">{item.label}</span>
              <span className="admin-sidebar-link-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-divider" />

        {/* Bottom */}
        <div className="admin-sidebar-bottom">
          <NavLink to="/" className="admin-sidebar-link admin-sidebar-link-ext" onClick={onClose}>
            <span className="admin-sidebar-link-icon"></span>
            <span className="admin-sidebar-link-label">Voir le site public</span>
          </NavLink>
          <button className="admin-sidebar-link admin-sidebar-logout" onClick={handleLogout}>
            <span className="admin-sidebar-link-icon"></span>
            <span className="admin-sidebar-link-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}
    </>
  );
}

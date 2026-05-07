import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';
import AdminSidebar from '../admin/AdminSidebar.jsx';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const { isAuthenticated } = useAdmin();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main className="admin-main">
        {/* Mobile topbar toggle */}
        <div className="admin-mobile-topbar">
          <button
            className="admin-mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <span /><span /><span />
          </button>
          <div className="admin-mobile-logo">IMA <span>ADMIN</span></div>
        </div>
        <div className="admin-page-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

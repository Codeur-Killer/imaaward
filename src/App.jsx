// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { VoteProvider }  from './context/VoteContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';

import PublicLayout    from './components/layout/PageTransition.jsx';
import AdminLayout     from './components/layout/AdminLayout.jsx';

import HomePage           from './pages/public/HomePage.jsx';
import CategoriesPage     from './pages/public/CategoriesPage.jsx';
import CategoryDetailPage from './pages/public/CategoryDetailPage.jsx';
import ResultsPage        from './pages/public/ResultsPage.jsx';
import AboutPage          from './pages/public/AboutPage.jsx';
import ArtistSharePage    from './pages/public/ArtistSharePage.jsx';
import PaymentSuccessPage from './pages/public/PaymentSuccessPage.jsx';
import PaymentErrorPage   from './pages/public/PaymentErrorPage.jsx';
import PaymentMockPage    from './pages/public/PaymentMockPage.jsx';

import AdminLoginPage       from './pages/admin/AdminLoginPage.jsx';
import DashboardPage        from './pages/admin/DashboardPage.jsx';
import ManageArtistsPage    from './pages/admin/ManageArtistsPage.jsx';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage.jsx';
import ManageVotesPage      from './pages/admin/ManageVotesPage.jsx';

import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <VoteProvider>
          <Routes>
            {/* ── Pages publiques ── */}
            <Route path="/"                  element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/categories"        element={<PublicLayout><CategoriesPage /></PublicLayout>} />
            <Route path="/categories/:slug"  element={<PublicLayout><CategoryDetailPage /></PublicLayout>} />
            <Route path="/resultats"         element={<PublicLayout><ResultsPage /></PublicLayout>} />
            <Route path="/a-propos"          element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/artiste/:artistId" element={<PublicLayout><ArtistSharePage /></PublicLayout>} />

            {/* ── Retours FedaPay — PAS dans PublicLayout (plein écran) ── */}
            <Route path="/paiement-succes"   element={<PaymentSuccessPage />} />
            <Route path="/paiement-erreur"   element={<PaymentErrorPage />} />
            {/* Mode sandbox/dev — simule la page de paiement FedaPay */}
            <Route path="/paiement-mock"     element={<PaymentMockPage />} />

            {/* ── Admin ── */}
            <Route path="/admin"             element={<AdminLoginPage />} />
            <Route path="/admin/dashboard"   element={<AdminLayout><DashboardPage /></AdminLayout>} />
            <Route path="/admin/artistes"    element={<AdminLayout><ManageArtistsPage /></AdminLayout>} />
            <Route path="/admin/categories"  element={<AdminLayout><ManageCategoriesPage /></AdminLayout>} />
            <Route path="/admin/votes"       element={<AdminLayout><ManageVotesPage /></AdminLayout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </VoteProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

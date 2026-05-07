import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { to: '/', label: 'Accueil', exact: true },
    { to: '/categories', label: 'Catégories' },
    { to: '/resultats', label: 'Résultats' },
    { to: '/a-propos', label: 'À propos' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            {/* <span className="navbar-logo-text">IMA</span> */}
            <span className="navbar-logo-sub">
              <img src="/logo.png" alt="Logo de IMA-AWARD" />
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            {navLinks.map(({ to, label, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="navbar-actions">
            <button className="navbar-cta" onClick={() => navigate('/categories')}>
              <span className="navbar-cta-shimmer" />
              Voter maintenant
            </button>
            <button
              className={`navbar-burger ${menuOpen ? 'navbar-burger-open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`navbar-drawer ${menuOpen ? 'navbar-drawer-open' : ''}`}>
        <div className="navbar-drawer-inner">
          <ul className="navbar-drawer-links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `navbar-drawer-link ${isActive ? 'navbar-drawer-link-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button className="navbar-cta navbar-cta-drawer" onClick={() => { navigate('/categories'); setMenuOpen(false); }}>
            <span className="navbar-cta-shimmer" />
            Voter maintenant
          </button>
          <Link to="/admin" className="navbar-admin-link" onClick={() => setMenuOpen(false)}>
            Espace Admin →
          </Link>
        </div>
      </div>
      {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

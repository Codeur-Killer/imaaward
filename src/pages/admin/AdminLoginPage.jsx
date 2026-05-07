// pages/admin/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loginError, loginLoading, isAuthenticated } = useAdmin();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated]);

  const validate = () => {
    const e = {};
    if (!email)                      e.email    = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide.';
    if (!password)                   e.password = 'Le mot de passe est requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    await login(email, password);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-radial-1" />
        <div className="admin-login-radial-2" />
      </div>

      <div className="admin-login-card">
        <div className="admin-login-logo">
          
          <div className="admin-login-logo-sub">
            <img src="/logo.png" alt="Logo de IMA-AWARD" />
          </div>
        </div>

        <div className="admin-login-header">
          <div className="admin-login-icon"></div>
          <h1 className="admin-login-title">Espace Administrateur</h1>
          <p className="admin-login-subtitle">Connectez-vous pour gérer la plateforme.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <div className="admin-input-wrap">
              <span className="admin-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input type="email" className={`form-input admin-input ${errors.email ? 'input-error' : ''}`}
                placeholder="admin@ima-awards.com" value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email:'' })); }}
                autoComplete="email" />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="admin-input-wrap">
              <span className="admin-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input type={showPass ? 'text' : 'password'}
                className={`form-input admin-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password:'' })); }}
                autoComplete="current-password" />
              <button type="button" className="admin-input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {loginError && (
            <div className="admin-login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {loginError}
            </div>
          )}

          <button type="submit" className="admin-login-btn" disabled={loginLoading}>
            {loginLoading ? <><span className="btn-spinner"/> Connexion...</> : <><span></span> Se connecter</>}
          </button>
        </form>

        
      </div>
    </div>
  );
}

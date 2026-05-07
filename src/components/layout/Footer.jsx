import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { IoLogoFacebook } from "react-icons/io5";
import { FaSquareInstagram } from "react-icons/fa6";
import { BsTwitterX } from "react-icons/bs";



export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-sub">
                <img src="/logo.png" alt="Logo de IMA-AWARD" />
              </span>
            </div>
            <p className="footer-tagline">
              La plateforme de vote dédiée aux meilleurs artistes musicaux africains et francophones.
            </p>
            <div className="footer-socials">
              {[
                { href: '#', icon: <BsTwitterX />, label: 'Twitter/X' },
                { href: '#', icon: <FaSquareInstagram />, label: 'Instagram' },
                { href: '#', icon: <IoLogoFacebook />, label: 'Facebook' },
              ].map(s => (
                <a key={s.label} href={s.href} className="footer-social" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-nav-title">Navigation</h4>
            <ul className="footer-nav-list">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/categories', label: 'Catégories' },
                { to: '/resultats', label: 'Résultats en direct' },
                { to: '/a-propos', label: 'À propos' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="footer-nav-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-nav-title">Catégories</h4>
            <ul className="footer-nav-list">
              {[
                'Meilleur Artiste Masculin',
                'Meilleure Artiste Féminine',
                'Révélation de l\'Année',
                'Meilleur Album',
                'Meilleur Clip Vidéo',
              ].map(c => (
                <li key={c}><Link to="/categories" className="footer-nav-link">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4 className="footer-nav-title">Informations</h4>
            <ul className="footer-nav-list">
              <li><Link to="#" className="footer-nav-link">Règlement des votes</Link></li>
              <li><Link to="#" className="footer-nav-link">Politique de confidentialité</Link></li>
              <li><Link to="#" className="footer-nav-link">Conditions d'utilisation</Link></li>
              <li><Link to="#" className="footer-nav-link">Contact</Link></li>
              {/* <li><Link to="/admin" className="footer-nav-link footer-admin-link">Espace Admin →</Link></li> */}
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} IMA Awards. Tous droits réservés.
          </p>
          <p className="footer-made">
            Paiements sécurisés via <span className="text-gold">FedaPay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

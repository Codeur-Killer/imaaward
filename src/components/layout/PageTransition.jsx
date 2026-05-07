import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './PageTransition.css';

export default function PublicLayout({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateY(0)';
        }
      });
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="public-layout">
      <Navbar />
      <main ref={ref} className="public-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

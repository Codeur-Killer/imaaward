import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../ui/CountdownTimer.jsx';
import { useVote } from '../../context/VoteContext.jsx';
import './HeroSection.css';

function GoldParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * 0.005;
        if (p.alpha > 0.6 || p.alpha < 0.05) p.alphaDir *= -1;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10 || p.x > canvas.width + 10) p.x = Math.random() * canvas.width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`;
        ctx.fill();

        // Occasional sparkle
        if (Math.random() > 0.995) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 197, 106, 0.15)`;
          ctx.fill();
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

export default function HeroSection() {
  const { VOTE_END_DATE } = useVote();
  const navigate = useNavigate();

  const storedStart = localStorage.getItem('ima_vote_start_date') || '2026-05-17T00:00:00';
  const labelText = new Date() < new Date(storedStart) ? 'Début des votes dans' : 'Fin des votes dans';

  return (
    <section className="hero">
      <GoldParticles />

      {/* Background radials */}
      <div className="hero-bg-radial hero-bg-radial-1" />
      <div className="hero-bg-radial hero-bg-radial-2" />
      <div className="hero-bg-radial hero-bg-radial-3" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Votes ouverts · Saison 2025–2026
        </div>

        <h1 className="hero-title">
          Votez pour vos
          <span className="hero-title-highlight"> managers favoris</span>
        </h1>

        <p className="hero-subtitle">
          Participez aux <strong>IMA Awards</strong> — Les plus grands managers africains et francophones
          s'affrontent pour les prix les plus convoités de la scène musicale.
        </p>

        <div className="hero-countdown-wrapper">
          <p className="hero-countdown-label">{labelText}</p>
          <CountdownTimer targetDate={VOTE_END_DATE} size="lg" />
        </div>

        <div className="hero-ctas">
          <button className="hero-btn-primary" onClick={() => navigate('/categories')}>
            <span className="hero-btn-shimmer" />
            <span className="hero-btn-icon"></span>
            Découvrir les catégories
          </button>
          <button className="hero-btn-secondary" onClick={() => navigate('/resultats')}>
            <span className="hero-btn-live" />
            Résultats en direct
          </button>
        </div>

        <div className="hero-scroll-hint">
          <div className="hero-scroll-icon">
            <div className="hero-scroll-dot" />
          </div>
          <span>Défiler</span>
        </div>
      </div>

      <div className="hero-bottom-gradient" />
    </section>
  );
}

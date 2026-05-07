// pages/public/HomePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/public/HeroSection.jsx';
import CategoryCard from '../../components/public/CategoryCard.jsx';
import ArtistCard from '../../components/public/ArtistCard.jsx';
import LiveResultsWidget from '../../components/public/LiveResultsWidget.jsx';
import VoteModal from '../../components/public/VoteModal.jsx';
import PartnersSection from '../../components/public/PartnersSection.jsx';
import { useVote } from '../../context/VoteContext.jsx';
import './HomePage.css';

function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick  = () => {
          const progress = Math.min((Date.now() - start) / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { categories, artists, stats } = useVote();
  const [voteModal, setVoteModal] = useState({ open: false, artist: null, category: null });

  const featuredArtists = artists.filter(a => a.featured).slice(0, 4);
  const totalVotes      = stats?.totalVotes || artists.reduce((s, a) => s + (a.votes || 0), 0);

  const handleVoteClick = (artist) => {
    const catId = artist.categoryId || artist.category?._id || artist.category;
    const cat   = categories.find(c => (c.id || c._id) === catId);
    setVoteModal({ open: true, artist, category: cat });
  };

  return (
    <div className="home-page">
      <HeroSection />

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: artists.length || stats?.totalArtists || 26,      label: 'Managers en compétition', icon: '' },
              { value: categories.length || stats?.totalCategories || 5, label: 'Catégories',              icon: '' },
              { value: totalVotes,                                        label: 'Votes enregistrés',       icon: '' },
            ].map((stat, i) => (
              <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="stat-card-icon">{stat.icon}</div>
                <div className="stat-card-value"><AnimatedCounter target={stat.value} /></div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag"> Compétitions</div>
            <h2 className="section-big-title">Explorez les Catégories</h2>
            <p className="section-desc">Découvrez toutes les catégories et soutenez vos artistes préférés.</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id || cat._id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Artistes vedettes */}
      {featuredArtists.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag"> Sélection</div>
              <h2 className="section-big-title">Manager en vedette</h2>
              <p className="section-desc">Les managers qui font vibrer la scène musicale africaine cette année.</p>
            </div>
            <div className="artists-grid">
              {featuredArtists.map((artist, i) => (
                <div key={artist.id || artist._id} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ArtistCard artist={artist} onVoteClick={handleVoteClick} />
                </div>
              ))}
            </div>
            <div className="section-cta-wrap">
              <button className="section-cta-btn" onClick={() => navigate('/categories')}>
                Voir tous les artistes →
              </button>
            </div>
          </div>
        </section>
      )}

      <LiveResultsWidget />
      <PartnersSection />

      {/* Comment voter */}
      <section className="section how-to">
        <div className="container">
          <div className="section-header">
            <div className="section-tag"> Guide</div>
            <h2 className="section-big-title">Comment voter ?</h2>
          </div>
          <div className="how-steps">
            {[
              { step:'01', icon:'', title:'Choisissez une catégorie',  desc:"Parcourez les catégories et découvrez les managers nominés." },
              { step:'02', icon:'', title:'Sélectionnez votre artiste', desc:"Consultez les profils et choisissez qui vous souhaitez soutenir." },
              { step:'03', icon:'', title:'Votez et soutenez',          desc:"Votez et multipliez votre soutien via FedaPay pour plus de votes." },
            ].map((s, i) => (
              <div key={i} className="how-step animate-in" style={{ animationDelay: `${i * 0.15}s` }}>
                {i < 2 && <div className="how-step-line" />}
                <div className="how-step-number">{s.step}</div>
                <div className="how-step-icon">{s.icon}</div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VoteModal
        isOpen={voteModal.open}
        artist={voteModal.artist}
        category={voteModal.category}
        onClose={() => setVoteModal({ open: false, artist: null, category: null })}
      />
    </div>
  );
}

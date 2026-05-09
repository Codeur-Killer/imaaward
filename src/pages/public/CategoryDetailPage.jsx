// pages/public/CategoryDetailPage.jsx
// Connecté à l'API réelle + Socket.io pour mises à jour en direct
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtistCard from '../../components/public/ArtistCard.jsx';
import VoteModal from '../../components/public/VoteModal.jsx';
import { useVote } from '../../context/VoteContext.jsx';
import { joinCategory, leaveCategory } from '../../services/socket.js';
import './CategoryDetailPage.css';

export default function CategoryDetailPage() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const { categories, getArtistsByCategory, getTotalVotesForCategory } = useVote();
  const [voteModal, setVoteModal] = useState({ open: false, artist: null });
  const [sort,      setSort]      = useState('votes');

  const category = categories.find(c => c.slug === slug);
  const catId    = category?.id || category?._id;

  // Socket.io — rejoindre la room de cette catégorie
  useEffect(() => {
    if (!catId) return;
    joinCategory(catId);
    return () => leaveCategory(catId);
  }, [catId]);

  if (categories.length === 0) {
    return (
      <div className="category-detail-page">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="not-found">
        <div className="container">
          <h1>Catégorie introuvable</h1>
          <button onClick={() => navigate('/categories')}>← Retour aux catégories</button>
        </div>
      </div>
    );
  }

  let artists = getArtistsByCategory(catId);
  if (sort === 'votes') artists = [...artists].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  else                  artists = [...artists].sort((a, b) => a.name.localeCompare(b.name));

  const totalVotes = getTotalVotesForCategory(catId);
  const leader     = artists[0];

  return (
    <div className="category-detail-page">
      <div className="cat-detail-hero" style={{ '--cat-color': category.color }}>
        <div className="cat-detail-hero-glow"
          style={{ background: `radial-gradient(ellipse 60% 80% at 50% 0%, ${category.color}1A 0%, transparent 70%)` }} />
        <div className="container">
          <button className="cat-detail-back" onClick={() => navigate('/categories')}>
            ← Toutes les catégories
          </button>
          <div className="cat-detail-header">
            {/* <div className="cat-detail-icon"
              style={{ background: `${category.color}20`, border: `1px solid ${category.color}40` }}>
              {category.icon}
            </div> */}
            <div></div>
            <div className="cat-detail-info">
              <div className={`category-card-status ${category.status === 'open' ? 'status-open' : 'status-closed'}`}
                style={{ alignSelf: 'flex-start' }}>
                <span className="status-dot" />
                {category.status === 'open' ? 'Votes ouverts' : 'Votes fermés'}
              </div>
              <h1 className="cat-detail-title" style={{ textTransform: "uppercase" }}>{category.name}</h1>
              <p className="cat-detail-desc">{category.description}</p>
              <div className="cat-detail-meta">
                <span className="cat-detail-meta-item">
                  <span style={{ color: category.color }}></span>
                  {artists.length} managers nominés
                </span>
                <span className="cat-detail-meta-sep">·</span>
                <span className="cat-detail-meta-item">
                  <span></span>
                  {(totalVotes || 0).toLocaleString('fr-FR')} votes au total
                </span>
                {leader && (
                  <>
                    <span className="cat-detail-meta-sep">·</span>
                    <span className="cat-detail-meta-item">
                      <span></span>
                      En tête : <strong style={{ color: category.color }}>{leader.name}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="cat-detail-controls">
            <h2 className="cat-detail-grid-title">Managers nominés</h2>
            <div className="cat-detail-sort">
              <span className="cat-detail-sort-label">Trier par :</span>
              {[
                { value: 'votes', label: 'Votes' },
                { value: 'name',  label: 'Nom' },
              ].map(opt => (
                <button key={opt.value}
                  className={`cat-detail-sort-btn ${sort === opt.value ? 'active' : ''}`}
                  onClick={() => setSort(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cat-detail-artists-grid">
            {artists.map((artist, i) => {
              const aid = artist.id || artist._id;
              return (
                <div key={aid} className="animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <ArtistCard
                    artist={artist}
                    rank={i + 1}
                    onVoteClick={a => setVoteModal({ open: true, artist: a })}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <VoteModal
        isOpen={voteModal.open}
        artist={voteModal.artist}
        category={category}
        onClose={() => setVoteModal({ open: false, artist: null })}
      />
    </div>
  );
}

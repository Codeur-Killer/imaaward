// components/public/ArtistCard.jsx
// Clic sur la card → navigate vers /artiste/:id
// Bouton "Voter" reste accessible directement sur la card
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../../context/VoteContext.jsx';
import VoteProgressBar from './VoteProgressBar.jsx';
import './ArtistCard.css';

export default function ArtistCard({ artist, onVoteClick, rank }) {
  const navigate = useNavigate();
  const { getVotePercentage, hasVoted } = useVote();
  const [copied, setCopied] = useState(false);

  const aid   = String(artist.id || artist._id);
  const pct   = getVotePercentage(aid);
  const voted = hasVoted(aid); // vote gratuit déjà utilisé

  const rankColors = ['#C9A84C', '#8A94A6', '#A0522D'];
  const rankIcons  = ['🥇', '🥈', '🥉'];

  // ── Navigation vers la page artiste ──────────────────────────────
  const goToArtistPage = () => {
    navigate(`/artiste/${aid}`);
  };

  // ── Bouton voter — ouvre modal sans naviguer ──────────────────────
  const handleVoteBtn = (e) => {
    e.stopPropagation(); // ne pas déclencher goToArtistPage
    if (onVoteClick) onVoteClick(artist);
  };

  // ── Bouton partager — copie le lien ──────────────────────────────
  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/artiste/${aid}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Votez pour ${artist.name} — IMA Awards`,
          text:  `Soutenez ${artist.name} aux IMA Awards !`,
          url:   shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <div
      className={`artist-card ${voted ? 'artist-card-voted' : ''}`}
      onClick={goToArtistPage}
      style={{ cursor: 'pointer' }}
      title={`Voir la page de ${artist.name}`}
    >
      {/* Rang */}
      {rank && rank <= 3 && (
        <div className="artist-card-rank" style={{ color: rankColors[rank - 1] }}>
          {rankIcons[rank - 1]}
        </div>
      )}

      {/* Photo carré */}
      <div className="artist-card-photo-wrap">
        <img
          src={artist.photo}
          alt={artist.name}
          className="artist-card-photo"
          loading="lazy"
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="artist-card-photo-fallback">{artist.name?.charAt(0)}</div>
        <div className="artist-card-photo-overlay" />
        {voted && (
          <div className="artist-card-voted-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Gratuit 
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="artist-card-body">
        <div className="artist-card-nationality">{artist.nationality}</div>
        <h3 className="artist-card-name">{artist.name}</h3>
        <p className="artist-card-genre">{artist.genre}</p>

        <div className="artist-card-votes-row">
          <span className="artist-card-votes-count">
            {(artist.votes || 0).toLocaleString('fr-FR')} votes
          </span>
          <span className="artist-card-pct">{pct}%</span>
        </div>

        <div className="artist-card-progress">
          <VoteProgressBar percentage={pct} showLabel={false} height="sm" />
        </div>

        <div className="artist-card-spacer" />

        {/* Boutons — stopPropagation pour ne pas déclencher la navigation */}
        <div className="artist-card-actions">

          {/* Bouton voter */}
          <button
            className={`artist-card-vote-btn ${voted ? 'artist-card-vote-btn-used' : ''}`}
            onClick={handleVoteBtn}
          >
            {voted ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Voter en payant 
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                Voter
              </>
            )}
          </button>

          {/* Bouton partager + lien page artiste */}
          <div className="artist-card-bottom-row">
            <button
              className={`artist-card-share-btn ${copied ? 'copied' : ''}`}
              onClick={handleShare}
              title="Copier le lien de partage"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Partager
                </>
              )}
            </button>

            <button
              className="artist-card-page-btn"
              onClick={goToArtistPage}
              title="Voir la page complète"
            >
              Voir →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// pages/public/ArtistSharePage.jsx
// Page artiste : infos complètes + vote + copie du lien de partage
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVote } from '../../context/VoteContext.jsx';
import { artistsAPI, resolvePhoto } from '../../services/api.js';
import VoteModal from '../../components/public/VoteModal.jsx';
import VoteProgressBar from '../../components/public/VoteProgressBar.jsx';
import './ArtistSharePage.css';

export default function ArtistSharePage() {
  const { artistId } = useParams();
  const navigate      = useNavigate();
  const { artists, categories, getVotePercentage, getTotalVotesForCategory, hasVoted } = useVote();

  const [artist,   setArtist]   = useState(null);
  const [category, setCategory] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [voteOpen, setVoteOpen] = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // D'abord chercher dans le contexte déjà chargé
        let found = artists.find(a => String(a.id || a._id) === artistId);
        if (!found && artists.length > 0) {
          // Pas dans le contexte → appel API direct
          try {
            const res = await artistsAPI.getOne(artistId);
            found = res.data;
          } catch {}
        }
        if (found) {
          setArtist(found);
          const catId = String(found.categoryId || found.category?._id || found.category || '');
          const cat   = categories.find(c => String(c.id||c._id) === catId);
          setCategory(cat || null);
        }
      } finally {
        setLoading(false);
      }
    };
    // Attendre que les données de contexte soient chargées
    if (artists.length > 0 || loading) load();
  }, [artistId, artists, categories]);

  if (loading) return (
    <div className="share-loading">
      <div className="share-spinner" />
      <p>Chargement...</p>
    </div>
  );

  if (!artist) return (
    <div className="share-notfound">
      <div style={{ fontSize: 60 }}>😕</div>
      <h1>Artiste introuvable</h1>
      <p>Ce lien est peut-être invalide.</p>
      <button className="share-back-btn" onClick={() => navigate('/categories')}>
        ← Voir les catégories
      </button>
    </div>
  );

  const aid        = String(artist.id || artist._id);
  const pct        = getVotePercentage(aid);
  const catId      = String(artist.categoryId || artist.category?._id || artist.category || '');
  const totalVotes = getTotalVotesForCategory(catId);
  const voted      = hasVoted(aid);
  const shareUrl   = `${window.location.origin}/artiste/${aid}`;
  const photoUrl   = resolvePhoto(artist.photo);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Votez pour ${artist.name} — IMA Awards`,
        text:  `Soutenez ${artist.name} aux IMA Awards ! ${(artist.votes||0).toLocaleString('fr-FR')} votes pour le moment.`,
        url:   shareUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="share-page">

      {/* Hero */}
      <div className="share-hero" style={{
        '--cat-color': category?.color || '#C9A84C'
      }}>
        <div className="share-hero-glow" />
        <div className="container">
          <button className="share-back-link"
            onClick={() => navigate(category ? `/categories/${category.slug}` : '/categories')}>
            ← {category ? category.name : 'Catégories'}
          </button>
        </div>
      </div>

      <div className="container">
        <div className="share-card">

          {/* ── Photo ── */}
          <div className="share-media">
            <div className="share-photo-frame">
              {photoUrl
                ? <img src={photoUrl} alt={artist.name} className="share-photo"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                : null
              }
              <div className="share-photo-fallback" style={{ display: photoUrl ? 'none' : 'flex' }}>
                {artist.name.charAt(0)}
              </div>
              {category && (
                <div className="share-cat-pill" style={{
                  background: `${category.color}20`,
                  border: `1px solid ${category.color}44`,
                  color: category.color,
                }}>
                   {category.name}
                </div>
              )}
            </div>
          </div>

          {/* ── Infos ── */}
          <div className="share-info">
            {/* <div className="share-nationality">{artist.nationality}</div> */}
            <h1 className="share-name">{artist.name}</h1>
            {artist.realName && <p className="share-realname">{artist.realName}</p>}
            <p className="share-genre">{artist.genre}</p>

            {artist.bio && (
              <p className="share-bio">{artist.bio}</p>
            )}

            {/* Stats */}
            <div className="share-stats">
              <div className="share-stat">
                <span className="share-stat-n" style={{ color: category?.color || 'var(--accent-gold-light)' }}>
                  {(artist.votes||0).toLocaleString('fr-FR')}
                </span>
                <span className="share-stat-l">votes</span>
              </div>
              <div className="share-stat">
                <span className="share-stat-n">{pct}%</span>
                <span className="share-stat-l">de la catégorie</span>
              </div>
              {totalVotes > 0 && (
                <div className="share-stat">
                  <span className="share-stat-n">{totalVotes.toLocaleString('fr-FR')}</span>
                  <span className="share-stat-l">votes totaux</span>
                </div>
              )}
            </div>

            {/* Barre de progression */}
            <div style={{ marginBottom: 20 }}>
              <VoteProgressBar percentage={pct} showLabel={false} height="lg" />
            </div>

            {/* Boutons d'action */}
            <div className="share-actions">
              <button
                className={`share-vote-btn ${voted ? 'share-vote-btn-used' : ''}`}
                onClick={() => setVoteOpen(true)}
                style={voted ? {} : {
                  background: `linear-gradient(135deg, ${category?.color || 'var(--accent-gold-dark)'} 0%, ${category?.color || 'var(--accent-gold)'} 100%)`
                }}
              >
                {voted ? (
                  <> Voter en payant</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    Voter pour {artist.name}
                  </>
                )}
              </button>

              <button className="share-share-btn" onClick={handleNativeShare}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Partager
              </button>
            </div>

            {/* ── Boîte de lien à copier ── */}
            <div className="share-link-box">
              <p className="share-link-title">
                🔗 Lien de partage — partagez ce lien avec votre communauté pour qu'ils puissent voter
              </p>
              <div className="share-link-row">
                <input
                  className="share-link-input"
                  value={shareUrl}
                  readOnly
                  onClick={e => e.target.select()}
                />
                <button
                  className={`share-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copier le lien
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de vote */}
      <VoteModal
        isOpen={voteOpen}
        artist={artist}
        category={category}
        onClose={() => setVoteOpen(false)}
      />
    </div>
  );
}

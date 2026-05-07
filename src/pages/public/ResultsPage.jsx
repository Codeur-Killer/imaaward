// pages/public/ResultsPage.jsx
// Résultats en direct — connecté à l'API + Socket.io
import React, { useState, useEffect } from 'react';
import { useVote } from '../../context/VoteContext.jsx';
import { getSocket, joinCategory, leaveCategory } from '../../services/socket.js';
import VoteProgressBar from '../../components/public/VoteProgressBar.jsx';
import './ResultsPage.css';

function PodiumBlock({ artist, rank, percentage }) {
  const heights   = ['180px', '130px', '100px'];
  const colors    = ['#C9A84C', '#8A94A6', '#A0522D'];
  const icons     = ['🥇', '🥈', '🥉'];
  const order     = [1, 0, 2];
  return (
    <div className={`podium-block podium-rank-${rank}`} style={{ order: order[rank - 1] }}>
      <img src={artist.photo} alt={artist.name} className="podium-photo"
        onError={e => { e.target.style.display = 'none'; }} />
      <div className="podium-icon">{icons[rank - 1]}</div>
      <div className="podium-name">{artist.name}</div>
      <div className="podium-pct" style={{ color: colors[rank - 1] }}>{percentage}%</div>
      <div className="podium-votes">{(artist.votes || 0).toLocaleString('fr-FR')} votes</div>
      <div className="podium-bar" style={{
        height: heights[rank - 1],
        background: `linear-gradient(to top, ${colors[rank - 1]}40, ${colors[rank - 1]}20)`,
        borderTop: `3px solid ${colors[rank - 1]}`,
      }}>
        <span className="podium-rank-num" style={{ color: colors[rank - 1] }}>{rank}</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { categories, getArtistsByCategory, getVotePercentage, getTotalVotesForCategory } = useVote();
  const [activeTab, setActiveTab] = useState(null);

  // Initialiser l'onglet actif quand les catégories sont chargées
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]?.id || categories[0]?._id);
    }
  }, [categories]);

  // Rejoindre / quitter la room Socket.io de la catégorie active
  useEffect(() => {
    if (!activeTab) return;
    joinCategory(activeTab);
    return () => leaveCategory(activeTab);
  }, [activeTab]);

  const catId          = activeTab;
  const activeCategory = categories.find(c => (c.id || c._id) === catId);
  const artists        = activeCategory
    ? [...getArtistsByCategory(catId)].sort((a, b) => (b.votes || 0) - (a.votes || 0))
    : [];
  const totalVotes     = getTotalVotesForCategory(catId);

  return (
    <div className="results-page">
      {/* Header */}
      <div className="results-hero">
        <div className="results-hero-glow" />
        <div className="container">
          <div className="results-hero-content">
            <div className="live-badge" style={{ alignSelf: 'center', marginBottom: '16px' }}>
              <span className="live-dot" />
              RÉSULTATS EN DIRECT
            </div>
            <h1 className="results-title">Résultats en Direct</h1>
            <p className="results-desc">
              Suivez les votes en temps réel. Résultats mis à jour automatiquement.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs-wrap">
        <div className="container">
          <div className="results-tabs">
            {categories.map(cat => {
              const cid = cat.id || cat._id;
              return (
                <button key={cid}
                  className={`results-tab ${activeTab === cid ? 'active' : ''}`}
                  onClick={() => setActiveTab(cid)}
                >
                  <span>{cat.icon}</span>
                  <span className="results-tab-name">{cat.name}</span>
                  <span className="results-tab-votes">
                    {getTotalVotesForCategory(cid).toLocaleString('fr-FR')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container">
          {activeCategory ? (
            <>
              <div className="results-cat-header">
                <div className="results-cat-info">
                  <span style={{ fontSize: '28px' }}>{activeCategory.icon}</span>
                  <div>
                    <h2 className="results-cat-title">{activeCategory.name}</h2>
                    <p className="results-cat-total">
                      {totalVotes.toLocaleString('fr-FR')} votes au total · {artists.length} nominés
                    </p>
                  </div>
                </div>
              </div>

              {/* Podium top 3 */}
              {artists.length >= 3 && (
                <div className="podium-section">
                  <h3 className="podium-title">🏆 Podium</h3>
                  <div className="podium-container">
                    {artists.slice(0, 3).map((artist, i) => {
                      const aid = artist.id || artist._id;
                      return (
                        <PodiumBlock
                          key={aid}
                          artist={artist}
                          rank={i + 1}
                          percentage={getVotePercentage(aid)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Classement complet */}
              <div className="results-ranking">
                <h3 className="results-ranking-title">Classement complet</h3>
                <div className="results-ranking-list">
                  {artists.map((artist, i) => {
                    const aid        = artist.id || artist._id;
                    const pct        = getVotePercentage(aid);
                    const rankColors = ['#C9A84C', '#8A94A6', '#A0522D'];
                    return (
                      <div key={aid} className={`results-row ${i < 3 ? 'results-row-top' : ''}`}>
                        <div className="results-row-rank"
                          style={{ color: i < 3 ? rankColors[i] : 'var(--text-muted)' }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                        </div>
                        <img src={artist.photo} alt={artist.name} className="results-row-photo"
                          onError={e => { e.target.style.display = 'none'; }} />
                        <div className="results-row-info">
                          <div className="results-row-name">{artist.name}</div>
                          <div className="results-row-meta">{artist.genre} · {artist.nationality}</div>
                        </div>
                        <div className="results-row-bar">
                          <VoteProgressBar
                            percentage={pct}
                            color={i === 0 ? 'gold' : i === 1 ? 'purple' : 'green'}
                            height="md"
                            showLabel={false}
                          />
                        </div>
                        <div className="results-row-stats">
                          <div className="results-row-pct"
                            style={{ color: i < 3 ? rankColors[i] : 'var(--text-primary)' }}>
                            {pct}%
                          </div>
                          <div className="results-row-votes">
                            {(artist.votes || 0).toLocaleString('fr-FR')} votes
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              Chargement des résultats...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

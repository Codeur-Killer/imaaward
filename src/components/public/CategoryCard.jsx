// components/public/CategoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../../context/VoteContext.jsx';
import './CategoryCard.css';

export default function CategoryCard({ category, index = 0 }) {
  const navigate = useNavigate();
  const { getArtistsByCategory, getTotalVotesForCategory, getVotePercentage } = useVote();

  const catId      = String(category.id || category._id);
  const artists    = getArtistsByCategory(catId);
  const topArtist  = [...artists].sort((a, b) => (b.votes||0) - (a.votes||0))[0];
  const topPct     = topArtist ? getVotePercentage(String(topArtist.id || topArtist._id)) : 0;
  const totalVotes = getTotalVotesForCategory(catId);

  return (
    <div
      className="category-card animate-in"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => navigate(`/categories/${category.slug}`)}
    >
      <div className="category-card-glow"
        style={{ background: `radial-gradient(circle at 30% 30%, ${category.color}1A 0%, transparent 60%)` }} />

      {/* Header */}
      <div className="category-card-header">
        {/* <div className="category-card-icon"
          style={{ background: `${category.color}20`, border: `1px solid ${category.color}40` }}>
          <span>{category.icon}</span>
        </div> */}
        <div></div>
        <div className={`category-card-status ${category.status === 'open' ? 'status-open' : 'status-closed'}`}>
          <span className="status-dot" />
          {category.status === 'open' ? 'Ouvert' : 'Fermé'}
        </div>
      </div>

      {/* Nom */}
      <h3 className="category-card-name" style="text-transform: uppercase;">{category.name}</h3>

      { /* Description — hauteur fixe (clamp CSS) */ }
      {/* <p className="category-card-desc">{category.description}</p> */}

      {/* Spacer — pousse le reste en bas */}
      <div className="category-card-spacer" />

      {/* Stats */}
      <div className="category-card-stats">
        <div className="category-stat">
          <span className="category-stat-value">{artists.length}</span>
          <span className="category-stat-label">Managers</span>
        </div>
        <div className="category-stat-divider" />
        <div className="category-stat">
          <span className="category-stat-value">{(totalVotes||0).toLocaleString('fr-FR')}</span>
          <span className="category-stat-label">Votes</span>
        </div>
      </div>

      {/* Leader */}
      {topArtist && (
        <div className="category-card-leader">
          <div className="category-card-leader-info">
            <span className="category-card-leader-label">🏆 En tête :</span>
            <span className="category-card-leader-name">{topArtist.name}</span>
          </div>
          <div className="category-card-progress-wrap">
            <div className="category-card-progress-bar">
              <div className="category-card-progress-fill"
                style={{ width: `${topPct}%`, background: category.color, boxShadow: `0 0 8px ${category.color}60` }} />
            </div>
            <span className="category-card-progress-pct" style={{ color: category.color }}>{topPct}%</span>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="category-card-footer">
        <span className="category-card-cta">
          Voter
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

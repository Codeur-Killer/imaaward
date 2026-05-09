// components/public/LiveResultsWidget.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../../context/VoteContext.jsx';
import { getSocket } from '../../services/socket.js';
import './LiveResultsWidget.css';

export default function LiveResultsWidget() {
  const navigate   = useNavigate();
  const { categories, getTopArtists, getVotePercentage } = useVote();

  const featured = categories.slice(0, 3);

  return (
    <section className="live-widget section">
      <div className="container">
        <div className="live-widget-header">
          <div className="live-widget-title-wrap">
            <div className="live-badge"><span className="live-dot" />LIVE</div>
            <h2 className="section-title live-widget-title" style={{ textTransform: "uppercase" }}>Résultats en temps réel</h2>
          </div>
          <button className="live-widget-see-all" onClick={() => navigate('/resultats')}>
            Voir tout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="live-widget-grid">
          {featured.map(cat => {
            const catId = cat.id || cat._id;
            const top3  = getTopArtists(catId, 3);
            return (
              <div key={catId} className="live-category-card">
                <div className="live-cat-header">
                  <span className="live-cat-icon"></span>
                  <h3 className="live-cat-name" style={{ textTransform: "uppercase" }}>{cat.name}</h3>
                </div>
                <div className="live-cat-artists">
                  {top3.map((artist, i) => {
                    const aid  = artist.id || artist._id;
                    const pct  = getVotePercentage(aid);
                    const rankColors = ['#C9A84C','#8A94A6','#A0522D'];
                    return (
                      <div key={aid} className="live-artist-row">
                        <div className="live-artist-rank" style={{ color: rankColors[i] }}>{i + 1}</div>
                        <img src={artist.photo} alt={artist.name} className="live-artist-photo"
                          onError={e => { e.target.style.display='none'; }} />
                        <div className="live-artist-info">
                          <div className="live-artist-name">{artist.name}</div>
                          <div className="live-progress-wrap">
                            <div className="live-progress-bar">
                              <div className="live-progress-fill"
                                style={{ width:`${pct}%`, background: rankColors[i], boxShadow:`0 0 8px ${rankColors[i]}60` }} />
                            </div>
                            <span className="live-pct" style={{ color: rankColors[i] }}>{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

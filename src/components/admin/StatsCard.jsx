import React from 'react';
import './StatsCard.css';

export default function StatsCard({ icon, title, value, change, changeType = 'up', color = 'gold', suffix = '' }) {
  const colorMap = {
    gold: '#C9A84C',
    purple: '#7C3AED',
    green: '#10B981',
    blue: '#3B82F6',
    pink: '#EC4899',
  };
  const c = colorMap[color] || colorMap.gold;

  return (
    <div className="stats-card-admin" style={{ '--card-color': c }}>
      <div className="stats-card-glow" />
      <div className="stats-card-top">
        <div className="stats-card-icon-wrap" style={{ background: `${c}1A`, border: `1px solid ${c}30` }}>
          <span className="stats-card-icon">{icon}</span>
        </div>
        {change !== undefined && (
          <div className={`stats-card-change stats-card-change-${changeType}`}>
            {changeType === 'up' ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="stats-card-value">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {suffix && <span className="stats-card-suffix">{suffix}</span>}
      </div>
      <div className="stats-card-title">{title}</div>
      <div className="stats-card-bar">
        <div className="stats-card-bar-fill" style={{ background: c }} />
      </div>
    </div>
  );
}

// components/admin/VoteChart.jsx
// Données 100% depuis l'API — aucune donnée statique affichée
import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import './VoteChart.css';

const EMPTY_DATA = [
  { name: 'Lun', votes: 0, revenue: 0 },
  { name: 'Mar', votes: 0, revenue: 0 },
  { name: 'Mer', votes: 0, revenue: 0 },
  { name: 'Jeu', votes: 0, revenue: 0 },
  { name: 'Ven', votes: 0, revenue: 0 },
  { name: 'Sam', votes: 0, revenue: 0 },
  { name: 'Dim', votes: 0, revenue: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="vote-chart-tooltip">
      <div className="vote-chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="vote-chart-tooltip-item" style={{ color: p.color }}>
          <span>{p.name === 'votes' ? ' Votes' : ' Revenus'} : </span>
          <strong>
            {p.name === 'votes'
              ? p.value.toLocaleString('fr-FR')
              : `${p.value.toLocaleString('fr-FR')} FCFA`}
          </strong>
        </div>
      ))}
    </div>
  );
};

// externalData : données réelles passées par DashboardPage depuis l'API
export default function VoteChart({ externalData }) {
  const [metric, setMetric] = useState('votes');
  // Utiliser les données API si disponibles, sinon graphique vide (pas de mock)
  const data = (externalData && externalData.length > 0) ? externalData : EMPTY_DATA;
  const hasData = externalData && externalData.length > 0 && externalData.some(d => d.votes > 0);

  return (
    <div className="vote-chart-card">
      <div className="vote-chart-header">
        <div>
          <h3 className="vote-chart-title">Évolution des votes</h3>
          <p className="vote-chart-subtitle">
            {hasData ? '7 derniers jours — données réelles' : 'En attente de données...'}
          </p>
        </div>
        <div className="vote-chart-controls">
          <div className="vote-chart-metrics">
            {['votes', 'revenue'].map(m => (
              <button
                key={m}
                className={`vote-chart-metric-btn ${metric === m ? 'active' : ''}`}
                onClick={() => setMetric(m)}
              >
                {m === 'votes' ? ' Votes' : ' Revenus'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="vote-chart-area">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(201,168,76,0.08)" strokeDasharray="4 4" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8A94A6', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(201,168,76,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8A94A6', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric === 'votes' ? 'votes' : 'revenue'}
              name={metric}
              stroke={metric === 'votes' ? '#C9A84C' : '#7C3AED'}
              strokeWidth={2.5}
              fill={metric === 'votes' ? 'url(#goldGrad)' : 'url(#purpleGrad)'}
              dot={{ fill: metric === 'votes' ? '#C9A84C' : '#7C3AED', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#080B12' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

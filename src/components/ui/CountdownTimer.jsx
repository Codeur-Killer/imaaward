import React from 'react';
import { useCountdown } from '../../hooks/useCountdown.js';
import './CountdownTimer.css';

export default function CountdownTimer({ targetDate, size = 'lg' }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <div className={`countdown countdown-${size}`}>
        <div className="countdown-expired">Les votes sont terminés</div>
      </div>
    );
  }

  const units = [
    { value: days, label: 'Jours' },
    { value: hours, label: 'Heures' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Secondes' },
  ];

  return (
    <div className={`countdown countdown-${size}`}>
      {units.map(({ value, label }, i) => (
        <React.Fragment key={label}>
          <div className="countdown-unit">
            <span className="countdown-value">{String(value).padStart(2, '0')}</span>
            <span className="countdown-label">{label}</span>
          </div>
          {i < units.length - 1 && <span className="countdown-sep">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

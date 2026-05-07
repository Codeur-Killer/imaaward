import React, { useEffect, useRef, useState } from 'react';
import './VoteProgressBar.css';

export default function VoteProgressBar({ percentage, color = 'gold', animated = true, showLabel = true, height = 'md' }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!animated) { setWidth(percentage); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(percentage); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percentage, animated]);

  return (
    <div className={`progress-bar progress-bar-${height}`} ref={ref}>
      <div
        className={`progress-fill progress-fill-${color}`}
        style={{ width: `${width}%`, transition: animated ? 'width 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
      />
      {showLabel && <span className="progress-label">{percentage}%</span>}
    </div>
  );
}

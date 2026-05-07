import React from 'react';
import './Loader.css';

export default function Loader({ size = 'md', text = '' }) {
  return (
    <div className={`loader loader-${size}`}>
      <div className="loader-ring">
        <div /><div /><div /><div />
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-logo">IMA</div>
      <Loader size="lg" />
    </div>
  );
}

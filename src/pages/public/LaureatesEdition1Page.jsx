import React from 'react';
import { laureatesEdition1 } from '../../data/laureatesEdition1.js';
import './LaureatesEdition1Page.css';

export default function LaureatesEdition1Page() {
  return (
    <div className="laureates-page">
      {/* Header */}
      <div className="laureates-hero">
        <div className="laureates-hero-glow" />
        <div className="container">
          <div className="laureates-hero-content">
            <h1 className="laureates-title">Lauréats Édition 1</h1>
            <p className="laureates-desc">
              Revivez les moments forts de notre toute première édition. Découvrez les artistes exceptionnels qui ont marqué l'histoire des IMA Awards.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <section className="section">
        <div className="container">
          {laureatesEdition1.length > 0 ? (
            <div className="laureates-grid">
              {laureatesEdition1.map((laureate) => (
                <div key={laureate.id} className="laureate-card">
                  <div className="laureate-photo-wrap">
                    {laureate.photo ? (
                      <img 
                        src={laureate.photo} 
                        alt={`Photo de ${laureate.name}`} 
                        className="laureate-photo"
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          e.target.nextSibling.style.display = 'flex'; 
                        }} 
                      />
                    ) : null}
                    {/* Placeholder en cas d'erreur de chargement ou d'absence d'image */}
                    <div 
                      className="laureate-photo-placeholder" 
                      style={{ display: laureate.photo ? 'none' : 'flex' }}
                    >
                      🏆
                    </div>
                  </div>
                  <div className="laureate-info">
                    <h3 className="laureate-category">{laureate.category}</h3>
                    <div className="laureate-name">{laureate.name}</div>
                    {laureate.description && (
                      <div className="laureate-desc">{laureate.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              Aucun lauréat enregistré pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import CategoryCard from '../../components/public/CategoryCard.jsx';
import { useVote } from '../../context/VoteContext.jsx';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { categories, loading } = useVote();

  return (
    <div className="categories-page">
      <div className="page-hero">
        <div className="page-hero-glow" />
        <div className="container">
          <div className="page-hero-content">
            <div className="section-tag">🏆 IMA Awards 2024–2025</div>
            <h1 className="page-hero-title">Toutes les catégories</h1>
            <p className="page-hero-desc">
              Choisissez une catégorie et votez pour votre artiste favori. <br />
              Les votes sont ouverts — faites entendre votre voix !
            </p>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              ⏳ Chargement des catégories...
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              Aucune catégorie disponible pour le moment.
            </div>
          ) : (
            <div className="categories-full-grid">
              {categories.map((cat, i) => (
                <CategoryCard key={cat.id || cat._id} category={cat} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

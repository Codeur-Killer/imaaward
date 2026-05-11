import React from 'react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero">
        <div className="page-hero-glow" />
        <div className="container">
          <div className="page-hero-content">
            <div className="section-tag"> Notre mission</div>
            <h1 className="page-hero-title">À propos des IMA Awards</h1>
            <p className="page-hero-desc">
              Les IMA Awards célèbrent les managers africains et francophone.
            </p>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-block">
              <div className="about-block-icon"></div>
              <h2 className="about-block-title">Notre Vision</h2>
              <p className="about-block-text">
                Les IMA Awards (International Music Africa Awards) sont nés d'une volonté de mettre en lumière
                les artistes africains et francophones qui font rayonner leur culture à travers le monde.
                Chaque année, nous célébrons ceux qui transcendent les frontières musicales.
              </p>
            </div>

            <div className="about-block">
              <div className="about-block-icon"></div>
              <h2 className="about-block-title">Le vote du public</h2>
              <p className="about-block-text">
                Contrairement à d'autres cérémonies, les IMA Awards accordent une place centrale au vote
                populaire. Chaque fan peut faire entendre sa voix, gratuitement ou en soutenant davantage
                son artiste via des votes supplémentaires. La musique appartient au peuple.
              </p>
            </div>

            <div className="about-block">
              <div className="about-block-icon"></div>
              <h2 className="about-block-title">Diversité & Inclusion</h2>
              <p className="about-block-text">
               Nos 16 catégories mettent en lumière l’excellence et la diversité des managers africains.  
Elles couvrent un spectre large : des figures les plus influentes aux révélations de l’année, en passant par les talents émergents et les pionniers qui façonnent l’avenir de l’industrie musicale.
              </p>
            </div>

            <div className="about-block">
              <div className="about-block-icon"></div>
              <h2 className="about-block-title">Paiements FedaPay</h2>
              <p className="about-block-text">
                Les votes supplémentaires sont traités via FedaPay, la plateforme de paiement africaine
                de référence. Carte bancaire, Mobile Money, Orange Money — tous les modes de paiement
                locaux sont acceptés en toute sécurité.
              </p>
            </div>
          </div>

          <div className="about-cta-section">
            <h3 className="about-cta-title">Prêt à voter ?</h3>
            <p className="about-cta-desc">Rejoignez des milliers de fans et soutenez vos managers favoris.</p>
            <a href="/categories" className="about-cta-btn">
              <span className="about-cta-shimmer" />
               Découvrir les catégories
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

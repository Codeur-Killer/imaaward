import React, { useRef } from 'react';
import './PartnersSection.css';
import { RiShakeHandsLine } from "react-icons/ri";
import { ImBullhorn } from "react-icons/im";



/* ── Mock partner data ── */
const PARTNER_LOGOS = [
  { id: 1, name: 'Orange Money',    logo: "logo.png", color: '#C9A84C', initials: 'OM' },
  
];

const PARTNER_POSTERS = [
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },
  { id: 1,  name: 'Grand Partenaire',    tag: 'Officiel',  color: '#C9A84C', emoji: 'fond.png' },

];

/* ── Infinite scroll track ── */
function LogoTrack({ items, direction = 'left', speed = 30 }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className={`logo-track-wrap logo-track-dir-${direction}`}>
      <div
        className="logo-track"
        style={{ '--track-speed': `${speed}s`, '--track-dir': direction === 'left' ? 'normal' : 'reverse' }}
      >
        {doubled.map((p, i) => (
          <div key={`${p.id}-${i}`} className="logo-card">
            <div className="logo-card-inner" style={{ '--partner-color': p.color }}>
              <span className="logo-card-name">
                <img src={p.logo} alt="" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Poster carousel ── */
function PosterCarousel({ items }) {
  const trackRef = useRef(null);
  const doubled = [...items, ...items];

  return (
    <div className="poster-track-wrap">
      <div className="poster-track" ref={trackRef}>
        {doubled.map((p, i) => (
          <div key={`${p.id}-${i}`} className="poster-card">
            {/* Poster mockup */}
            <div className="poster-card-visual" style={{ '--poster-color': p.color }}>
              <div className="poster-card-bg" />
              
                <div className="poster-card-emoji">
                  <img src={p.emoji}  alt="" />
                </div>
                <div className="poster-card-ima">IMA AWARDS 2026</div>
             
              <div className="poster-card-shine" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnersSection() {
  return (
    <section className="partners-section">
      <div className="partners-bg-glow" />

      {/* ── Section 1: Logo carousel ── */}
      <div className="partners-logos-block">
        <div className="container">
          <div className="partners-header">
            <div className="partners-tag"><RiShakeHandsLine /> Partenaires officiels</div>
            <h2 className="partners-title">Ils soutiennent les IMA Awards</h2>
            <p className="partners-desc">
              Nos partenaires s'engagent chaque année aux côtés des artistes africains et francophones.
            </p>
          </div>
        </div>

        {/* Infinite logo scroll — two rows, opposite directions */}
        <div className="logo-carousel-wrap">
          <div className="logo-carousel-fade logo-carousel-fade-left" />
          <div className="logo-carousel-fade logo-carousel-fade-right" />
          <div className="logo-rows">
            <LogoTrack items={PARTNER_LOGOS} direction="left"  speed={28} />
            <LogoTrack items={[...PARTNER_LOGOS].reverse()} direction="right" speed={35} />
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="partners-divider">
        <div className="container">
          <div className="partners-divider-line" />
        </div>
      </div>

      {/* ── Section 2: Poster carousel ── */}
      {/* <div className="partners-posters-block">
        <div className="container">
          <div className="partners-header">
            <div className="partners-tag"><ImBullhorn /> Affichage partenaires</div>
            <h2 className="partners-title">Nos partenaires à l'honneur</h2>
            <p className="partners-desc">
              Découvrez les affiches officielles de nos partenaires institutionnels et sponsors.
            </p>
          </div>
        </div>

        <div className="poster-carousel-wrap">
          <div className="poster-carousel-fade poster-carousel-fade-left" />
          <div className="poster-carousel-fade poster-carousel-fade-right" />
          <PosterCarousel items={PARTNER_POSTERS} />
        </div>
      </div> */}
    </section>
  );
}

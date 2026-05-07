// components/public/PaidVoteCelebration.jsx
// Animation de célébration pour vote payant réussi
// Personnage qui danse + message "Tu anidjè !" + confetti
import React, { useEffect, useRef, useState } from 'react';
import './PaidVoteCelebration.css';

// SVG personne qui danse — animation CSS
function DancingPerson() {
  return (
    <div className="dancer-wrap" aria-hidden="true">
      <svg className="dancer" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
        {/* Tête */}
        <circle cx="60" cy="28" r="20" fill="#F5C87B" className="dancer-head"/>
        {/* Yeux fermés / souriant */}
        <ellipse cx="52" cy="26" rx="3" ry="2" fill="#1a1a2e" className="dancer-eye-l"/>
        <ellipse cx="68" cy="26" rx="3" ry="2" fill="#1a1a2e" className="dancer-eye-r"/>
        <path d="M50 35 Q60 44 70 35" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Corps */}
        <rect x="45" y="50" width="30" height="45" rx="8" fill="#C9A84C" className="dancer-body"/>
        {/* Bras gauche */}
        <line x1="45" y1="60" x2="18" y2="40" stroke="#F5C87B" strokeWidth="8" strokeLinecap="round" className="dancer-arm-l"/>
        {/* Bras droit */}
        <line x1="75" y1="60" x2="102" y2="35" stroke="#F5C87B" strokeWidth="8" strokeLinecap="round" className="dancer-arm-r"/>
        {/* Jambe gauche */}
        <line x1="55" y1="95" x2="40" y2="145" stroke="#F5C87B" strokeWidth="9" strokeLinecap="round" className="dancer-leg-l"/>
        {/* Jambe droite */}
        <line x1="65" y1="95" x2="85" y2="140" stroke="#F5C87B" strokeWidth="9" strokeLinecap="round" className="dancer-leg-r"/>
        {/* Pied gauche */}
        <ellipse cx="36" cy="152" rx="12" ry="7" fill="#7C3AED" className="dancer-foot-l"/>
        {/* Pied droit */}
        <ellipse cx="89" cy="147" rx="12" ry="7" fill="#7C3AED" className="dancer-foot-r"/>
        {/* Chapeau */}
        <ellipse cx="60" cy="10" rx="28" ry="8" fill="#7C3AED"/>
        <rect x="50" y="2" width="20" height="12" rx="4" fill="#7C3AED"/>
        {/* Étoiles autour */}
        <text x="8"  y="60" fontSize="14" className="star star-1">⭐</text>
        <text x="95" y="55" fontSize="14" className="star star-2">✨</text>
        <text x="15" y="120" fontSize="12" className="star star-3">🎵</text>
        <text x="92" y="115" fontSize="12" className="star star-4">🎶</text>
      </svg>
    </div>
  );
}

// Confetti doré
function GoldConfetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#C9A84C','#E8C56A','#F5C87B','#7C3AED','#10B981','#fff','#F59E0B'][i % 7],
    left:  `${Math.random() * 100}%`,
    delay: `${(Math.random() * 1.2).toFixed(2)}s`,
    size:  `${5 + Math.floor(Math.random() * 9)}px`,
    round: i % 2 === 0,
    duration: `${2 + Math.random() * 1.5}s`,
  }));
  return (
    <div className="celeb-confetti" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} className="celeb-confetti-piece"
          style={{
            left: p.left, width: p.size, height: p.size,
            background: p.color, animationDelay: p.delay,
            animationDuration: p.duration,
            borderRadius: p.round ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function PaidVoteCelebration({ isOpen, onClose, artistName, voteCount }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // Synthèse vocale "Tu anidjè !"
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance('Tu anidjè !');
      utt.lang  = 'fr-FR';
      utt.rate  = 0.85;
      utt.pitch = 1.3;
      utt.volume = 1;
      // Essayer une voix africaine/française
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr')) || voices[0];
      if (frVoice) utt.voice = frVoice;
      // Attendre un court délai pour l'animation
      setTimeout(() => window.speechSynthesis.speak(utt), 600);
    }
    // Auto-fermeture après 5 secondes
    const timer = setTimeout(onClose, 5000);
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="celeb-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Célébration">
      <div className="celeb-box" onClick={e => e.stopPropagation()}>
        <GoldConfetti />

        {/* Titre en haut */}
        <div className="celeb-badge">🎉 PAIEMENT VALIDÉ</div>

        {/* Texte principal */}
        <div className="celeb-text-main">
          <span className="celeb-tu">Tu </span>
          <span className="celeb-anidge">anidjè</span>
          <span className="celeb-excl"> !</span>
        </div>

        {/* Personnage qui danse */}
        <DancingPerson />

        {/* Infos du vote */}
        <div className="celeb-info">
          <span className="celeb-votes-num">{voteCount}</span>
          <span className="celeb-votes-lbl">vote{voteCount > 1 ? 's' : ''} pour</span>
          <span className="celeb-artist">{artistName}</span>
        </div>

        <p className="celeb-subtitle">
          Merci pour votre soutien ! Vos votes ont bien été comptabilisés. 🌍🎵
        </p>

        <button className="celeb-close-btn" onClick={onClose}>
          Continuer
        </button>
      </div>
    </div>
  );
}

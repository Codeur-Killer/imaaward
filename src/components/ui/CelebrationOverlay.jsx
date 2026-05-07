// components/ui/CelebrationOverlay.jsx
// Animation de célébration après un vote payant réussi
// Personnage qui danse + confetti + voix "Tu anidjè !"
import React, { useEffect, useRef, useState } from 'react';
import './CelebrationOverlay.css';

// Confetti coloré festif
function Confetti({ count = 60 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id:    i,
    color: ['#C9A84C','#E8C56A','#7C3AED','#10B981','#F59E0B','#EF4444','#3B82F6','#EC4899','#fff'][i % 9],
    left:  `${(i / count) * 100}%`,
    delay: `${(i * 0.05).toFixed(2)}s`,
    size:  `${7 + (i % 7)}px`,
    shape: i % 4, // 0=carré, 1=rond, 2=rectangle, 3=étoile
    duration: `${2 + (i % 3) * 0.5}s`,
  }));
  return (
    <div className="cel-confetti" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} className={`cel-piece cel-piece-${p.shape}`}
          style={{
            left: p.left, width: p.size, height: p.shape === 2 ? `calc(${p.size} * 0.4)` : p.size,
            background: p.color, animationDelay: p.delay, animationDuration: p.duration,
            borderRadius: p.shape === 1 ? '50%' : p.shape === 0 ? '2px' : '1px',
          }} />
      ))}
    </div>
  );
}

// SVG d'un personnage qui saute de joie (dessin vectoriel animé)
function DancingPerson() {
  return (
    <div className="cel-person" aria-hidden="true">
      <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" className="cel-svg">
        {/* Tête */}
        <circle cx="60" cy="32" r="22" fill="#FBBF24" stroke="#D97706" strokeWidth="2"/>
        {/* Visage souriant */}
        <circle cx="52" cy="28" r="3" fill="#92400E"/>
        <circle cx="68" cy="28" r="3" fill="#92400E"/>
        <path d="M50 37 Q60 47 70 37" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Corps */}
        <rect x="42" y="58" width="36" height="48" rx="8" fill="#7C3AED"/>
        {/* Bras gauche levé */}
        <line x1="42" y1="68" x2="18" y2="38" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round" className="cel-arm-left"/>
        {/* Bras droit levé */}
        <line x1="78" y1="68" x2="102" y2="38" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round" className="cel-arm-right"/>
        {/* Mains */}
        <circle cx="15" cy="35" r="8" fill="#FBBF24" className="cel-arm-left"/>
        <circle cx="105" cy="35" r="8" fill="#FBBF24" className="cel-arm-right"/>
        {/* Jambe gauche */}
        <line x1="54" y1="106" x2="38" y2="148" stroke="#1E40AF" strokeWidth="12" strokeLinecap="round" className="cel-leg-left"/>
        {/* Jambe droite */}
        <line x1="66" y1="106" x2="82" y2="148" stroke="#1E40AF" strokeWidth="12" strokeLinecap="round" className="cel-leg-right"/>
        {/* Pieds */}
        <ellipse cx="33" cy="152" rx="14" ry="7" fill="#1E40AF" className="cel-leg-left"/>
        <ellipse cx="87" cy="152" rx="14" ry="7" fill="#1E40AF" className="cel-leg-right"/>
        {/* Étoiles autour */}
        <text x="8"  y="20"  fontSize="18" className="cel-star cel-star-1">⭐</text>
        <text x="92" y="20"  fontSize="16" className="cel-star cel-star-2">🌟</text>
        <text x="0"  y="100" fontSize="14" className="cel-star cel-star-3">✨</text>
        <text x="100" y="95" fontSize="14" className="cel-star cel-star-4">✨</text>
        <text x="45" y="0"   fontSize="20" className="cel-star cel-star-5">🎉</text>
      </svg>
    </div>
  );
}

export default function CelebrationOverlay({ show, artistName, voteCount, onClose }) {
  const audioRef = useRef(null);
  const [phase, setPhase] = useState('enter'); // enter | main | exit

  useEffect(() => {
    if (!show) { setPhase('enter'); return; }

    setPhase('enter');
    const t1 = setTimeout(() => setPhase('main'), 200);

    // Synthèse vocale : "Tu anidjè !"
    const speak = () => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance('Tu anidjè ! Félicitations !');
      utter.lang  = 'fr-FR';
      utter.pitch = 1.3;
      utter.rate  = 0.9;
      utter.volume = 1;
      // Essayer d'abord une voix française
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frVoice) utter.voice = frVoice;
      window.speechSynthesis.speak(utter);
    };

    const t2 = setTimeout(speak, 600);

    // Fermer automatiquement après 4.5s
    const t3 = setTimeout(() => {
      setPhase('exit');
      const t4 = setTimeout(onClose, 500);
      return () => clearTimeout(t4);
    }, 4500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); window.speechSynthesis?.cancel(); };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`cel-overlay cel-${phase}`} onClick={onClose} role="dialog" aria-label="Célébration">
      <div className="cel-box" onClick={e => e.stopPropagation()}>
        <Confetti count={70} />

        <DancingPerson />

        {/* Bulle "Tu anidjè !" */}
        <div className="cel-bubble">
          <span className="cel-bubble-text">Tu anidjè !</span>
          <span className="cel-bubble-emoji">🎊</span>
        </div>

        {/* Infos du vote */}
        <div className="cel-info">
          <div className="cel-info-votes">
            <span className="cel-info-num">{voteCount}</span>
            <span className="cel-info-label">vote{voteCount > 1 ? 's' : ''} payant{voteCount > 1 ? 's' : ''}</span>
          </div>
          <p className="cel-info-text">
            Votre soutien pour <strong>{artistName}</strong> a été enregistré !
          </p>
        </div>

        {/* Badge score */}
        <div className="cel-score-badge">
          <span>💎</span> Vote payant · 60% du score
        </div>

        <button className="cel-close-btn" onClick={onClose}>
          Continuer
        </button>
      </div>
    </div>
  );
}

// VoteModal.jsx — Portal React pour sortir du stacking context
// Vote gratuit 1x | Vote payant illimité via FedaPay
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVote } from '../../context/VoteContext.jsx';
import './VoteModal.css';

/* ── Confetti ─────────────────────────────────────────────────────── */
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#C9A84C','#E8C56A','#7C3AED','#10B981','#F59E0B','#fff','#F472B6'][i % 7],
    left: `${(i / 30) * 100}%`,
    delay: `${(i * 0.07).toFixed(2)}s`,
    size: `${5 + (i % 6)}px`,
    round: i % 3 !== 0,
  }));
  return (
    <div className="vm-confetti" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} className="vm-confetti-piece" style={{
          left: p.left, width: p.size, height: p.size,
          background: p.color, animationDelay: p.delay,
          borderRadius: p.round ? '50%' : '2px',
        }} />
      ))}
    </div>
  );
}

const PRICE = 200;
const QUICK = [1, 5, 10, 20, 50];

/* ── Composant interne du modal ────────────────────────────────────── */
function ModalContent({ artist, category, onClose }) {
  const { castVote, initPaidVote, hasVoted } = useVote();

  const [tab,   setTab]   = useState('free');
  const [step,  setStep]  = useState('select');
  const [err,   setErr]   = useState('');
  const [qty,   setQty]   = useState(5);
  const [email, setEmail] = useState('');
  const [name,  setName]  = useState('');
  const [url,   setUrl]   = useState('');
  const [ref,   setRef]   = useState('');

  const aid       = String(artist.id || artist._id);
  const freeUsed  = hasVoted(aid);
  const total     = qty * PRICE;

  // Ouvre sur l'onglet payant si gratuit déjà utilisé
  useEffect(() => {
    setTab(freeUsed ? 'paid' : 'free');
    setStep('select');
    setErr(''); setEmail(''); setName('');
    setQty(5); setUrl(''); setRef('');
  }, [aid, freeUsed]);

  // Escape key
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  /* Vote gratuit */
  const doFreeVote = async () => {
    setStep('loading'); setErr('');
    const r = await castVote(aid);
    if (r.alreadyVoted) { setStep('already'); return; }
    if (r.success)      { setStep('ok-free'); return; }
    setErr(r.message || 'Erreur.'); setStep('select');
  };

  /* Init paiement FedaPay */
  const doPaidInit = async () => {
    if (email && !/\S+@\S+\.\S+/.test(email)) { setErr('Email invalide.'); return; }
    setStep('loading'); setErr('');
    const finalEmail = email || 'anonyme@example.com';
    const finalName = name.trim() || 'Anonyme';
    const r = await initPaidVote(aid, qty, finalEmail, finalName);
    if (!r.success) { setErr(r.message || 'Erreur paiement.'); setStep('select'); return; }
    setUrl(r.data.checkoutUrl);
    setRef(r.data.transactionRef);
    setStep('ready');
  };

  /* Ouvrir FedaPay dans le même onglet → redirect automatique vers /paiement-succes */
  const goFedaPay = () => { if (url) window.location.href = url; };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="vm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="vm-box" role="dialog" aria-modal="true" aria-label="Modal de vote">

        {/* Fermer */}
        <button className="vm-close" onClick={onClose} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ─ Header ─ */}
        <div className="vm-header">
          <span className="vm-hicon">
            {step==='ok-free'?'🎉':step==='already'?'✅':step==='ready'?'':''}
          </span>
          <div className="vm-htxt">
            <div className="vm-htitle">
              {step==='ok-free' ? 'Vote enregistré !'
               : step==='already' ? 'Vote gratuit utilisé'
               : step==='ready'   ? 'Prêt à payer'
               : 'Voter pour cet manager'}
            </div>
            <div className="vm-hcat">{category?.name}</div>
          </div>
        </div>

        {/* ─ Artiste ─ */}
        <div className="vm-artist">
          <div className="vm-aphoto">
            <img src={artist.photo} alt={artist.name}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            <div className="vm-aphoto-fb">{artist.name?.charAt(0)}</div>
          </div>
          <div className="vm-ainfo">
            <div className="vm-aname">{artist.name}</div>
            <div className="vm-agenre">{artist.genre}</div>
            {/* <div className="vm-anat">{artist.nationality}</div> */}
          </div>
          <div className="vm-avotes">
            <span className="vm-avnum">{(artist.votes||0).toLocaleString('fr-FR')}</span>
            <span className="vm-avlbl">votes</span>
          </div>
        </div>

        {/* ═══════════ SELECT ═══════════ */}
        {step === 'select' && (
          <div className="vm-body">

            {/* Tabs */}
            <div className="vm-tabs">
              <button
                className={`vm-tab ${tab==='free'?'active':''}`}
                onClick={() => setTab('free')}
                disabled={freeUsed}
              >
                 Gratuit
                {freeUsed && <span className="vm-used-badge"></span>}
              </button>
              <button
                className={`vm-tab ${tab==='paid'?'active':''}`}
                onClick={() => { setTab('paid'); setErr(''); }}
              >
                 Payant <span className="vm-inf">∞</span>
              </button>
            </div>

            {/* ── Onglet GRATUIT disponible ── */}
            {tab === 'free' && !freeUsed && (
              <>
                <div className="vm-free-box">
                  <div className="vm-free-emoji"></div>
                  <div className="vm-free-title">1 vote gratuit disponible</div>
                  <div className="vm-free-sub">
                    1 seul vote gratuit par artiste — permanent, sans inscription.
                  </div>
                  <div className="vm-free-pill"> Gratuit ·  Anti-double ·  1 fois</div>
                </div>
                {err && <div className="vm-err">{err}</div>}
                <button className="vm-btn-gold" onClick={doFreeVote}>
                  <span className="vm-shimmer" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                  Voter gratuitement pour {artist.name}
                </button>
                <div className="vm-or"><span>ou voter davantage avec FedaPay</span></div>
                <button className="vm-link" onClick={() => setTab('paid')}>
                   Votes illimités →
                </button>
              </>
            )}

            {/* ── Onglet GRATUIT déjà utilisé ── */}
            {tab === 'free' && freeUsed && (
              <>
                <div className="vm-info-box vm-info-green">
                  <span>✅</span>
                  <span>Vous avez déjà voté gratuitement pour <strong>{artist.name}</strong>.</span>
                </div>
                <button className="vm-btn-purple" onClick={() => setTab('paid')}>
                  <span className="vm-shimmer" />
                   Voter encore — illimité avec FedaPay
                </button>
              </>
            )}

            {/* ── Onglet PAYANT ── */}
            {tab === 'paid' && (
              <>
                <div className="vm-info-box vm-info-purple">
                  <span>♾️</span>
                  <span><strong>Illimité</strong> — Votez autant de fois que vous voulez</span>
                </div>

                {/* Compteur */}
                <div className="vm-count-label">Nombre de votes</div>
                <div className="vm-counter">
                  <button className="vm-cbtn" onClick={() => setQty(v => Math.max(1,v-1))}>−</button>
                  <div className="vm-cnum">
                    <span className="vm-cval">{qty}</span>
                    <span className="vm-csub">vote{qty>1?'s':''}</span>
                  </div>
                  <button className="vm-cbtn" onClick={() => setQty(v => Math.min(999,v+1))}>+</button>
                </div>
                <div className="vm-quick">
                  {QUICK.map(n => (
                    <button key={n} className={`vm-qbtn ${qty===n?'active':''}`}
                      onClick={() => setQty(n)}>{n}</button>
                  ))}
                </div>

                {/* Prix */}
                <div className="vm-price-box">
                  <div className="vm-prow">
                    <span>Prix unitaire</span><span>{PRICE} XOF / vote</span>
                  </div>
                  <div className="vm-prow vm-ptotal">
                    <span>Total</span>
                    <strong>{total.toLocaleString('fr-FR')} XOF</strong>
                  </div>
                </div>

                {/* Formulaire */}
                <div className="vm-field">
                  <label className="vm-label" htmlFor="vmnm">Votre nom complet (optionnel)</label>
                  <input id="vmnm" className="vm-input" type="text"
                    placeholder="Prénom Nom" value={name}
                    onChange={e => { setName(e.target.value); setErr(''); }} />
                </div>
                <div className="vm-field">
                  <label className="vm-label" htmlFor="vmem">Email (optionnel, pour le reçu)</label>
                  <input id="vmem" className="vm-input" type="email"
                    placeholder="votre@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setErr(''); }} />
                </div>

                {err && <div className="vm-err">{err}</div>}

                <button className="vm-btn-purple" onClick={doPaidInit}>
                  <span className="vm-shimmer" />
                   Payer {total.toLocaleString('fr-FR')} XOF · {qty} vote{qty>1?'s':''}
                </button>

                {/* Moyens de paiement */}
                {/* <div className="vm-methods">
                  <div className="vm-methods-title">Moyens de paiement acceptés</div>
                  <div className="vm-methods-list">
                    <span>📱 Mobile Money</span>
                    <span>🟠 Orange Money</span>
                    <span>💳 Carte bancaire</span>
                    <span>🏦 MTN · Moov</span>
                  </div>
                </div> */}
              </>
            )}
          </div>
        )}

        {/* ═══════════ LOADING ═══════════ */}
        {step === 'loading' && (
          <div className="vm-body vm-center">
            <div className="vm-spinner" />
            <p className="vm-spin-txt">
              {tab==='free' ? 'Enregistrement du vote...' : 'Connexion à FedaPay...'}
            </p>
          </div>
        )}

        {/* ═══════════ SUCCÈS GRATUIT ═══════════ */}
        {step === 'ok-free' && (
          <div className="vm-success">
            <Confetti />
            <div className="vm-ok-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="vm-ok-title">Vote enregistré !</div>
            <p className="vm-ok-msg">
              Votre vote gratuit pour <strong>{artist.name}</strong> a bien été comptabilisé. 🎵
            </p>
            <div className="vm-ok-stats">
              <div className="vm-stat">
                <span className="vm-stat-n">{((artist.votes||0)+1).toLocaleString('fr-FR')}</span>
                <span className="vm-stat-l">votes</span>
              </div>
              <div className="vm-stat">
                <span className="vm-stat-n">🆓</span>
                <span className="vm-stat-l">1 fois</span>
              </div>
            </div>
            <button className="vm-btn-green" onClick={onClose}>Continuer</button>
            <button className="vm-link" onClick={() => { setStep('select'); setTab('paid'); }}>
              💳 Voter encore avec FedaPay →
            </button>
          </div>
        )}

        {/* ═══════════ DÉJÀ VOTÉ ═══════════ */}
        {step === 'already' && (
          <div className="vm-body vm-center">
            <span style={{fontSize:42}}>✅</span>
            <div className="vm-ok-title">Vote gratuit déjà utilisé</div>
            <p className="vm-ok-msg">
              Vous avez déjà voté gratuitement pour <strong>{artist.name}</strong>.
            </p>
            <button className="vm-btn-purple" onClick={() => { setStep('select'); setTab('paid'); }}>
              <span className="vm-shimmer" />
              💳 Voter davantage avec FedaPay
            </button>
            <button className="vm-btn-green" style={{marginTop:8}} onClick={onClose}>Fermer</button>
          </div>
        )}

        {/* ═══════════ PRÊT À PAYER ═══════════ */}
        {step === 'ready' && (
          <div className="vm-body">
            <div style={{textAlign:'center',fontSize:38,lineHeight:1,margin:'4px 0'}}></div>
            <div className="vm-ok-title" style={{textAlign:'center'}}>Tout est prêt !</div>

            {/* Récap */}
            <div className="vm-recap">
              <div className="vm-recap-row">
                <span> Manager</span><strong>{artist.name}</strong>
              </div>
              <div className="vm-recap-row">
                <span> Votes</span>
                <strong>{qty} vote{qty>1?'s':''}</strong>
              </div>
              <div className="vm-recap-row">
                <span> Montant</span>
                <strong className="vm-recap-price">{total.toLocaleString('fr-FR')} XOF</strong>
              </div>
              <div className="vm-recap-row">
                <span> Email</span>
                <span className="vm-recap-email">{email}</span>
              </div>
            </div>

            <div className="vm-ref">Réf : <code>{ref}</code></div>

            {/* Bouton principal — ouvre FedaPay dans le même onglet */}
            <button className="vm-btn-purple vm-btn-lg" onClick={goFedaPay}>
              <span className="vm-shimmer" />
              🔗 Ouvrir FedaPay et payer maintenant
            </button>

            {/* <div className="vm-methods">
              <div className="vm-methods-title">Moyens de paiement disponibles</div>
              <div className="vm-methods-list">
                <span>📱 Mobile Money</span>
                <span>🟠 Orange Money</span>
                <span>💳 Carte bancaire</span>
                <span>🏦 MTN · Moov</span>
              </div>
            </div> */}

            {/* <p className="vm-note">
              Après paiement, vous serez redirigé automatiquement. 🎉
            </p>
            <button className="vm-link" onClick={() => setStep('select')}>
              ← Modifier ma commande
            </button> */}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Export principal — utilise un portail React ───────────────────── */
export default function VoteModal({ artist, category, isOpen, onClose }) {
  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !artist) return null;

  // ✅ Portail : le modal est rendu dans #modal-root, HORS du main
  // → Échappe au transform/stacking context du PageTransition
  const portalTarget = document.getElementById('modal-root') || document.body;

  return createPortal(
    <ModalContent artist={artist} category={category} onClose={onClose} />,
    portalTarget
  );
}

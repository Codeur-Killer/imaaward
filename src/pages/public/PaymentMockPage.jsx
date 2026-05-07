// PaymentMockPage.jsx
// Page de simulation de paiement FedaPay (mode développement/sandbox)
// Reproduit l'interface de paiement FedaPay avec Mobile Money + Carte bancaire
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentMockPage.css';

export default function PaymentMockPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const [method,  setMethod]  = useState('mobile');
  const [phone,   setPhone]   = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvv,     setCvv]     = useState('');
  const [step,    setStep]    = useState('form'); // form | processing | done
  const [error,   setError]   = useState('');

  const ref      = params.get('ref')      || '';
  const artistId = params.get('artistId') || '';
  const votes    = parseInt(params.get('votes') || '1');
  const amount   = parseInt(params.get('amount') || String(votes * 200));

  // Simuler le traitement
  const handlePay = () => {
    if (method === 'mobile' && !phone.trim()) { setError('Entrez votre numéro de téléphone.'); return; }
    if (method === 'card') {
      if (!cardNum.replace(/\s/g,'').match(/^\d{16}$/)) { setError('Numéro de carte invalide.'); return; }
      if (!expiry.match(/^\d{2}\/\d{2}$/))               { setError('Date d\'expiration invalide (MM/AA).'); return; }
      if (!cvv.match(/^\d{3,4}$/))                       { setError('CVV invalide.'); return; }
    }
    setError('');
    setStep('processing');
    // Après 2s → confirmer via le backend mock-redirect puis rediriger
    setTimeout(async () => {
      try {
        const backendUrl = `http://localhost:5000/api/votes/fedapay/mock-redirect?ref=${ref}`;
        // Appel backend pour confirmer le paiement
        const res = await fetch(backendUrl, { redirect: 'follow' });
        // Le backend redirige vers /paiement-succes — on suit manuellement
        if (res.url && res.url.includes('/paiement-succes')) {
          window.location.href = res.url;
        } else {
          // Fallback : naviguer directement
          window.location.href = `/paiement-succes?ref=${ref}&artistId=${artistId}&votes=${votes}`;
        }
      } catch {
        window.location.href = `/paiement-succes?ref=${ref}&artistId=${artistId}&votes=${votes}`;
      }
    }, 2000);
  };

  const formatCard = (val) => {
    const clean = val.replace(/\D/g,'').slice(0,16);
    return clean.replace(/(.{4})/g,'$1 ').trim();
  };
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g,'').slice(0,4);
    return clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean;
  };

  return (
    <div className="mock-page">
      <div className="mock-card">

        {/* Header FedaPay style */}
        <div className="mock-header">
          <div className="mock-logo">
            <span className="mock-logo-icon">💳</span>
            <span className="mock-logo-txt">FedaPay</span>
            <span className="mock-sandbox-badge">SANDBOX</span>
          </div>
          <div className="mock-amount-box">
            <span className="mock-amount-num">{amount.toLocaleString('fr-FR')}</span>
            <span className="mock-amount-cur">XOF</span>
          </div>
          <p className="mock-desc">{votes} vote{votes>1?'s':''} — IMA Awards</p>
          <div className="mock-ref">Réf : <code>{ref}</code></div>
        </div>

        {step === 'form' && (
          <>
            {/* Sélection méthode */}
            <div className="mock-methods">
              <button
                className={`mock-method-btn ${method==='mobile'?'active':''}`}
                onClick={() => { setMethod('mobile'); setError(''); }}
              >
                <span className="mock-method-icon">📱</span>
                <div>
                  <div className="mock-method-title">Mobile Money</div>
                  <div className="mock-method-sub">MTN · Moov · Orange · Wave</div>
                </div>
              </button>
              <button
                className={`mock-method-btn ${method==='card'?'active':''}`}
                onClick={() => { setMethod('card'); setError(''); }}
              >
                <span className="mock-method-icon">💳</span>
                <div>
                  <div className="mock-method-title">Carte bancaire</div>
                  <div className="mock-method-sub">Visa · Mastercard</div>
                </div>
              </button>
            </div>

            {/* Formulaire Mobile Money */}
            {method === 'mobile' && (
              <div className="mock-form">
                <div className="mock-operator-grid">
                  {['MTN Mobile Money','Moov Money','Orange Money','Wave'].map(op => (
                    <button key={op} className="mock-op-btn" type="button">{op}</button>
                  ))}
                </div>
                <div className="mock-field">
                  <label className="mock-label">Numéro de téléphone</label>
                  <div className="mock-phone-wrap">
                    <span className="mock-country">🇧🇯 +229</span>
                    <input
                      className="mock-input"
                      type="tel"
                      placeholder="XX XX XX XX"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setError(''); }}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="mock-info-box">
                  📲 Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
                </div>
              </div>
            )}

            {/* Formulaire Carte bancaire */}
            {method === 'card' && (
              <div className="mock-form">
                <div className="mock-field">
                  <label className="mock-label">Numéro de carte</label>
                  <input
                    className="mock-input mock-card-input"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNum}
                    onChange={e => { setCardNum(formatCard(e.target.value)); setError(''); }}
                    maxLength={19}
                  />
                </div>
                <div className="mock-row-2">
                  <div className="mock-field">
                    <label className="mock-label">Date d'expiration</label>
                    <input
                      className="mock-input"
                      type="text"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={e => { setExpiry(formatExpiry(e.target.value)); setError(''); }}
                      maxLength={5}
                    />
                  </div>
                  <div className="mock-field">
                    <label className="mock-label">CVV</label>
                    <input
                      className="mock-input"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={e => { setCvv(e.target.value.replace(/\D/g,'').slice(0,4)); setError(''); }}
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="mock-card-logos">
                  <span>VISA</span><span>Mastercard</span>
                </div>
              </div>
            )}

            {error && <div className="mock-error">{error}</div>}

            <button className="mock-pay-btn" onClick={handlePay}>
              <span className="mock-pay-shimmer"/>
              Payer {amount.toLocaleString('fr-FR')} XOF
            </button>

            <button className="mock-cancel-btn" onClick={() => navigate(-1)}>
              Annuler
            </button>

            <div className="mock-secure">
              🔒 Paiement sécurisé · Mode sandbox FedaPay
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="mock-processing">
            <div className="mock-spinner"/>
            <div className="mock-proc-title">Traitement en cours...</div>
            <p className="mock-proc-sub">
              {method === 'mobile'
                ? 'Vérifiez votre téléphone et confirmez le paiement.'
                : 'Validation de votre carte bancaire...'}
            </p>
            <div className="mock-proc-dots">
              <span/><span/><span/>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

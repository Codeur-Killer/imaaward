// pages/public/PaymentErrorPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentErrorPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get('ref');

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-primary)', padding:24
    }}>
      <div style={{
        textAlign:'center', maxWidth:420,
        background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:40
      }}>
        <div style={{fontSize:60, marginBottom:16}}>😕</div>
        <h1 style={{fontFamily:'var(--font-display)', fontSize:26, color:'var(--text-primary)', marginBottom:10}}>
          Paiement non abouti
        </h1>
        <p style={{color:'var(--text-secondary)', fontSize:15, lineHeight:1.7, marginBottom:24}}>
          Votre paiement n'a pas pu être validé. Vous pouvez réessayer ou choisir un autre moyen de paiement.
          {ref && <><br/><span style={{fontSize:12, color:'var(--text-muted)'}}>Réf : {ref}</span></>}
        </p>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={() => navigate(-1)}
            style={{
              padding:'12px 24px', borderRadius:99, border:'1px solid var(--border)',
              background:'transparent', color:'var(--text-secondary)', cursor:'pointer',
              fontFamily:'var(--font-body)', fontSize:14, fontWeight:600
            }}>
            ← Retour
          </button>
          <button onClick={() => navigate('/categories')}
            style={{
              padding:'12px 24px', borderRadius:99, border:'none',
              background:'linear-gradient(135deg,var(--accent-gold-dark),var(--accent-gold))',
              color:'#080808', cursor:'pointer',
              fontFamily:'var(--font-body)', fontSize:14, fontWeight:700
            }}>
            Réessayer →
          </button>
        </div>
      </div>
    </div>
  );
}

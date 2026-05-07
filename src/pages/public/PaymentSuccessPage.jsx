// pages/public/PaymentSuccessPage.jsx
// Page vers laquelle FedaPay redirige après paiement validé
// Affiche automatiquement l'animation "Tu anidjè !"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { votesAPI } from '../../services/api.js';
import PaidVoteCelebration from '../../components/public/PaidVoteCelebration.jsx';

export default function PaymentSuccessPage() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const [info, setInfo]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCeleb, setShowCeleb] = useState(false);

  const ref       = params.get('ref');
  const artistId  = params.get('artistId');
  const votes     = parseInt(params.get('votes') || '1');

  useEffect(() => {
    const verify = async () => {
      try {
        if (ref) {
          const res = await votesAPI.verifyPayment(ref);
          if (res.success && res.data.status === 'approved') {
            setInfo(res.data);
          }
        }
      } catch {}
      finally {
        setLoading(false);
        // Afficher la célébration dans tous les cas (le paiement a réussi)
        setTimeout(() => setShowCeleb(true), 300);
      }
    };
    verify();
  }, [ref]);

  const handleCelebClose = () => {
    setShowCeleb(false);
    // Retourner vers les résultats ou la catégorie
    navigate('/resultats');
  };

  if (loading) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'var(--bg-primary)', flexDirection:'column', gap:16
      }}>
        <div style={{
          width:48, height:48, border:'3px solid rgba(201,168,76,.2)',
          borderTopColor:'var(--accent-gold)', borderRadius:'50%', animation:'spin .8s linear infinite'
        }}/>
        <p style={{color:'var(--text-secondary)', fontSize:16}}>Validation du paiement...</p>
      </div>
    );
  }

  return (
    <>
      {/* Page de fond */}
      <div style={{
        minHeight:'100vh', background:'var(--bg-primary)',
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <div style={{textAlign:'center', padding:32}}>
          <div style={{fontSize:64, marginBottom:16}}>🎉</div>
          <h1 style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--accent-gold)', marginBottom:8}}>
            Paiement validé !
          </h1>
          <p style={{color:'var(--text-secondary)', fontSize:16}}>
            {info ? `${info.voteCount} vote(s) pour ${info.artistName}` : `${votes} vote(s) enregistré(s)`}
          </p>
        </div>
      </div>

      {/* Célébration par-dessus */}
      {showCeleb && (
        <PaidVoteCelebration
          isOpen={showCeleb}
          artistName={info?.artistName || 'votre artiste'}
          voteCount={info?.voteCount || votes}
          onClose={handleCelebClose}
        />
      )}
    </>
  );
}

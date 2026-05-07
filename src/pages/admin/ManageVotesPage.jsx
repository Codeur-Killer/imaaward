// pages/admin/ManageVotesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useVote } from '../../context/VoteContext.jsx';
import { votesAPI } from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import './ManagePage.css';

const PAGE_SIZE = 15;

export default function ManageVotesPage() {
  const { categories } = useVote();
  const [votes,      setVotes]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchVotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await votesAPI.getHistory({ page, limit: PAGE_SIZE, type: typeFilter || undefined });
      setVotes(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error('Erreur chargement votes :', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  // Écouter les nouveaux votes en temps réel
  useEffect(() => {
    const socket = getSocket();
    socket.on('admin:vote-update', () => {
      if (page === 1) fetchVotes(); // Rafraîchir la première page
    });
    return () => socket.off('admin:vote-update');
  }, [fetchVotes, page]);

  const filtered = votes.filter(v =>
    !search || v.artistName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const freeVotes   = votes.filter(v => v.type === 'gratuit').length;
  const paidVotes   = votes.filter(v => v.type === 'payant').length;
  const totalRevenue = votes.filter(v => v.type === 'payant').reduce((s, v) => s + (v.amount || 0), 0);

  return (
    <div className="manage-page">
      <div className="manage-topbar">
        <div>
          <h1 className="manage-title">Gestion des votes</h1>
          <p className="manage-subtitle">{total} votes enregistrés · {totalRevenue.toLocaleString('fr-FR')} FCFA de revenus</p>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'10px 16px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-accent)', fontSize:22, color:'var(--success)' }}>{freeVotes}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase' }}>Gratuits</div>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'10px 16px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-accent)', fontSize:22, color:'var(--accent-gold-light)' }}>{paidVotes}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase' }}>Payants</div>
          </div>
        </div>
      </div>

      <div className="manage-content">
        <div className="manage-filters">
          <div className="manage-search-wrap" style={{ flex:1 }}>
            <span className="manage-search-icon"></span>
            <input type="text" className="form-input manage-search" placeholder="Rechercher par artiste..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ minWidth:140 }} value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">Tous les types</option>
            <option value="gratuit">Gratuit</option>
            <option value="payant">Payant</option>
          </select>
          <button onClick={fetchVotes} style={{ padding:'10px 16px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13 }}>
             Rafraîchir
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Artiste</th><th>Catégorie</th><th>Votes</th><th>Type</th><th>Montant</th><th>Date & Heure</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-secondary)' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state">Aucun vote trouvé</div></td></tr>
              ) : filtered.map((vote, i) => (
                <tr key={vote.id || i}>
                  <td style={{ color:'var(--text-muted)', fontSize:12 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ fontWeight:600 }}>{vote.artistName}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{(vote.categoryName || '').split(' ').slice(0,3).join(' ')}...</td>
                  <td><span className="badge badge-gold">{vote.votes}</span></td>
                  <td>
                    <span className={`badge ${vote.type === 'payant' ? 'badge-purple' : 'badge-success'}`}>
                      {vote.type === 'payant' ? ' Payant' : ' Gratuit'}
                    </span>
                  </td>
                  <td style={{ color: vote.amount ? 'var(--accent-gold)' : 'var(--text-muted)', fontSize: vote.amount ? 16 : 14 }}>
                    {vote.amount ? `${vote.amount.toLocaleString('fr-FR')} F` : '—'}
                  </td>
                  <td style={{ color:'var(--text-secondary)', fontSize:12 }}>
                    {new Date(vote.timestamp).toLocaleDateString('fr-FR')} {new Date(vote.timestamp).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding:'8px 16px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', opacity: page===1 ? 0.5 : 1 }}>← Précédent</button>
            <span style={{ padding:'8px 16px', color:'var(--text-secondary)', fontSize:14 }}>Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding:'8px 16px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', opacity: page===totalPages ? 0.5 : 1 }}>Suivant →</button>
          </div>
        )}
      </div>
    </div>
  );
}

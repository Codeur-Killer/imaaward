// pages/admin/ManageCategoriesPage.jsx
import React, { useState } from 'react';
import { useVote } from '../../context/VoteContext.jsx';
import { categoriesAPI } from '../../services/api.js';
import './ManagePage.css';

const EMPTY_CAT = { name: '', description: '', icon: '🎵', color: '#C9A84C', status: 'open' };
const ICONS = ['🎤', '👑', '⭐', '💿', '🎬', '🎵', '🏆', '🎶', '🌍', '🔥'];

export default function ManageCategoriesPage() {
  const { categories, getArtistsByCategory, getTotalVotesForCategory, dispatch, refreshData } = useVote();
  const [modal,     setModal]     = useState({ open: false, mode: 'add', cat: null });
  const [form,      setForm]      = useState(EMPTY_CAT);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  const openAdd  = () => { setForm(EMPTY_CAT); setSaveError(''); setModal({ open: true, mode: 'add', cat: null }); };
  const openEdit = (cat) => { setForm({ ...cat }); setSaveError(''); setModal({ open: true, mode: 'edit', cat }); };
  const closeModal = () => setModal({ open: false, mode: 'add', cat: null });

  const handleSave = async () => {
    if (!form.name) { setSaveError('Le nom est requis.'); return; }
    setSaving(true); setSaveError('');
    try {
      if (modal.mode === 'add') {
        const res = await categoriesAPI.create({ name: form.name, description: form.description, icon: form.icon, color: form.color, status: form.status });
        dispatch({ type: 'ADD_CATEGORY', payload: res.data });
      } else {
        const id  = form.id || form._id;
        const res = await categoriesAPI.update(id, { name: form.name, description: form.description, icon: form.icon, color: form.color, status: form.status });
        dispatch({ type: 'UPDATE_CATEGORY', payload: res.data });
      }
      closeModal();
      refreshData();
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (catId) => {
    try {
      await categoriesAPI.toggleStatus(catId);
      dispatch({ type: 'TOGGLE_CATEGORY_STATUS', payload: catId });
    } catch (err) {
      console.error('Erreur toggle :', err.message);
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-topbar">
        <div>
          <h1 className="manage-title">Gestion des catégories</h1>
          <p className="manage-subtitle">{categories.length} catégories · {categories.filter(c => c.status === 'open').length} ouvertes</p>
        </div>
        <button className="manage-add-btn" onClick={openAdd}><span>+</span> Nouvelle catégorie</button>
      </div>

      <div className="manage-content">
        <div className="manage-cat-grid">
          {categories.map(cat => {
            const cid         = cat.id || cat._id;
            const artistCount = getArtistsByCategory(cid).length;
            const totalVotes  = getTotalVotesForCategory(cid);
            return (
              <div key={cid} className="manage-cat-card">
                <div className="manage-cat-card-header">
                  <span className="manage-cat-icon">{cat.icon}</span>
                  <div className={`category-card-status ${cat.status === 'open' ? 'status-open' : 'status-closed'}`}>
                    <span className="status-dot" />
                    {cat.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </div>
                </div>
                <div className="manage-cat-card-body">
                  <h3 style={{ color: cat.color }}>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <div className="manage-cat-stats">
                    <div className="manage-cat-stat">
                      <span className="manage-cat-stat-val">{artistCount}</span>
                      <span className="manage-cat-stat-label">Artistes</span>
                    </div>
                    <div className="manage-cat-stat">
                      <span className="manage-cat-stat-val">{(totalVotes||0).toLocaleString('fr-FR')}</span>
                      <span className="manage-cat-stat-label">Votes</span>
                    </div>
                  </div>
                  <div className="manage-cat-actions">
                    <button className={`manage-toggle-btn ${cat.status === 'open' ? 'manage-toggle-open' : 'manage-toggle-closed'}`} onClick={() => toggleStatus(cid)}>
                      {cat.status === 'open' ? '🔒 Fermer les votes' : '🔓 Ouvrir les votes'}
                    </button>
                    <button className="manage-action-btn manage-action-edit" onClick={() => openEdit(cat)}>✏️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="manage-modal">
            <div className="manage-modal-header">
              <h3>{modal.mode === 'add' ? ' Nouvelle catégorie' : ' Modifier la catégorie'}</h3>
              <button className="modal-close" onClick={closeModal} style={{ cursor:'pointer', background:'none', border:'1px solid var(--border)', borderRadius:'50%', width:32, height:32, color:'var(--text-secondary)', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div className="manage-modal-body">
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div className="form-group">
                  <label className="form-label">Nom de la catégorie *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Meilleur Artiste Hip-Hop" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description..." style={{ minHeight:80 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icône</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {ICONS.map(icon => (
                      <button key={icon} type="button"
                        style={{ width:40, height:40, borderRadius:8, border:`1px solid ${form.icon === icon ? 'var(--accent-gold)' : 'var(--border)'}`, background: form.icon === icon ? 'rgba(201,168,76,0.1)' : 'transparent', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onClick={() => setForm(p => ({ ...p, icon }))}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="open">Ouvert</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
              </div>
              {saveError && <div style={{ color:'var(--danger)', fontSize:13, padding:'8px 0' }}>{saveError}</div>}
              <div className="manage-modal-footer">
                <button className="manage-btn-cancel" onClick={closeModal}>Annuler</button>
                <button className="manage-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Sauvegarde...' : modal.mode === 'add' ? ' Créer' : ' Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

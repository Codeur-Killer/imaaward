// pages/admin/ManageArtistsPage.jsx
// Upload photo fichier + CRUD complet
import React, { useState, useRef } from 'react';
import { useVote } from '../../context/VoteContext.jsx';
import { artistsAPI, resolvePhoto } from '../../services/api.js';
import './ManagePage.css';

const EMPTY = { name:'', realName:'', categoryId:'', bio:'', genre:'', nationality:'', votes:0, featured:false };

export default function ManageArtistsPage() {
  const { artists, categories, dispatch, refreshData } = useVote();
  const [search,        setSearch]        = useState('');
  const [filterCat,     setFilterCat]     = useState('');
  const [modal,         setModal]         = useState({ open:false, mode:'add', artist:null });
  const [form,          setForm]          = useState(EMPTY);
  const [photoFile,     setPhotoFile]     = useState(null);    // File objet
  const [photoPreview,  setPhotoPreview]  = useState('');      // Data URL preview
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState('');
  const fileInputRef = useRef(null);

  const filtered = artists.filter(a => {
    const catId = String(a.categoryId||a.category?._id||a.category||'');
    return a.name.toLowerCase().includes(search.toLowerCase()) && (!filterCat || catId === filterCat);
  });

  const getCat = (artist) => {
    const catId = String(artist.categoryId||artist.category?._id||artist.category||'');
    return categories.find(c => c.id===catId||c._id===catId);
  };

  const openAdd = () => {
    setForm(EMPTY); setPhotoFile(null); setPhotoPreview(''); setSaveError('');
    setModal({ open:true, mode:'add', artist:null });
  };

  const openEdit = (artist) => {
    setForm({
      name: artist.name, realName: artist.realName||'',
      categoryId: String(artist.categoryId||artist.category?._id||artist.category||''),
      bio: artist.bio||'', genre: artist.genre||'', nationality: artist.nationality||'',
      votes: artist.votes||0, featured: artist.featured||false,
    });
    setPhotoFile(null);
    setPhotoPreview(resolvePhoto(artist.photo) || '');
    setSaveError('');
    setModal({ open:true, mode:'edit', artist });
  };

  const closeModal = () => setModal({ open:false, mode:'add', artist:null });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { setSaveError('Image trop lourde (max 5MB).'); return; }
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
    if (!allowed.includes(file.type)) { setSaveError('Format non supporté. Utilisez JPG, PNG, WEBP.'); return; }
    setPhotoFile(file);
    setSaveError('');
    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveError('Le nom est requis.'); return; }
    if (!form.categoryId)   { setSaveError('La catégorie est requise.'); return; }
    setSaving(true); setSaveError('');

    // Construire FormData pour l'upload
    const fd = new FormData();
    fd.append('name',        form.name.trim());
    fd.append('realName',    form.realName||'');
    fd.append('categoryId',  form.categoryId);
    fd.append('bio',         form.bio||'');
    fd.append('genre',       form.genre||'');
    fd.append('nationality', form.nationality||'');
    fd.append('votes',       String(Number(form.votes)||0));
    fd.append('featured',    String(!!form.featured));
    if (photoFile) fd.append('photo', photoFile);

    try {
      if (modal.mode === 'add') {
        const res = await artistsAPI.create(fd);
        dispatch({ type:'ADD_ARTIST', payload: res.data });
      } else {
        const id = modal.artist.id || modal.artist._id;
        const res = await artistsAPI.update(id, fd);
        dispatch({ type:'UPDATE_ARTIST', payload: res.data });
      }
      closeModal();
      setTimeout(refreshData, 500);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await artistsAPI.delete(id); dispatch({ type:'DELETE_ARTIST', payload:id }); }
    catch (err) { console.error(err.message); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <div className="manage-page">
      <div className="manage-topbar">
        <div>
          <h1 className="manage-title">Gestion des artistes</h1>
          <p className="manage-subtitle">{artists.length} artistes enregistrés</p>
        </div>
        <button className="manage-add-btn" onClick={openAdd}><span>+</span> Ajouter un artiste</button>
      </div>

      <div className="manage-content">
        <div className="manage-filters">
          <div className="manage-search-wrap">
            <span className="manage-search-icon"></span>
            <input className="form-input manage-search" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="form-select manage-filter-select" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map(c=><option key={c.id||c._id} value={c.id||c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Artiste</th><th>Catégorie</th><th>Genre</th><th>Votes</th><th>Vedette</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6}><div className="empty-state">Aucun artiste trouvé</div></td></tr>
                : filtered.map(artist => {
                  const cat = getCat(artist);
                  const aid = artist.id||artist._id;
                  return (
                    <tr key={aid}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          {artist.photo
                            ? <img src={resolvePhoto(artist.photo)} alt={artist.name}
                                style={{width:38,height:38,borderRadius:8,objectFit:'cover',border:'1px solid var(--border)',flexShrink:0}}
                                onError={e=>{e.target.style.display='none';}} />
                            : <div style={{width:38,height:38,borderRadius:8,background:'linear-gradient(135deg,var(--accent-gold-dark),var(--accent-purple))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:16,flexShrink:0}}>
                                {artist.name.charAt(0)}
                              </div>
                          }
                          <div>
                            <div style={{fontWeight:600,fontSize:14}}>{artist.name}</div>
                            <div style={{fontSize:12,color:'var(--text-muted)'}}>{artist.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td>{cat ? <span className="badge badge-gold">{cat.icon} {cat.name.split(' ').slice(0,2).join(' ')}</span> : '—'}</td>
                      <td style={{color:'var(--text-secondary)',fontSize:13}}>{artist.genre}</td>
                      <td><span style={{fontFamily:'var(--font-accent)',fontSize:17,color:'var(--accent-gold-light)'}}>{(artist.votes||0).toLocaleString('fr-FR')}</span></td>
                      <td><span className={`badge ${artist.featured?'badge-gold':'badge-danger'}`}>{artist.featured?'⭐ Oui':'Non'}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="manage-action-btn manage-action-edit" onClick={()=>openEdit(artist)}>✏️</button>
                          <button className="manage-action-btn manage-action-delete" onClick={()=>setDeleteConfirm(aid)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Add/Edit ── */}
      {modal.open && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="manage-modal" style={{maxWidth:580}}>
            <div className="manage-modal-header">
              <h3>{modal.mode==='add'?' Ajouter un artiste':' Modifier l\'artiste'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="manage-modal-body">

              {/* ── Upload photo ── */}
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Photo de l'artiste</label>
                <div className="photo-upload-zone" onClick={()=>fileInputRef.current?.click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview"
                        style={{width:90,height:90,borderRadius:12,objectFit:'cover',border:'2px solid var(--accent-gold)'}} />
                    : <div className="photo-upload-placeholder">
                        <span style={{fontSize:32}}></span>
                        <span style={{fontSize:13,color:'var(--text-secondary)'}}>Cliquer pour sélectionner une image</span>
                        <span style={{fontSize:11,color:'var(--text-muted)'}}>JPG, PNG, WEBP — max 5MB</span>
                      </div>
                  }
                  {photoPreview && (
                    <div className="photo-upload-overlay">
                      <span style={{fontSize:24}}>🔄</span>
                      <span style={{fontSize:12}}>Changer la photo</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                {photoPreview && (
                  <button type="button" style={{marginTop:6,fontSize:12,color:'var(--danger)',background:'none',border:'none',cursor:'pointer'}}
                    onClick={()=>{setPhotoFile(null);setPhotoPreview('');if(fileInputRef.current)fileInputRef.current.value='';}}>
                    ✕ Supprimer la photo
                  </button>
                )}
              </div>

              <div className="manage-form-grid">
                <div className="form-group">
                  <label className="form-label">Nom d'artiste *</label>
                  <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Nom scénique" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom réel</label>
                  <input className="form-input" value={form.realName} onChange={e=>setForm(p=>({...p,realName:e.target.value}))} placeholder="Prénom Nom" />
                </div>
                <div className="form-group">
                  <label className="form-label">Catégorie *</label>
                  <select className="form-select" value={form.categoryId} onChange={e=>setForm(p=>({...p,categoryId:e.target.value}))}>
                    <option value="">Sélectionner...</option>
                    {categories.map(c=><option key={c.id||c._id} value={c.id||c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Genre musical</label>
                  <input className="form-input" value={form.genre} onChange={e=>setForm(p=>({...p,genre:e.target.value}))} placeholder="Afrobeats, R&B..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Nationalité</label>
                  <input className="form-input" value={form.nationality} onChange={e=>setForm(p=>({...p,nationality:e.target.value}))} placeholder="🇳🇬 Nigeria" />
                </div>
                <div className="form-group">
                  <label className="form-label">Votes initiaux</label>
                  <input type="number" className="form-input" value={form.votes} onChange={e=>setForm(p=>({...p,votes:e.target.value}))} min="0" />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Biographie</label>
                  <textarea className="form-textarea" value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} placeholder="Description de l'artiste..." />
                </div>
                <div className="form-group">
                  <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))}
                      style={{width:16,height:16,accentColor:'var(--accent-gold)'}} />
                    <span className="form-label" style={{margin:0}}>Mettre en vedette ⭐</span>
                  </label>
                </div>
              </div>

              {saveError && (
                <div style={{color:'var(--danger)',fontSize:13,padding:'8px 12px',background:'rgba(239,68,68,.08)',borderRadius:8,border:'1px solid rgba(239,68,68,.25)'}}>
                  {saveError}
                </div>
              )}

              <div className="manage-modal-footer">
                <button className="manage-btn-cancel" onClick={closeModal}>Annuler</button>
                <button className="manage-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Enregistrement...' : modal.mode==='add' ? ' Ajouter' : ' Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={()=>setDeleteConfirm(null)}>
          <div className="manage-confirm-modal">
            <div className="manage-confirm-icon">⚠️</div>
            <h3 className="manage-confirm-title">Supprimer cet artiste ?</h3>
            <p className="manage-confirm-desc">Cette action est irréversible.</p>
            <div className="manage-confirm-actions">
              <button className="manage-btn-cancel" onClick={()=>setDeleteConfirm(null)}>Annuler</button>
              <button className="manage-btn-delete" onClick={()=>handleDelete(deleteConfirm)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

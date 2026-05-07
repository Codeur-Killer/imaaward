// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('ima_admin_token');
  const h = {};
  if (!isFormData) h['Content-Type'] = 'application/json';
  if (token)       h['Authorization'] = `Bearer ${token}`;
  return h;
};

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const res  = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(isFormData), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    const err    = new Error(data.message || 'Erreur serveur');
    err.status   = res.status;
    err.data     = data;
    throw err;
  }
  return data;
};

const get    = (path, params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== ''))
  ).toString();
  return request(`${path}${qs ? `?${qs}` : ''}`);
};
const post   = (path, body) => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
const put    = (path, body) => request(path, { method: 'PUT',  body: body instanceof FormData ? body : JSON.stringify(body) });
const patch  = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del    = (path)       => request(path, { method: 'DELETE' });

// Résoudre une URL photo (relative ou absolue)
export const resolvePhoto = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('http')) return photo;
  if (photo.startsWith('/uploads/')) return `${STATIC_URL}${photo}`;
  return photo;
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password) => post('/auth/login', { email, password }),
  register: (data)            => post('/auth/register', data),
  me:       ()                => get('/auth/me'),
};

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll:       (params = {}) => get('/categories', params),
  getOne:       (id)          => get(`/categories/${id}`),
  getRanking:   (id)          => get(`/categories/${id}/ranking`),
  create:       (data)        => post('/categories', data),
  update:       (id, data)    => put(`/categories/${id}`, data),
  toggleStatus: (id)          => patch(`/categories/${id}/toggle`),
  delete:       (id)          => del(`/categories/${id}`),
};

// ── ARTISTS ───────────────────────────────────────────────────────────────────
export const artistsAPI = {
  getAll:  (params = {}) => get('/artists', params),
  getOne:  (id)          => get(`/artists/${id}`),
  // create/update utilisent FormData pour l'upload photo
  create:  (formData)    => post('/artists', formData),
  update:  (id, formData)=> put(`/artists/${id}`, formData),
  delete:  (id)          => del(`/artists/${id}`),
};

// ── VOTES ─────────────────────────────────────────────────────────────────────
export const votesAPI = {
  // Vote gratuit (1 par artiste)
  castFree:    (artistId)                => post('/votes/free', { artistId }),
  // Initier un vote payant FedaPay
  initPaid:    (artistId, voteCount, customerEmail, customerName) =>
    post('/votes/paid/init', { artistId, voteCount, customerEmail, customerName }),
  // Vérifier le statut d'un paiement
  verifyPayment: (ref)   => get('/votes/fedapay/verify', { ref }),
  // Vérifier si l'IP a déjà voté gratuitement
  checkVoted:  (artistId)              => get(`/votes/check/${artistId}`),
  // Résultats live
  getResults:  ()                      => get('/votes/results'),
  // Stats admin
  getStats:    ()                      => get('/votes/stats'),
  // Historique admin
  getHistory:  (params = {})          => get('/votes/history', params),
};

export { STATIC_URL };
export default { authAPI, categoriesAPI, artistsAPI, votesAPI, resolvePhoto };

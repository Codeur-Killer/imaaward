// src/context/VoteContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { categoriesAPI, artistsAPI, votesAPI, resolvePhoto } from '../services/api.js';
import { getSocket } from '../services/socket.js';

const VoteContext = createContext(null);
export const VOTE_END_DATE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

// Normaliser un artiste — s'assurer que la photo est une URL complète
const normalizeArtist = (a) => ({
  ...a,
  id:   String(a.id || a._id),
  _id:  String(a.id || a._id),
  photo: resolvePhoto(a.photo),
  votes: a.votes || 0,
});

const normalizeCategory = (c) => ({
  ...c,
  id:  String(c.id || c._id),
  _id: String(c.id || c._id),
  totalVotes: c.totalVotes || 0,
  artistCount: c.artistCount || 0,
});

const initialState = {
  artists: [], categories: [],
  stats: { totalVotes: 0, totalArtists: 0, totalCategories: 0, totalRevenue: 0 },
  userVotes:  {},   // { [artistId]: true } — vote gratuit utilisé
  loading: true, error: null,
};

function voteReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR':   return { ...state, error: action.payload, loading: false };

    case 'INIT_DATA': {
      const cats    = (action.payload.categories || []).map(normalizeCategory);
      const artists = (action.payload.artists || []).map(normalizeArtist);
      return {
        ...state, categories: cats, artists,
        stats: { totalVotes: artists.reduce((s,a)=>s+(a.votes||0),0), totalArtists: artists.length, totalCategories: cats.length, totalRevenue: 0 },
        loading: false, error: null,
      };
    }

    case 'SET_LIVE_DATA': {
      const cats    = (action.payload.categories || []).map(normalizeCategory);
      const artists = (action.payload.artists || []).map(normalizeArtist);
      const totalVotes = artists.reduce((s,a)=>s+(a.votes||0),0);
      return { ...state, categories: cats, artists, stats: { ...state.stats, totalVotes } };
    }

    case 'LOCAL_VOTE_UPDATE': {
      const aid = String(action.payload.artistId);
      const artist = state.artists.find(a => a.id === aid);
      if (!artist) return state;
      const catId = String(artist.categoryId || artist.category?._id || artist.category);
      return {
        ...state,
        artists:    state.artists.map(a => a.id === aid ? {...a, votes: (a.votes||0)+1} : a),
        categories: state.categories.map(c => c.id === catId ? {...c, totalVotes: (c.totalVotes||0)+1} : c),
        stats:      { ...state.stats, totalVotes: (state.stats.totalVotes||0)+1 },
        userVotes:  { ...state.userVotes, [aid]: true },
      };
    }

    case 'LOCAL_PAID_VOTE_UPDATE': {
      const { artistId, voteCount } = action.payload;
      const aid = String(artistId);
      const artist = state.artists.find(a => a.id === aid);
      if (!artist) return state;
      const catId = String(artist.categoryId || artist.category?._id || artist.category);
      return {
        ...state,
        artists:    state.artists.map(a => a.id === aid ? {...a, votes: (a.votes||0)+voteCount} : a),
        categories: state.categories.map(c => c.id === catId ? {...c, totalVotes: (c.totalVotes||0)+voteCount} : c),
        stats:      { ...state.stats, totalVotes: (state.stats.totalVotes||0)+voteCount, totalRevenue: (state.stats.totalRevenue||0)+(voteCount*200) },
      };
    }

    case 'SOCKET_UPDATE': {
      const { artistId, artist: upd, categoryStats } = action.payload;
      const aid = String(artistId);
      const updatedArtists = state.artists.map(a => {
        if (a.id === aid) return { ...a, votes: upd.votes, photo: resolvePhoto(upd.photo) || a.photo };
        if (categoryStats) {
          const found = categoryStats.artists?.find(ca => String(ca.id) === a.id);
          if (found) return { ...a, votes: found.votes };
        }
        return a;
      });
      const updatedCats = categoryStats
        ? state.categories.map(c => String(c.id) === String(categoryStats.categoryId)
            ? { ...c, totalVotes: categoryStats.totalVotes } : c)
        : state.categories;
      return { ...state, artists: updatedArtists, categories: updatedCats };
    }

    case 'MARK_FREE_VOTED': {
      const aid = String(action.payload);
      return { ...state, userVotes: { ...state.userVotes, [aid]: true } };
    }

    // Admin CRUD
    case 'ADD_ARTIST':
      return { ...state, artists: [...state.artists, normalizeArtist(action.payload)] };
    case 'UPDATE_ARTIST':
      return { ...state, artists: state.artists.map(a => a.id === String(action.payload.id||action.payload._id) ? normalizeArtist({...a,...action.payload}) : a) };
    case 'DELETE_ARTIST':
      return { ...state, artists: state.artists.filter(a => a.id !== String(action.payload)) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, normalizeCategory(action.payload)] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === String(action.payload.id||action.payload._id) ? normalizeCategory({...c,...action.payload}) : c) };
    case 'TOGGLE_CATEGORY_STATUS':
      return { ...state, categories: state.categories.map(c => c.id === String(action.payload) ? {...c, status: c.status==='open'?'closed':'open'} : c) };

    default: return state;
  }
}

export function VoteProvider({ children }) {
  const [state, dispatch] = useReducer(voteReducer, {
    ...initialState,
    userVotes: (() => { try { return JSON.parse(localStorage.getItem('ima_user_votes')||'{}'); } catch { return {}; } })(),
  });
  const loadingRef = useRef(false);

  const loadInitialData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await votesAPI.getResults();
      if (res.data?.length > 0) {
        dispatch({ type: 'INIT_DATA', payload: {
          categories: res.data.map(r => r.category),
          artists:    res.data.flatMap(r => r.artists),
        }});
      } else {
        const [cR, aR] = await Promise.all([categoriesAPI.getAll(), artistsAPI.getAll()]);
        dispatch({ type: 'INIT_DATA', payload: { categories: cR.data||[], artists: aR.data||[] } });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally { loadingRef.current = false; }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => { localStorage.setItem('ima_user_votes', JSON.stringify(state.userVotes)); }, [state.userVotes]);

  // Socket.io
  useEffect(() => {
    const socket = getSocket();
    const handler = (data) => dispatch({ type: 'SOCKET_UPDATE', payload: data });
    socket.on('vote:update', handler);
    return () => socket.off('vote:update', handler);
  }, []);

  // Polling 20s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await votesAPI.getResults();
        if (res.data?.length > 0) dispatch({ type: 'SET_LIVE_DATA', payload: {
          categories: res.data.map(r=>r.category), artists: res.data.flatMap(r=>r.artists),
        }});
      } catch {}
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // ── API publique ──────────────────────────────────────────────────────────

  /** Vote GRATUIT — 1 par artiste, permanent */
  const castVote = useCallback(async (artistId) => {
    const aid = String(artistId);
    if (state.userVotes[aid]) return { success: false, alreadyVoted: true, message: 'Vote gratuit déjà utilisé pour cet artiste.' };

    // Optimistic update
    dispatch({ type: 'LOCAL_VOTE_UPDATE', payload: { artistId: aid } });
    try {
      const res = await votesAPI.castFree(aid);
      if (res.data?.categoryStats) dispatch({ type: 'SOCKET_UPDATE', payload: { artistId: aid, artist: res.data.artist||{}, categoryStats: res.data.categoryStats } });
      return { success: true, alreadyVoted: false, message: res.message };
    } catch (err) {
      if (err.status === 409) {
        dispatch({ type: 'MARK_FREE_VOTED', payload: aid });
        return { success: false, alreadyVoted: true, message: err.message };
      }
      return { success: false, alreadyVoted: false, message: err.message||'Erreur lors du vote.' };
    }
  }, [state.userVotes]);

  /** Initier un vote PAYANT — retourne checkoutUrl FedaPay */
  const initPaidVote = useCallback(async (artistId, voteCount, customerEmail, customerName = '') => {
    try {
      const res = await votesAPI.initPaid(artistId, voteCount, customerEmail, customerName);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.message||'Erreur paiement.' };
    }
  }, []);

  /** Confirmer l'affichage local après paiement (appelé depuis la page de retour) */
  const confirmPaidVote = useCallback((artistId, voteCount) => {
    dispatch({ type: 'LOCAL_PAID_VOTE_UPDATE', payload: { artistId: String(artistId), voteCount } });
  }, []);

  const hasVoted    = useCallback((artistId) => !!state.userVotes[String(artistId)], [state.userVotes]);

  const getArtistsByCategory = useCallback((categoryId) => {
    const cid = String(categoryId);
    return state.artists.filter(a => String(a.categoryId||a.category?._id||a.category||'') === cid);
  }, [state.artists]);

  const getTopArtists = useCallback((categoryId, limit = 3) =>
    [...getArtistsByCategory(categoryId)].sort((a,b)=>(b.votes||0)-(a.votes||0)).slice(0,limit),
  [getArtistsByCategory]);

  const getTotalVotesForCategory = useCallback((categoryId) => {
    const cid = String(categoryId);
    const cat = state.categories.find(c => c.id === cid);
    if (cat?.totalVotes != null) return cat.totalVotes;
    return getArtistsByCategory(categoryId).reduce((s,a)=>s+(a.votes||0),0);
  }, [state.categories, getArtistsByCategory]);

  const getVotePercentage = useCallback((artistId) => {
    const aid = String(artistId);
    const artist = state.artists.find(a => a.id === aid);
    if (!artist) return 0;
    const catId = String(artist.categoryId||artist.category?._id||artist.category||'');
    const total = getTotalVotesForCategory(catId);
    return total === 0 ? 0 : Math.round(((artist.votes||0)/total)*100);
  }, [state.artists, getTotalVotesForCategory]);

  const refreshData = useCallback(() => { loadingRef.current = false; return loadInitialData(); }, [loadInitialData]);

  return (
    <VoteContext.Provider value={{
      ...state, VOTE_END_DATE,
      castVote, initPaidVote, confirmPaidVote, hasVoted,
      getArtistsByCategory, getTopArtists, getTotalVotesForCategory, getVotePercentage,
      refreshData, dispatch,
    }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error('useVote must be used within VoteProvider');
  return ctx;
}

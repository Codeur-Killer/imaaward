# 🔗 IMA Awards — Intégration API Frontend

Guide complet pour connecter le frontend React à l'API backend.

---

## ✅ Ce qui a été intégré

### Nouveaux fichiers créés
| Fichier | Rôle |
|---------|------|
| `src/services/api.js`    | Service centralisé — tous les appels API REST |
| `src/services/socket.js` | Service Socket.io — temps réel |
| `src/.env`               | Variables d'environnement Vite |

### Fichiers modifiés
| Fichier | Changement |
|---------|------------|
| `src/context/VoteContext.jsx`  | Charge données depuis l'API + écoute Socket.io |
| `src/context/AdminContext.jsx` | Auth JWT réelle |
| `src/components/public/ArtistCard.jsx`    | Compatible `id` et `_id` MongoDB |
| `src/components/public/CategoryCard.jsx`  | Compatible `id` et `_id` MongoDB |
| `src/components/public/VoteModal.jsx`     | Appel API vote réel |
| `src/components/public/LiveResultsWidget.jsx` | Données API live |
| `src/components/admin/VoteChart.jsx`      | Accepte données API |
| `src/pages/public/HomePage.jsx`          | Données depuis API |
| `src/pages/public/ResultsPage.jsx`       | Socket.io rooms catégories |
| `src/pages/public/CategoryDetailPage.jsx`| Socket.io rooms + API |
| `src/pages/admin/AdminLoginPage.jsx`     | Auth JWT réelle |
| `src/pages/admin/DashboardPage.jsx`      | Stats API + Socket.io live |
| `src/pages/admin/ManageArtistsPage.jsx`  | CRUD complet via API |
| `src/pages/admin/ManageCategoriesPage.jsx`| CRUD complet via API |
| `src/pages/admin/ManageVotesPage.jsx`    | Historique API + Socket.io |

---

## 🚀 Démarrage

### 1. Backend
```bash
cd ima-backend
npm install
cp .env.example .env
npm run seed  # → Charge les données de démo
npm run dev   # → http://localhost:5000
```

### 2. Frontend
```bash
cd ima-awards
npm install   # socket.io-client inclus
npm run dev   # → http://localhost:5173
```

---

## ⚙️ Configuration

**`ima-awards/.env`**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**`ima-backend/.env`**
```
PORT=5000
MONGODB_URI=mongodb://localhost:5000/ima_awards
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

---

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND REACT                      │
│                                                      │
│  VoteContext                                         │
│  ├── loadInitialData() ──────────── GET /categories  │
│  │                      ──────────── GET /artists    │
│  ├── castVote(artistId) ────────── POST /votes       │
│  └── Socket.io listener ◄──── vote:update (temps réel)
│                                                      │
│  AdminContext                                        │
│  └── login(email, pwd) ────────── POST /auth/login   │
│                                                      │
│  Pages admin                                         │
│  ├── DashboardPage ────────────── GET /votes/stats   │
│  ├── ManageArtists ────────────── CRUD /artists      │
│  ├── ManageCategories ─────────── CRUD /categories   │
│  └── ManageVotes ──────────────── GET /votes/history │
└─────────────────────────────────────────────────────┘
                           │
                    HTTP + Socket.io
                           │
┌─────────────────────────────────────────────────────┐
│                  BACKEND NODE.JS                     │
│                                                      │
│  Express.js                                          │
│  ├── /api/auth        → authController               │
│  ├── /api/categories  → categoryController           │
│  ├── /api/artists     → artistController             │
│  └── /api/votes       → voteController               │
│                                                      │
│  Socket.io                                           │
│  ├── vote:update  → émis après chaque vote           │
│  ├── admin:vote-update → dashboard admin             │
│  └── admin:stats-update → KPIs temps réel            │
│                                                      │
│  MongoDB                                             │
│  ├── users       → admins JWT                        │
│  ├── categories  → catégories de vote                │
│  ├── artists     → artistes avec compteur votes      │
│  └── votes       → historique votes (anti-double)    │
└─────────────────────────────────────────────────────┘
```

---

## 🛡️ Anti-double vote

Le système utilise un **fingerprint SHA-256** basé sur :
- L'adresse IP du votant
- L'ID de l'artiste
- La date du jour (YYYY-MM-DD)

→ 1 vote gratuit par artiste par jour par IP.
→ Les votes payants (futurs FedaPay) ne sont pas limités.

---

## 📡 Socket.io — Rooms

| Room | Description |
|------|-------------|
| `category:{id}` | Mises à jour d'une catégorie spécifique |
| `admin`         | Notifications dashboard administrateur |
| Global          | Toutes les pages (vote:update) |

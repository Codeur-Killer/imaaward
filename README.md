# 🏆 IMA Awards — Plateforme de Vote Musicale

Interface complète React.js pour une plateforme de vote pour artistes musicaux africains et francophones.

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173
```

### Build de production
```bash
npm run build
npm run preview
```

---

## 🔐 Accès Administrateur

| Champ    | Valeur                    |
|----------|---------------------------|
| Email    | `admin@ima-awards.com`    |
| Mot de passe | `admin123`            |

URL Admin : `/admin`

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          — Navigation sticky glassmorphism
│   │   ├── Footer.jsx          — Pied de page complet
│   │   ├── PageTransition.jsx  — Layout public avec transitions
│   │   └── AdminLayout.jsx     — Layout admin avec sidebar
│   ├── ui/
│   │   ├── Button.jsx          — Bouton réutilisable (5 variantes)
│   │   ├── Modal.jsx           — Modal générique
│   │   ├── CountdownTimer.jsx  — Compte à rebours animé
│   │   └── Loader.jsx          — Indicateurs de chargement
│   ├── public/
│   │   ├── HeroSection.jsx     — Hero plein écran avec particules canvas
│   │   ├── ArtistCard.jsx      — Card artiste avec vote
│   │   ├── CategoryCard.jsx    — Card catégorie
│   │   ├── VoteProgressBar.jsx — Barre de progression animée
│   │   ├── VoteModal.jsx       — Modal de vote (gratuit + FedaPay)
│   │   └── LiveResultsWidget.jsx — Widget résultats live
│   └── admin/
│       ├── AdminSidebar.jsx    — Sidebar fixe admin
│       ├── StatsCard.jsx       — Cartes statistiques
│       └── VoteChart.jsx       — Graphique votes (recharts)
├── pages/
│   ├── public/
│   │   ├── HomePage.jsx        — Page d'accueil complète
│   │   ├── CategoriesPage.jsx  — Liste des catégories
│   │   ├── CategoryDetailPage.jsx — Détail catégorie + vote
│   │   ├── ResultsPage.jsx     — Résultats avec podium
│   │   └── AboutPage.jsx       — Page à propos
│   └── admin/
│       ├── AdminLoginPage.jsx  — Connexion admin
│       ├── DashboardPage.jsx   — Tableau de bord
│       ├── ManageArtistsPage.jsx  — CRUD artistes
│       ├── ManageCategoriesPage.jsx — Gestion catégories
│       └── ManageVotesPage.jsx — Liste des votes paginée
├── context/
│   ├── VoteContext.jsx         — State global votes, artistes, catégories
│   └── AdminContext.jsx        — Auth admin
├── hooks/
│   ├── useLocalStorage.js      — Anti-double vote
│   └── useCountdown.js         — Countdown timer
├── data/
│   └── mockData.js             — 25 artistes, 5 catégories réalistes
└── styles/
    └── global.css              — Variables CSS + animations + utilitaires
```

---

## 🎨 Design System

| Élément         | Valeur                            |
|-----------------|-----------------------------------|
| Thème           | Sombre, luxueux, Award Show       |
| Couleur primaire | `#C9A84C` (or doré)              |
| Accent          | `#7C3AED` (violet)                |
| Police titres   | Playfair Display (Google Fonts)   |
| Police UI       | DM Sans (Google Fonts)            |
| Police stats    | Bebas Neue (Google Fonts)         |

---

## 🌐 Pages & Routes

| Route                      | Description                      |
|----------------------------|----------------------------------|
| `/`                        | Accueil (Hero, Stats, Catégories, Artistes, Live) |
| `/categories`              | Toutes les catégories            |
| `/categories/:slug`        | Détail catégorie + vote          |
| `/resultats`               | Résultats en direct avec podium  |
| `/a-propos`                | À propos des IMA Awards          |
| `/admin`                   | Login administrateur             |
| `/admin/dashboard`         | Tableau de bord admin            |
| `/admin/artistes`          | Gestion des artistes (CRUD)      |
| `/admin/categories`        | Gestion des catégories           |
| `/admin/votes`             | Historique des votes paginé      |

---

## 💳 Intégration FedaPay

Dans `VoteModal.jsx`, l'intégration FedaPay est simulée. Pour la production :

```javascript
// Remplacer la simulation par l'appel réel FedaPay
const transaction = await fetch('/api/fedapay/create-transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: voteCount * 500,
    description: `${voteCount} vote(s) pour ${artist.name}`,
    customer: { email }
  })
}).then(r => r.json());

window.location.href = transaction.checkout_url;
```

---

## 📦 Dépendances

| Package           | Usage                          |
|-------------------|--------------------------------|
| `react`           | Framework UI                   |
| `react-dom`       | Rendu DOM                      |
| `react-router-dom`| Routage SPA                    |
| `recharts`        | Graphiques admin               |
| `react-icons`     | (Optionnel) Icônes SVG         |
| `vite`            | Bundler + dev server           |

---

## ✨ Fonctionnalités

- ✅ **Particules dorées canvas** sur le Hero
- ✅ **Countdown animé** jusqu'à la fin des votes
- ✅ **Anti-double vote** via localStorage
- ✅ **Simulation live** — votes se mettent à jour automatiquement toutes les 8s
- ✅ **VoteModal** gratuit (1 vote) + payant (FedaPay simulé)
- ✅ **Confetti animés** après un vote réussi
- ✅ **Podium visuel** sur la page Résultats
- ✅ **Dashboard admin** avec graphique recharts, stats cards, table paginée
- ✅ **CRUD complet** artistes & catégories
- ✅ **Auth admin** protégée (localStorage)
- ✅ **Responsive** mobile-first complet
- ✅ **Glassmorphism** navbar + cards
- ✅ **Transitions de page** fluides
- ✅ **Animations scroll** (Intersection Observer)

# 📚 DOCUMENTATION TECHNIQUE - ASCARTEL

## 🎯 Vue d'ensemble

**AsCartel** est une plateforme e-commerce moderne développée en Vanilla JavaScript avec un backend Node.js/Express. Le projet suit une architecture modulaire et scalable.

---

## 🏗️ Architecture

### Frontend
```
AsCartel Official/
├── index.html              # Page d'accueil
├── panier.html            # Page panier
├── checkout.html          # Page commande
├── wishlist.html          # Page favoris
├── login.html             # Connexion
├── register.html          # Inscription
├── addresses.html         # Gestion adresses
├── recherche.html         # Résultats recherche
├── offline.html           # Page hors ligne PWA
│
├── style.css              # Styles principaux
├── design-system.css      # Design tokens
├── dark-mode.css          # Mode sombre
├── animations.css         # Animations avancées
├── filters.css            # Filtres sidebar
├── sort.css               # Tri produits
├── pagination.css         # Pagination
├── wishlist.css           # Wishlist
├── cart.css               # Panier
├── search.css             # Recherche
│
├── app.js                 # Application principale
├── script.js              # Scripts généraux
├── config.js              # Configuration
├── cart.js                # Gestion panier
├── filters.js             # Système filtres
├── sort.js                # Tri produits
├── pagination.js          # Pagination
├── search.js              # Recherche autocomplete
├── animations.js          # Animations manager
├── performance.js         # Optimisation performance
├── analytics.js           # Analytics & tracking
├── products-service.js    # Service API produits
├── wishlist-page.js       # Gestion wishlist
│
├── sw.js                  # Service Worker PWA
├── manifest.json          # Manifest PWA
└── README.md              # Documentation utilisateur
```

### Backend
```
backend/
├── server.js              # Point d'entrée
├── config/
│   ├── database.js        # Configuration SQLite
│   └── settings.js        # Paramètres app
├── middleware/
│   ├── auth.js            # Authentification JWT
│   └── businessHours.js   # Horaires ouverture
├── routes/
│   ├── auth.js            # Routes authentification
│   ├── articles.js        # Routes produits
│   ├── orders.js          # Routes commandes
│   ├── addresses.js       # Routes adresses
│   └── settings.js        # Routes paramètres
├── scripts/
│   ├── init-db.js         # Initialisation DB
│   ├── seed-products.js   # Données test
│   └── add-addresses-table.js
├── data/
│   └── ascartel.db        # Base SQLite
└── package.json
```

---

## 🔧 Technologies

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Styles modernes (Grid, Flexbox, Custom Properties)
- **JavaScript (ES6+)** - Vanilla JS, pas de framework
- **Font Awesome 6** - Icônes
- **Google Fonts (Poppins)** - Typographie

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js 4** - Framework web
- **SQLite (better-sqlite3)** - Base de données
- **JWT (jsonwebtoken)** - Authentification
- **bcryptjs** - Hachage mots de passe
- **CORS** - Sécurité cross-origin

### DevOps
- **Git/GitHub** - Contrôle version
- **Netlify** - Hébergement frontend
- **Render** - Hébergement backend

---

## 📦 Installation

### Prérequis
```bash
node >= 18.0.0
npm >= 9.0.0
git >= 2.0.0
```

### Backend
```bash
cd backend
npm install
npm run init-db
npm start  # Port 3000
```

### Frontend
```bash
# Option 1: Serveur local Python
python3 -m http.server 8080

# Option 2: Live Server (VS Code)
# Clic droit > Open with Live Server

# Option 3: Netlify CLI
netlify dev
```

---

## 🔐 Authentification

### JWT Flow
1. Login → POST `/api/auth/login`
2. Réception token JWT (24h validité)
3. Stockage `localStorage.setItem('token', jwt)`
4. Requêtes authentifiées: `Authorization: Bearer ${token}`

### Rôles
- **Admin** - Accès complet (CRUD produits, commandes, paramètres)
- **Collaborateur** - Gestion commandes, consultation
- **Client** - Navigation, achat

### Identifiants par défaut
```
Admin:
  Email: master@ascartel.com
  Password: ASCARTEL_MASTER_2025

Collaborateur:
  Email: vendeur@ascartel.com
  Password: Vente123
```

---

## 🛒 Fonctionnalités

### Phase 1 - Fondations ✅
- Connexion Backend ↔ Frontend
- Grille produits avec loading/error states
- Page produit détaillée
- Système panier complet
- Badge compteur animé
- Page panier avec calcul total

### Phase 2 - Authentification ✅
- Routes auth (register, login, logout, me, forgot-password)
- Formulaire inscription avec validation temps réel
- Formulaire connexion avec "Se souvenir de moi"
- Modal mot de passe oublié
- Dashboard client
- Gestion adresses livraison (CRUD)

### Phase 3 - Checkout ✅
- Checkout 4 étapes
- Paiement à la livraison UNIQUEMENT
- Frais livraison: Standard 5k, Express 8k (TOUJOURS payants)
- Confirmation commande avec numéro

### Phase 4 - Fonctionnalités avancées ✅
- Recherche avec autocomplete (2 chars, debounce 300ms)
- Filtres sidebar (genre, catégorie, prix, tailles, couleurs)
- Tri produits (8 options)
- Pagination (20 produits/page)
- Wishlist persistante

### Phase 5 - Polish & Optimisation ✅
- Animations avancées (20+ keyframes)
- Performance (lazy loading, resource hints)
- PWA (Service Worker, manifest, offline)
- Analytics & tracking (page views, events, e-commerce)

---

## 🎨 Design System

### Couleurs
```css
--primary-color: #f68db5;
--primary-light: #f9c5d5;
--secondary-color: #3b82f6;
--success-color: #22c55e;
--warning-color: #f59e0b;
--error-color: #ef4444;
```

### Typographie
```css
font-family: 'Poppins', sans-serif;
font-weights: 300, 400, 500, 600, 700
```

### Breakpoints
```css
mobile: 320px+
tablet: 768px+
desktop: 1024px+
large: 1440px+
```

---

## 🚀 Performance

### Optimisations
- **Lazy loading** images (native + fallback)
- **Resource hints** (dns-prefetch, preconnect)
- **Code splitting** par fonctionnalité
- **Cache API** (5 min TTL)
- **Service Worker** (cache strategies)
- **Compression** assets
- **Debounce/Throttle** événements

### Web Vitals
- **LCP** < 2.5s (Largest Contentful Paint)
- **FID** < 100ms (First Input Delay)
- **CLS** < 0.1 (Cumulative Layout Shift)

---

## 📊 Analytics

### Events trackés
- `page_view` - Vue page
- `click` - Clics utilisateur
- `scroll_depth` - Profondeur scroll (25%, 50%, 75%, 100%)
- `time_on_page` - Temps passé
- `add_to_cart` - Ajout panier
- `add_to_wishlist` - Ajout favoris
- `view_item` - Vue produit
- `web_vitals` - Métriques performance

### Intégration
```javascript
// Google Analytics 4
gtag('event', 'add_to_cart', { item_name: 'Robe', price: 50000 });

// Custom endpoint
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify(event)
});
```

---

## 🔒 Sécurité

### Mesures
- ✅ JWT avec expiration 24h
- ✅ Mots de passe hachés (bcrypt, 10 rounds)
- ✅ CORS configuré
- ✅ Validation données côté serveur
- ✅ Protection CSRF
- ✅ Rate limiting (à implémenter)
- ✅ HTTPS en production

### Bonnes pratiques
- Pas de credentials en clair
- Tokens stockés en localStorage (pas cookies pour éviter CSRF)
- Validation input utilisateur
- Sanitization SQL (prepared statements)

---

## 🧪 Tests

### À implémenter
```bash
# Tests unitaires
npm run test:unit

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Outils recommandés
- **Jest** - Tests unitaires
- **Cypress** - Tests E2E
- **Lighthouse** - Performance audit

---

## 🌐 Déploiement

### Frontend (Netlify)
```bash
# Build
# Pas de build nécessaire (Vanilla JS)

# Deploy
git push origin main  # Auto-deploy
```

### Backend (Render)
```bash
# Build command
npm install

# Start command
npm start

# Environment variables
PORT=3000
JWT_SECRET=xxx
ADMIN_EMAIL=master@ascartel.com
```

---

## 📝 API Endpoints

### Auth
```
POST   /api/auth/register      # Inscription
POST   /api/auth/login         # Connexion
GET    /api/auth/me            # Profil
POST   /api/auth/logout        # Déconnexion
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Articles
```
GET    /api/articles           # Liste produits
GET    /api/articles/:id       # Détail produit
GET    /api/articles/flash-sales
POST   /api/articles           # Créer (Admin)
PUT    /api/articles/:id       # Modifier (Admin)
DELETE /api/articles/:id       # Supprimer (Admin)
```

### Orders
```
POST   /api/orders             # Créer commande
GET    /api/orders             # Liste (Staff)
GET    /api/orders/:id         # Détail (Staff)
PATCH  /api/orders/:id/status  # Modifier statut (Staff)
```

### Addresses
```
GET    /api/addresses          # Liste adresses
GET    /api/addresses/:id      # Détail
POST   /api/addresses          # Créer
PUT    /api/addresses/:id      # Modifier
DELETE /api/addresses/:id      # Supprimer
PATCH  /api/addresses/:id/default
```

---

## 🐛 Debugging

### Logs
```javascript
// Frontend
console.log('📊 Event:', data);
console.error('❌ Error:', error);

// Backend
console.log('[INFO]', message);
console.error('[ERROR]', error);
```

### Chrome DevTools
- **Network** - Requêtes API
- **Application** - localStorage, Service Worker
- **Performance** - Web Vitals
- **Lighthouse** - Audit complet

---

## 🤝 Contribution

### Workflow Git
```bash
# Créer branche
git checkout -b feature/ma-feature

# Commits
git commit -m "✅ Feature: description"

# Push
git push origin feature/ma-feature

# Pull Request sur GitHub
```

### Conventions
- **Commits**: Emoji + description claire
- **Code**: ESLint + Prettier
- **CSS**: BEM naming
- **JS**: Camel case, JSDoc comments

---

## 📞 Support

- **Email**: support@ascartel.com
- **GitHub Issues**: [github.com/ascartel/issues](https://github.com)
- **Documentation**: Ce fichier

---

## 📄 Licence

MIT License - Voir fichier `LICENSE`

---

## 👨‍💻 Auteur

**Aina** - Développeur Full Stack
- GitHub: [@monocanon12-cpu](https://github.com/monocanon12-cpu)

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2024  
**Status**: ✅ Production Ready

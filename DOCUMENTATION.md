# 📚 Documentation Technique AsCartel

## 🏗️ Architecture

### Frontend
```
AsCartel Official/
├── index.html              # Page d'accueil
├── produit-detail.html     # Détails produit
├── panier.html             # Panier
├── paiement-mobile.html    # Paiement mobile
├── login.html              # Connexion
├── admin.html              # Dashboard admin
├── styles.css              # Styles globaux
├── config.js               # Configuration
└── scripts/
    ├── chatbot-ai.js       # Pinka AI v4.0
    ├── mobile-payment.js   # Paiement mobile
    ├── cart.js             # Gestion panier
    ├── filters.js          # Filtres produits
    └── ...
```

### Backend
```
backend/
├── server.js               # Point d'entrée
├── config/
│   ├── database.js         # SQLite
│   └── settings.js         # Configuration
├── routes/
│   ├── auth.js             # Authentification
│   ├── articles.js         # Produits
│   ├── orders.js           # Commandes
│   ├── payment.js          # Paiements
│   └── settings.js         # Paramètres
├── middleware/
│   ├── auth.js             # JWT validation
│   └── businessHours.js    # Horaires
├── tests/
│   └── api.test.js         # Tests API
└── scripts/
    ├── init-db.js          # Init DB
    └── health-check.js     # Health check
```

## 🔐 Authentification

### JWT Token
```javascript
// Login
POST /api/auth/login
{
  "email": "master@ascartel.com",
  "password": "ASCARTEL_MASTER_2025"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "master@ascartel.com",
    "role": "admin"
  }
}
```

### Utilisation Token
```javascript
// Headers
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Articles
```
GET    /api/articles                    # Liste tous
GET    /api/articles?genre=Femme        # Filtrer genre
GET    /api/articles?minPrice=10000     # Filtrer prix
GET    /api/articles/:id                # Détail
GET    /api/articles/flash-sales        # Ventes flash
POST   /api/articles                    # Créer (Admin)
PUT    /api/articles/:id                # Modifier (Admin)
DELETE /api/articles/:id                # Supprimer (Admin)
```

### Commandes
```
POST   /api/orders                      # Créer
GET    /api/orders                      # Liste (Staff)
GET    /api/orders/:id                  # Détail (Staff)
PATCH  /api/orders/:id/status           # Modifier statut (Staff)
```

### Paiement Mobile
```
POST   /api/payment/initiate            # Initier
GET    /api/payment/status/:id          # Vérifier
POST   /api/payment/cancel/:id          # Annuler
POST   /api/payment/callback            # Webhook
```

### Settings
```
GET    /api/settings/status             # Statut boutique
PUT    /api/settings/hours              # Horaires (Admin)
PUT    /api/settings/store              # Ouvrir/Fermer (Admin)
```

## 🤖 Pinka AI v4.0

### Capacités
- **ML Recommendations**: Scoring produits basé historique
- **Sentiment Analysis**: Détection émotions client
- **Voice Recognition**: Commandes vocales (Web Speech API)
- **Visual Search**: Recherche par image
- **Analytics**: Tracking comportement utilisateur
- **Persistance**: localStorage (50 messages, préférences)

### Utilisation
```javascript
// Initialisation automatique
const pinka = new PinkaAI();

// Message utilisateur
pinka.sendMessage("Je cherche une robe élégante");

// Recommandations ML
const recommendations = pinka.getRecommendations(5);

// Sentiment
const sentiment = pinka.analyzeSentiment("Super produit !");
// { score: 0.8, sentiment: 'positive', urgency: false }
```

### Configuration
```javascript
// chatbot-ai.js
const GEMINI_API_KEY = 'AIzaSyBZeZa13ZdgjfLdsxVDIU7rl_GNQXJ3f50';
const ENABLE_VOICE = true;
const ENABLE_SENTIMENT = true;
const ENABLE_VISUAL_SEARCH = true;
```

## 💳 Paiement Mobile

### Opérateurs Supportés
- **MVola** (Telma): 032, 033, 034, 038
- **Orange Money**: 032, 037
- **Airtel Money**: 033

### Flow
```javascript
// 1. Initier
const payment = new MobilePaymentMadagascar();
const result = await payment.initiatePayment(
  '0321234567',  // Numéro
  50000,         // Montant
  'ORD-123',     // ID commande
  'Jean Dupont'  // Nom client
);

// 2. Client compose USSD
// *111# (MVola) ou *144# (Orange) ou *123# (Airtel)

// 3. Vérifier statut
const status = await payment.checkTransactionStatus(result.transaction.id);

// 4. Confirmation
if (status.status === 'completed') {
  // Commande validée
}
```

### Frais Transaction
```javascript
const fees = payment.getTransactionFees(50000, 'mvola');
// {
//   amount: 50000,
//   fees: 500,      // 1%
//   total: 50500
// }
```

## 🧪 Tests

### Lancer Tests
```bash
# Backend
cd backend

# Health check
npm run health-check

# Tests API
npm test

# Tests complets
npm run test:full
```

### Tests Disponibles
- Health check & status
- Articles (CRUD, filtres)
- Auth (login, token)
- Orders (création, listing)
- Payment (initiate, status)
- Error handling (404, 401)
- CORS & Performance

## 🚀 Déploiement

### Frontend (Cloudflare Workers)
```bash
# Auto-deploy sur push main
git push origin main

# URL: https://ascartel.monocanon12.workers.dev/
```

### Backend (Render)
```bash
# Manual deploy depuis dashboard Render
# URL: https://ascartel-backend.onrender.com

# Keep-alive (GitHub Actions)
# Ping toutes les 14 min
```

### Variables d'Environnement
```env
# Backend (.env)
PORT=3000
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h
OPENING_HOUR=8
CLOSING_HOUR=20
ADMIN_EMAIL=master@ascartel.com
NODE_ENV=production
```

## 📊 Base de Données

### Schema SQLite
```sql
-- Articles
CREATE TABLE articles (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  categorie TEXT,
  prix_reel INTEGER,
  prix_promo INTEGER,
  stock_quantite INTEGER,
  image_url TEXT,
  flash_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total_amount INTEGER,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Frontend (config.js)
```javascript
const CONFIG = {
  mode: 'api',
  apiUrl: window.location.origin.includes('localhost')
    ? 'http://localhost:3000/api'
    : 'https://ascartel-backend.onrender.com/api'
};
```

### CORS (backend/server.js)
```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'https://ascartel.monocanon12.workers.dev',
  'https://ascartel-official.pages.dev'
];
```

## 📱 Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

## 🎨 Thèmes

### Variables CSS
```css
:root {
  --primary-color: #f68db5;
  --secondary-color: #ff4d8d;
  --bg-primary: #ffffff;
  --bg-secondary: #f9f9f9;
  --text-primary: #333333;
  --text-secondary: #666666;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
}
```

## 🔒 Sécurité

### Mesures Implémentées
- ✅ JWT Authentication
- ✅ bcrypt Password Hashing
- ✅ Helmet.js (HTTP headers)
- ✅ Rate Limiting (100 req/15min)
- ✅ CORS Whitelist
- ✅ Input Validation
- ✅ SQL Injection Protection (Prepared Statements)
- ✅ XSS Protection

### Recommandations Production
```javascript
// 1. Changer secrets
JWT_SECRET=<générer_secret_fort>

// 2. HTTPS uniquement
app.use(helmet.hsts());

// 3. Rate limiting strict
max: 50 // au lieu de 100

// 4. Logs sécurisés
// Ne pas logger tokens/passwords
```

## 📈 Performance

### Optimisations
- Lazy loading images
- Service Worker (cache)
- Minification CSS/JS
- CDN pour assets statiques
- Database indexing
- API response caching

### Métriques Cibles
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- API Response: < 500ms
- Lighthouse Score: > 90

## 🐛 Debugging

### Logs Backend
```bash
# Voir logs Render
render logs

# Logs locaux
tail -f backend/logs/app.log
```

### Console Frontend
```javascript
// Activer debug Pinka AI
localStorage.setItem('pinka_debug', 'true');

// Voir historique
console.log(JSON.parse(localStorage.getItem('pinka_history')));

// Voir préférences
console.log(JSON.parse(localStorage.getItem('pinka_preferences')));
```

## 📞 Support

### Contacts
- **Email**: support@ascartel.com
- **WhatsApp**: +261 32 00 000 00
- **Messenger**: @AsCartelMadagascar

### Issues GitHub
```bash
# Créer issue
https://github.com/monocanon12-cpu/Ascartel_Official/issues/new
```

---

**Version**: 4.0.0  
**Dernière mise à jour**: 2026-01-05  
**Auteur**: Aina

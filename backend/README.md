# ASCARTEL Backend API

API REST pour la gestion des articles, ventes flash et administration de la boutique ASCARTEL.

## 🚀 Installation

```bash
cd backend
npm install
npm run init-db  # Initialise la base de données
npm start        # Démarre le serveur
```

## 🔐 Identifiants

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `master@ascartel.com` | `ASCARTEL_MASTER_2025` |
| Collaborateur | `vendeur@ascartel.com` | `Vente123` |

## 📡 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur (auth requise)
- `POST /api/auth/logout` - Déconnexion

### Articles (Public)
- `GET /api/articles` - Liste des articles
- `GET /api/articles/:id` - Détail d'un article
- `GET /api/articles/categories` - Liste des catégories
- `GET /api/articles/flash-sales` - Articles en vente flash

### Articles (Admin)
- `POST /api/articles` - Créer un article
- `PUT /api/articles/:id` - Modifier un article
- `PATCH /api/articles/:id/stock` - Modifier le stock
- `PATCH /api/articles/:id/flash` - Activer/désactiver vente flash
- `DELETE /api/articles/:id` - Supprimer un article

### Paramètres
- `GET /api/settings/status` - Statut de la boutique (public)
- `GET /api/settings` - Tous les paramètres (admin)
- `PUT /api/settings/hours` - Modifier les horaires (admin)
- `PUT /api/settings/store` - Ouvrir/fermer la boutique (admin)
- `PUT /api/settings/flash-global` - Activer/désactiver toutes les ventes flash (admin)

### Commandes
- `POST /api/orders` - Créer une commande (vérifie les horaires)
- `GET /api/orders` - Liste des commandes (staff)
- `GET /api/orders/:id` - Détail d'une commande (staff)
- `PATCH /api/orders/:id/status` - Modifier le statut (staff)

## 🔒 Sécurité

- Authentification JWT
- Mots de passe hashés avec bcrypt
- Middleware de vérification des rôles
- Blocage des transactions hors horaires

## 📊 Schéma Base de Données

```sql
-- Utilisateurs
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  name TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

-- Articles
CREATE TABLE articles (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  categorie TEXT,
  image_url TEXT,
  prix_reel REAL NOT NULL,
  prix_promo REAL,
  stock_quantite INTEGER DEFAULT 0,
  flash_active INTEGER DEFAULT 0,
  date_debut_flash DATETIME,
  date_fin_flash DATETIME,
  actif INTEGER DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
);

-- Paramètres
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME
);

-- Commandes
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME,
  updated_at DATETIME
);

-- Lignes de commande
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);
```

# 🛍️ AsCartel - Boutique en ligne moderne

![AsCartel Banner](https://via.placeholder.com/1200x300/f68db5/ffffff?text=AsCartel+-+Mode+Tendance+Madagascar)

## 📋 Description

**AsCartel** est une plateforme e-commerce moderne et élégante spécialisée dans la mode à Madagascar. Le projet offre une expérience d'achat fluide avec des fonctionnalités avancées comme les ventes flash, un système de panier intelligent, et une interface responsive.

## ✨ Fonctionnalités

### 🎨 Frontend
- ✅ Interface moderne et responsive
- ✅ Mode sombre/clair
- ✅ Système de filtrage avancé (genre, catégorie, prix)
- ✅ Ventes flash avec compte à rebours
- ✅ Panier et liste de souhaits
- ✅ Chatbot d'assistance (Pinka)
- ✅ Recherche dynamique
- ✅ Animations fluides
- ✅ SEO optimisé

### 🔧 Backend (API REST)
- ✅ Authentification JWT
- ✅ Gestion des articles
- ✅ Système de ventes flash
- ✅ Gestion des commandes
- ✅ Horaires d'ouverture configurables
- ✅ Base de données SQLite
- ✅ Middleware de sécurité

### 👥 Rôles utilisateurs
- **Admin** : Gestion complète (articles, commandes, paramètres)
- **Collaborateur** : Gestion des commandes et consultation
- **Client** : Navigation et achat

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/VOTRE_USERNAME/ascartel-official.git
cd ascartel-official
```

### 2. Installer le backend
```bash
cd backend
npm install
npm run init-db  # Initialiser la base de données
npm start        # Démarrer le serveur (port 3000)
```

### 3. Lancer le frontend
```bash
# Option 1 : Ouvrir index.html directement dans un navigateur

# Option 2 : Utiliser un serveur local
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080
```

## ⚙️ Configuration

### Mode de fonctionnement

Dans `config.js`, vous pouvez choisir entre deux modes :

```javascript
const CONFIG = {
  mode: 'standalone', // ou 'api'
  apiUrl: 'http://localhost:3000/api',
  // ...
};
```

- **`standalone`** : Utilise les produits de démonstration (pas besoin du backend)
- **`api`** : Se connecte au backend (nécessite que le serveur soit lancé)

### Variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
JWT_SECRET=VOTRE_CLE_SECRETE_ICI
JWT_EXPIRES_IN=24h
OPENING_HOUR=8
CLOSING_HOUR=20
ADMIN_EMAIL=master@ascartel.com
```

## 🔐 Identifiants par défaut

### Admin
- **Email** : `master@ascartel.com`
- **Mot de passe** : `ASCARTEL_MASTER_2025`

### Collaborateur
- **Email** : `vendeur@ascartel.com`
- **Mot de passe** : `Vente123`

⚠️ **Important** : Changez ces identifiants en production !

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion

### Articles
- `GET /api/articles` - Liste des articles
- `GET /api/articles/:id` - Détail d'un article
- `GET /api/articles/flash-sales` - Ventes flash
- `POST /api/articles` - Créer un article (Admin)
- `PUT /api/articles/:id` - Modifier un article (Admin)
- `DELETE /api/articles/:id` - Supprimer un article (Admin)

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Liste des commandes (Staff)
- `GET /api/orders/:id` - Détail d'une commande (Staff)
- `PATCH /api/orders/:id/status` - Modifier le statut (Staff)

### Paramètres
- `GET /api/settings/status` - Statut de la boutique
- `PUT /api/settings/hours` - Modifier les horaires (Admin)
- `PUT /api/settings/store` - Ouvrir/Fermer la boutique (Admin)

## 🗂️ Structure du projet

```
ascartel-official/
├── backend/
│   ├── config/          # Configuration (DB, settings)
│   ├── data/            # Base de données SQLite
│   ├── middleware/      # Middlewares (auth, businessHours)
│   ├── routes/          # Routes API
│   ├── scripts/         # Scripts utilitaires
│   ├── utils/           # Fonctions utilitaires
│   ├── .env             # Variables d'environnement
│   ├── package.json
│   └── server.js        # Point d'entrée
├── *.html               # Pages HTML
├── *.css                # Feuilles de style
├── *.js                 # Scripts frontend
├── config.js            # Configuration frontend
└── README.md
```

## 🛠️ Technologies utilisées

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome (icônes)
- Google Fonts (Poppins)

### Backend
- Node.js + Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs (hachage des mots de passe)

## 📱 Responsive Design

Le site est entièrement responsive et optimisé pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🎨 Thèmes

- 🌞 Mode clair (par défaut)
- 🌙 Mode sombre (toggle disponible)

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Mots de passe hachés (bcrypt)
- ✅ Protection CORS
- ✅ Validation des données
- ✅ Middleware d'autorisation

## 📈 Améliorations futures

- [ ] Système de paiement (Stripe, PayPal)
- [ ] Envoi d'emails (confirmation de commande)
- [ ] Gestion des images (upload)
- [ ] Système de notation des produits
- [ ] Historique des commandes pour les clients
- [ ] Dashboard analytics pour l'admin
- [ ] Multi-langues (FR/MG/EN)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Aina**
- GitHub: [@VOTRE_USERNAME](https://github.com/VOTRE_USERNAME)

## 🙏 Remerciements

- Font Awesome pour les icônes
- Google Fonts pour la typographie
- La communauté open source

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous plaît !** ⭐

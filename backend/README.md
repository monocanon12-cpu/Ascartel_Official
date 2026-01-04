# 🚀 ASCARTEL Backend API

Backend REST API pour la plateforme e-commerce ASCARTEL, optimisé pour la production.

## ✨ Fonctionnalités

- ✅ **Authentification JWT** sécurisée
- ✅ **Rate Limiting** anti-DDoS
- ✅ **Helmet** protection headers HTTP
- ✅ **Logging structuré** avec Winston
- ✅ **Health Check** avancé
- ✅ **Backup automatique** de la base de données
- ✅ **Support Docker** et PM2
- ✅ **CORS** configuré
- ✅ **Validation** des données
- ✅ **Gestion gracieuse** des arrêts

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier de configuration
cp .env.example .env

# Éditer .env et configurer vos variables
nano .env

# Initialiser la base de données
npm run init-db

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

## 📋 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarrer le serveur |
| `npm run dev` | Mode développement (nodemon) |
| `npm run init-db` | Initialiser la base de données |
| `npm run backup-db` | Créer un backup de la DB |
| `npm run health-check` | Vérifier la santé du serveur |
| `npm run test-api` | Tester toutes les routes API |
| `npm run pm2:start` | Démarrer avec PM2 |
| `npm run docker:run` | Lancer avec Docker Compose |

## 🔐 Variables d'Environnement

Voir `.env.example` pour la liste complète. Variables essentielles :

```env
PORT=3000
JWT_SECRET=votre_cle_secrete_forte
FRONTEND_URL=https://votre-frontend.com
NODE_ENV=production
```

⚠️ **Générer une clé JWT forte :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📡 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion

### Articles
- `GET /api/articles` - Liste des articles
- `GET /api/articles/:id` - Détail d'un article
- `GET /api/articles/flash-sales` - Ventes flash
- `POST /api/articles` - Créer (Admin)
- `PUT /api/articles/:id` - Modifier (Admin)
- `DELETE /api/articles/:id` - Supprimer (Admin)

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Liste (Staff)
- `GET /api/orders/:id` - Détail (Staff)
- `PATCH /api/orders/:id/status` - Modifier statut (Staff)

### Paramètres
- `GET /api/settings/status` - Statut boutique
- `PUT /api/settings/hours` - Modifier horaires (Admin)
- `PUT /api/settings/store` - Ouvrir/Fermer (Admin)

### Système
- `GET /api/health` - Health check

## 🚀 Déploiement

Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour les guides détaillés :

- Heroku
- Render
- Railway
- Docker
- VPS avec PM2
- Nginx reverse proxy

## 🔒 Sécurité

- ✅ Helmet (protection headers)
- ✅ Rate Limiting (100 req/15min en prod)
- ✅ Auth Rate Limiting (5 req/15min)
- ✅ CORS configuré
- ✅ JWT avec expiration
- ✅ Mots de passe hashés (bcrypt)
- ✅ Validation des entrées
- ✅ Logs sécurisés

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Logs
```bash
# PM2
pm2 logs ascartel-api

# Docker
docker logs ascartel-backend

# Fichiers
tail -f logs/combined.log
```

## 🔄 Backup & Maintenance

### Backup manuel
```bash
npm run backup-db
```

### Backup automatique (cron)
```bash
# Tous les jours à 2h du matin
0 2 * * * cd /chemin/vers/backend && npm run backup-db
```

Les backups sont stockés dans `data/backups/` (10 derniers conservés).

## 🐳 Docker

### Build
```bash
docker build -t ascartel-api .
```

### Run
```bash
docker-compose up -d
```

### Logs
```bash
docker logs -f ascartel-backend
```

## 🧪 Tests

```bash
# Tester toutes les routes
npm run test-api

# Health check
npm run health-check
```

## 📁 Structure

```
backend/
├── config/          # Configuration (DB, settings)
├── data/            # Base de données SQLite
│   └── backups/     # Backups automatiques
├── logs/            # Logs Winston
├── middleware/      # Middlewares (auth, validation)
├── routes/          # Routes API
├── scripts/         # Scripts utilitaires
├── utils/           # Fonctions utilitaires
├── .env.example     # Template variables d'environnement
├── Dockerfile       # Configuration Docker
├── ecosystem.config.js  # Configuration PM2
├── nginx.conf       # Configuration Nginx
├── Procfile         # Configuration Heroku
└── server.js        # Point d'entrée
```

## 🔧 Technologies

- **Runtime** : Node.js 14+
- **Framework** : Express.js
- **Base de données** : SQLite (better-sqlite3)
- **Authentification** : JWT (jsonwebtoken)
- **Sécurité** : Helmet, bcryptjs, express-rate-limit
- **Validation** : express-validator, Joi
- **Logging** : Winston
- **Cache** : node-cache

## 📝 Identifiants par Défaut

### Admin
- Email : `master@ascartel.com`
- Mot de passe : `ASCARTEL_MASTER_2025`

⚠️ **Changez ces identifiants en production !**

## 🆘 Dépannage

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
# Tuer le processus
kill -9 <PID>
```

### Erreur de base de données
```bash
# Réinitialiser
rm data/ascartel.db
npm run init-db
```

### Erreur JWT
```bash
# Vérifier la variable
echo $JWT_SECRET
# Régénérer une clé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📈 Roadmap

- [ ] Migration PostgreSQL
- [ ] Tests unitaires (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] Swagger documentation
- [ ] WebSocket pour notifications temps réel
- [ ] Redis pour le cache
- [ ] Elasticsearch pour la recherche

## 📄 Licence

ISC

## 👨‍💻 Auteur

**ASCARTEL Team**

---

⭐ **N'oubliez pas de sécuriser vos variables d'environnement en production !**

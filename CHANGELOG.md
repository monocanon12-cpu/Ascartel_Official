# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-01-XX

### ✨ Ajouté
- Authentification JWT sécurisée
- Gestion des articles avec ventes flash
- Système de commandes
- Gestion des horaires d'ouverture
- Rate limiting anti-DDoS (100 req/15min)
- Rate limiting authentification (5 req/15min)
- Helmet pour la sécurité des headers
- Logging structuré avec Winston
- Health check avancé avec infos DB
- Backup automatique de la base de données
- Scripts de maintenance (backup, health-check, test-api)
- Support Docker avec Dockerfile et docker-compose
- Configuration PM2 pour production
- Configuration Nginx pour reverse proxy
- Procfile pour Heroku
- Guide de déploiement complet (DEPLOYMENT.md)
- CI/CD avec GitHub Actions
- Gestion gracieuse des arrêts (SIGTERM, SIGINT)
- Documentation de sécurité (SECURITY.md)
- Validation des données avec express-validator et Joi
- Cache avec node-cache
- CORS configuré pour production

### 🔒 Sécurité
- Mots de passe hashés avec bcrypt
- JWT avec expiration configurable
- Protection contre les injections SQL
- Validation stricte des entrées
- Headers HTTP sécurisés (Helmet)
- Rate limiting sur toutes les routes
- Logs sécurisés (pas de données sensibles)

### 📚 Documentation
- README.md complet
- DEPLOYMENT.md avec guides pour Heroku, Render, Railway, Docker, PM2
- SECURITY.md avec politique de sécurité
- .env.example avec toutes les variables
- Commentaires dans le code

### 🛠️ Infrastructure
- SQLite pour le développement
- Support PostgreSQL/MySQL (à venir)
- Backups automatiques (10 derniers conservés)
- Logs rotatifs
- Monitoring avec health check

### 🧪 Tests
- Script de test API automatisé
- Health check endpoint
- Tests de toutes les routes principales

## [0.1.0] - 2025-01-XX (Beta)

### Ajouté
- Structure de base du projet
- Routes API basiques
- Authentification simple
- Base de données SQLite

---

## Types de changements

- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔄 Modifié` : Changements dans les fonctionnalités existantes
- `🗑️ Déprécié` : Fonctionnalités bientôt supprimées
- `❌ Supprimé` : Fonctionnalités supprimées
- `🐛 Corrigé` : Corrections de bugs
- `🔒 Sécurité` : Corrections de vulnérabilités

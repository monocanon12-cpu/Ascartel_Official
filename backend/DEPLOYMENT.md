# 🚀 Guide de Déploiement ASCARTEL Backend

## 📋 Prérequis

- Node.js 14+ installé
- npm ou yarn
- Compte sur une plateforme d'hébergement (Heroku, Render, Railway, etc.)

---

## 🔧 Configuration Initiale

### 1. Variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```bash
cp .env.example .env
```

**Variables OBLIGATOIRES en production :**

```env
PORT=3000
JWT_SECRET=VOTRE_CLE_SECRETE_FORTE_ICI
FRONTEND_URL=https://votre-domaine-frontend.com
NODE_ENV=production
```

⚠️ **IMPORTANT** : Générez une clé JWT forte :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🌐 Déploiement sur Heroku

### 1. Installation Heroku CLI
```bash
npm install -g heroku
heroku login
```

### 2. Créer l'application
```bash
heroku create ascartel-api
```

### 3. Configurer les variables d'environnement
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_cle_secrete
heroku config:set FRONTEND_URL=https://votre-frontend.com
heroku config:set OPENING_HOUR=8
heroku config:set CLOSING_HOUR=20
```

### 4. Déployer
```bash
git push heroku main
```

### 5. Initialiser la base de données
```bash
heroku run npm run init-db
```

### 6. Vérifier le déploiement
```bash
heroku logs --tail
heroku open /api/health
```

---

## 🎯 Déploiement sur Render

### 1. Créer un nouveau Web Service
- Connectez votre repo GitHub
- Sélectionnez le dossier `backend`

### 2. Configuration
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Environment** : Node

### 3. Variables d'environnement
Ajoutez dans le dashboard Render :
```
NODE_ENV=production
JWT_SECRET=votre_cle_secrete
FRONTEND_URL=https://votre-frontend.com
PORT=3000
```

### 4. Déployer
Render déploie automatiquement à chaque push sur la branche principale.

---

## 🚂 Déploiement sur Railway

### 1. Installation Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Initialiser le projet
```bash
railway init
```

### 3. Configurer les variables
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=votre_cle_secrete
railway variables set FRONTEND_URL=https://votre-frontend.com
```

### 4. Déployer
```bash
railway up
```

---

## 🐳 Déploiement avec Docker

### 1. Build l'image
```bash
npm run docker:build
```

### 2. Lancer avec Docker Compose
```bash
npm run docker:run
```

### 3. Vérifier
```bash
docker ps
docker logs ascartel-backend
```

---

## 🔄 Déploiement avec PM2 (VPS)

### 1. Installer PM2
```bash
npm install -g pm2
```

### 2. Démarrer l'application
```bash
npm run pm2:start
```

### 3. Configurer le démarrage automatique
```bash
pm2 startup
pm2 save
```

### 4. Commandes utiles
```bash
npm run pm2:logs      # Voir les logs
npm run pm2:restart   # Redémarrer
npm run pm2:stop      # Arrêter
```

---

## 📊 Monitoring et Maintenance

### Health Check
```bash
npm run health-check
```

### Backup de la base de données
```bash
npm run backup-db
```

### Automatiser les backups (cron)
```bash
# Ajouter dans crontab -e
0 2 * * * cd /chemin/vers/backend && npm run backup-db
```

---

## 🔒 Checklist de Sécurité

- [ ] JWT_SECRET changé et fort (64+ caractères)
- [ ] FRONTEND_URL configuré avec le bon domaine
- [ ] NODE_ENV=production
- [ ] Helmet activé (✅ déjà fait)
- [ ] Rate limiting activé (✅ déjà fait)
- [ ] CORS configuré correctement
- [ ] Logs activés
- [ ] Backups automatiques configurés
- [ ] HTTPS activé sur l'hébergeur
- [ ] Variables sensibles dans .env (pas dans le code)

---

## 🧪 Tests Post-Déploiement

### 1. Tester le health check
```bash
curl https://votre-api.com/api/health
```

### 2. Tester l'authentification
```bash
curl -X POST https://votre-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@ascartel.com","password":"ASCARTEL_MASTER_2025"}'
```

### 3. Tester les articles
```bash
curl https://votre-api.com/api/articles
```

---

## 🆘 Dépannage

### Erreur de connexion DB
```bash
# Réinitialiser la base de données
npm run init-db
```

### Erreur JWT
```bash
# Vérifier que JWT_SECRET est défini
echo $JWT_SECRET
```

### Logs
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs ascartel-api

# Docker
docker logs ascartel-backend
```

---

## 📈 Optimisations Recommandées

1. **CDN** : Utilisez Cloudflare pour le cache et la protection DDoS
2. **Monitoring** : Configurez UptimeRobot ou Pingdom
3. **Logs** : Intégrez Loggly ou Papertrail
4. **Base de données** : Migrez vers PostgreSQL pour la production
5. **Backups** : Configurez des backups automatiques quotidiens

---

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du serveur
2. Les variables d'environnement
3. La connexion à la base de données
4. La configuration CORS

---

**Bon déploiement ! 🚀**

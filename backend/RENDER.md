# 🚀 Déploiement AsCartel Backend sur Render

Guide pas à pas pour héberger votre backend sur Render.

---

## ✅ Prérequis

- ✅ Backend dans le dossier `/backend`
- ✅ Fichier principal : `server.js`
- ✅ `package.json` configuré
- ✅ Code poussé sur GitHub

---

## 📋 Réponses aux questions

**1️⃣ Le fichier principal s'appelle comment ?**
→ `server.js`

**2️⃣ Ton backend est à la racine ou dans `/backend` ?**
→ Dans le dossier `/backend`

---

## 🟢 ÉTAPE 1 — Vérification locale

Dans le terminal :

```bash
cd backend
npm install
npm start
```

Ouvrir le navigateur : `http://localhost:3000`

✅ Résultat attendu :
```json
{
  "message": "Backend AsCartel en ligne 🚀",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

Tester le health check : `http://localhost:3000/api/health`

---

## 🟢 ÉTAPE 2 — Push sur GitHub

```bash
git add .
git commit -m "Backend AsCartel prêt pour Render"
git push
```

Vérifier sur GitHub que ces fichiers sont présents :
- ✅ `backend/package.json`
- ✅ `backend/server.js`
- ✅ `backend/render.yaml`

---

## 🟢 ÉTAPE 3 — Créer le service sur Render

1. Aller sur 👉 https://render.com
2. Cliquer sur **Dashboard**
3. Cliquer sur **New +**
4. Sélectionner **Web Service**

---

## 🟢 ÉTAPE 4 — Connecter GitHub

1. Connecter votre compte GitHub
2. Sélectionner le repository **AsCartel Official** (ou le nom de votre repo)

---

## 🟢 ÉTAPE 5 — Configuration Render

### 🔹 Name
```
ascartel-backend
```

### 🔹 Runtime
```
Node
```

### 🔹 Branch
```
main
```
(ou `master` selon votre branche principale)

### 🔹 Root Directory
```
backend
```
⚠️ **IMPORTANT** : Votre backend est dans le dossier `/backend`

### 🔹 Build Command
```bash
npm install && node scripts/init-db.js
```

### 🔹 Start Command
```bash
npm start
```

### 🔹 Plan
```
Free
```

---

## 🟢 ÉTAPE 6 — Variables d'environnement

Avant de cliquer sur "Create", ajouter ces variables :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Générer une clé forte (voir ci-dessous) |
| `JWT_EXPIRES_IN` | `24h` |
| `OPENING_HOUR` | `8` |
| `CLOSING_HOUR` | `20` |
| `ADMIN_EMAIL` | `master@ascartel.com` |
| `FRONTEND_URL` | Votre URL Netlify (à ajouter plus tard) |

### 🔐 Générer JWT_SECRET

Dans votre terminal local :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier le résultat et le coller dans `JWT_SECRET`.

---

## 🟢 ÉTAPE 7 — Déployer

Cliquer sur **Create Web Service** 🚀

Render va :
1. Cloner votre repo
2. Installer les dépendances (`npm install`)
3. Initialiser la base de données (`node scripts/init-db.js`)
4. Démarrer le serveur (`npm start`)

⏱️ Attendre 2-5 minutes...

---

## 🟢 ÉTAPE 8 — Vérifier le déploiement

Render vous donnera une URL, par exemple :
```
https://ascartel-backend.onrender.com
```

### Test 1 : Route racine
```
https://ascartel-backend.onrender.com/
```

✅ Résultat attendu :
```json
{
  "message": "Backend AsCartel en ligne 🚀",
  "version": "1.0.0"
}
```

### Test 2 : Health check
```
https://ascartel-backend.onrender.com/api/health
```

✅ Résultat attendu :
```json
{
  "success": true,
  "status": "operational",
  "database": {
    "status": "connected",
    "articlesCount": 50
  }
}
```

### Test 3 : Articles
```
https://ascartel-backend.onrender.com/api/articles
```

✅ Doit retourner la liste des articles

---

## 🎉 Félicitations !

Votre backend AsCartel est maintenant en ligne sur Render !

---

## 🔄 Déploiement automatique

Chaque fois que vous faites :
```bash
git push
```

Render redéploie automatiquement votre backend ! 🚀

---

## 🔗 Prochaine étape : Connecter le frontend

1. Copier l'URL Render : `https://ascartel-backend.onrender.com`

2. Dans votre frontend (`config.js`), modifier :
```javascript
const CONFIG = {
  mode: 'api',
  apiUrl: 'https://ascartel-backend.onrender.com/api',
  // ...
};
```

3. Ajouter l'URL Netlify dans les variables Render :
   - Aller dans **Environment** sur Render
   - Ajouter `FRONTEND_URL` = `https://votre-site.netlify.app`
   - Sauvegarder (redéploiement automatique)

---

## ⚠️ Note importante (Plan Free)

Le plan gratuit de Render :
- ✅ Parfait pour débuter
- ⚠️ Le serveur s'endort après 15 min d'inactivité
- ⏱️ Premier chargement peut prendre 30-60 secondes

Pour éviter ça :
- Passer au plan payant ($7/mois)
- Ou utiliser un service de ping (UptimeRobot)

---

## 🆘 Dépannage

### Erreur "Build failed"
→ Vérifier que `Root Directory` = `backend`

### Erreur "Application failed to respond"
→ Vérifier les logs Render
→ S'assurer que `process.env.PORT` est utilisé

### Erreur de base de données
→ Vérifier que `npm run init-db` s'est bien exécuté dans les logs

### CORS Error depuis le frontend
→ Ajouter `FRONTEND_URL` dans les variables d'environnement Render

---

## 📞 Support

En cas de problème :
1. Consulter les logs Render (onglet "Logs")
2. Tester les endpoints avec Postman
3. Vérifier les variables d'environnement

---

**Bon déploiement ! 🚀**

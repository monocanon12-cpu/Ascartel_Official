# 🚀 Guide de Démarrage Rapide - AsCartel

## ⚡ Démarrage en 3 Minutes

### Option 1 : Mode Standalone (Sans Backend)
```bash
# 1. Ouvrir le fichier
open index.html

# OU avec serveur local
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080
```

### Option 2 : Mode Complet (Avec Backend)
```bash
# Terminal 1 : Démarrer le backend
cd backend
npm install
npm run init-db
npm start

# Terminal 2 : Démarrer le frontend
python3 -m http.server 8080
```

## 🔑 Connexion Rapide

### Admin
```
Email : master@ascartel.com
Mot de passe : ASCARTEL_MASTER_2025
```

### Client
- Cliquer sur "Se connecter avec Google"
- OU "Se connecter avec Facebook"

## ✅ Vérification Rapide

### 1. Frontend
- ✅ Ouvrir http://localhost:8080
- ✅ Voir les produits affichés
- ✅ Cliquer sur un filtre (Femme, Homme, etc.)
- ✅ Ajouter un produit au panier
- ✅ Ajouter un produit aux favoris
- ✅ Se connecter avec Google/Facebook
- ✅ Accéder au dashboard client

### 2. Backend (si lancé)
- ✅ Ouvrir http://localhost:3000
- ✅ Voir le message de bienvenue
- ✅ Tester http://localhost:3000/api/health
- ✅ Tester http://localhost:3000/api/articles

## 🎯 Fonctionnalités Principales

### Pour les Visiteurs
1. **Parcourir** : Voir tous les produits
2. **Filtrer** : Par genre, catégorie, prix
3. **Rechercher** : Barre de recherche dynamique
4. **Ventes Flash** : Promotions avec compte à rebours

### Pour les Clients Connectés
1. **Dashboard** : Espace personnel avec stats
2. **Panier** : Gestion des achats
3. **Favoris** : Liste de souhaits
4. **Profil** : Informations personnelles

### Pour les Admins
1. **Gestion articles** : CRUD complet
2. **Commandes** : Suivi et statuts
3. **Paramètres** : Configuration boutique
4. **Import** : Ajout en masse

## 🐛 Résolution Rapide

### Problème : Produits ne s'affichent pas
**Solution** :
1. Vérifier que le backend est lancé
2. OU passer en mode standalone dans `config.js`
```javascript
mode: 'standalone'
```

### Problème : Erreur de connexion
**Solution** :
1. Vérifier Firebase config dans `firebase-config.js`
2. Vérifier que les identifiants sont corrects
3. Vider le cache du navigateur

### Problème : Panier ne se met pas à jour
**Solution** :
1. Ouvrir la console (F12)
2. Vérifier localStorage : `localStorage.getItem('cart')`
3. Vider si nécessaire : `localStorage.clear()`

## 📊 URLs Importantes

### Local
- Frontend : http://localhost:8080
- Backend : http://localhost:3000
- API Health : http://localhost:3000/api/health
- API Articles : http://localhost:3000/api/articles

### Production
- Frontend : https://flourishing-kitten-4a42c7.netlify.app
- Backend : https://ascartel-backend.onrender.com
- API Health : https://ascartel-backend.onrender.com/api/health

## 🎨 Personnalisation Rapide

### Changer les couleurs
Éditer `style.css` :
```css
:root {
  --primary-color: #f68db5; /* Rose */
  --secondary-color: #1a1a2e; /* Noir */
}
```

### Ajouter des produits
1. Se connecter en admin
2. Aller sur admin-articles.html
3. Cliquer "Ajouter un article"
4. OU utiliser admin-import-bulk.html

### Modifier le logo
Remplacer `logo.png` par votre image

## 📱 Test Mobile

### Chrome DevTools
1. F12 pour ouvrir DevTools
2. Ctrl+Shift+M pour mode mobile
3. Tester différentes tailles

### Appareils Réels
- Scanner le QR code de l'URL locale
- OU utiliser ngrok pour tunnel public

## 🔒 Sécurité

### En Production
1. ✅ Changer JWT_SECRET dans .env
2. ✅ Changer les mots de passe admin
3. ✅ Activer HTTPS
4. ✅ Configurer CORS correctement
5. ✅ Limiter rate limiting

### Variables d'Environnement
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=votre_secret_64_caracteres
FRONTEND_URL=https://votre-domaine.com
```

## 📈 Monitoring

### Logs Backend
```bash
# Voir les logs en temps réel
tail -f backend/logs/combined.log

# Voir les erreurs
tail -f backend/logs/error.log
```

### Health Check
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://ascartel-backend.onrender.com/api/health
```

## 🎉 Prêt !

Votre boutique AsCartel est maintenant opérationnelle !

**Prochaines étapes** :
1. ✅ Ajouter vos propres produits
2. ✅ Personnaliser les couleurs/logo
3. ✅ Configurer le paiement (Stripe/PayPal)
4. ✅ Ajouter votre domaine personnalisé
5. ✅ Activer les emails de confirmation

---

**Besoin d'aide ?** Consultez `VERIFICATION-COMPLETE.md` pour plus de détails.

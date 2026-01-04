# 🎯 GUIDE COMPLET ASCARTEL - Tout ce que vous devez savoir

## 📍 OÙ VOUS EN ÊTES

✅ Backend déployé sur Render : https://ascartel-backend.onrender.com
✅ Frontend déployé sur Netlify : https://flourishing-kitten-4a42c7.netlify.app
✅ Code sur GitHub

---

## 🔧 CE QU'IL RESTE À FAIRE

### ÉTAPE 1 : Configurer les variables sur Render (5 min)

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service "ascartel-backend"
3. Menu à gauche → "Environment"
4. Ajoutez ces 3 variables (cliquez "Add Environment Variable" pour chacune) :

```
NODE_ENV=production
JWT_SECRET=6635f20b4e1f077c669dc826edbfe4c598caf1975791baafdcfef4b55110af3e5047c75d5af321535f20a4d67c919114b80d4da4d86126728d0250c3d68f8e2d
FRONTEND_URL=https://flourishing-kitten-4a42c7.netlify.app
```

5. Cliquez "Save Changes"
6. Attendez 2 minutes que le service redémarre

---

### ÉTAPE 2 : Mettre à jour le fichier admin-articles.html

Dans le fichier `admin-articles.html`, ligne 1050 environ, changez :

```javascript
// AVANT
const API_URL = 'http://localhost:3000/api';

// APRÈS
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://ascartel-backend.onrender.com/api';
```

Puis :
```bash
git add admin-articles.html
git commit -m "Update API URL for production"
git push
```

Netlify redéploiera automatiquement.

---

## 👤 COMMENT SE CONNECTER EN ADMIN

### Sur votre site Netlify :

1. Allez sur : https://flourishing-kitten-4a42c7.netlify.app/admin-articles.html
2. La page se connecte automatiquement avec :
   - Email : `master@ascartel.com`
   - Mot de passe : `ASCARTEL_MASTER_2025`

---

## 📦 COMMENT AJOUTER VOS ARTICLES

### Méthode 1 : Via l'interface (recommandé)

1. Allez sur : https://flourishing-kitten-4a42c7.netlify.app/admin-articles.html
2. Cliquez sur "Ajouter un article"
3. Remplissez le formulaire :
   - **Nom** : Ex: "Robe Élégante Rose"
   - **Description** : Décrivez le produit
   - **Catégorie** : Robes, Tops, Pantalons, etc.
   - **Stock** : Quantité disponible
   - **Prix normal** : Prix en Ariary
   - **Prix promo** : Si vous voulez une réduction
   - **Image** : Uploadez depuis votre PC ou mettez une URL
   - **Vente Flash** : Cochez si c'est une promo
4. Cliquez "Enregistrer"

### Méthode 2 : Import en masse

1. Allez sur : https://flourishing-kitten-4a42c7.netlify.app/admin-import-bulk.html
2. Préparez un fichier JSON avec tous vos articles
3. Importez-le

---

## 🔥 COMMENT ACTIVER UNE VENTE FLASH

1. Sur la page de gestion des articles
2. Trouvez l'article
3. Cliquez sur le bouton "Flash" (éclair)
4. L'article apparaîtra automatiquement dans les ventes flash du site

---

## 📊 SYSTÈME DE VENTES AUTOMATIQUE

**C'est déjà configuré !** Quand un client achète :

1. ✅ Le stock diminue automatiquement
2. ✅ La commande apparaît dans le dashboard admin
3. ✅ Si stock = 0, l'article disparaît du site
4. ✅ Les statistiques se mettent à jour

---

## 🎨 COMMENT AJOUTER DES IMAGES

### Option 1 : Depuis votre PC
1. Cliquez sur "Choisir une image depuis mon PC"
2. Sélectionnez l'image (max 5MB)
3. L'image sera convertie et sauvegardée automatiquement

### Option 2 : Avec une URL
1. Cliquez sur "Ou utiliser une URL"
2. Collez l'URL de l'image (ex: depuis Google Drive, Imgur, etc.)

---

## 📱 PAGES IMPORTANTES

### Pour vous (Admin) :
- Dashboard : https://flourishing-kitten-4a42c7.netlify.app/admin-dashboard.html
- Gestion articles : https://flourishing-kitten-4a42c7.netlify.app/admin-articles.html
- Import en masse : https://flourishing-kitten-4a42c7.netlify.app/admin-import-bulk.html

### Pour les clients :
- Accueil : https://flourishing-kitten-4a42c7.netlify.app/
- Ventes Flash : https://flourishing-kitten-4a42c7.netlify.app/#flash-sales
- Panier : https://flourishing-kitten-4a42c7.netlify.app/panier.html

---

## 🔐 IDENTIFIANTS

### Admin Master
- Email : `master@ascartel.com`
- Mot de passe : `ASCARTEL_MASTER_2025`

⚠️ **IMPORTANT** : Changez ce mot de passe en production !

---

## ❓ QUESTIONS FRÉQUENTES

### Q : Les articles n'apparaissent pas sur le site ?
R : Vérifiez que :
1. Les variables d'environnement sont bien configurées sur Render
2. Le backend Render est bien "Live" (pas "Failed")
3. L'URL de l'API est correcte dans admin-articles.html

### Q : Comment modifier un article ?
R : Sur la page de gestion, cliquez sur "Modifier" sur l'article

### Q : Comment supprimer un article ?
R : Cliquez sur "Modifier", puis "Supprimer" en bas du formulaire

### Q : Un article est en rupture de stock, que faire ?
R : Modifiez l'article et augmentez le stock

### Q : Comment voir les commandes ?
R : Allez sur le Dashboard admin, section "Ventes Récentes"

---

## 🚨 EN CAS DE PROBLÈME

### Le backend ne répond pas
1. Allez sur https://dashboard.render.com
2. Vérifiez que le service est "Live"
3. Regardez les logs pour voir les erreurs

### Les articles ne se chargent pas
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs
3. Vérifiez que l'URL de l'API est correcte

### Erreur CORS
1. Vérifiez que FRONTEND_URL est bien configuré sur Render
2. Redémarrez le service Render

---

## 📞 RÉSUMÉ RAPIDE

1. **Ajouter un article** : admin-articles.html → "Ajouter un article"
2. **Activer vente flash** : Cliquez sur le bouton "Flash" sur l'article
3. **Voir les ventes** : admin-dashboard.html → Section "Ventes Récentes"
4. **Modifier le stock** : Cliquez sur "Modifier" → Changez le stock

---

**Votre site est prêt ! Il ne reste plus qu'à ajouter vos articles ! 🎉**

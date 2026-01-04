# 🔥 Configuration Firebase - Guide Complet

## 🎯 ÉTAPE 1 : Créer un projet Firebase (2 min)

1. Allez sur : https://console.firebase.google.com/
2. Cliquez sur **"Ajouter un projet"** ou **"Add project"**
3. Nom du projet : `AsCartel`
4. Cliquez **"Continuer"**
5. Désactivez Google Analytics (pas nécessaire pour l'instant)
6. Cliquez **"Créer le projet"**
7. Attendez 30 secondes, puis cliquez **"Continuer"**

---

## 🎯 ÉTAPE 2 : Ajouter une application Web (1 min)

1. Sur la page d'accueil du projet, cliquez sur l'icône **Web** `</>`
2. Nom de l'app : `AsCartel Web`
3. **NE PAS** cocher "Firebase Hosting"
4. Cliquez **"Enregistrer l'application"**

5. **COPIEZ** le code de configuration qui apparaît :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ascartel-xxxxx.firebaseapp.com",
  projectId: "ascartel-xxxxx",
  storageBucket: "ascartel-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

6. Cliquez **"Continuer vers la console"**

---

## 🎯 ÉTAPE 3 : Activer l'authentification (2 min)

### A) Activer Google

1. Menu gauche → **"Authentication"** (ou "Authentification")
2. Cliquez sur **"Get started"** (si première fois)
3. Onglet **"Sign-in method"**
4. Cliquez sur **"Google"**
5. Activez le bouton **"Enable"**
6. Email d'assistance : Votre email
7. Cliquez **"Save"**

### B) Activer Facebook

1. Toujours dans **"Sign-in method"**
2. Cliquez sur **"Facebook"**
3. Activez le bouton **"Enable"**

**IMPORTANT** : Notez l'URL de redirection OAuth :
```
https://ascartel-xxxxx.firebaseapp.com/__/auth/handler
```

4. **NE CLIQUEZ PAS ENCORE SUR SAVE**

---

## 🎯 ÉTAPE 4 : Créer l'App Facebook (3 min)

1. Ouvrez un nouvel onglet : https://developers.facebook.com/
2. Cliquez **"My Apps"** → **"Create App"**
3. Type : **"Consumer"** → **"Next"**
4. Nom : `AsCartel`
5. Email : Votre email
6. Cliquez **"Create App"**

### Configurer Facebook Login

1. Cherchez **"Facebook Login"** → **"Set Up"**
2. Plateforme : **"Web"**
3. Site URL : `https://flourishing-kitten-4a42c7.netlify.app`
4. **"Save"** → **"Continue"**

### Configurer les URLs OAuth

1. Menu gauche → **"Facebook Login"** → **"Settings"**
2. Dans **"Valid OAuth Redirect URIs"**, collez l'URL Firebase de l'étape 3B :
   ```
   https://ascartel-xxxxx.firebaseapp.com/__/auth/handler
   ```
3. Cliquez **"Save Changes"**

### Récupérer les clés

1. Menu gauche → **"Settings"** → **"Basic"**
2. Notez :
   - **App ID** : `123456789`
   - **App Secret** : Cliquez "Show" → Notez-le

---

## 🎯 ÉTAPE 5 : Finaliser Firebase avec Facebook

1. Retournez sur Firebase Console
2. Dans la config Facebook (étape 3B), entrez :
   - **App ID** : Celui de Facebook
   - **App Secret** : Celui de Facebook
3. Cliquez **"Save"**

---

## 🎯 ÉTAPE 6 : Configurer votre site (1 min)

1. Ouvrez le fichier `firebase-config.js` dans votre projet
2. Remplacez le contenu par votre configuration Firebase (étape 2) :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_API_KEY",
  authDomain: "ascartel-xxxxx.firebaseapp.com",
  projectId: "ascartel-xxxxx",
  storageBucket: "ascartel-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
```

3. Sauvegardez le fichier

---

## 🎯 ÉTAPE 7 : Déployer sur Netlify

```bash
git add .
git commit -m "Add Firebase authentication"
git push
```

Attendez 1 minute que Netlify redéploie.

---

## 🎯 ÉTAPE 8 : Ajouter le domaine Netlify dans Firebase

1. Firebase Console → **"Authentication"** → **"Settings"**
2. Onglet **"Authorized domains"**
3. Cliquez **"Add domain"**
4. Ajoutez : `flourishing-kitten-4a42c7.netlify.app`
5. Cliquez **"Add"**

---

## 🧪 ÉTAPE 9 : Tester !

1. Allez sur : https://flourishing-kitten-4a42c7.netlify.app/login.html
2. Cliquez sur **"Se connecter avec Google"**
3. Choisissez votre compte Google
4. ✅ Vous devriez être redirigé vers la page d'accueil !

5. Testez aussi **"Se connecter avec Facebook"**

---

## ✅ C'est terminé !

Vos clients peuvent maintenant se connecter avec :
- ✅ Google
- ✅ Facebook
- ✅ Email/mot de passe (pour les admins)

---

## 🆘 Dépannage

### Erreur "Firebase not configured"
→ Vérifiez que `firebase-config.js` contient vos vraies clés

### Erreur "Unauthorized domain"
→ Ajoutez votre domaine Netlify dans Firebase (étape 8)

### Erreur Facebook "URL not allowed"
→ Vérifiez les URLs OAuth dans Facebook Developer Console

### Les boutons ne fonctionnent pas
→ Ouvrez la console (F12) et regardez les erreurs

---

## 📞 Besoin d'aide ?

Envoyez-moi :
1. Le message d'erreur exact
2. Une capture d'écran de la console (F12)
3. L'étape où vous êtes bloqué

---

**Bon courage ! 🚀**

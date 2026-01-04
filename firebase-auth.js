// Module d'authentification Firebase pour AsCartel

class FirebaseAuth {
  constructor() {
    this.auth = null;
    this.currentUser = null;
  }

  // Initialiser Firebase
  async init() {
    try {
      // Importer Firebase depuis CDN
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut, onAuthStateChanged } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

      // Initialiser l'app
      const app = initializeApp(firebaseConfig);
      this.auth = getAuth(app);
      
      // Providers
      this.googleProvider = new GoogleAuthProvider();
      this.facebookProvider = new FacebookAuthProvider();
      
      // Écouter les changements d'état
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.handleAuthStateChange(user);
      });

      console.log('✅ Firebase initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur Firebase:', error);
      return false;
    }
  }

  // Connexion avec Google
  async signInWithGoogle() {
    try {
      const { signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;
      
      // Sauvegarder l'utilisateur
      this.saveUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        provider: 'google',
        role: 'client'
      });

      return { success: true, user };
    } catch (error) {
      console.error('Erreur Google:', error);
      return { success: false, error: error.message };
    }
  }

  // Connexion avec Facebook
  async signInWithFacebook() {
    try {
      const { signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      const user = result.user;
      
      // Sauvegarder l'utilisateur
      this.saveUser({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        provider: 'facebook',
        role: 'client'
      });

      return { success: true, user };
    } catch (error) {
      console.error('Erreur Facebook:', error);
      return { success: false, error: error.message };
    }
  }

  // Déconnexion
  async signOut() {
    try {
      const { signOut: firebaseSignOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      await firebaseSignOut(this.auth);
      localStorage.removeItem('ainaUser');
      sessionStorage.removeItem('ainaUser');
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder l'utilisateur
  saveUser(userData) {
    const userToSave = {
      ...userData,
      loggedIn: true,
      loginDate: new Date().toISOString()
    };
    
    localStorage.setItem('ainaUser', JSON.stringify(userToSave));
  }

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    const saved = localStorage.getItem('ainaUser') || sessionStorage.getItem('ainaUser');
    return saved ? JSON.parse(saved) : null;
  }

  // Gérer les changements d'état
  handleAuthStateChange(user) {
    if (user) {
      console.log('✅ Utilisateur connecté:', user.email);
    } else {
      console.log('❌ Utilisateur déconnecté');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn() {
    return this.currentUser !== null || this.getCurrentUser() !== null;
  }
}

// Instance globale
const firebaseAuth = new FirebaseAuth();

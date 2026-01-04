// Configuration Firebase pour AsCartel
// À REMPLACER avec vos vraies clés Firebase

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}

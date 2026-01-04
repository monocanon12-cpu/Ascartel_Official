// Configuration ASCARTEL
const CONFIG = {
  // Mode de fonctionnement : 'api' uniquement
  mode: 'api',
  
  // URL de l'API backend
  apiUrl: window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : 'https://ascartel-backend.onrender.com/api'
};

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

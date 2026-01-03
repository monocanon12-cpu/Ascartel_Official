// =============================================
// ASCARTEL - Dark Mode Global
// =============================================

(function() {
  'use strict';
  
  // =============================================
  // INITIALISATION DU MODE SOMBRE
  // =============================================
  function initDarkMode() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    const darkMode = settings.darkMode || false;
    
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    // Appliquer les autres paramètres d'apparence
    if (settings.fontSize) {
      document.documentElement.style.fontSize = 
        settings.fontSize === 'small' ? '14px' :
        settings.fontSize === 'large' ? '18px' : '16px';
    }
    
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }
    
    if (settings.animations === false) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
  }
  
  // =============================================
  // TOGGLE DARK MODE
  // =============================================
  window.toggleDarkMode = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    settings.darkMode = isDark;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    return isDark;
  };
  
  // =============================================
  // EXPORT POUR UTILISATION GLOBALE
  // =============================================
  window.DarkMode = {
    init: initDarkMode,
    toggle: window.toggleDarkMode,
    isEnabled: () => document.body.classList.contains('dark-mode')
  };
  
  // Auto-initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
  
  console.log('🌙 Dark Mode ASCARTEL initialisé');
})();

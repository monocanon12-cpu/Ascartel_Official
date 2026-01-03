// =============================================
// COOKIE CONSENT - Bannière RGPD
// =============================================

const CookieConsent = {
  cookieName: 'aina_cookie_consent',
  cookieDuration: 365, // jours

  init() {
    // Vérifier si le consentement a déjà été donné
    if (!this.hasConsent()) {
      this.showBanner();
    }
  },

  hasConsent() {
    return this.getCookie(this.cookieName) !== null;
  },

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  },

  showBanner() {
    // Créer la bannière
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.setAttribute('aria-describedby', 'cookie-description');
    
    banner.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-icon">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <div class="cookie-text">
          <h3 id="cookie-title">🍪 Ce site utilise des cookies</h3>
          <p id="cookie-description">
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
            En continuant à naviguer, vous acceptez notre utilisation des cookies.
            <a href="politique-cookies.html" class="cookie-link">En savoir plus</a>
          </p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn-accept" id="cookie-accept-all">
            <i class="fas fa-check"></i> Tout accepter
          </button>
          <button class="cookie-btn cookie-btn-essential" id="cookie-accept-essential">
            Essentiels uniquement
          </button>
          <button class="cookie-btn cookie-btn-settings" id="cookie-settings">
            <i class="fas fa-cog"></i> Paramétrer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animer l'apparition
    setTimeout(() => banner.classList.add('active'), 100);

    // Event listeners
    document.getElementById('cookie-accept-all').addEventListener('click', () => {
      this.acceptAll();
    });

    document.getElementById('cookie-accept-essential').addEventListener('click', () => {
      this.acceptEssential();
    });

    document.getElementById('cookie-settings').addEventListener('click', () => {
      this.showSettings();
    });
  },

  hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 300);
    }
  },

  acceptAll() {
    this.setCookie(this.cookieName, JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }), this.cookieDuration);
    
    this.hideBanner();
    this.loadOptionalScripts();
    this.showToast('Préférences enregistrées ✓');
  },

  acceptEssential() {
    this.setCookie(this.cookieName, JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }), this.cookieDuration);
    
    this.hideBanner();
    this.showToast('Cookies essentiels acceptés');
  },

  showSettings() {
    // Créer la modal de paramètres
    const modal = document.createElement('div');
    modal.id = 'cookie-settings-modal';
    modal.className = 'cookie-modal';
    
    modal.innerHTML = `
      <div class="cookie-modal-overlay" id="cookie-modal-close-overlay"></div>
      <div class="cookie-modal-content">
        <div class="cookie-modal-header">
          <h2>Paramètres des cookies</h2>
          <button class="cookie-modal-close" id="cookie-modal-close">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4>Cookies essentiels</h4>
                <p>Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
              </div>
              <label class="cookie-toggle disabled">
                <input type="checkbox" checked disabled>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4>Cookies analytiques</h4>
                <p>Nous aident à comprendre comment vous utilisez le site pour l'améliorer.</p>
              </div>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-analytics" checked>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4>Cookies marketing</h4>
                <p>Permettent d'afficher des publicités personnalisées.</p>
              </div>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-marketing">
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4>Cookies de préférences</h4>
                <p>Mémorisent vos choix (langue, région, etc.).</p>
              </div>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-preferences" checked>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button class="cookie-btn cookie-btn-save" id="cookie-save-settings">
            Enregistrer mes préférences
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Event listeners
    document.getElementById('cookie-modal-close').addEventListener('click', () => {
      this.closeSettings();
    });

    document.getElementById('cookie-modal-close-overlay').addEventListener('click', () => {
      this.closeSettings();
    });

    document.getElementById('cookie-save-settings').addEventListener('click', () => {
      this.saveSettings();
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeSettings();
    });
  },

  closeSettings() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  saveSettings() {
    const analytics = document.getElementById('cookie-analytics')?.checked || false;
    const marketing = document.getElementById('cookie-marketing')?.checked || false;
    const preferences = document.getElementById('cookie-preferences')?.checked || false;

    this.setCookie(this.cookieName, JSON.stringify({
      essential: true,
      analytics,
      marketing,
      preferences,
      timestamp: new Date().toISOString()
    }), this.cookieDuration);

    this.closeSettings();
    this.hideBanner();
    
    if (analytics) {
      this.loadOptionalScripts();
    }
    
    this.showToast('Préférences enregistrées ✓');
  },

  loadOptionalScripts() {
    // Charger Google Analytics ou autres scripts si acceptés
    const consent = this.getConsent();
    if (consent && consent.analytics) {
      // Exemple: Google Analytics
      // gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  },

  getConsent() {
    const cookie = this.getCookie(this.cookieName);
    if (cookie) {
      try {
        return JSON.parse(cookie);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'cookie-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
  CookieConsent.init();
});

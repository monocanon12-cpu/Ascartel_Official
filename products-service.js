// =============================================
// ASCARTEL - Service API Produits Avancé
// Équivalent React Query en Vanilla JS
// =============================================

class ProductsAPI {
  constructor() {
    this.baseURL = 'https://ascartel-backend.onrender.com/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 seconde
    this.pageSize = 20;
  }

  // Générer une clé de cache
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  // Vérifier si le cache est valide
  isCacheValid(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheTimeout;
  }

  // Récupérer depuis le cache
  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }

  // Sauvegarder dans le cache
  saveToCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch avec retry
  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`⚠️ Tentative ${attempt}/${this.retryAttempts} échouée, retry dans ${this.retryDelay}ms...`);
        await this.sleep(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  // Utilitaire sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Charger les produits avec pagination
  async getProducts(page = 1, filters = {}) {
    const offset = (page - 1) * this.pageSize;
    const params = {
      limit: this.pageSize,
      offset,
      ...filters
    };

    const cacheKey = this.getCacheKey('/articles', params);

    // Vérifier le cache
    if (this.isCacheValid(cacheKey)) {
      console.log('📦 Chargement depuis le cache');
      return {
        data: this.getFromCache(cacheKey),
        fromCache: true
      };
    }

    // Construire l'URL avec paramètres
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/articles?${queryString}`;

    try {
      const data = await this.fetchWithRetry(url);
      
      // Sauvegarder dans le cache
      this.saveToCache(cacheKey, data);
      
      return {
        data,
        fromCache: false
      };
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      throw error;
    }
  }

  // Charger un produit par ID
  async getProduct(id) {
    const cacheKey = this.getCacheKey(`/articles/${id}`);

    if (this.isCacheValid(cacheKey)) {
      return {
        data: this.getFromCache(cacheKey),
        fromCache: true
      };
    }

    const url = `${this.baseURL}/articles/${id}`;

    try {
      const data = await this.fetchWithRetry(url);
      this.saveToCache(cacheKey, data);
      return {
        data,
        fromCache: false
      };
    } catch (error) {
      console.error(`❌ Erreur chargement produit ${id}:`, error);
      throw error;
    }
  }

  // Charger les ventes flash
  async getFlashSales() {
    const cacheKey = this.getCacheKey('/articles/flash-sales');

    if (this.isCacheValid(cacheKey)) {
      return {
        data: this.getFromCache(cacheKey),
        fromCache: true
      };
    }

    const url = `${this.baseURL}/articles/flash-sales`;

    try {
      const data = await this.fetchWithRetry(url);
      this.saveToCache(cacheKey, data);
      return {
        data,
        fromCache: false
      };
    } catch (error) {
      console.error('❌ Erreur chargement flash sales:', error);
      throw error;
    }
  }

  // Vider le cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache vidé');
  }
}

// Instance globale
const productsAPI = new ProductsAPI();

// =============================================
// Hook useProducts (équivalent React Query)
// =============================================

class ProductsState {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.state = {
      loading: false,
      error: null,
      data: null,
      isEmpty: false
    };
    this.currentPage = 1;
    this.filters = {};
  }

  // Mettre à jour l'état
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Charger les produits
  async loadProducts(page = 1, filters = {}) {
    this.currentPage = page;
    this.filters = filters;
    
    this.setState({ loading: true, error: null });
    this.renderSkeleton();

    try {
      const { data } = await productsAPI.getProducts(page, filters);

      if (data.success) {
        const isEmpty = !data.articles || data.articles.length === 0;
        
        this.setState({
          loading: false,
          data: data.articles,
          isEmpty,
          error: null
        });

        // Mettre à jour le système de filtres si disponible
        if (typeof filtersSystem !== 'undefined' && filtersSystem) {
          filtersSystem.setProducts(data.articles);
        }

        if (isEmpty) {
          this.renderEmpty();
        } else {
          this.renderProducts(data.articles);
        }
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message,
        data: null
      });
      this.renderError(error.message);
    }
  }

  // Recharger
  retry() {
    this.loadProducts(this.currentPage, this.filters);
  }

  // Render skeleton loading
  renderSkeleton() {
    if (!this.container) return;

    const skeletons = Array(8).fill(0).map(() => `
      <div class="product-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = skeletons;
  }

  // Render produits
  renderProducts(products) {
    if (!this.container) return;

    this.container.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        ${product.flash_sale && product.flash_sale.active ? 
          `<div class="product-badge sale">-${product.flash_sale.discount}%</div>` : ''}
        
        <div class="product-image">
          <img src="${product.image_url || 'https://via.placeholder.com/300x400'}" 
               alt="${product.nom}" 
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/300x400/f3f4f6/999?text=Image'" />
          <div class="product-actions">
            <button class="quick-view" onclick="viewProduct(${product.id})">Voir plus</button>
            <button class="add-to-cart" 
                    onclick="addToCart(${product.id}, '${product.nom.replace(/'/g, "\\'")}', ${product.prix}, '${product.image_url || ''}')" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
              ${product.stock <= 0 ? 'Indisponible' : 'Ajouter au panier'}
            </button>
          </div>
          <button class="wishlist-btn" data-product-id="${product.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
        
        <div class="product-info">
          <h3>${product.nom}</h3>
          ${product.categorie ? `<p class="product-category">${product.categorie}</p>` : ''}
          <div class="product-rating">
            <div class="stars">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
            </div>
            <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
          </div>
          <div class="product-price">
            ${product.prix_original && product.prix_original > product.prix ? 
              `<span class="original-price">${product.prix_original.toLocaleString()} Ar</span>` : ''}
            <span class="price">${product.prix.toLocaleString()} Ar</span>
          </div>
        </div>
      </div>
    `).join('');

    // Animation
    const cards = this.container.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      setTimeout(() => card.classList.add('animate-in'), index * 50);
    });
  }

  // Render état vide
  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="products-empty">
        <i class="fas fa-box-open"></i>
        <h3>Aucun produit disponible</h3>
        <p>Revenez bientôt pour découvrir nos nouveautés !</p>
        <button class="cta-button" onclick="location.reload()">Actualiser</button>
      </div>
    `;
  }

  // Render erreur
  renderError(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="products-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erreur de chargement</h3>
        <p>${message}</p>
        <button class="cta-button" onclick="productsState.retry()">
          <i class="fas fa-redo"></i> Réessayer
        </button>
      </div>
    `;
  }

  // Render
  render() {
    // Le rendu est géré par les méthodes spécifiques
  }
}

// Instance globale
let productsState;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  
  if (productsGrid) {
    productsState = new ProductsState('productsGrid');
    productsState.loadProducts();
    
    // Intégrer avec le système de filtres
    if (typeof FiltersSystem !== 'undefined' && typeof filtersSystem !== 'undefined') {
      // Charger les produits dans le système de filtres
      productsState.loadProducts().then(() => {
        if (productsState.state.data) {
          filtersSystem.setProducts(productsState.state.data);
        }
      });
    }
    
    console.log('✨ Service API Produits initialisé');
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductsAPI, ProductsState, productsAPI };
}

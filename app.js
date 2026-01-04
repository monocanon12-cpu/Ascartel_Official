// =============================================
// Application principale - Fonctionnalités e-commerce
// =============================================

document.addEventListener('DOMContentLoaded', function() {

  // =============================================
  // DEVISE - Normalisation EUR -> Ariary (Ar)
  // =============================================
  const CURRENCY = {
    symbol: 'Ar',
    euroToAriaryRate: 1000
  };

  function formatAriary(amount) {
    const n = Math.round(Number(amount) || 0);
    // Groupement par espaces (style FR)
    const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${grouped} ${CURRENCY.symbol}`;
  }

  function parseEuroLike(text) {
    // Accepte: 29,99€ | 29.99 € | 29,99 | 29.99
    const cleaned = String(text)
      .replace(/\s/g, '')
      .replace(/€/g, '')
      .replace(/eur/gi, '');

    const match = cleaned.match(/\d+(?:[\.,]\d+)?/);
    if (!match) return null;
    return Number(match[0].replace(',', '.'));
  }

  function convertEuroTextToAriaryText(text) {
    const t = String(text);
    if (!/€|\beur\b|\beuro\b/i.test(t)) return t;
    const eur = parseEuroLike(t);
    if (eur == null) return t.replace(/€/g, CURRENCY.symbol);
    return formatAriary(eur * CURRENCY.euroToAriaryRate);
  }

  function normalizeDomCurrency() {
    const selectors = [
      '.price',
      '.original-price',
      '.sale-price',
      '.rec-price',
      '.flash-prices .original',
      '.flash-prices .sale',
      '.price-labels span',
      '.country-selector span',
      '.promo-content span',
      '.shipping-item span'
    ];

    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      const before = el.textContent;
      const after = convertEuroTextToAriaryText(before);
      if (after !== before) el.textContent = after;
    });
  }

  function migrateStoredCurrency() {
    const keys = ['cart', 'wishlist', 'recentSearches', 'recentlyViewed'];

    keys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const data = JSON.parse(raw);

        if (Array.isArray(data)) {
          const migrated = data.map((item) => {
            if (item && typeof item === 'object' && typeof item.price === 'string') {
              return { ...item, price: convertEuroTextToAriaryText(item.price) };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(migrated));
        }
      } catch (_) {
        // Ignore: donnée invalide
      }
    });
  }

  // 1) Migre le localStorage (anciens prix en €)
  migrateStoredCurrency();

  // =============================================
  // WISHLIST - Liste de souhaits
  // =============================================
  const wishlist = {
    items: JSON.parse(localStorage.getItem('wishlist')) || [],
    
    add(productId, productData) {
      if (!this.items.find(item => item.id === productId)) {
        this.items.push({ id: productId, ...productData });
        this.save();
        this.updateUI();
        this.showNotification('Ajouté aux favoris ❤️');
      }
    },
    
    remove(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
      this.updateUI();
      this.showNotification('Retiré des favoris');
    },
    
    toggle(productId, productData) {
      if (this.items.find(item => item.id === productId)) {
        this.remove(productId);
        return false;
      } else {
        this.add(productId, productData);
        return true;
      }
    },
    
    save() {
      localStorage.setItem('wishlist', JSON.stringify(this.items));
    },
    
    updateUI() {
      const countEl = document.getElementById('wishlistCount');
      if (countEl) {
        countEl.textContent = this.items.length;
        countEl.style.display = this.items.length > 0 ? 'flex' : 'none';
      }
      
      // Mettre à jour les icônes coeur sur les produits
      document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.dataset.productId;
        const isInWishlist = this.items.find(item => item.id === productId);
        btn.classList.toggle('active', isInWishlist);
        btn.innerHTML = isInWishlist ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
      });
    },
    
    showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'wishlist-notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    }
  };
  
  // Initialiser le compteur wishlist
  wishlist.updateUI();
  
  // =============================================
  // CART - Panier
  // =============================================
  const cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    
    add(productId, productData) {
      const existing = this.items.find(item => item.id === productId);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({ id: productId, quantity: 1, ...productData });
      }
      this.save();
      this.updateUI();
      this.animateCart();
      this.showNotification('Ajouté au panier 🛒');
    },
    
    remove(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
      this.updateUI();
    },
    
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    
    updateUI() {
      const countEl = document.querySelector('.cart-count');
      if (countEl) {
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'flex' : 'none';
      }
    },
    
    animateCart() {
      const cartIcon = document.querySelector('.cart-icon');
      if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 1000);
      }
    },
    
    showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    }
  };
  
  // Initialiser le compteur panier
  cart.updateUI();

  // 2) Normalise la devise visible (au cas où du contenu affiche encore €)
  normalizeDomCurrency();
  // 3) Re-normalise après les rendus dynamiques (Flash Sale, recommandations, etc.)
  setTimeout(normalizeDomCurrency, 0);
  setTimeout(normalizeDomCurrency, 500);

  // =============================================
  // NAVIGATION - Menus déroulants
  // =============================================
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (trigger && menu) {
      trigger.addEventListener('mouseenter', () => {
        menu.classList.add('active');
      });
      
      dropdown.addEventListener('mouseleave', () => {
        menu.classList.remove('active');
      });
      
      // Support tactile
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        menu.classList.toggle('active');
      });
    }
  });
  
  // =============================================
  // FILTRES AVANCÉS
  // =============================================
  const filterToggle = document.getElementById('filterToggle');
  const filtersPanel = document.getElementById('filtersPanel');
  
  if (filterToggle && filtersPanel) {
    filterToggle.addEventListener('click', () => {
      filtersPanel.classList.toggle('active');
      filterToggle.classList.toggle('active');
    });
  }
  
  // Filtres de taille
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });
  
  // Filtres de couleur
  document.querySelectorAll('.color-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });
  
  // Slider de prix
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  
  if (priceRange && priceValue) {
    priceRange.addEventListener('input', () => {
      priceValue.textContent = priceRange.value + ' 000 Ar';
    });
  }
  
  // =============================================
  // FLASH SALE - Chargé depuis l'API
  // =============================================
  
  const flashSaleContainer = document.getElementById('flashSaleProducts');
  
  if (flashSaleContainer) {
    // Charger les ventes flash depuis l'API
    fetch(`${CONFIG.apiUrl}/articles/flash-sales`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.flashSales && data.flashSales.length > 0) {
          flashSaleContainer.innerHTML = '';
          data.flashSales.forEach(product => {
            const card = document.createElement('div');
            card.className = 'flash-product-card';
            card.innerHTML = `
              <div class="flash-discount-badge">-${product.flash_sale.discount}%</div>
              <button class="wishlist-btn" data-product-id="${product.id}">
                <i class="far fa-heart"></i>
              </button>
              <img src="${product.image_url || 'https://via.placeholder.com/200x280'}" alt="${product.nom}">
              <div class="flash-product-info">
                <h4>${product.nom}</h4>
                <div class="flash-prices">
                  <span class="original">${product.prix_original.toLocaleString()} Ar</span>
                  <span class="sale">${product.prix.toLocaleString()} Ar</span>
                </div>
                <div class="flash-progress">
                  <div class="progress-bar" style="width: ${Math.min(100, (product.stock / 20) * 100)}%"></div>
                  <span>${product.stock} restant(s)</span>
                </div>
                <button class="flash-add-cart" data-product-id="${product.id}">
                  <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
              </div>
            `;
            flashSaleContainer.appendChild(card);
          });
        } else {
          flashSaleContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Aucune vente flash pour le moment</p>';
        }
      })
      .catch(error => {
        console.error('Erreur chargement ventes flash:', error);
        flashSaleContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">Erreur de chargement</p>';
      });
  }
  
  // Timer Flash Sale
  function updateFlashTimer() {
    const hours = document.getElementById('flash-hours');
    const minutes = document.getElementById('flash-minutes');
    const seconds = document.getElementById('flash-seconds');
    
    if (!hours || !minutes || !seconds) return;
    
    let h = parseInt(hours.textContent);
    let m = parseInt(minutes.textContent);
    let s = parseInt(seconds.textContent);
    
    s--;
    if (s < 0) { s = 59; m--; }
    if (m < 0) { m = 59; h--; }
    if (h < 0) { h = 23; m = 59; s = 59; }
    
    hours.textContent = h.toString().padStart(2, '0');
    minutes.textContent = m.toString().padStart(2, '0');
    seconds.textContent = s.toString().padStart(2, '0');
  }
  
  setInterval(updateFlashTimer, 1000);
  
  // =============================================
  // RECOMMANDATIONS - Chargées depuis l'API
  // =============================================
  
  const recommendationsContainer = document.getElementById('recommendationsGrid');
  
  if (recommendationsContainer) {
    fetch(`${CONFIG.apiUrl}/articles?limit=8`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.articles && data.articles.length > 0) {
          recommendationsContainer.innerHTML = '';
          data.articles.slice(0, 4).forEach(product => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
              <div class="rec-tag">Recommandé</div>
              <button class="wishlist-btn" data-product-id="${product.id}">
                <i class="far fa-heart"></i>
              </button>
              <img src="${product.image_url || 'https://via.placeholder.com/200x280'}" alt="${product.nom}">
              <div class="rec-info">
                <h4>${product.nom}</h4>
                <span class="rec-price">${product.prix.toLocaleString()} Ar</span>
                <button class="rec-add-cart" data-product-id="${product.id}">
                  <i class="fas fa-plus"></i> Ajouter au panier
                </button>
              </div>
            `;
            recommendationsContainer.appendChild(card);
          });
        } else {
          recommendationsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Aucune recommandation pour le moment</p>';
        }
      })
      .catch(error => {
        console.error('Erreur chargement recommandations:', error);
        recommendationsContainer.innerHTML = '';
      });
  }
  
  // =============================================
  // EVENT LISTENERS - Produits
  // =============================================
  
  // Ajouter au panier (tous les boutons)
  document.addEventListener('click', (e) => {
    // Bouton ajouter au panier
    if (e.target.closest('.add-to-cart') || e.target.closest('.flash-add-cart') || e.target.closest('.rec-add-cart')) {
      const btn = e.target.closest('.add-to-cart') || e.target.closest('.flash-add-cart') || e.target.closest('.rec-add-cart');
      const card = btn.closest('.product-card') || btn.closest('.flash-product-card') || btn.closest('.recommendation-card');
      
      const productId = btn.dataset.productId || 'prod-' + Date.now();
      const productName = card.querySelector('h3, h4')?.textContent || 'Produit';
      const productPrice = card.querySelector('.price, .sale, .rec-price')?.textContent || '0 Ar';
      
      cart.add(productId, { name: productName, price: productPrice });
      
      // Animation du bouton
      btn.classList.add('added');
      btn.innerHTML = '<i class="fas fa-check"></i> Ajouté';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = btn.classList.contains('flash-add-cart') ? '<i class="fas fa-shopping-cart"></i> Ajouter' : 
                        btn.classList.contains('rec-add-cart') ? '<i class="fas fa-plus"></i> Ajouter au panier' : 'Ajouter au panier';
      }, 1500);
    }
    
    // Bouton wishlist
    if (e.target.closest('.wishlist-btn')) {
      const btn = e.target.closest('.wishlist-btn');
      const card = btn.closest('.product-card') || btn.closest('.flash-product-card') || btn.closest('.recommendation-card');
      
      const productId = btn.dataset.productId || 'prod-' + Date.now();
      const productName = card.querySelector('h3, h4')?.textContent || 'Produit';
      const productPrice = card.querySelector('.price, .sale, .rec-price')?.textContent || '0 Ar';
      
      const added = wishlist.toggle(productId, { name: productName, price: productPrice });
      
      btn.innerHTML = added ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
      btn.classList.toggle('active', added);
    }
  });
  
  // =============================================
  // AJOUT DES BOUTONS WISHLIST AUX PRODUITS EXISTANTS
  // =============================================
  document.querySelectorAll('.product-card').forEach((card, index) => {
    if (!card.querySelector('.wishlist-btn')) {
      const wishlistBtn = document.createElement('button');
      wishlistBtn.className = 'wishlist-btn';
      wishlistBtn.dataset.productId = 'prod-' + index;
      wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
      card.querySelector('.product-image').appendChild(wishlistBtn);
    }
  });
  
  // Mise à jour de l'état des boutons wishlist
  wishlist.updateUI();
  
  // =============================================
  // RECHERCHE DYNAMIQUE
  // =============================================
  const searchInput = document.querySelector('.search-box input');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase();
      if (query.length < 2) return;
      
      // Filtrer les produits visibles
      document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const match = name.includes(query);
        card.style.display = match || query.length < 2 ? 'block' : 'none';
      });
    }, 300));
    
    // Réinitialiser quand vide
    searchInput.addEventListener('blur', () => {
      if (!searchInput.value) {
        document.querySelectorAll('.product-card').forEach(card => {
          card.style.display = 'block';
        });
      }
    });
  }
  
  // =============================================
  // SCROLL HORIZONTAL CATEGORIES
  // =============================================
  const trendingTags = document.querySelector('.trending-tags');
  
  if (trendingTags) {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    trendingTags.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - trendingTags.offsetLeft;
      scrollLeft = trendingTags.scrollLeft;
    });
    
    trendingTags.addEventListener('mouseleave', () => isDown = false);
    trendingTags.addEventListener('mouseup', () => isDown = false);
    
    trendingTags.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - trendingTags.offsetLeft;
      const walk = (x - startX) * 2;
      trendingTags.scrollLeft = scrollLeft - walk;
    });
  }
  
  // =============================================
  // UTILITAIRES
  // =============================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // =============================================
  // ANIMATIONS AU SCROLL
  // =============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.product-card, .review-card, .flash-product-card, .recommendation-card').forEach(el => {
    observer.observe(el);
  });
  
  console.log('✨ Application Aina initialisée avec succès !');
});

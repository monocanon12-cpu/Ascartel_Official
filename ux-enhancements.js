// =============================================
// UX ENHANCEMENTS - Améliorations inspirées Apple/Airbnb/Nike/Glossier
// =============================================

(function() {
  'use strict';

  // =============================================
  // PHASE 1.1 - PERFORMANCES
  // =============================================

  /**
   * Lazy Loading pour les images
   * Charge les images uniquement quand elles entrent dans le viewport
   */
  const LazyLoader = {
    init() {
      // Utiliser Intersection Observer pour le lazy loading
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });

        // Observer toutes les images avec data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });

        // Observer aussi les images normales pour ajouter le fade-in
        document.querySelectorAll('.product-image img, .flash-product-card img, .recommendation-card img').forEach(img => {
          if (!img.dataset.observed) {
            img.dataset.observed = 'true';
            img.classList.add('lazy-image');
            
            if (img.complete) {
              img.classList.add('loaded');
            } else {
              img.addEventListener('load', () => {
                img.classList.add('loaded');
              });
            }
          }
        });
      }
    },

    loadImage(img) {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
    }
  };

  /**
   * Skeleton Screens
   * Affiche des placeholders animés pendant le chargement
   */
  const SkeletonLoader = {
    createSkeleton(type = 'card') {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type}`;
      
      if (type === 'card') {
        skeleton.innerHTML = `
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-price"></div>
            <div class="skeleton-line skeleton-short"></div>
          </div>
        `;
      } else if (type === 'text') {
        skeleton.innerHTML = `
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-short"></div>
        `;
      }
      
      return skeleton;
    },

    showSkeletons(container, count = 4, type = 'card') {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        fragment.appendChild(this.createSkeleton(type));
      }
      container.appendChild(fragment);
    },

    hideSkeletons(container) {
      container.querySelectorAll('.skeleton').forEach(s => s.remove());
    }
  };

  /**
   * Progressive Image Loading
   * Charge d'abord une version floue puis la version HD
   */
  const ProgressiveImages = {
    init() {
      document.querySelectorAll('.progressive-image').forEach(container => {
        const img = container.querySelector('img');
        const placeholder = container.querySelector('.placeholder');
        
        if (img && placeholder) {
          img.addEventListener('load', () => {
            placeholder.classList.add('fade-out');
            img.classList.add('loaded');
          });
        }
      });
    }
  };

  // =============================================
  // PHASE 1.2 - MOBILE-FIRST
  // =============================================

  /**
   * Menu Mobile Hamburger Fluide
   */
  const MobileMenu = {
    init() {
      const menuBtn = document.querySelector('.mobile-menu-btn');
      const nav = document.querySelector('.main-nav');
      const body = document.body;
      
      if (!menuBtn || !nav) return;

      // Créer l'overlay
      let overlay = document.querySelector('.menu-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
      }

      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle(menuBtn, nav, overlay, body);
      });

      overlay.addEventListener('click', () => {
        this.close(menuBtn, nav, overlay, body);
      });

      // Fermer avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
          this.close(menuBtn, nav, overlay, body);
        }
      });

      // Gérer le swipe pour fermer
      this.handleSwipe(nav, menuBtn, overlay, body);
    },

    toggle(btn, nav, overlay, body) {
      const isOpen = nav.classList.contains('active');
      if (isOpen) {
        this.close(btn, nav, overlay, body);
      } else {
        this.open(btn, nav, overlay, body);
      }
    },

    open(btn, nav, overlay, body) {
      nav.classList.add('active');
      overlay.classList.add('active');
      body.classList.add('menu-open');
      btn.innerHTML = '<i class="fas fa-times"></i>';
      btn.setAttribute('aria-expanded', 'true');
    },

    close(btn, nav, overlay, body) {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      body.classList.remove('menu-open');
      btn.innerHTML = '<i class="fas fa-bars"></i>';
      btn.setAttribute('aria-expanded', 'false');
    },

    handleSwipe(nav, btn, overlay, body) {
      let startX = 0;
      let currentX = 0;

      nav.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      nav.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
      }, { passive: true });

      nav.addEventListener('touchend', () => {
        const diff = startX - currentX;
        if (diff > 50) {
          this.close(btn, nav, overlay, body);
        }
      });
    }
  };

  /**
   * Touch-friendly zones (44x44px minimum)
   */
  const TouchOptimization = {
    init() {
      // S'assurer que tous les boutons et liens sont assez grands
      const interactiveElements = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');
      
      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          el.classList.add('touch-target');
        }
      });
    }
  };

  // =============================================
  // PHASE 1.3 - NAVIGATION AMÉLIORÉE
  // =============================================

  /**
   * Recherche Prédictive
   */
  const PredictiveSearch = {
    products: [
      { name: 'Robe d\'été légère', category: 'Femme', price: '29 990 Ar' },
      { name: 'Jean taille haute', category: 'Femme', price: '47 990 Ar' },
      { name: 'Veste en jean délavé', category: 'Unisexe', price: '45 990 Ar' },
      { name: 'Ensemble de sport', category: 'Sport', price: '39 990 Ar' },
      { name: 'Top en dentelle', category: 'Femme', price: '24 990 Ar' },
      { name: 'Chemise classique', category: 'Homme', price: '39 990 Ar' },
      { name: 'Pantalon chino', category: 'Homme', price: '49 990 Ar' },
      { name: 'Robe du soir', category: 'Femme', price: '59 990 Ar' },
      { name: 'Blouse légère', category: 'Femme', price: '34 990 Ar' },
      { name: 'Pull en coton', category: 'Unisexe', price: '34 490 Ar' },
      { name: 'Jupe plissée', category: 'Femme', price: '34 990 Ar' },
      { name: 'Short en jean', category: 'Unisexe', price: '24 990 Ar' }
    ],

    recentSearches: JSON.parse(localStorage.getItem('recentSearches')) || [],

    init() {
      const searchInput = document.querySelector('.search-box input');
      if (!searchInput) return;

      // Créer le dropdown de suggestions
      const searchBox = searchInput.closest('.search-box');
      let dropdown = searchBox.querySelector('.search-dropdown');
      
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        searchBox.appendChild(dropdown);
      }

      // Événements
      searchInput.addEventListener('focus', () => this.showDropdown(dropdown, searchInput.value));
      searchInput.addEventListener('input', (e) => this.handleInput(e.target.value, dropdown));
      searchInput.addEventListener('blur', () => {
        setTimeout(() => dropdown.classList.remove('active'), 200);
      });

      // Navigation clavier
      searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e, dropdown, searchInput));
    },

    handleInput(query, dropdown) {
      if (query.length < 1) {
        this.showDropdown(dropdown, '');
        return;
      }

      const results = this.search(query);
      this.renderResults(results, query, dropdown);
    },

    search(query) {
      const q = query.toLowerCase();
      return this.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      ).slice(0, 6);
    },

    showDropdown(dropdown, query) {
      if (query.length > 0) {
        const results = this.search(query);
        this.renderResults(results, query, dropdown);
      } else {
        this.renderRecentAndPopular(dropdown);
      }
      dropdown.classList.add('active');
    },

    renderResults(results, query, dropdown) {
      if (results.length === 0) {
        dropdown.innerHTML = `
          <div class="search-no-results">
            <i class="fas fa-search"></i>
            <p>Aucun résultat pour "${query}"</p>
            <span>Essayez avec d'autres mots-clés</span>
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="search-results">
            <h4>Produits</h4>
            ${results.map(p => `
              <a href="#" class="search-result-item">
                <i class="fas fa-tshirt"></i>
                <div class="result-info">
                  <span class="result-name">${this.highlight(p.name, query)}</span>
                  <span class="result-meta">${p.category} • ${p.price}</span>
                </div>
                <i class="fas fa-arrow-right"></i>
              </a>
            `).join('')}
          </div>
        `;
      }
      dropdown.classList.add('active');
    },

    renderRecentAndPopular(dropdown) {
      const recentHtml = this.recentSearches.length > 0 ? `
        <div class="search-section">
          <h4><i class="fas fa-clock"></i> Recherches récentes</h4>
          ${this.recentSearches.slice(0, 3).map(s => `
            <a href="#" class="search-recent-item">
              <i class="fas fa-history"></i>
              <span>${s}</span>
            </a>
          `).join('')}
        </div>
      ` : '';

      dropdown.innerHTML = `
        ${recentHtml}
        <div class="search-section">
          <h4><i class="fas fa-fire"></i> Tendances</h4>
          <div class="search-trends">
            <a href="#" class="trend-chip">Robes</a>
            <a href="#" class="trend-chip">Nouveautés</a>
            <a href="#" class="trend-chip">Soldes</a>
            <a href="#" class="trend-chip">Été 2024</a>
          </div>
        </div>
        <div class="search-section">
          <h4><i class="fas fa-star"></i> Populaires</h4>
          ${this.products.slice(0, 3).map(p => `
            <a href="#" class="search-result-item">
              <i class="fas fa-tshirt"></i>
              <div class="result-info">
                <span class="result-name">${p.name}</span>
                <span class="result-meta">${p.category} • ${p.price}</span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
      dropdown.classList.add('active');
    },

    highlight(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    },

    handleKeyboard(e, dropdown, input) {
      const items = dropdown.querySelectorAll('.search-result-item, .search-recent-item');
      const activeItem = dropdown.querySelector('.search-item-active');
      let currentIndex = Array.from(items).indexOf(activeItem);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeItem) activeItem.classList.remove('search-item-active');
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex]?.classList.add('search-item-active');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeItem) activeItem.classList.remove('search-item-active');
        currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[currentIndex]?.classList.add('search-item-active');
      } else if (e.key === 'Enter' && activeItem) {
        e.preventDefault();
        this.saveSearch(input.value);
        activeItem.click();
      }
    },

    saveSearch(query) {
      if (query && !this.recentSearches.includes(query)) {
        this.recentSearches.unshift(query);
        this.recentSearches = this.recentSearches.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
      }
    }
  };

  /**
   * Filtres en temps réel
   */
  const RealTimeFilters = {
    init() {
      const applyBtn = document.querySelector('.apply-filters-btn');
      const productCards = document.querySelectorAll('.product-card');
      
      if (!applyBtn) return;

      // Filtrage en temps réel (sans bouton)
      document.querySelectorAll('.size-btn, .color-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.applyFilters(productCards);
        });
      });

      const priceRange = document.getElementById('priceRange');
      if (priceRange) {
        priceRange.addEventListener('input', this.debounce(() => {
          this.applyFilters(productCards);
        }, 300));
      }

      document.querySelectorAll('.style-options input').forEach(cb => {
        cb.addEventListener('change', () => {
          this.applyFilters(productCards);
        });
      });

      applyBtn.addEventListener('click', () => {
        this.applyFilters(productCards);
        document.getElementById('filtersPanel')?.classList.remove('active');
      });
    },

    applyFilters(cards) {
      const activeSizes = Array.from(document.querySelectorAll('.size-btn.active')).map(b => b.dataset.size);
      const activeColors = Array.from(document.querySelectorAll('.color-filter-btn.active')).map(b => b.dataset.color);
      const maxPrice = parseInt(document.getElementById('priceRange')?.value || 200);
      const activeStyles = Array.from(document.querySelectorAll('.style-options input:checked')).map(c => c.value);

      let visibleCount = 0;

      cards.forEach(card => {
        let show = true;

        // Filtrer par prix (simulation)
        const priceText = card.querySelector('.price')?.textContent || '';
        const priceMatch = priceText.match(/[\d,]+/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[0].replace(',', '.'));
          if (price > maxPrice) show = false;
        }

        // Animation de filtrage
        if (show) {
          card.style.display = 'block';
          card.classList.add('filter-animate');
          setTimeout(() => card.classList.remove('filter-animate'), 300);
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Message si aucun résultat
      this.updateResultsCount(visibleCount);
    },

    updateResultsCount(count) {
      let counter = document.querySelector('.filter-results-count');
      if (!counter) {
        counter = document.createElement('div');
        counter.className = 'filter-results-count';
        document.querySelector('.section-header')?.appendChild(counter);
      }
      counter.textContent = `${count} produit${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
    },

    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  };

  // =============================================
  // PHASE 2.1 - ANIMATIONS SCROLL
  // =============================================

  /**
   * Scroll Animations (Scroll-telling inspiré Apple)
   */
  const ScrollAnimations = {
    init() {
      // Observer pour les animations au scroll
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;
            
            setTimeout(() => {
              el.classList.add('animate-visible');
            }, delay);
            
            animationObserver.unobserve(el);
          }
        });
      }, observerOptions);

      // Ajouter les classes d'animation aux éléments
      this.setupAnimations(animationObserver);
    },

    setupAnimations(observer) {
      // Fade in up
      document.querySelectorAll('.product-card, .flash-product-card, .recommendation-card, .review-card').forEach((el, i) => {
        el.classList.add('animate-fade-up');
        el.dataset.delay = (i % 4) * 100;
        observer.observe(el);
      });

      // Fade in
      document.querySelectorAll('.section-header h2, .trending-section h2, .reviews-section h2, .recommendations-section h2').forEach(el => {
        el.classList.add('animate-fade-in');
        observer.observe(el);
      });

      // Slide in from left
      document.querySelectorAll('.shipping-item').forEach((el, i) => {
        el.classList.add('animate-slide-left');
        el.dataset.delay = i * 100;
        observer.observe(el);
      });

      // Scale in
      document.querySelectorAll('.trend-tag').forEach((el, i) => {
        el.classList.add('animate-scale-in');
        el.dataset.delay = i * 50;
        observer.observe(el);
      });
    }
  };

  /**
   * Parallax Effect (subtil, inspiré Apple)
   */
  const ParallaxEffect = {
    init() {
      const hero = document.querySelector('.hero');
      if (!hero) return;

      // Parallax seulement sur desktop
      if (window.innerWidth > 768) {
        window.addEventListener('scroll', this.throttle(() => {
          const scrolled = window.pageYOffset;
          const rate = scrolled * 0.3;
          hero.style.backgroundPositionY = `calc(50% + ${rate}px)`;
        }, 16));
      }
    },

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // =============================================
  // PHASE 2.2 - MICRO-INTERACTIONS
  // =============================================

  /**
   * Hover Effects améliorés
   */
  const HoverEffects = {
    init() {
      // Effet ripple sur les boutons
      document.querySelectorAll('.cta-button, .filter-btn, .add-to-cart, .flash-add-cart, .rec-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => this.createRipple(e, btn));
      });

      // Effet de suivi curseur sur les cartes produits
      if (window.innerWidth > 768) {
        document.querySelectorAll('.product-card, .flash-product-card, .recommendation-card').forEach(card => {
          card.addEventListener('mousemove', (e) => this.handleCardHover(e, card));
          card.addEventListener('mouseleave', () => this.resetCard(card));
        });
      }
    },

    createRipple(e, button) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },

    handleCardHover(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    },

    resetCard(card) {
      card.style.transform = '';
    }
  };

  /**
   * Loading Animations
   */
  const LoadingAnimations = {
    init() {
      // Ajouter une animation de chargement globale
      window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Animer le contenu principal
        setTimeout(() => {
          document.querySelectorAll('.animate-on-load').forEach((el, i) => {
            setTimeout(() => el.classList.add('loaded'), i * 100);
          });
        }, 100);
      });
    }
  };

  // =============================================
  // PHASE 3.1 - SOCIAL PROOF
  // =============================================

  /**
   * Produits vus récemment
   */
  const RecentlyViewed = {
    key: 'recentlyViewed',
    maxItems: 6,

    init() {
      this.trackProductViews();
      this.renderSection();
    },

    trackProductViews() {
      document.querySelectorAll('.product-card, .flash-product-card, .recommendation-card').forEach(card => {
        card.addEventListener('click', () => {
          const product = {
            id: card.dataset.productId || 'prod-' + Date.now(),
            name: card.querySelector('h3, h4')?.textContent || 'Produit',
            price: card.querySelector('.price, .sale, .rec-price')?.textContent || '',
            image: card.querySelector('img')?.src || ''
          };
          this.addProduct(product);
        });
      });
    },

    addProduct(product) {
      let items = this.getItems();
      items = items.filter(p => p.id !== product.id);
      items.unshift(product);
      items = items.slice(0, this.maxItems);
      localStorage.setItem(this.key, JSON.stringify(items));
    },

    getItems() {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    },

    renderSection() {
      const items = this.getItems();
      if (items.length === 0) return;

      // Créer la section si elle n'existe pas
      let section = document.querySelector('.recently-viewed-section');
      if (!section) {
        section = document.createElement('section');
        section.className = 'recently-viewed-section';
        section.innerHTML = `
          <h2><i class="fas fa-eye"></i> Vu récemment</h2>
          <div class="recently-viewed-grid"></div>
        `;
        
        // Insérer avant la newsletter
        const newsletter = document.querySelector('.newsletter');
        if (newsletter) {
          newsletter.parentNode.insertBefore(section, newsletter);
        }
      }

      const grid = section.querySelector('.recently-viewed-grid');
      grid.innerHTML = items.map(p => `
        <div class="recently-viewed-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="rv-info">
            <span class="rv-name">${p.name}</span>
            <span class="rv-price">${p.price}</span>
          </div>
        </div>
      `).join('');
    }
  };

  /**
   * Live Viewers Counter
   */
  const LiveViewers = {
    init() {
      document.querySelectorAll('.product-card').forEach(card => {
        const viewers = Math.floor(Math.random() * 15) + 3;
        
        const badge = document.createElement('div');
        badge.className = 'live-viewers-badge';
        badge.innerHTML = `<i class="fas fa-eye"></i> ${viewers} personnes regardent`;
        
        const productImage = card.querySelector('.product-image');
        if (productImage && Math.random() > 0.5) { // 50% chance d'afficher
          productImage.appendChild(badge);
        }
      });
    }
  };

  /**
   * Stock Urgency
   */
  const StockUrgency = {
    init() {
      document.querySelectorAll('.product-card').forEach(card => {
        const stockLevel = Math.floor(Math.random() * 20) + 1;
        
        if (stockLevel <= 5) {
          const urgency = document.createElement('div');
          urgency.className = 'stock-urgency';
          urgency.innerHTML = `<i class="fas fa-fire"></i> Plus que ${stockLevel} en stock !`;
          
          const productInfo = card.querySelector('.product-info');
          if (productInfo) {
            productInfo.appendChild(urgency);
          }
        }
      });
    }
  };

  // =============================================
  // PHASE 2.3 - FICHES PRODUITS AMÉLIORÉES
  // =============================================

  /**
   * Quick View Modal
   * Modal de visualisation rapide des produits
   */
  const QuickViewModal = {
    modal: null,

    init() {
      this.createModal();
      this.attachEvents();
    },

    createModal() {
      this.modal = document.createElement('div');
      this.modal.className = 'quick-view-modal';
      this.modal.innerHTML = `
        <div class="qv-overlay"></div>
        <div class="qv-container">
          <button class="qv-close"><i class="fas fa-times"></i></button>
          <div class="qv-content">
            <div class="qv-gallery">
              <div class="qv-main-image">
                <img src="" alt="Produit" id="qvMainImage">
                <div class="qv-zoom-lens"></div>
              </div>
              <div class="qv-thumbnails" id="qvThumbnails"></div>
            </div>
            <div class="qv-details">
              <span class="qv-badge" id="qvBadge"></span>
              <h2 class="qv-title" id="qvTitle"></h2>
              <div class="qv-rating">
                <div class="qv-stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star-half-alt"></i>
                </div>
                <span class="qv-reviews">(127 avis)</span>
              </div>
              <div class="qv-price" id="qvPrice"></div>
              
              <div class="qv-benefits">
                <h4>Pourquoi vous allez l'adorer</h4>
                <ul>
                  <li><i class="fas fa-check"></i> Tissu doux et confortable</li>
                  <li><i class="fas fa-check"></i> Coupe flatteuse pour toutes les morphologies</li>
                  <li><i class="fas fa-check"></i> Facile d'entretien, lavable en machine</li>
                </ul>
              </div>

              <div class="qv-options">
                <div class="qv-size-selector">
                  <label>Taille</label>
                  <div class="qv-sizes">
                    <button class="qv-size" data-size="XS">XS</button>
                    <button class="qv-size" data-size="S">S</button>
                    <button class="qv-size active" data-size="M">M</button>
                    <button class="qv-size" data-size="L">L</button>
                    <button class="qv-size" data-size="XL">XL</button>
                  </div>
                  <a href="#" class="qv-size-guide"><i class="fas fa-ruler"></i> Guide des tailles</a>
                </div>
                
                <div class="qv-color-selector">
                  <label>Couleur</label>
                  <div class="qv-colors" id="qvColors"></div>
                </div>
              </div>

              <div class="qv-quantity">
                <label>Quantité</label>
                <div class="qv-qty-control">
                  <button class="qv-qty-btn" id="qvQtyMinus">-</button>
                  <input type="number" value="1" min="1" max="10" id="qvQtyInput">
                  <button class="qv-qty-btn" id="qvQtyPlus">+</button>
                </div>
              </div>

              <div class="qv-actions">
                <button class="qv-add-cart">
                  <i class="fas fa-shopping-bag"></i>
                  Ajouter au panier
                </button>
                <button class="qv-add-wishlist">
                  <i class="far fa-heart"></i>
                </button>
              </div>

              <div class="qv-trust">
                <div class="qv-trust-item">
                  <i class="fas fa-truck"></i>
                  <span>Livraison gratuite dès 50 000 Ar</span>
                </div>
                <div class="qv-trust-item">
                  <i class="fas fa-undo"></i>
                  <span>Retours gratuits sous 30 jours</span>
                </div>
                <div class="qv-trust-item">
                  <i class="fas fa-shield-alt"></i>
                  <span>Paiement 100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(this.modal);
    },

    attachEvents() {
      // Boutons Quick View
      document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const card = btn.closest('.product-card');
          this.open(card);
        });
      });

      // Fermer modal
      this.modal.querySelector('.qv-close').addEventListener('click', () => this.close());
      this.modal.querySelector('.qv-overlay').addEventListener('click', () => this.close());
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('active')) {
          this.close();
        }
      });

      // Sélection taille
      this.modal.querySelectorAll('.qv-size').forEach(btn => {
        btn.addEventListener('click', () => {
          this.modal.querySelectorAll('.qv-size').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Contrôle quantité
      const qtyInput = this.modal.querySelector('#qvQtyInput');
      this.modal.querySelector('#qvQtyMinus').addEventListener('click', () => {
        if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
      });
      this.modal.querySelector('#qvQtyPlus').addEventListener('click', () => {
        if (qtyInput.value < 10) qtyInput.value = parseInt(qtyInput.value) + 1;
      });

      // Ajouter au panier
      this.modal.querySelector('.qv-add-cart').addEventListener('click', () => {
        this.addToCart();
      });

      // Ajouter aux favoris
      this.modal.querySelector('.qv-add-wishlist').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle('active');
        btn.innerHTML = btn.classList.contains('active') ? 
          '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
      });
    },

    open(card) {
      const name = card.querySelector('h3')?.textContent || 'Produit';
      const price = card.querySelector('.price')?.textContent || '';
      const image = card.querySelector('img')?.src || '';
      const badge = card.querySelector('.product-badge')?.textContent || '';
      const colors = card.querySelectorAll('.color-dot');

      // Remplir les données
      this.modal.querySelector('#qvTitle').textContent = name;
      this.modal.querySelector('#qvPrice').innerHTML = price;
      this.modal.querySelector('#qvMainImage').src = image;
      this.modal.querySelector('#qvBadge').textContent = badge;
      this.modal.querySelector('#qvBadge').style.display = badge ? 'inline-block' : 'none';

      // Couleurs
      const colorsContainer = this.modal.querySelector('#qvColors');
      colorsContainer.innerHTML = '';
      colors.forEach((dot, i) => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'qv-color' + (i === 0 ? ' active' : '');
        colorBtn.style.background = dot.style.backgroundColor;
        colorBtn.addEventListener('click', () => {
          colorsContainer.querySelectorAll('.qv-color').forEach(c => c.classList.remove('active'));
          colorBtn.classList.add('active');
        });
        colorsContainer.appendChild(colorBtn);
      });

      // Thumbnails (simulation)
      const thumbsContainer = this.modal.querySelector('#qvThumbnails');
      thumbsContainer.innerHTML = `
        <img src="${image}" alt="Vue 1" class="active">
        <img src="${image}" alt="Vue 2">
        <img src="${image}" alt="Vue 3">
      `;
      thumbsContainer.querySelectorAll('img').forEach(thumb => {
        thumb.addEventListener('click', () => {
          thumbsContainer.querySelectorAll('img').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          this.modal.querySelector('#qvMainImage').src = thumb.src;
        });
      });

      // Ouvrir
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Initialiser le zoom
      this.initZoom();
    },

    close() {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    },

    initZoom() {
      const mainImage = this.modal.querySelector('#qvMainImage');
      const container = this.modal.querySelector('.qv-main-image');
      const lens = this.modal.querySelector('.qv-zoom-lens');

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        lens.style.left = (x - 50) + 'px';
        lens.style.top = (y - 50) + 'px';
        lens.style.display = 'block';

        const scaleX = (x / rect.width) * 100;
        const scaleY = (y / rect.height) * 100;
        mainImage.style.transformOrigin = `${scaleX}% ${scaleY}%`;
        mainImage.style.transform = 'scale(2)';
      });

      container.addEventListener('mouseleave', () => {
        lens.style.display = 'none';
        mainImage.style.transform = 'scale(1)';
      });
    },

    addToCart() {
      const btn = this.modal.querySelector('.qv-add-cart');
      btn.classList.add('loading');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

      setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('success');
        btn.innerHTML = '<i class="fas fa-check"></i> Ajouté au panier !';

        // Animation du panier
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
          cartIcon.classList.add('cart-bounce');
          const count = cartIcon.querySelector('.cart-count');
          if (count) {
            count.textContent = parseInt(count.textContent) + 1;
            count.style.display = 'flex';
          }
          setTimeout(() => cartIcon.classList.remove('cart-bounce'), 1000);
        }

        setTimeout(() => {
          btn.classList.remove('success');
          btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Ajouter au panier';
        }, 2000);
      }, 800);
    }
  };

  /**
   * Image Zoom on Hover
   * Zoom au survol sur les images produits
   */
  const ImageZoom = {
    init() {
      if (window.innerWidth <= 768) return; // Pas sur mobile

      document.querySelectorAll('.product-image').forEach(container => {
        const img = container.querySelector('img');
        if (!img) return;

        container.addEventListener('mousemove', (e) => {
          const rect = container.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          img.style.transformOrigin = `${x}% ${y}%`;
          img.style.transform = 'scale(1.5)';
        });

        container.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
        });
      });
    }
  };

  // =============================================
  // PHASE 2.4 & 3.2 - TRUST BADGES & MICROCOPY
  // =============================================

  /**
   * Trust Badges Section
   * Ajoute une section de badges de confiance
   */
  const TrustBadges = {
    init() {
      // Vérifier si la section existe déjà
      if (document.querySelector('.trust-badges-section')) return;

      const section = document.createElement('section');
      section.className = 'trust-badges-section';
      section.innerHTML = `
        <div class="trust-badges-container">
          <div class="trust-badge-item">
            <i class="fas fa-truck"></i>
            <h4>Livraison Gratuite</h4>
            <p>Dès 50 000 Ar d'achat à Madagascar</p>
          </div>
          <div class="trust-badge-item">
            <i class="fas fa-undo-alt"></i>
            <h4>Retours Gratuits</h4>
            <p>Sous 30 jours, sans condition</p>
          </div>
          <div class="trust-badge-item">
            <i class="fas fa-shield-alt"></i>
            <h4>Paiement Sécurisé</h4>
            <p>Cryptage SSL 256 bits</p>
          </div>
          <div class="trust-badge-item">
            <i class="fas fa-headset"></i>
            <h4>Service Client</h4>
            <p>Disponible 7j/7 par chat</p>
          </div>
        </div>
      `;

      // Insérer avant le footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.parentNode.insertBefore(section, footer);
      }
    }
  };

  /**
   * Microcopy - Textes rassurants
   * Ajoute des microtextes sur les produits
   */
  const Microcopy = {
    badges: [
      { icon: 'fa-truck', text: 'Livraison rapide' },
      { icon: 'fa-undo', text: 'Retour facile' },
      { icon: 'fa-leaf', text: 'Éco-responsable' },
      { icon: 'fa-heart', text: 'Coup de cœur' }
    ],

    init() {
      document.querySelectorAll('.product-card').forEach((card, index) => {
        // Ajouter des microcopy badges aléatoires
        const productInfo = card.querySelector('.product-info');
        if (!productInfo || productInfo.querySelector('.product-microcopy')) return;

        const microcopyDiv = document.createElement('div');
        microcopyDiv.className = 'product-microcopy';

        // Sélectionner 1-2 badges aléatoires
        const numBadges = Math.random() > 0.5 ? 2 : 1;
        const shuffled = [...this.badges].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < numBadges; i++) {
          const badge = shuffled[i];
          microcopyDiv.innerHTML += `
            <span class="microcopy-badge">
              <i class="fas ${badge.icon}"></i>
              ${badge.text}
            </span>
          `;
        }

        productInfo.appendChild(microcopyDiv);
      });

      // Ajouter des badges "Populaire" sur certains produits
      this.addPopularTags();
    },

    addPopularTags() {
      const productImages = document.querySelectorAll('.product-card .product-image');
      productImages.forEach((img, i) => {
        // Ajouter sur ~20% des produits
        if (Math.random() < 0.2 && !img.querySelector('.popular-tag')) {
          const tag = document.createElement('span');
          tag.className = 'popular-tag';
          tag.innerHTML = '<i class="fas fa-fire"></i> Populaire';
          img.appendChild(tag);
        }
      });
    }
  };

  // =============================================
  // INITIALISATION
  // =============================================

  function init() {
    // Phase 1.1 - Performances
    LazyLoader.init();
    ProgressiveImages.init();

    // Phase 1.2 - Mobile
    MobileMenu.init();
    TouchOptimization.init();

    // Phase 1.3 - Navigation
    PredictiveSearch.init();
    RealTimeFilters.init();

    // Phase 2.1 - Animations scroll
    ScrollAnimations.init();
    ParallaxEffect.init();

    // Phase 2.2 - Micro-interactions
    HoverEffects.init();
    LoadingAnimations.init();

    // Phase 3.1 - Social proof
    RecentlyViewed.init();
    LiveViewers.init();
    StockUrgency.init();

    // Phase 2.3 - Fiches produits
    QuickViewModal.init();
    ImageZoom.init();

    // Phase 2.4 & 3.2 - Hiérarchie visuelle et Copywriting
    TrustBadges.init();
    Microcopy.init();

    console.log('✨ UX Enhancements loaded successfully!');
  }

  // Lancer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

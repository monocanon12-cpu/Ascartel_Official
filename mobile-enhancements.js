/* =============================================
   MOBILE ENHANCEMENTS
   Sticky add-to-cart & Bottom navigation
   ============================================= */

const MobileEnhancements = {
  init() {
    this.createBottomNav();
    this.createStickyAddToCart();
    this.initProductSorting();
    this.updateCartBadge();
  },

  // =============================================
  // BOTTOM NAVIGATION
  // =============================================
  createBottomNav() {
    // Only create on mobile
    if (window.innerWidth > 768) return;
    
    // Check if already exists
    if (document.querySelector('.bottom-nav')) return;

    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.setAttribute('aria-label', 'Navigation mobile');
    
    bottomNav.innerHTML = `
      <div class="bottom-nav-content">
        <a href="index.html" class="bottom-nav-item ${this.isCurrentPage('index') ? 'active' : ''}">
          <i class="fas fa-home"></i>
          <span>Accueil</span>
        </a>
        <a href="index.html#products" class="bottom-nav-item">
          <i class="fas fa-search"></i>
          <span>Explorer</span>
        </a>
        <button class="bottom-nav-item" id="bottomNavCart">
          <i class="fas fa-shopping-bag"></i>
          <span>Panier</span>
          <span class="bottom-nav-badge" id="bottomNavCartBadge" style="display: none;">0</span>
        </button>
        <button class="bottom-nav-item" id="bottomNavWishlist">
          <i class="far fa-heart"></i>
          <span>Favoris</span>
          <span class="bottom-nav-badge" id="bottomNavWishlistBadge" style="display: none;">0</span>
        </button>
        <a href="login.html" class="bottom-nav-item">
          <i class="fas fa-user"></i>
          <span>Compte</span>
        </a>
      </div>
    `;

    document.body.appendChild(bottomNav);

    // Event listeners
    document.getElementById('bottomNavCart').addEventListener('click', () => {
      window.location.href = 'panier.html';
    });

    document.getElementById('bottomNavWishlist').addEventListener('click', () => {
      // Toggle wishlist panel or navigate
      const wishlistPanel = document.querySelector('.wishlist-panel');
      if (wishlistPanel) {
        wishlistPanel.classList.toggle('open');
      }
    });

    this.updateBottomNavBadges();
  },

  isCurrentPage(page) {
    const path = window.location.pathname;
    if (page === 'index') {
      return path === '/' || path.includes('index.html') || path === '';
    }
    return path.includes(page);
  },

  updateBottomNavBadges() {
    // Update cart badge
    const cartBadge = document.getElementById('bottomNavCartBadge');
    if (cartBadge) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      if (count > 0) {
        cartBadge.textContent = count > 9 ? '9+' : count;
        cartBadge.style.display = 'flex';
      } else {
        cartBadge.style.display = 'none';
      }
    }

    // Update wishlist badge
    const wishlistBadge = document.getElementById('bottomNavWishlistBadge');
    if (wishlistBadge) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (wishlist.length > 0) {
        wishlistBadge.textContent = wishlist.length > 9 ? '9+' : wishlist.length;
        wishlistBadge.style.display = 'flex';
      } else {
        wishlistBadge.style.display = 'none';
      }
    }
  },

  // =============================================
  // STICKY ADD-TO-CART
  // =============================================
  createStickyAddToCart() {
    // Only create on mobile
    if (window.innerWidth > 768) return;
    
    // Check if already exists
    if (document.querySelector('.sticky-add-to-cart')) return;

    const stickyBar = document.createElement('div');
    stickyBar.className = 'sticky-add-to-cart';
    stickyBar.id = 'stickyAddToCart';
    
    stickyBar.innerHTML = `
      <div class="sticky-add-to-cart-content">
        <div class="sticky-product-info">
          <div class="sticky-product-name" id="stickyProductName">Sélectionnez un produit</div>
          <div class="sticky-product-price" id="stickyProductPrice">--</div>
        </div>
        <button class="sticky-add-btn" id="stickyAddBtn">
          <i class="fas fa-shopping-bag"></i>
          <span>Ajouter</span>
        </button>
      </div>
    `;

    document.body.appendChild(stickyBar);

    // Show when scrolling past product cards
    this.initStickyScrollBehavior();

    // Add to cart click
    document.getElementById('stickyAddBtn').addEventListener('click', () => {
      const productData = stickyBar.dataset;
      if (productData.productId) {
        this.addToCart({
          id: productData.productId,
          name: productData.productName,
          price: productData.productPrice,
          image: productData.productImage
        });
      }
    });
  },

  initStickyScrollBehavior() {
    const stickyBar = document.getElementById('stickyAddToCart');
    if (!stickyBar) return;

    let lastProduct = null;
    const productCards = document.querySelectorAll('.product-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lastProduct = entry.target;
          this.updateStickyProduct(lastProduct);
        }
      });
    }, {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0
    });

    productCards.forEach(card => observer.observe(card));

    // Show/hide based on scroll position
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const productsSection = document.getElementById('products') || document.querySelector('.products-grid');
      
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        const isInProductsSection = rect.top < window.innerHeight / 2 && rect.bottom > 100;
        
        if (isInProductsSection && lastProduct) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      }
      
      lastScrollY = currentScrollY;
    });
  },

  updateStickyProduct(productCard) {
    const stickyBar = document.getElementById('stickyAddToCart');
    if (!stickyBar || !productCard) return;

    const nameEl = productCard.querySelector('.product-name, h3, .product-title');
    const priceEl = productCard.querySelector('.current-price, .product-price, .price');
    const imgEl = productCard.querySelector('img');

    const name = nameEl ? nameEl.textContent.trim() : 'Produit';
    const price = priceEl ? priceEl.textContent.trim() : '--';
    const image = imgEl ? imgEl.src : '';
    const id = productCard.dataset.productId || productCard.id || Math.random().toString(36).substr(2, 9);

    document.getElementById('stickyProductName').textContent = name;
    document.getElementById('stickyProductPrice').textContent = price;

    stickyBar.dataset.productId = id;
    stickyBar.dataset.productName = name;
    stickyBar.dataset.productPrice = price;
    stickyBar.dataset.productImage = image;
  },

  addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update badges
    this.updateBottomNavBadges();
    this.updateCartBadge();
    
    // Show feedback
    this.showAddedFeedback();
  },

  showAddedFeedback() {
    const btn = document.getElementById('stickyAddBtn');
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> <span>Ajouté !</span>';
    btn.style.background = '#22c55e';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
    }, 1500);
  },

  updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update header cart badge
    const headerBadge = document.querySelector('.cart-count, .cart-badge');
    if (headerBadge) {
      headerBadge.textContent = count;
      headerBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update bottom nav badge
    this.updateBottomNavBadges();
  },

  // =============================================
  // PRODUCT SORTING
  // =============================================
  initProductSorting() {
    const sortSelect = document.querySelector('.sort-select, #productSort');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      const sortValue = e.target.value;
      this.sortProducts(sortValue);
    });
  },

  sortProducts(sortBy) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    const products = Array.from(productsGrid.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
      const priceA = this.extractPrice(a);
      const priceB = this.extractPrice(b);
      const nameA = a.querySelector('.product-name, h3')?.textContent || '';
      const nameB = b.querySelector('.product-name, h3')?.textContent || '';

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'newest':
          // Assume newer products have higher data-id or are first
          return (b.dataset.productId || 0) - (a.dataset.productId || 0);
        default:
          return 0;
      }
    });

    // Re-append sorted products
    products.forEach(product => productsGrid.appendChild(product));
  },

  extractPrice(productCard) {
    const priceEl = productCard.querySelector('.current-price, .product-price, .price');
    if (!priceEl) return 0;
    
    const priceText = priceEl.textContent.replace(/[^\d]/g, '');
    return parseInt(priceText) || 0;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  MobileEnhancements.init();
});

// Re-check on resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    if (!document.querySelector('.bottom-nav')) {
      MobileEnhancements.createBottomNav();
    }
    if (!document.querySelector('.sticky-add-to-cart')) {
      MobileEnhancements.createStickyAddToCart();
    }
  }
});

// Listen for cart updates from other scripts
window.addEventListener('cartUpdated', () => {
  MobileEnhancements.updateCartBadge();
  MobileEnhancements.updateBottomNavBadges();
});

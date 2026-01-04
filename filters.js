// ============================================
// SYSTÈME DE FILTRES AVANCÉS - ASCARTEL
// ============================================

class FiltersSystem {
  constructor() {
    this.filters = {
      genre: [],
      category: [],
      priceMin: null,
      priceMax: null,
      sizes: [],
      colors: [],
      inStock: false,
      flashSale: false
    };
    
    this.products = [];
    this.filteredProducts = [];
    this.onFilterChange = null;
    
    this.init();
  }

  init() {
    this.loadFiltersFromURL();
    this.attachEventListeners();
  }

  // Charger filtres depuis URL
  loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('genre')) this.filters.genre = params.get('genre').split(',');
    if (params.has('category')) this.filters.category = params.get('category').split(',');
    if (params.has('priceMin')) this.filters.priceMin = parseFloat(params.get('priceMin'));
    if (params.has('priceMax')) this.filters.priceMax = parseFloat(params.get('priceMax'));
    if (params.has('sizes')) this.filters.sizes = params.get('sizes').split(',');
    if (params.has('colors')) this.filters.colors = params.get('colors').split(',');
    if (params.has('inStock')) this.filters.inStock = params.get('inStock') === 'true';
    if (params.has('flashSale')) this.filters.flashSale = params.get('flashSale') === 'true';
    
    this.updateUIFromFilters();
  }

  // Mettre à jour URL avec filtres
  updateURL() {
    const params = new URLSearchParams();
    
    if (this.filters.genre.length) params.set('genre', this.filters.genre.join(','));
    if (this.filters.category.length) params.set('category', this.filters.category.join(','));
    if (this.filters.priceMin) params.set('priceMin', this.filters.priceMin);
    if (this.filters.priceMax) params.set('priceMax', this.filters.priceMax);
    if (this.filters.sizes.length) params.set('sizes', this.filters.sizes.join(','));
    if (this.filters.colors.length) params.set('colors', this.filters.colors.join(','));
    if (this.filters.inStock) params.set('inStock', 'true');
    if (this.filters.flashSale) params.set('flashSale', 'true');
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }

  // Attacher événements
  attachEventListeners() {
    // Checkboxes genre
    document.querySelectorAll('input[name="genre"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.toggleArrayFilter('genre', e.target.value, e.target.checked);
      });
    });

    // Checkboxes catégorie
    document.querySelectorAll('input[name="category"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.toggleArrayFilter('category', e.target.value, e.target.checked);
      });
    });

    // Prix min/max
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin) {
      priceMin.addEventListener('input', (e) => {
        this.filters.priceMin = e.target.value ? parseFloat(e.target.value) : null;
        this.applyFilters();
      });
    }
    
    if (priceMax) {
      priceMax.addEventListener('input', (e) => {
        this.filters.priceMax = e.target.value ? parseFloat(e.target.value) : null;
        this.applyFilters();
      });
    }

    // Tailles
    document.querySelectorAll('input[name="size"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.toggleArrayFilter('sizes', e.target.value, e.target.checked);
      });
    });

    // Couleurs
    document.querySelectorAll('input[name="color"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.toggleArrayFilter('colors', e.target.value, e.target.checked);
      });
    });

    // En stock
    const inStockCheckbox = document.getElementById('inStock');
    if (inStockCheckbox) {
      inStockCheckbox.addEventListener('change', (e) => {
        this.filters.inStock = e.target.checked;
        this.applyFilters();
      });
    }

    // Vente flash
    const flashSaleCheckbox = document.getElementById('flashSale');
    if (flashSaleCheckbox) {
      flashSaleCheckbox.addEventListener('change', (e) => {
        this.filters.flashSale = e.target.checked;
        this.applyFilters();
      });
    }

    // Reset
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // Toggle sidebar mobile
    const toggleBtn = document.getElementById('toggleFilters');
    const sidebar = document.querySelector('.filters-sidebar');
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }
  }

  // Toggle filtre tableau
  toggleArrayFilter(key, value, checked) {
    if (checked) {
      if (!this.filters[key].includes(value)) {
        this.filters[key].push(value);
      }
    } else {
      this.filters[key] = this.filters[key].filter(v => v !== value);
    }
    this.applyFilters();
  }

  // Appliquer filtres
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Genre
      if (this.filters.genre.length && !this.filters.genre.includes(product.genre)) {
        return false;
      }

      // Catégorie
      if (this.filters.category.length && !this.filters.category.includes(product.category)) {
        return false;
      }

      // Prix
      if (this.filters.priceMin && product.price < this.filters.priceMin) {
        return false;
      }
      if (this.filters.priceMax && product.price > this.filters.priceMax) {
        return false;
      }

      // Tailles
      if (this.filters.sizes.length) {
        const productSizes = product.sizes || [];
        if (!this.filters.sizes.some(size => productSizes.includes(size))) {
          return false;
        }
      }

      // Couleurs
      if (this.filters.colors.length) {
        const productColors = product.colors || [];
        if (!this.filters.colors.some(color => productColors.includes(color))) {
          return false;
        }
      }

      // En stock
      if (this.filters.inStock && product.stock <= 0) {
        return false;
      }

      // Vente flash
      if (this.filters.flashSale && !product.flash_sale) {
        return false;
      }

      return true;
    });

    this.updateResultsCount();
    this.updateURL();
    
    if (this.onFilterChange) {
      this.onFilterChange(this.filteredProducts);
    }
  }

  // Mettre à jour compteur
  updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
      countElement.textContent = this.filteredProducts.length;
    }

    const totalElement = document.getElementById('totalProducts');
    if (totalElement) {
      totalElement.textContent = this.products.length;
    }
  }

  // Reset filtres
  resetFilters() {
    this.filters = {
      genre: [],
      category: [],
      priceMin: null,
      priceMax: null,
      sizes: [],
      colors: [],
      inStock: false,
      flashSale: false
    };

    // Reset UI
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';

    this.applyFilters();
  }

  // Mettre à jour UI depuis filtres
  updateUIFromFilters() {
    // Genre
    this.filters.genre.forEach(value => {
      const input = document.querySelector(`input[name="genre"][value="${value}"]`);
      if (input) input.checked = true;
    });

    // Catégorie
    this.filters.category.forEach(value => {
      const input = document.querySelector(`input[name="category"][value="${value}"]`);
      if (input) input.checked = true;
    });

    // Prix
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin && this.filters.priceMin) priceMin.value = this.filters.priceMin;
    if (priceMax && this.filters.priceMax) priceMax.value = this.filters.priceMax;

    // Tailles
    this.filters.sizes.forEach(value => {
      const input = document.querySelector(`input[name="size"][value="${value}"]`);
      if (input) input.checked = true;
    });

    // Couleurs
    this.filters.colors.forEach(value => {
      const input = document.querySelector(`input[name="color"][value="${value}"]`);
      if (input) input.checked = true;
    });

    // En stock
    const inStockCheckbox = document.getElementById('inStock');
    if (inStockCheckbox) inStockCheckbox.checked = this.filters.inStock;

    // Vente flash
    const flashSaleCheckbox = document.getElementById('flashSale');
    if (flashSaleCheckbox) flashSaleCheckbox.checked = this.filters.flashSale;
  }

  // Charger produits
  setProducts(products) {
    this.products = products;
    this.applyFilters();
  }

  // Obtenir produits filtrés
  getFilteredProducts() {
    return this.filteredProducts;
  }

  // Obtenir filtres actifs
  getActiveFilters() {
    return this.filters;
  }

  // Compter filtres actifs
  getActiveFiltersCount() {
    let count = 0;
    if (this.filters.genre.length) count++;
    if (this.filters.category.length) count++;
    if (this.filters.priceMin || this.filters.priceMax) count++;
    if (this.filters.sizes.length) count++;
    if (this.filters.colors.length) count++;
    if (this.filters.inStock) count++;
    if (this.filters.flashSale) count++;
    return count;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FiltersSystem;
}

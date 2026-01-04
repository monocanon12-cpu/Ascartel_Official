// ============================================
// SYSTÈME DE TRI PRODUITS - ASCARTEL
// ============================================

class ProductSort {
  constructor() {
    this.currentSort = localStorage.getItem('productSort') || 'default';
    this.products = [];
    this.onSortChange = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.updateUI();
  }

  attachEventListeners() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.value = this.currentSort;
      sortSelect.addEventListener('change', (e) => {
        this.setSort(e.target.value);
      });
    }
  }

  setSort(sortType) {
    this.currentSort = sortType;
    localStorage.setItem('productSort', sortType);
    this.updateUI();
    this.applySorting();
  }

  updateUI() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.value = this.currentSort;
    }
  }

  setProducts(products) {
    this.products = products;
    this.applySorting();
  }

  applySorting() {
    let sorted = [...this.products];

    switch (this.currentSort) {
      case 'price-asc':
        sorted.sort((a, b) => a.prix - b.prix);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.prix - a.prix);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      case 'newest':
        sorted.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = a.flash_sale ? a.flash_sale.discount : 0;
          const discountB = b.flash_sale ? b.flash_sale.discount : 0;
          return discountB - discountA;
        });
        break;
      default:
        // default: garder l'ordre original
        break;
    }

    if (this.onSortChange) {
      this.onSortChange(sorted);
    }
  }

  getSortedProducts() {
    return this.products;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductSort;
}

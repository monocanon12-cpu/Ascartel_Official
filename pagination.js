// ============================================
// SYSTÈME DE PAGINATION - ASCARTEL
// ============================================

class Pagination {
  constructor(options = {}) {
    this.currentPage = 1;
    this.itemsPerPage = options.itemsPerPage || 20;
    this.totalItems = 0;
    this.totalPages = 0;
    this.maxButtons = options.maxButtons || 5;
    this.containerId = options.containerId || 'paginationContainer';
    this.onPageChange = null;
    
    this.init();
  }

  init() {
    this.loadPageFromURL();
  }

  loadPageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    this.currentPage = page;
  }

  updateURL() {
    const params = new URLSearchParams(window.location.search);
    if (this.currentPage > 1) {
      params.set('page', this.currentPage);
    } else {
      params.delete('page');
    }
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }

  setTotalItems(total) {
    this.totalItems = total;
    this.totalPages = Math.ceil(total / this.itemsPerPage);
    this.render();
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateURL();
    this.render();
    
    if (this.onPageChange) {
      this.onPageChange(page);
    }
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers() {
    const pages = [];
    const half = Math.floor(this.maxButtons / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxButtons - 1);
    
    if (end - start < this.maxButtons - 1) {
      start = Math.max(1, end - this.maxButtons + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container || this.totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    const pages = this.getPageNumbers();
    const showFirst = pages[0] > 1;
    const showLast = pages[pages.length - 1] < this.totalPages;

    container.innerHTML = `
      <div class="pagination">
        <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="pagination.prevPage()">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        ${showFirst ? `
          <button class="pagination-btn" onclick="pagination.goToPage(1)">1</button>
          ${pages[0] > 2 ? '<span class="pagination-dots">...</span>' : ''}
        ` : ''}
        
        ${pages.map(page => `
          <button class="pagination-btn ${page === this.currentPage ? 'active' : ''}" 
                  onclick="pagination.goToPage(${page})">
            ${page}
          </button>
        `).join('')}
        
        ${showLast ? `
          ${pages[pages.length - 1] < this.totalPages - 1 ? '<span class="pagination-dots">...</span>' : ''}
          <button class="pagination-btn" onclick="pagination.goToPage(${this.totalPages})">${this.totalPages}</button>
        ` : ''}
        
        <button class="pagination-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''} onclick="pagination.nextPage()">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="pagination-info">
        Page ${this.currentPage} sur ${this.totalPages} • ${this.totalItems} produits
      </div>
    `;
  }

  getCurrentPage() {
    return this.currentPage;
  }

  getOffset() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pagination;
}

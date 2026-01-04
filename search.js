// =============================================
// ASCARTEL - Système de Recherche Avancé
// =============================================

class SearchSystem {
  constructor() {
    this.searchInput = null;
    this.searchResults = null;
    this.debounceTimer = null;
    this.debounceDelay = 300;
    this.minChars = 2;
    this.maxResults = 5;
    this.currentIndex = -1;
    this.results = [];
  }

  init() {
    this.searchInput = document.querySelector('#searchInput, .search-box input[type="text"]');
    
    if (!this.searchInput) {
      console.warn('Search input not found');
      return;
    }

    // Créer le conteneur de résultats
    this.createResultsContainer();

    // Événements
    this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));
    this.searchInput.addEventListener('focus', () => this.showResults());
    
    // Fermer au clic extérieur
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        this.hideResults();
      }
    });

    console.log('✨ Système de recherche initialisé');
  }

  createResultsContainer() {
    const searchBox = this.searchInput.closest('.search-box');
    
    this.searchResults = document.createElement('div');
    this.searchResults.className = 'search-results';
    this.searchResults.style.display = 'none';
    
    searchBox.style.position = 'relative';
    searchBox.appendChild(this.searchResults);
  }

  handleInput(e) {
    const query = e.target.value.trim();

    // Annuler le timer précédent
    clearTimeout(this.debounceTimer);

    if (query.length < this.minChars) {
      this.hideResults();
      return;
    }

    // Debounce
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.debounceDelay);
  }

  async search(query) {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/articles?limit=50`);
      const data = await response.json();

      if (data.success && data.articles) {
        // Filtrer les résultats
        this.results = data.articles.filter(article => {
          const searchText = `${article.nom} ${article.description || ''} ${article.categorie || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        }).slice(0, this.maxResults);

        this.displayResults(query);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  }

  displayResults(query) {
    if (this.results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-result-item no-results">
          <i class="fas fa-search"></i>
          <span>Aucun résultat pour "${query}"</span>
        </div>
      `;
      this.showResults();
      return;
    }

    this.searchResults.innerHTML = this.results.map((article, index) => `
      <div class="search-result-item" data-index="${index}" onclick="searchSystem.selectResult(${article.id})">
        <img src="${article.image_url || 'https://via.placeholder.com/40x50'}" alt="${article.nom}">
        <div class="result-info">
          <div class="result-name">${this.highlightText(article.nom, query)}</div>
          <div class="result-category">${article.categorie || ''}</div>
        </div>
        <div class="result-price">${article.prix.toLocaleString()} Ar</div>
      </div>
    `).join('');

    this.showResults();
    this.currentIndex = -1;
  }

  highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  handleKeyboard(e) {
    if (!this.searchResults || this.searchResults.style.display === 'none') {
      return;
    }

    const items = this.searchResults.querySelectorAll('.search-result-item:not(.no-results)');

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentIndex = Math.min(this.currentIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.currentIndex = Math.max(this.currentIndex - 1, -1);
        this.updateSelection(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.currentIndex >= 0 && this.results[this.currentIndex]) {
          this.selectResult(this.results[this.currentIndex].id);
        } else {
          this.searchPage();
        }
        break;

      case 'Escape':
        this.hideResults();
        this.searchInput.blur();
        break;
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  selectResult(productId) {
    window.location.href = `produit-detail.html?id=${productId}`;
  }

  searchPage() {
    const query = this.searchInput.value.trim();
    if (query) {
      window.location.href = `recherche.html?q=${encodeURIComponent(query)}`;
    }
  }

  showResults() {
    if (this.searchResults && this.searchResults.innerHTML) {
      this.searchResults.style.display = 'block';
    }
  }

  hideResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'none';
    }
  }
}

// Instance globale
const searchSystem = new SearchSystem();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
  searchSystem.init();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchSystem, searchSystem };
}

// =============================================
// ASCARTEL - Gestion des produits avec API
// =============================================

// Charger la configuration
const API_URL = typeof CONFIG !== 'undefined' ? CONFIG.apiUrl : 'http://localhost:3000/api';
const USE_API = typeof CONFIG !== 'undefined' ? CONFIG.mode === 'api' : false;

// =============================================
// CHARGEMENT DES PRODUITS
// =============================================
async function loadProducts(genre = 'all', flashOnly = false) {
  const productsGrid = document.getElementById('productsGrid');
  
  if (!productsGrid) {
    console.warn('Element productsGrid non trouvé');
    return;
  }
  
  // Afficher un loader
  productsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #f68db5; margin-bottom: 20px;"></i>
      <p style="color: #6b7280; font-size: 1.1rem;">Chargement des produits...</p>
    </div>
  `;
  
  // Mode standalone : utiliser les produits de démonstration
  if (!USE_API && typeof CONFIG !== 'undefined' && CONFIG.demoProducts) {
    console.log('🎨 Mode standalone : utilisation des produits de démonstration');
    
    let products = [...CONFIG.demoProducts]; // Copie pour éviter la mutation
    
    // Filtrer par genre
    if (genre !== 'all') {
      products = products.filter(p => p.genre === genre);
    }
    
    // Filtrer par ventes flash
    if (flashOnly) {
      products = products.filter(p => p.flash_sale && p.flash_sale.active);
    }
    
    // Simuler un délai de chargement
    setTimeout(() => {
      if (products.length > 0) {
        renderProducts(products);
      } else {
        showEmptyState(genre);
      }
    }, 300);
    
    return;
  }
  
  // Mode API : charger depuis le backend
  try {
    console.log('🌐 Mode API : chargement depuis le backend');
    
    // Construire l'URL avec les filtres
    let url = `${API_URL}/articles?limit=50`;
    
    if (genre !== 'all') {
      url += `&genre=${encodeURIComponent(genre)}`;
    }
    
    if (flashOnly) {
      url += `&flash_only=true`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.articles && data.articles.length > 0) {
      renderProducts(data.articles);
    } else {
      showEmptyState(genre);
    }
    
  } catch (error) {
    console.error('❌ Erreur chargement produits:', error);
    console.log('💡 Astuce : Lancez le backend avec "cd backend && npm start" ou passez en mode standalone dans config.js');
    showErrorState();
  }
}

// =============================================
// AFFICHAGE DES PRODUITS
// =============================================
function renderProducts(articles) {
  const productsGrid = document.getElementById('productsGrid');
  
  productsGrid.innerHTML = articles.map(article => {
    const isFlash = article.flash_sale && article.flash_sale.active;
    const price = isFlash ? article.prix : article.prix_original;
    const originalPrice = isFlash ? article.prix_original : null;
    const discount = isFlash ? article.flash_sale.discount : null;
    
    return `
      <div class="product-card" data-product-id="${article.id}">
        ${isFlash ? `<div class="product-badge sale">-${discount}%</div>` : ''}
        ${article.genre ? `<div class="product-badge">${getGenreIcon(article.genre)} ${article.genre}</div>` : ''}
        ${article.stock <= 0 ? '<div class="product-badge" style="background: #ef4444;">Rupture</div>' : ''}
        ${article.stock > 0 && article.stock <= 5 ? '<div class="product-badge" style="background: #f59e0b;">Stock faible</div>' : ''}
        
        <div class="product-image">
          ${article.image_url ? 
            `<img src="${article.image_url}" alt="${article.nom}" loading="lazy" />` : 
            `<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#d1d5db;font-size:3rem;">
              <i class="fas fa-image"></i>
            </div>`
          }
          <div class="product-actions">
            <button class="quick-view" onclick="viewProduct(${article.id})">Voir plus</button>
            <button class="add-to-cart" data-product-id="${article.id}" ${article.stock <= 0 ? 'disabled' : ''}>
              ${article.stock <= 0 ? 'Indisponible' : 'Ajouter au panier'}
            </button>
          </div>
          <button class="wishlist-btn" data-product-id="${article.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
        
        <div class="product-info">
          <h3>${article.nom}</h3>
          ${article.categorie ? `<p class="product-category">${article.categorie}</p>` : ''}
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
            ${originalPrice ? `<span class="original-price">${formatPrice(originalPrice)}</span>` : ''}
            <span class="price">${formatPrice(price)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Retirer la classe loading
  productsGrid.classList.remove('loading');
  
  // Animer les cartes avec un délai échelonné
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate-in');
    }, index * 100); // Délai de 100ms entre chaque carte
  });
}

// =============================================
// ÉTATS VIDES ET ERREURS
// =============================================
function showEmptyState(genre) {
  const productsGrid = document.getElementById('productsGrid');
  const genreText = genre === 'all' ? 'produits' : `produits pour ${genre}`;
  
  productsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
      <i class="fas fa-box-open" style="font-size: 4rem; color: #d1d5db; margin-bottom: 20px;"></i>
      <h3 style="color: #374151; margin: 0 0 10px 0;">Aucun ${genreText} disponible</h3>
      <p style="color: #6b7280; margin: 0 0 30px 0;">Revenez bientôt pour découvrir nos nouveautés !</p>
      <button class="cta-button" onclick="loadProducts('all')">Voir tous les produits</button>
    </div>
  `;
}

function showErrorState() {
  const productsGrid = document.getElementById('productsGrid');
  
  productsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
      <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;"></i>
      <h3 style="color: #374151; margin: 0 0 10px 0;">Erreur de connexion</h3>
      <p style="color: #6b7280; margin: 0 0 30px 0;">Impossible de charger les produits. Vérifiez que le serveur backend est lancé.</p>
      <button class="cta-button" onclick="loadProducts('all')">
        <i class="fas fa-redo"></i> Réessayer
      </button>
    </div>
  `;
}

// =============================================
// FILTRES
// =============================================
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active');
      
      // Animation de chargement
      const productsGrid = document.getElementById('productsGrid');
      productsGrid.classList.add('loading');
      
      // Récupérer le genre
      const genre = btn.dataset.genre;
      
      // Délai pour l'animation
      setTimeout(() => {
        // Charger les produits filtrés
        if (genre === 'flash') {
          loadProducts('all', true);
        } else {
          loadProducts(genre, false);
        }
      }, 150);
    });
  });
}

// =============================================
// UTILITAIRES
// =============================================
function formatPrice(price) {
  const n = Math.round(Number(price) || 0);
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} Ar`;
}

function getGenreIcon(genre) {
  const icons = {
    'Femme': '👩',
    'Homme': '👨',
    'Enfant': '👶',
    'Unisexe': '👥',
    'Accessoires': '💍'
  };
  return icons[genre] || '';
}

function viewProduct(productId) {
  // Rediriger vers la page produit (à implémenter)
  console.log('Voir produit:', productId);
  alert(`Fonctionnalité à venir : Voir le produit #${productId}`);
}

// =============================================
// INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Charger tous les produits au démarrage
  loadProducts('all');
  
  // Configurer les filtres
  setupFilters();
  
  console.log('✨ API Produits ASCARTEL initialisée');
});

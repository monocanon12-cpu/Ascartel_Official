// ============================================
// WISHLIST PAGE - ASCARTEL
// ============================================

class WishlistManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('ascartel_wishlist')) || [];
    this.init();
  }

  init() {
    this.render();
    this.updateCount();
  }

  getItems() {
    return this.items;
  }

  addItem(item) {
    if (!this.items.find(i => i.id === item.id)) {
      this.items.push(item);
      this.save();
      this.render();
      this.updateCount();
      this.showNotification('Ajouté aux favoris ❤️');
    }
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
    this.render();
    this.updateCount();
    this.showNotification('Retiré des favoris');
  }

  clearAll() {
    if (confirm('Voulez-vous vraiment vider votre liste de souhaits ?')) {
      this.items = [];
      this.save();
      this.render();
      this.updateCount();
      this.showNotification('Liste de souhaits vidée');
    }
  }

  save() {
    localStorage.setItem('ascartel_wishlist', JSON.stringify(this.items));
  }

  updateCount() {
    const countEl = document.getElementById('wishlistCount');
    if (countEl) {
      countEl.textContent = this.items.length;
      countEl.style.display = this.items.length > 0 ? 'flex' : 'none';
    }
  }

  render() {
    const container = document.getElementById('wishlistContent');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <i class="far fa-heart"></i>
          <h2>Votre liste de souhaits est vide</h2>
          <p>Ajoutez vos articles préférés pour les retrouver facilement</p>
          <a href="index.html" class="cta-button">
            <i class="fas fa-shopping-bag"></i> Découvrir nos produits
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="wishlist-actions">
        <p class="wishlist-count-text">
          <strong>${this.items.length}</strong> article${this.items.length > 1 ? 's' : ''} dans votre liste
        </p>
        <button class="clear-wishlist-btn" onclick="wishlistManager.clearAll()">
          <i class="fas fa-trash"></i> Vider la liste
        </button>
      </div>
      
      <div class="wishlist-grid">
        ${this.items.map(item => `
          <div class="wishlist-item" data-id="${item.id}">
            <div class="wishlist-item-image">
              <button class="remove-wishlist-btn" onclick="wishlistManager.removeItem('${item.id}')">
                <i class="fas fa-times"></i>
              </button>
              <img src="${item.image || 'https://via.placeholder.com/300x400'}" alt="${item.name}">
            </div>
            <div class="wishlist-item-info">
              <h3>${item.name}</h3>
              <div class="wishlist-item-price">${item.price}</div>
              <div class="wishlist-item-actions">
                <button class="add-to-cart-btn" onclick="wishlistManager.addToCart('${item.id}')">
                  <i class="fas fa-shopping-bag"></i> Ajouter
                </button>
                <button class="view-product-btn" onclick="location.href='produit-detail.html?id=${item.id}'">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  addToCart(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    // Utiliser le système de panier existant
    if (typeof cart !== 'undefined') {
      cart.add(id, item);
    } else {
      // Fallback si cart n'est pas disponible
      const cartItems = JSON.parse(localStorage.getItem('ascartel_cart')) || [];
      const existing = cartItems.find(i => i.id === id);
      
      if (existing) {
        existing.quantity++;
      } else {
        cartItems.push({ ...item, quantity: 1 });
      }
      
      localStorage.setItem('ascartel_cart', JSON.stringify(cartItems));
      this.showNotification('Ajouté au panier 🛒');
      
      // Mettre à jour le compteur panier
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        const total = cartItems.reduce((sum, i) => sum + i.quantity, 0);
        cartCount.textContent = total;
        cartCount.style.display = total > 0 ? 'flex' : 'none';
      }
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'wishlist-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, #f9c5d5, #f68db5);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Initialiser
let wishlistManager;

document.addEventListener('DOMContentLoaded', () => {
  wishlistManager = new WishlistManager();
  
  // Mettre à jour le compteur panier
  const cartItems = JSON.parse(localStorage.getItem('ascartel_cart')) || [];
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const total = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    cartCount.textContent = total;
    cartCount.style.display = total > 0 ? 'flex' : 'none';
  }
});

// Animations CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

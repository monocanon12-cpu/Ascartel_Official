// =============================================
// ASCARTEL - Système de Panier
// =============================================

class Cart {
  constructor() {
    this.items = this.loadFromStorage();
    this.updateUI();
  }

  // Charger le panier depuis localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('ascartel_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      return [];
    }
  }

  // Sauvegarder dans localStorage
  saveToStorage() {
    try {
      localStorage.setItem('ascartel_cart', JSON.stringify(this.items));
      this.updateUI();
    } catch (error) {
      console.error('Erreur sauvegarde panier:', error);
    }
  }

  // Ajouter un produit
  addItem(product) {
    const { id, nom, prix, image_url, taille = 'M', couleur = 'Noir', quantite = 1 } = product;

    // Vérifier si le produit existe déjà avec même taille/couleur
    const existingIndex = this.items.findIndex(
      item => item.id === id && item.taille === taille && item.couleur === couleur
    );

    if (existingIndex > -1) {
      // Augmenter la quantité
      this.items[existingIndex].quantite += quantite;
    } else {
      // Ajouter nouveau produit
      this.items.push({
        id,
        nom,
        prix,
        image_url,
        taille,
        couleur,
        quantite
      });
    }

    this.saveToStorage();
    this.showNotification(`✅ ${nom} ajouté au panier`, 'success');
    return true;
  }

  // Retirer un produit
  removeItem(id, taille, couleur) {
    const index = this.items.findIndex(
      item => item.id === id && item.taille === taille && item.couleur === couleur
    );

    if (index > -1) {
      const removedItem = this.items.splice(index, 1)[0];
      this.saveToStorage();
      this.showNotification(`🗑️ ${removedItem.nom} retiré du panier`, 'info');
      return true;
    }
    return false;
  }

  // Mettre à jour la quantité
  updateQuantity(id, taille, couleur, newQuantity) {
    const item = this.items.find(
      item => item.id === id && item.taille === taille && item.couleur === couleur
    );

    if (item) {
      if (newQuantity <= 0) {
        return this.removeItem(id, taille, couleur);
      }
      item.quantite = newQuantity;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Vider le panier
  clear() {
    this.items = [];
    this.saveToStorage();
    this.showNotification('🗑️ Panier vidé', 'info');
  }

  // Obtenir le nombre total d'articles
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantite, 0);
  }

  // Obtenir le prix total
  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.prix * item.quantite), 0);
  }

  // Obtenir tous les articles
  getItems() {
    return this.items;
  }

  // Mettre à jour l'UI (badge compteur)
  updateUI() {
    const totalItems = this.getTotalItems();
    const badges = document.querySelectorAll('.cart-count');
    
    badges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
      
      // Animation bounce
      if (totalItems > 0) {
        badge.style.animation = 'none';
        setTimeout(() => {
          badge.style.animation = 'cartBounce 0.5s ease';
        }, 10);
      }
    });
  }

  // Afficher une notification
  showNotification(message, type = 'success') {
    // Retirer les anciennes notifications
    const oldNotif = document.querySelector('.cart-notification');
    if (oldNotif) oldNotif.remove();

    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification-${type}`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);

    // Retirer après 3 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Instance globale du panier
const cart = new Cart();

// Fonctions globales pour compatibilité
function addToCart(productId, productName, productPrice, productImage = '', size = 'M', color = 'Noir', quantity = 1) {
  return cart.addItem({
    id: productId,
    nom: productName,
    prix: productPrice,
    image_url: productImage,
    taille: size,
    couleur: color,
    quantite: quantity
  });
}

function removeFromCart(productId, size = 'M', color = 'Noir') {
  return cart.removeItem(productId, size, color);
}

function updateCartQuantity(productId, size, color, newQuantity) {
  return cart.updateQuantity(productId, size, color, newQuantity);
}

function clearCart() {
  return cart.clear();
}

function getCartTotal() {
  return cart.getTotalPrice();
}

function getCartItems() {
  return cart.getItems();
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  cart.updateUI();
  console.log('🛒 Système de panier initialisé');
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Cart, cart };
}

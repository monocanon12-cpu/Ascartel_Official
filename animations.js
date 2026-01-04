// ============================================
// ANIMATIONS MANAGER - ASCARTEL
// ============================================

class AnimationsManager {
  constructor() {
    this.observers = [];
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupHoverEffects();
    this.setupRippleEffect();
    this.setupStaggerAnimations();
  }

  // Scroll reveal avec Intersection Observer
  setupScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  // Hover effects dynamiques
  setupHoverEffects() {
    // Cartes produits
    document.querySelectorAll('.product-card').forEach(card => {
      card.classList.add('hover-lift');
    });

    // Boutons CTA
    document.querySelectorAll('.cta-button, .add-to-cart').forEach(btn => {
      btn.classList.add('btn-animated', 'ripple');
    });
  }

  // Effet ripple sur les boutons
  setupRippleEffect() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.ripple');
      if (!button) return;

      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
      `;

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Animations en cascade
  setupStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-children');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    staggerContainers.forEach(container => observer.observe(container));
    this.observers.push(observer);
  }

  // Animer l'ajout au panier
  animateAddToCart(button) {
    button.classList.add('added');
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-check';
    }
    
    setTimeout(() => {
      button.classList.remove('added');
      if (icon) {
        icon.className = 'fas fa-shopping-bag';
      }
    }, 1500);
  }

  // Animer le compteur panier
  animateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
      badge.classList.add('notification-badge');
      setTimeout(() => badge.classList.remove('notification-badge'), 2000);
    }
  }

  // Animer wishlist
  animateWishlist(button) {
    button.classList.add('active');
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-heart';
    }
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Ajouter les keyframes CSS dynamiquement
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-effect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialiser
let animationsManager;

document.addEventListener('DOMContentLoaded', () => {
  animationsManager = new AnimationsManager();
  console.log('✨ Animations Manager initialisé');
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationsManager;
}

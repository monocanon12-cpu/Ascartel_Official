/* =============================================
   POLISH PASS - JavaScript Enhancements
   Micro-interactions, scroll reveals, form validation
   ============================================= */

const PolishEnhancements = {
  init() {
    this.initScrollReveal();
    this.initFormValidation();
    this.initCartBounce();
    this.initImageFallback();
    this.initSmoothScrollLinks();
    this.initExternalLinks();
    this.initLoadingButtons();
  },

  // =============================================
  // SCROLL REVEAL ANIMATION
  // =============================================
  initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.product-card, .testimonial-card, .faq-item, .value-card, .contact-card, section > h2'
    );

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Stagger animation
            setTimeout(() => {
              entry.target.classList.add('revealed');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 50);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  },

  // =============================================
  // FORM VALIDATION
  // =============================================
  initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach((input) => {
        // Validate on blur
        input.addEventListener('blur', () => {
          this.validateField(input);
        });

        // Remove error on input
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            this.removeError(input);
          }
        });
      });

      // Prevent submit if invalid
      form.addEventListener('submit', (e) => {
        let isValid = true;

        inputs.forEach((input) => {
          if (!this.validateField(input)) {
            isValid = false;
          }
        });

        if (!isValid) {
          e.preventDefault();
          // Focus first invalid field
          const firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.classList.add('shake');
            setTimeout(() => firstInvalid.classList.remove('shake'), 500);
          }
        }
      });
    });
  },

  validateField(input) {
    // Skip if no validation needed
    if (!input.required && !input.pattern) return true;

    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (input.required && !value) {
      isValid = false;
      errorMessage = 'Ce champ est requis';
    }

    // Email validation
    if (input.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Veuillez entrer une adresse email valide';
      }
    }

    // Phone validation
    if (input.type === 'tel' && value) {
      const phoneRegex = /^[\d\s+()-]{8,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Veuillez entrer un numéro de téléphone valide';
      }
    }

    // Min length
    if (input.minLength && value.length < input.minLength) {
      isValid = false;
      errorMessage = `Minimum ${input.minLength} caractères requis`;
    }

    // Pattern validation
    if (input.pattern && value) {
      const regex = new RegExp(input.pattern);
      if (!regex.test(value)) {
        isValid = false;
        errorMessage = input.title || 'Format invalide';
      }
    }

    // Apply visual feedback
    if (isValid) {
      this.setValid(input);
    } else {
      this.setError(input, errorMessage);
    }

    return isValid;
  },

  setError(input, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');

    // Remove existing error
    this.removeError(input);

    // Add error message
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    input.parentNode.appendChild(errorEl);
  },

  setValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    this.removeError(input);
  },

  removeError(input) {
    input.classList.remove('is-invalid');
    const existingError = input.parentNode.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
  },

  // =============================================
  // CART BOUNCE ANIMATION
  // =============================================
  initCartBounce() {
    // Listen for add to cart events
    document.addEventListener('click', (e) => {
      const addToCartBtn = e.target.closest('.add-to-cart, .btn-add-cart, [data-add-cart]');
      if (!addToCartBtn) return;

      // Find cart icon
      const cartIcon = document.querySelector('.cart-icon, .fa-shopping-bag, .fa-shopping-cart');
      if (cartIcon) {
        cartIcon.classList.add('bounce');
        setTimeout(() => cartIcon.classList.remove('bounce'), 500);
      }

      // Update cart badge
      const cartBadge = document.querySelector('.cart-count, .cart-badge');
      if (cartBadge) {
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 300);
      }
    });
  },

  // =============================================
  // IMAGE FALLBACK
  // =============================================
  initImageFallback() {
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function () {
        if (!this.dataset.fallbackApplied) {
          this.dataset.fallbackApplied = 'true';
          this.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
              <rect fill="#f8f8f8" width="300" height="400"/>
              <text fill="#9ca3af" font-family="sans-serif" font-size="14" text-anchor="middle" x="150" y="200">
                Image non disponible
              </text>
            </svg>
          `);
          this.alt = 'Image non disponible';
        }
      });

      // Lazy load fade in
      img.addEventListener('load', function () {
        this.classList.add('lazy-loaded');
      });
    });
  },

  // =============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL without jumping
          history.pushState(null, null, targetId);
        }
      });
    });
  },

  // =============================================
  // EXTERNAL LINKS
  // =============================================
  initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      // Check if external
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  },

  // =============================================
  // LOADING BUTTONS
  // =============================================
  initLoadingButtons() {
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', function () {
        const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn && !submitBtn.classList.contains('btn-loading')) {
          submitBtn.classList.add('btn-loading');
          submitBtn.disabled = true;

          // Reset after timeout (for demo purposes)
          setTimeout(() => {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
          }, 3000);
        }
      });
    });
  }
};

// =============================================
// TOAST NOTIFICATIONS SYSTEM
// =============================================
const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);

    // Add styles if not present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-container {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }
        
        .toast {
          padding: 16px 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideInRight 0.3s ease;
        }
        
        .toast.toast-success { border-left: 4px solid #22c55e; }
        .toast.toast-error { border-left: 4px solid #ef4444; }
        .toast.toast-warning { border-left: 4px solid #f59e0b; }
        .toast.toast-info { border-left: 4px solid #3b82f6; }
        
        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .toast-success .toast-icon { background: #dcfce7; color: #22c55e; }
        .toast-error .toast-icon { background: #fee2e2; color: #ef4444; }
        .toast-warning .toast-icon { background: #fef3c7; color: #f59e0b; }
        .toast-info .toast-icon { background: #dbeafe; color: #3b82f6; }
        
        .toast-content {
          flex: 1;
        }
        
        .toast-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }
        
        .toast-message {
          font-size: 0.85rem;
          color: #6b7280;
        }
        
        .toast-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          font-size: 18px;
          line-height: 1;
        }
        
        .toast-close:hover { color: #4a4a4a; }
        
        .toast.removing {
          animation: slideOutRight 0.3s ease forwards;
        }
        
        @keyframes slideOutRight {
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
        
        @media (max-width: 480px) {
          .toast-container {
            left: 10px;
            right: 10px;
            bottom: 80px;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },

  show(options) {
    if (!this.container) this.init();

    const { type = 'info', title, message, duration = 4000 } = options;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Fermer">&times;</button>
    `;

    this.container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  },

  dismiss(toast) {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  },

  success(message, title) {
    return this.show({ type: 'success', title, message });
  },

  error(message, title) {
    return this.show({ type: 'error', title, message });
  },

  warning(message, title) {
    return this.show({ type: 'warning', title, message });
  },

  info(message, title) {
    return this.show({ type: 'info', title, message });
  }
};

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  PolishEnhancements.init();
  Toast.init();
});

// Export for global use
window.Toast = Toast;
window.PolishEnhancements = PolishEnhancements;

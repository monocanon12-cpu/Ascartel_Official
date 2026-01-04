// ============================================
// ANALYTICS & TRACKING - ASCARTEL
// ============================================

class AnalyticsManager {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    this.trackPageView();
    this.trackUserBehavior();
    this.trackEcommerce();
    this.trackPerformance();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page view
  trackPageView() {
    const pageData = {
      event: 'page_view',
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId
    };

    this.sendEvent(pageData);
    console.log('📊 Page view tracked:', pageData);
  }

  // Track user behavior
  trackUserBehavior() {
    // Clics
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        this.trackEvent('click', {
          element_type: target.tagName.toLowerCase(),
          element_text: target.textContent.trim().substring(0, 50),
          element_class: target.className
        });
      }
    });

    // Scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        this.trackEvent('scroll_depth', { percent: scrollPercent });
      }
    }, 1000));

    // Temps passé
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent('time_on_page', { seconds: timeSpent });
    });
  }

  // Track e-commerce
  trackEcommerce() {
    // Ajout au panier
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const card = e.target.closest('.product-card');
        if (card) {
          const productName = card.querySelector('h3')?.textContent;
          const productPrice = card.querySelector('.price')?.textContent;
          
          this.trackEvent('add_to_cart', {
            item_name: productName,
            price: productPrice,
            currency: 'MGA'
          });
        }
      }
    });

    // Ajout à la wishlist
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wishlist-btn')) {
        const card = e.target.closest('.product-card');
        if (card) {
          const productName = card.querySelector('h3')?.textContent;
          
          this.trackEvent('add_to_wishlist', {
            item_name: productName
          });
        }
      }
    });

    // Vue produit
    if (window.location.pathname.includes('produit-detail')) {
      const productName = document.querySelector('.product-title')?.textContent;
      const productPrice = document.querySelector('.product-price')?.textContent;
      
      this.trackEvent('view_item', {
        item_name: productName,
        price: productPrice,
        currency: 'MGA'
      });
    }
  }

  // Track performance
  trackPerformance() {
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackEvent('web_vitals', {
          metric: 'LCP',
          value: Math.round(lastEntry.renderTime || lastEntry.loadTime)
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.trackEvent('web_vitals', {
            metric: 'FID',
            value: Math.round(entry.processingStart - entry.startTime)
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  // Track custom event
  trackEvent(eventName, params = {}) {
    const event = {
      event: eventName,
      ...params,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Send event to analytics service
  sendEvent(event) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event.event, event);
    }

    // Custom analytics endpoint
    if (CONFIG && CONFIG.analyticsEndpoint) {
      fetch(CONFIG.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(err => console.warn('Analytics error:', err));
    }

    // Console log en dev
    if (window.location.hostname === 'localhost') {
      console.log('📊 Event tracked:', event);
    }
  }

  // Throttle utility
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Get all events
  getEvents() {
    return this.events;
  }

  // Export events as CSV
  exportEvents() {
    const csv = [
      Object.keys(this.events[0]).join(','),
      ...this.events.map(e => Object.values(e).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${Date.now()}.csv`;
    a.click();
  }
}

// Initialiser
let analyticsManager;

document.addEventListener('DOMContentLoaded', () => {
  analyticsManager = new AnalyticsManager();
  console.log('📊 Analytics Manager initialisé');
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
}

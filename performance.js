// ============================================
// PERFORMANCE OPTIMIZER - ASCARTEL
// ============================================

class PerformanceOptimizer {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupResourceHints();
    this.setupCaching();
    this.measurePerformance();
  }

  // Lazy loading images
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supporté
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // Fallback avec Intersection Observer
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            this.imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => this.imageObserver.observe(img));
    }
  }

  // Optimisation images
  setupImageOptimization() {
    document.querySelectorAll('img').forEach(img => {
      // Ajouter loading="lazy" si pas déjà présent
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Ajouter decoding="async"
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      // Placeholder pendant le chargement
      if (!img.complete) {
        img.style.backgroundColor = '#f3f4f6';
      }

      img.addEventListener('load', () => {
        img.style.backgroundColor = 'transparent';
      });
    });
  }

  // Resource hints
  setupResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
      { rel: 'preconnect', href: 'https://ascartel-backend.onrender.com' }
    ];

    hints.forEach(hint => {
      if (!document.querySelector(`link[href="${hint.href}"]`)) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.rel === 'preconnect') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });
  }

  // Caching strategy
  setupCaching() {
    // Cache API responses
    if ('caches' in window) {
      const CACHE_NAME = 'ascartel-v1';
      const urlsToCache = [
        '/',
        '/style.css',
        '/script.js',
        '/config.js'
      ];

      // Note: Service Worker gérera le caching complet
      console.log('✅ Cache API disponible');
    }
  }

  // Mesurer performance
  measurePerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          if (perfData) {
            const metrics = {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              ttfb: perfData.responseStart - perfData.requestStart,
              download: perfData.responseEnd - perfData.responseStart,
              domInteractive: perfData.domInteractive,
              domComplete: perfData.domComplete,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart
            };

            console.log('📊 Performance Metrics:', metrics);
            
            // Envoyer à analytics si disponible
            if (typeof gtag !== 'undefined') {
              gtag('event', 'timing_complete', {
                name: 'load',
                value: Math.round(perfData.loadEventEnd),
                event_category: 'Performance'
              });
            }
          }
        }, 0);
      });
    }
  }

  // Debounce utility
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
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

  // Preload critical resources
  preloadResource(href, as, type = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  }

  // Defer non-critical CSS
  deferCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
    };
    document.head.appendChild(link);
  }

  // Cleanup
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
  }
}

// Web Vitals monitoring
class WebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
  }

  // Largest Contentful Paint
  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('📈 LCP:', this.metrics.lcp);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // First Input Delay
  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log('📈 FID:', this.metrics.fid);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  // Cumulative Layout Shift
  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        console.log('📈 CLS:', this.metrics.cls);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// Initialiser
let performanceOptimizer;
let webVitalsMonitor;

document.addEventListener('DOMContentLoaded', () => {
  performanceOptimizer = new PerformanceOptimizer();
  webVitalsMonitor = new WebVitalsMonitor();
  console.log('⚡ Performance Optimizer initialisé');
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceOptimizer, WebVitalsMonitor };
}

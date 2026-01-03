// Effets pour la navigation header avec animations fluides
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  
  // Gestion des liens de navigation
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Retirer la classe active de tous les liens
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Ajouter la classe active au lien cliqué
      this.classList.add('active');
      
      // Effet de pulsation
      this.style.transform = 'translateY(-2px) scale(1.05)';
      setTimeout(() => {
        this.style.transform = 'translateY(-2px) scale(1)';
      }, 150);
    });
  });

  // Gestion des menus déroulants avec animations fluides
  navDropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const columns = dropdown.querySelectorAll('.dropdown-column');
    
    let hoverTimeout;
    let leaveTimeout;

    // Fonction pour ouvrir le menu avec animation
    function openMenu() {
      clearTimeout(leaveTimeout);
      
      // Réinitialiser les animations des colonnes
      columns.forEach((column, index) => {
        column.style.opacity = '0';
        column.style.transform = 'translateY(20px)';
        column.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Animation échelonnée des colonnes
        setTimeout(() => {
          column.style.opacity = '1';
          column.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
      });
      
      // Animation de la flèche
      const arrow = trigger.querySelector('i');
      if (arrow) {
        arrow.style.transform = 'rotate(180deg) scale(1.1)';
      }
    }

    // Fonction pour fermer le menu avec animation
    function closeMenu() {
      clearTimeout(hoverTimeout);
      
      leaveTimeout = setTimeout(() => {
        // Animation de fermeture des colonnes
        columns.forEach((column, index) => {
          setTimeout(() => {
            column.style.opacity = '0';
            column.style.transform = 'translateY(-10px)';
          }, index * 50);
        });
        
        // Animation de la flèche
        const arrow = trigger.querySelector('i');
        if (arrow) {
          arrow.style.transform = 'rotate(0deg) scale(1)';
        }
      }, 150);
    }

    // Événements de survol
    dropdown.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(openMenu, 100);
    });

    dropdown.addEventListener('mouseleave', closeMenu);

    // Gestion tactile pour mobile
    if ('ontouchstart' in window) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Fermer tous les autres menus
        navDropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            const otherMenu = otherDropdown.querySelector('.dropdown-menu');
            if (otherMenu && otherMenu.style.opacity === '1') {
              otherDropdown.dispatchEvent(new Event('mouseleave'));
            }
          }
        });
        
        // Basculer le menu actuel
        if (menu.style.opacity === '1') {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // Animation des liens dans les colonnes
    const columnLinks = dropdown.querySelectorAll('.dropdown-column a');
    columnLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(8px) scale(1.02)';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0) scale(1)';
      });
      
      link.addEventListener('click', function() {
        // Effet de clic
        this.style.transform = 'translateX(8px) scale(0.98)';
        setTimeout(() => {
          this.style.transform = 'translateX(8px) scale(1.02)';
        }, 100);
      });
    });
  });

  // Fermer les menus en cliquant ailleurs
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      navDropdowns.forEach(dropdown => {
        dropdown.dispatchEvent(new Event('mouseleave'));
      });
    }
  });

  // Animation des titres de colonnes au survol du menu
  navDropdowns.forEach(dropdown => {
    const columnTitles = dropdown.querySelectorAll('.dropdown-column h4');
    
    dropdown.addEventListener('mouseenter', () => {
      columnTitles.forEach((title, index) => {
        setTimeout(() => {
          const afterElement = title;
          afterElement.style.setProperty('--after-width', '100%');
        }, 200 + (index * 100));
      });
    });
    
    dropdown.addEventListener('mouseleave', () => {
      columnTitles.forEach(title => {
        title.style.setProperty('--after-width', '0%');
      });
    });
  });

  // Effet de brillance sur les liens de navigation
  navLinks.forEach(link => {
    if (link.classList.contains('dropdown-trigger')) return;
    
    link.addEventListener('mouseenter', function() {
      // Créer l'effet de brillance
      const shine = document.createElement('div');
      shine.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.6s ease;
        pointer-events: none;
        z-index: 1;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(shine);
      
      // Déclencher l'animation
      setTimeout(() => {
        shine.style.left = '100%';
      }, 10);
      
      // Nettoyer après l'animation
      setTimeout(() => {
        if (shine.parentNode) {
          shine.parentNode.removeChild(shine);
        }
      }, 650);
    });
  });
});
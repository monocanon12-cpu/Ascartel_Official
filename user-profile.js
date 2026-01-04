// Gestion du profil utilisateur connecté

class UserProfile {
  constructor() {
    this.user = null;
    this.init();
  }

  init() {
    // Récupérer l'utilisateur connecté
    const savedUser = localStorage.getItem('ainaUser') || sessionStorage.getItem('ainaUser');
    
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
        this.updateUI();
      } catch (error) {
        console.error('Erreur parsing user:', error);
      }
    }
  }

  isLoggedIn() {
    return this.user !== null && this.user.loggedIn === true;
  }

  updateUI() {
    if (!this.isLoggedIn()) return;

    // Mettre à jour l'icône utilisateur avec la photo
    const userIcon = document.querySelector('.header-icons .icon-link[href="login.html"]');
    if (userIcon && this.user.photo) {
      userIcon.innerHTML = `<img src="${this.user.photo}" alt="${this.user.name}" class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
      userIcon.href = '#';
      userIcon.onclick = (e) => {
        e.preventDefault();
        this.showUserMenu();
      };
    }

    // Mettre à jour le bouton de connexion dans la promo bar
    const loginBtn = document.querySelector('.promo-bar .login-btn');
    if (loginBtn) {
      loginBtn.innerHTML = `<img src="${this.user.photo || ''}" alt="${this.user.name}" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; vertical-align: middle;"> ${this.user.name}`;
      loginBtn.href = '#';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        this.showUserMenu();
      };
    }
  }

  showUserMenu() {
    // Créer le menu déroulant
    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.innerHTML = `
      <div class="user-menu-header">
        <img src="${this.user.photo || ''}" alt="${this.user.name}" class="user-menu-avatar">
        <div class="user-menu-info">
          <strong>${this.user.name}</strong>
          <span>${this.user.email}</span>
        </div>
      </div>
      <div class="user-menu-items">
        <a href="#" class="user-menu-item" onclick="window.location.href='dashboard-client.html'">
          <i class="fas fa-home"></i> Mon espace
        </a>
        <a href="#" class="user-menu-item">
          <i class="fas fa-shopping-bag"></i> Mes commandes
        </a>
        <a href="#" class="user-menu-item">
          <i class="fas fa-heart"></i> Mes favoris
        </a>
        <a href="#" class="user-menu-item">
          <i class="fas fa-user"></i> Mon profil
        </a>
        <a href="#" class="user-menu-item">
          <i class="fas fa-cog"></i> Paramètres
        </a>
        <hr style="margin: 10px 0; border: none; border-top: 1px solid #e5e7eb;">
        <a href="#" class="user-menu-item logout-item" onclick="userProfile.logout(); return false;">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </a>
      </div>
    `;

    document.body.appendChild(menu);

    // Fermer le menu si on clique ailleurs
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  }

  logout() {
    localStorage.removeItem('ainaUser');
    sessionStorage.removeItem('ainaUser');
    this.user = null;
    window.location.href = 'index.html';
  }

  getUser() {
    return this.user;
  }
}

// Instance globale
const userProfile = new UserProfile();

// Styles pour le menu
const style = document.createElement('style');
style.textContent = `
  .user-avatar {
    border: 2px solid #f68db5;
    transition: transform 0.3s;
  }
  
  .user-avatar:hover {
    transform: scale(1.1);
  }
  
  .user-dropdown-menu {
    position: fixed;
    top: 80px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 10000;
    min-width: 280px;
    animation: slideDown 0.3s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .user-menu-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .user-menu-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f68db5;
  }
  
  .user-menu-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-menu-info strong {
    font-size: 1rem;
    color: #1a1a2e;
  }
  
  .user-menu-info span {
    font-size: 0.85rem;
    color: #6b7280;
  }
  
  .user-menu-items {
    padding: 10px;
  }
  
  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    color: #374151;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s;
    font-size: 0.95rem;
  }
  
  .user-menu-item:hover {
    background: #f3f4f6;
    color: #f68db5;
  }
  
  .user-menu-item i {
    width: 20px;
    text-align: center;
  }
  
  .logout-item {
    color: #ef4444;
  }
  
  .logout-item:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;
document.head.appendChild(style);

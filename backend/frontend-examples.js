/**
 * =============================================
 * EXEMPLES D'UTILISATION POUR LE FRONTEND
 * ASCARTEL - À intégrer dans votre code frontend
 * =============================================
 */

const API_URL = 'http://localhost:3000/api';

// =============================================
// UTILITAIRE - Gestion du token
// =============================================

const TokenManager = {
  save(token, remember = false) {
    if (remember) {
      localStorage.setItem('ascartel_token', token);
    } else {
      sessionStorage.setItem('ascartel_token', token);
    }
  },

  get() {
    return localStorage.getItem('ascartel_token') || sessionStorage.getItem('ascartel_token');
  },

  remove() {
    localStorage.removeItem('ascartel_token');
    sessionStorage.removeItem('ascartel_token');
  },

  getAuthHeaders() {
    const token = this.get();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// =============================================
// 1. AUTHENTIFICATION
// =============================================

// Connexion Admin
async function login(email, password, remember = false) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      TokenManager.save(data.token, remember);
      console.log('Connecté en tant que:', data.user.role);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

// Déconnexion
function logout() {
  TokenManager.remove();
  window.location.href = 'login.html';
}

// Vérifier si connecté
async function checkAuth() {
  const token = TokenManager.get();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: TokenManager.getAuthHeaders()
    });

    const data = await response.json();
    return data.success ? data.user : null;
  } catch {
    return null;
  }
}

// =============================================
// 2. ARTICLES (PUBLIC)
// =============================================

// Récupérer tous les articles
async function getArticles(options = {}) {
  const { categorie, flash_only, limit, offset } = options;
  const params = new URLSearchParams();

  if (categorie) params.append('categorie', categorie);
  if (flash_only) params.append('flash_only', 'true');
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);

  try {
    const response = await fetch(`${API_URL}/articles?${params}`);
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Erreur récupération articles:', error);
    return [];
  }
}

// Récupérer les ventes flash
async function getFlashSales() {
  try {
    const response = await fetch(`${API_URL}/articles/flash-sales`);
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Erreur récupération ventes flash:', error);
    return [];
  }
}

// Récupérer un article par ID
async function getArticle(id) {
  try {
    const response = await fetch(`${API_URL}/articles/${id}`);
    const data = await response.json();
    return data.article;
  } catch (error) {
    console.error('Erreur récupération article:', error);
    return null;
  }
}

// =============================================
// 3. STATUT BOUTIQUE (PUBLIC)
// =============================================

// Vérifier si la boutique est ouverte
async function getStoreStatus() {
  try {
    const response = await fetch(`${API_URL}/settings/status`);
    const data = await response.json();
    return data.store;
  } catch (error) {
    console.error('Erreur statut boutique:', error);
    return { open: false, message: 'Erreur de connexion' };
  }
}

// =============================================
// 4. COMMANDES (PUBLIC - vérifie les horaires)
// =============================================

// Créer une commande
async function createOrder(customerInfo, cartItems) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        items: cartItems.map(item => ({
          article_id: item.id,
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.order;
  } catch (error) {
    console.error('Erreur création commande:', error);
    throw error;
  }
}

// =============================================
// 5. ADMIN - GESTION DES ARTICLES
// =============================================

// Modifier le stock d'un article
async function updateStock(articleId, newQuantity) {
  try {
    const response = await fetch(`${API_URL}/articles/${articleId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders()
      },
      body: JSON.stringify({ stock_quantite: newQuantity })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Erreur modification stock:', error);
    throw error;
  }
}

// Modifier le prix d'un article
async function updatePrice(articleId, prixReel, prixPromo = null) {
  try {
    const response = await fetch(`${API_URL}/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders()
      },
      body: JSON.stringify({ prix_reel: prixReel, prix_promo: prixPromo })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.article;
  } catch (error) {
    console.error('Erreur modification prix:', error);
    throw error;
  }
}

// Activer/Désactiver une vente flash
async function toggleFlashSale(articleId, active, prixPromo = null, dateDebut = null, dateFin = null) {
  try {
    const response = await fetch(`${API_URL}/articles/${articleId}/flash`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders()
      },
      body: JSON.stringify({
        flash_active: active,
        prix_promo: prixPromo,
        date_debut_flash: dateDebut,
        date_fin_flash: dateFin
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.article;
  } catch (error) {
    console.error('Erreur vente flash:', error);
    throw error;
  }
}

// =============================================
// 6. ADMIN - PARAMÈTRES
// =============================================

// Modifier les horaires
async function updateBusinessHours(openingHour, closingHour) {
  try {
    const response = await fetch(`${API_URL}/settings/hours`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders()
      },
      body: JSON.stringify({ opening_hour: openingHour, closing_hour: closingHour })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Erreur modification horaires:', error);
    throw error;
  }
}

// Ouvrir/Fermer la boutique
async function toggleStore(open) {
  try {
    const response = await fetch(`${API_URL}/settings/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders()
      },
      body: JSON.stringify({ open })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Erreur ouverture/fermeture:', error);
    throw error;
  }
}

// =============================================
// EXEMPLES D'UTILISATION
// =============================================

/*
// 1. Connexion Admin
await login('master@ascartel.com', 'ASCARTEL_MASTER_2025', true);

// 2. Récupérer les articles
const articles = await getArticles();
console.log(articles);

// 3. Récupérer les ventes flash
const flashSales = await getFlashSales();
console.log(flashSales);

// 4. Vérifier si la boutique est ouverte
const status = await getStoreStatus();
if (!status.open) {
  alert(status.message);
}

// 5. Créer une commande
const order = await createOrder(
  { name: 'Jean Dupont', email: 'jean@email.com', phone: '+261 34 00 000 00' },
  [{ id: 1, quantity: 2 }, { id: 3, quantity: 1 }]
);

// 6. Admin - Modifier le stock
await updateStock(1, 50);

// 7. Admin - Activer une vente flash
await toggleFlashSale(1, true, 25000, '2025-01-01', '2025-01-31');

// 8. Admin - Modifier les horaires
await updateBusinessHours(9, 21);
*/

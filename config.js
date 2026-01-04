// Configuration ASCARTEL
const CONFIG = {
  // Mode de fonctionnement : 'standalone' ou 'api'
  mode: 'api', // Mode API pour production
  
  // URL de l'API backend
  apiUrl: window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : 'https://votre-backend.onrender.com/api', // Remplacez par votre URL Render
  
  // Produits de démonstration (utilisés en mode standalone)
  demoProducts: [
    {
      id: 1,
      nom: 'Robe élégante fleurie',
      prix: 45000,
      prix_original: 89000,
      genre: 'Femme',
      categorie: 'Robes',
      stock: 12,
      image_url: 'https://via.placeholder.com/300x400/fce7f3/333?text=Robe+Fleurie',
      flash_sale: { active: true, discount: 50 }
    },
    {
      id: 2,
      nom: 'Chemise classique homme',
      prix: 35000,
      prix_original: 35000,
      genre: 'Homme',
      categorie: 'Chemises',
      stock: 8,
      image_url: 'https://via.placeholder.com/300x400/dbeafe/333?text=Chemise',
      flash_sale: { active: false }
    },
    {
      id: 3,
      nom: 'Jean slim femme',
      prix: 28000,
      prix_original: 70000,
      genre: 'Femme',
      categorie: 'Pantalons',
      stock: 15,
      image_url: 'https://via.placeholder.com/300x400/e5e7eb/333?text=Jean+Slim',
      flash_sale: { active: true, discount: 60 }
    },
    {
      id: 4,
      nom: 'Pull cozy hiver',
      prix: 21000,
      prix_original: 60000,
      genre: 'Unisexe',
      categorie: 'Pulls',
      stock: 20,
      image_url: 'https://via.placeholder.com/300x400/fef3c7/333?text=Pull+Cozy',
      flash_sale: { active: true, discount: 65 }
    },
    {
      id: 5,
      nom: 'Veste tendance',
      prix: 45000,
      prix_original: 130000,
      genre: 'Femme',
      categorie: 'Vestes',
      stock: 5,
      image_url: 'https://via.placeholder.com/300x400/d1fae5/333?text=Veste',
      flash_sale: { active: true, discount: 65 }
    },
    {
      id: 6,
      nom: 'T-shirt basique',
      prix: 15000,
      prix_original: 15000,
      genre: 'Homme',
      categorie: 'T-shirts',
      stock: 30,
      image_url: 'https://via.placeholder.com/300x400/fecaca/333?text=T-shirt',
      flash_sale: { active: false }
    },
    {
      id: 7,
      nom: 'Robe de soirée',
      prix: 75000,
      prix_original: 150000,
      genre: 'Femme',
      categorie: 'Robes',
      stock: 3,
      image_url: 'https://via.placeholder.com/300x400/c7d2fe/333?text=Robe+Soirée',
      flash_sale: { active: true, discount: 50 }
    },
    {
      id: 8,
      nom: 'Short en jean',
      prix: 25000,
      prix_original: 25000,
      genre: 'Unisexe',
      categorie: 'Shorts',
      stock: 18,
      image_url: 'https://via.placeholder.com/300x400/fed7aa/333?text=Short',
      flash_sale: { active: false }
    },
    {
      id: 9,
      nom: 'Ensemble enfant',
      prix: 30000,
      prix_original: 30000,
      genre: 'Enfant',
      categorie: 'Ensembles',
      stock: 10,
      image_url: 'https://via.placeholder.com/300x400/fce7f3/333?text=Ensemble+Enfant',
      flash_sale: { active: false }
    },
    {
      id: 10,
      nom: 'Sac à main élégant',
      prix: 40000,
      prix_original: 80000,
      genre: 'Accessoires',
      categorie: 'Sacs',
      stock: 7,
      image_url: 'https://via.placeholder.com/300x400/e9d5ff/333?text=Sac',
      flash_sale: { active: true, discount: 50 }
    },
    {
      id: 11,
      nom: 'Pantalon chino homme',
      prix: 38000,
      prix_original: 38000,
      genre: 'Homme',
      categorie: 'Pantalons',
      stock: 12,
      image_url: 'https://via.placeholder.com/300x400/bfdbfe/333?text=Chino',
      flash_sale: { active: false }
    },
    {
      id: 12,
      nom: 'Blouse chic',
      prix: 17000,
      prix_original: 50000,
      genre: 'Femme',
      categorie: 'Tops',
      stock: 14,
      image_url: 'https://via.placeholder.com/300x400/fef3c7/333?text=Blouse',
      flash_sale: { active: true, discount: 66 }
    }
  ]
};

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

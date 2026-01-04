const db = require('../config/database');

// Produits de démonstration
const products = [
  {
    nom: "Robe d'été fleurie",
    description: "Robe légère et élégante parfaite pour l'été",
    genre: "Femme",
    categorie: "Robes",
    prix_reel: 45000,
    prix_promo: 35000,
    stock_quantite: 15,
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
    flash_active: 1,
    date_debut_flash: new Date().toISOString(),
    date_fin_flash: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    nom: "Jean slim noir",
    description: "Jean confortable coupe slim",
    genre: "Femme",
    categorie: "Pantalons",
    prix_reel: 38000,
    stock_quantite: 20,
    image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"
  },
  {
    nom: "T-shirt basique blanc",
    description: "T-shirt en coton 100% confortable",
    genre: "Unisexe",
    categorie: "Hauts",
    prix_reel: 15000,
    stock_quantite: 50,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
  },
  {
    nom: "Chemise à carreaux",
    description: "Chemise décontractée pour homme",
    genre: "Homme",
    categorie: "Chemises",
    prix_reel: 32000,
    prix_promo: 25000,
    stock_quantite: 12,
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
    flash_active: 1
  },
  {
    nom: "Sneakers blanches",
    description: "Baskets tendance et confortables",
    genre: "Unisexe",
    categorie: "Chaussures",
    prix_reel: 55000,
    stock_quantite: 8,
    image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"
  },
  {
    nom: "Sac à main cuir",
    description: "Sac élégant en cuir véritable",
    genre: "Femme",
    categorie: "Accessoires",
    prix_reel: 68000,
    prix_promo: 55000,
    stock_quantite: 5,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    flash_active: 1
  },
  {
    nom: "Veste en jean",
    description: "Veste en denim classique",
    genre: "Unisexe",
    categorie: "Vestes",
    prix_reel: 48000,
    stock_quantite: 10,
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"
  },
  {
    nom: "Robe de soirée",
    description: "Robe élégante pour occasions spéciales",
    genre: "Femme",
    categorie: "Robes",
    prix_reel: 95000,
    stock_quantite: 3,
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500"
  }
];

console.log('🌱 Ajout des produits de démonstration...\n');

const stmt = db.prepare(`
  INSERT INTO articles (nom, description, genre, categorie, image_url, prix_reel, prix_promo, stock_quantite, flash_active, date_debut_flash, date_fin_flash)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
products.forEach(product => {
  try {
    stmt.run(
      product.nom,
      product.description,
      product.genre,
      product.categorie,
      product.image_url,
      product.prix_reel,
      product.prix_promo || null,
      product.stock_quantite,
      product.flash_active ? 1 : 0,
      product.date_debut_flash || null,
      product.date_fin_flash || null
    );
    count++;
    console.log(`✅ ${product.nom}`);
  } catch (error) {
    console.error(`❌ Erreur pour ${product.nom}:`, error.message);
  }
});

console.log(`\n✨ ${count}/${products.length} produits ajoutés avec succès !`);

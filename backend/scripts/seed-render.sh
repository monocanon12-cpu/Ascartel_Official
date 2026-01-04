#!/bin/bash

# Script pour peupler la base de données Render avec des produits

API_URL="https://ascartel-backend.onrender.com/api"
ADMIN_EMAIL="master@ascartel.com"
ADMIN_PASSWORD="ASCARTEL_MASTER_2025"

echo "🔐 Connexion admin..."

# Obtenir le token JWT
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de connexion admin"
  exit 1
fi

echo "✅ Token obtenu"
echo ""
echo "📦 Ajout des produits..."

# Produit 1
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Robe d'\''été fleurie",
    "description": "Robe légère et élégante parfaite pour l'\''été",
    "genre": "Femme",
    "categorie": "Robes",
    "prix_reel": 45000,
    "prix_promo": 35000,
    "stock_quantite": 15,
    "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
    "flash_active": true,
    "date_debut_flash": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "date_fin_flash": "'$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' > /dev/null && echo "✅ Robe d'été fleurie"

# Produit 2
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Jean slim noir",
    "description": "Jean confortable coupe slim",
    "genre": "Femme",
    "categorie": "Pantalons",
    "prix_reel": 38000,
    "stock_quantite": 20,
    "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"
  }' > /dev/null && echo "✅ Jean slim noir"

# Produit 3
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "T-shirt basique blanc",
    "description": "T-shirt en coton 100% confortable",
    "genre": "Unisexe",
    "categorie": "Hauts",
    "prix_reel": 15000,
    "stock_quantite": 50,
    "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
  }' > /dev/null && echo "✅ T-shirt basique blanc"

# Produit 4
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Chemise à carreaux",
    "description": "Chemise décontractée pour homme",
    "genre": "Homme",
    "categorie": "Chemises",
    "prix_reel": 32000,
    "prix_promo": 25000,
    "stock_quantite": 12,
    "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
    "flash_active": true
  }' > /dev/null && echo "✅ Chemise à carreaux"

# Produit 5
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Sneakers blanches",
    "description": "Baskets tendance et confortables",
    "genre": "Unisexe",
    "categorie": "Chaussures",
    "prix_reel": 55000,
    "stock_quantite": 8,
    "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"
  }' > /dev/null && echo "✅ Sneakers blanches"

# Produit 6
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Sac à main cuir",
    "description": "Sac élégant en cuir véritable",
    "genre": "Femme",
    "categorie": "Accessoires",
    "prix_reel": 68000,
    "prix_promo": 55000,
    "stock_quantite": 5,
    "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    "flash_active": true
  }' > /dev/null && echo "✅ Sac à main cuir"

# Produit 7
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Veste en jean",
    "description": "Veste en denim classique",
    "genre": "Unisexe",
    "categorie": "Vestes",
    "prix_reel": 48000,
    "stock_quantite": 10,
    "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"
  }' > /dev/null && echo "✅ Veste en jean"

# Produit 8
curl -s -X POST "$API_URL/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Robe de soirée",
    "description": "Robe élégante pour occasions spéciales",
    "genre": "Femme",
    "categorie": "Robes",
    "prix_reel": 95000,
    "stock_quantite": 3,
    "image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500"
  }' > /dev/null && echo "✅ Robe de soirée"

echo ""
echo "✨ Tous les produits ont été ajoutés avec succès !"
echo ""
echo "🔍 Vérification..."
curl -s "$API_URL/articles" | grep -o '"count":[0-9]*' | cut -d':' -f2 | xargs -I {} echo "📦 {} produits dans la base de données"

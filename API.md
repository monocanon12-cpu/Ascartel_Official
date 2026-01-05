# 📡 AsCartel API Documentation

## Base URL
```
Production: https://ascartel-backend.onrender.com/api
Local: http://localhost:3000/api
```

## Authentication

Toutes les routes protégées nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### POST /auth/login
Connexion utilisateur

**Request:**
```json
{
  "email": "master@ascartel.com",
  "password": "ASCARTEL_MASTER_2025"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "master@ascartel.com",
    "role": "admin",
    "nom": "Master Admin"
  }
}
```

**Errors:**
- `400`: Email/password manquants
- `401`: Identifiants invalides

---

### GET /auth/me
Obtenir profil utilisateur connecté

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "master@ascartel.com",
    "role": "admin",
    "nom": "Master Admin"
  }
}
```

**Errors:**
- `401`: Token manquant ou invalide

---

## 🛍️ Articles Endpoints

### GET /articles
Liste tous les articles avec filtres optionnels

**Query Parameters:**
- `genre`: Femme | Homme | Unisexe
- `categorie`: Robes | Pantalons | Hauts | etc.
- `minPrice`: Prix minimum (Ar)
- `maxPrice`: Prix maximum (Ar)
- `search`: Recherche texte
- `flashOnly`: true (ventes flash uniquement)

**Example:**
```
GET /articles?genre=Femme&minPrice=20000&maxPrice=50000
```

**Response (200):**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "nom": "Robe d'été fleurie",
      "description": "Robe légère et élégante",
      "genre": "Femme",
      "categorie": "Robes",
      "prix": 35000,
      "prix_reel": 45000,
      "stock_quantite": 15,
      "image_url": "https://...",
      "flash_sale": {
        "active": true,
        "discount": 22,
        "prix_original": 45000
      }
    }
  ],
  "count": 1,
  "filters": {
    "genre": "Femme",
    "minPrice": 20000,
    "maxPrice": 50000
  }
}
```

---

### GET /articles/:id
Détails d'un article

**Response (200):**
```json
{
  "success": true,
  "article": {
    "id": 1,
    "nom": "Robe d'été fleurie",
    "description": "Robe légère et élégante pour l'été",
    "genre": "Femme",
    "categorie": "Robes",
    "prix": 35000,
    "prix_reel": 45000,
    "stock_quantite": 15,
    "image_url": "https://...",
    "flash_sale": {
      "active": true,
      "discount": 22
    },
    "created_at": "2026-01-05T10:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Article non trouvé

---

### GET /articles/flash-sales
Ventes flash actives

**Response (200):**
```json
{
  "success": true,
  "flashSales": [
    {
      "id": 1,
      "nom": "Robe d'été fleurie",
      "prix": 35000,
      "prix_reel": 45000,
      "discount": 22,
      "stock_quantite": 15,
      "image_url": "https://..."
    }
  ],
  "count": 1
}
```

---

### POST /articles
Créer un article (Admin uniquement)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "nom": "Nouvelle robe",
  "description": "Description",
  "genre": "Femme",
  "categorie": "Robes",
  "prix_reel": 50000,
  "prix_promo": 40000,
  "stock_quantite": 20,
  "image_url": "https://...",
  "flash_active": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "article": {
    "id": 9,
    "nom": "Nouvelle robe",
    ...
  }
}
```

**Errors:**
- `401`: Non authentifié
- `403`: Pas les droits admin
- `400`: Données invalides

---

### PUT /articles/:id
Modifier un article (Admin uniquement)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "prix_promo": 35000,
  "stock_quantite": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "article": { ... }
}
```

---

### DELETE /articles/:id
Supprimer un article (Admin uniquement)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Article supprimé"
}
```

---

## 📦 Orders Endpoints

### POST /orders
Créer une commande

**Request:**
```json
{
  "customer_name": "Jean Dupont",
  "customer_email": "jean@example.com",
  "customer_phone": "0321234567",
  "customer_address": "Antananarivo, Madagascar",
  "items": [
    {
      "article_id": 1,
      "quantity": 2,
      "price": 35000
    }
  ],
  "delivery_method": "standard",
  "delivery_fee": 5000,
  "total_amount": 75000,
  "notes": "Livraison après 18h"
}
```

**Response (201):**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "order_number": "ORD-2026-123",
    "status": "pending",
    "total_amount": 75000,
    "created_at": "2026-01-05T10:00:00.000Z"
  }
}
```

---

### GET /orders
Liste des commandes (Staff uniquement)

**Headers:**
```
Authorization: Bearer <staff_token>
```

**Query Parameters:**
- `status`: pending | confirmed | shipped | delivered | cancelled
- `limit`: Nombre max (défaut: 50)
- `offset`: Pagination

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": 123,
      "order_number": "ORD-2026-123",
      "customer_name": "Jean Dupont",
      "total_amount": 75000,
      "status": "pending",
      "created_at": "2026-01-05T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### GET /orders/:id
Détails d'une commande (Staff uniquement)

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "order_number": "ORD-2026-123",
    "customer_name": "Jean Dupont",
    "customer_email": "jean@example.com",
    "customer_phone": "0321234567",
    "customer_address": "Antananarivo",
    "items": [
      {
        "article_id": 1,
        "article_name": "Robe d'été",
        "quantity": 2,
        "price": 35000,
        "subtotal": 70000
      }
    ],
    "delivery_method": "standard",
    "delivery_fee": 5000,
    "total_amount": 75000,
    "status": "pending",
    "notes": "Livraison après 18h",
    "created_at": "2026-01-05T10:00:00.000Z"
  }
}
```

---

### PATCH /orders/:id/status
Modifier statut commande (Staff uniquement)

**Request:**
```json
{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "status": "confirmed",
    "updated_at": "2026-01-05T11:00:00.000Z"
  }
}
```

**Status valides:**
- `pending`: En attente
- `confirmed`: Confirmée
- `shipped`: Expédiée
- `delivered`: Livrée
- `cancelled`: Annulée

---

## 💳 Payment Endpoints

### POST /payment/initiate
Initier un paiement mobile

**Request:**
```json
{
  "phoneNumber": "0321234567",
  "amount": 50000,
  "orderId": "ORD-2026-123",
  "customerName": "Jean Dupont",
  "provider": "mvola"
}
```

**Response (200):**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN-1704448800000-ABC123",
    "orderId": "ORD-2026-123",
    "provider": "mvola",
    "providerName": "MVola",
    "phoneNumber": "+261 32 12 345 67",
    "amount": 50000,
    "status": "pending",
    "createdAt": "2026-01-05T10:00:00.000Z",
    "expiresAt": "2026-01-05T10:05:00.000Z"
  },
  "message": "Composez *111# pour confirmer"
}
```

---

### GET /payment/status/:transactionId
Vérifier statut transaction

**Response (200):**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN-1704448800000-ABC123",
    "status": "completed",
    "completedAt": "2026-01-05T10:02:00.000Z"
  }
}
```

**Status possibles:**
- `pending`: En attente
- `completed`: Complété
- `expired`: Expiré
- `cancelled`: Annulé

---

### POST /payment/cancel/:transactionId
Annuler une transaction

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction annulée"
}
```

---

## ⚙️ Settings Endpoints

### GET /settings/status
Statut de la boutique

**Response (200):**
```json
{
  "success": true,
  "isOpen": true,
  "currentHour": 14,
  "openingHour": 8,
  "closingHour": 20,
  "message": "Boutique ouverte"
}
```

---

### PUT /settings/hours
Modifier horaires (Admin uniquement)

**Request:**
```json
{
  "openingHour": 9,
  "closingHour": 21
}
```

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "openingHour": 9,
    "closingHour": 21
  }
}
```

---

### PUT /settings/store
Ouvrir/Fermer boutique (Admin uniquement)

**Request:**
```json
{
  "forceOpen": true
}
```

**Response (200):**
```json
{
  "success": true,
  "isOpen": true
}
```

---

## 🏥 Health Endpoint

### GET /health
Vérification santé du serveur

**Response (200):**
```json
{
  "success": true,
  "status": "operational",
  "timestamp": "2026-01-05T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "articlesCount": 8
  },
  "uptime": 3600
}
```

---

## ❌ Error Responses

### Format Standard
```json
{
  "success": false,
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

### Codes HTTP
- `200`: Succès
- `201`: Créé
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Accès refusé
- `404`: Non trouvé
- `429`: Trop de requêtes
- `500`: Erreur serveur

---

## 🔒 Rate Limiting

- **Global**: 100 requêtes / 15 minutes
- **Auth**: 5 tentatives / 15 minutes

**Headers de réponse:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704449700
```

---

## 📝 Notes

### Formats de données
- **Dates**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Prix**: Entiers en Ariary (Ar)
- **Téléphones**: Format malgache (03X XX XXX XX)

### Pagination
```
?limit=20&offset=0
```

### Tri
```
?sortBy=prix&order=asc
```

---

**Version API**: 1.0.0  
**Dernière mise à jour**: 2026-01-05

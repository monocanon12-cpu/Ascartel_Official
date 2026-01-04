require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const settings = require('./config/settings');
const { logger } = require('./utils/logger');

// Import des routes
const authRoutes = require('./routes/auth');
const articlesRoutes = require('./routes/articles');
const settingsRoutes = require('./routes/settings');
const ordersRoutes = require('./routes/orders');
const addressesRoutes = require('./routes/addresses');

const app = express();

// =============================================
// MIDDLEWARES DE SÉCURITÉ
// =============================================

// Helmet - Protection des headers HTTP
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting - Protection contre les attaques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, error: 'Trop de requêtes, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Trop de tentatives de connexion' }
});
app.use('/api/auth/login', authLimiter);

// CORS - Autoriser les requêtes du frontend
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'https://ascartel-official.pages.dev',
  'https://flourishing-kitten-4a42c7.netlify.app',
  'https://monocanon12-cpu.github.io'
];

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.pages.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parser JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// =============================================
// ROUTES API
// =============================================

// Route racine pour Render
app.get('/', (req, res) => {
  res.json({
    message: 'Backend AsCartel en ligne 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      articles: '/api/articles',
      auth: '/api/auth/login',
      flashSales: '/api/articles/flash-sales'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);

// Route de santé avancée
app.get('/api/health', (req, res) => {
  const db = require('./config/database');
  let dbStatus = 'connected';
  let articlesCount = 0;
  
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM articles').get();
    articlesCount = result.count;
  } catch (error) {
    dbStatus = 'error';
    logger.error('Health check DB error:', error);
  }
  
  res.json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      articlesCount
    },
    uptime: process.uptime()
  });
});

// Route pour peupler la base (ADMIN ONLY - à supprimer après utilisation)
app.post('/api/seed-database', (req, res) => {
  try {
    const db = require('./config/database');
    
    // Vérifier si déjà peuplé
    const count = db.prepare('SELECT COUNT(*) as count FROM articles').get();
    if (count.count > 0) {
      return res.json({ success: false, message: 'Base déjà peuplée', count: count.count });
    }
    
    // Produits de démo
    const products = [
      { nom: "Robe d'été fleurie", description: "Robe légère et élégante", genre: "Femme", categorie: "Robes", prix_reel: 45000, prix_promo: 35000, stock_quantite: 15, image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500", flash_active: 1 },
      { nom: "Jean slim noir", description: "Jean confortable coupe slim", genre: "Femme", categorie: "Pantalons", prix_reel: 38000, stock_quantite: 20, image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500" },
      { nom: "T-shirt basique blanc", description: "T-shirt en coton 100%", genre: "Unisexe", categorie: "Hauts", prix_reel: 15000, stock_quantite: 50, image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
      { nom: "Chemise à carreaux", description: "Chemise décontractée", genre: "Homme", categorie: "Chemises", prix_reel: 32000, prix_promo: 25000, stock_quantite: 12, image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", flash_active: 1 },
      { nom: "Sneakers blanches", description: "Baskets tendance", genre: "Unisexe", categorie: "Chaussures", prix_reel: 55000, stock_quantite: 8, image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500" },
      { nom: "Sac à main cuir", description: "Sac élégant en cuir", genre: "Femme", categorie: "Accessoires", prix_reel: 68000, prix_promo: 55000, stock_quantite: 6, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", flash_active: 1 },
      { nom: "Montre classique", description: "Montre élégante", genre: "Homme", categorie: "Accessoires", prix_reel: 85000, stock_quantite: 10, image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500" },
      { nom: "Veste en jean", description: "Veste décontractée", genre: "Unisexe", categorie: "Vestes", prix_reel: 52000, stock_quantite: 14, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }
    ];
    
    const stmt = db.prepare(`
      INSERT INTO articles (nom, description, genre, categorie, prix_reel, prix_promo, stock_quantite, image_url, flash_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    products.forEach(p => {
      stmt.run(p.nom, p.description, p.genre, p.categorie, p.prix_reel, p.prix_promo || null, p.stock_quantite, p.image_url, p.flash_active || 0);
    });
    
    const newCount = db.prepare('SELECT COUNT(*) as count FROM articles').get();
    res.json({ success: true, message: 'Base peuplée avec succès', count: newCount.count });
  } catch (error) {
    logger.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GESTION DES ERREURS
// =============================================

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  
  // Ne pas exposer les détails en production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'Erreur interne du serveur'
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: errorMessage
  });
});

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

const PORT = process.env.PORT || settings.port;

const server = app.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════');
  logger.info('   🚀 ASCARTEL API SERVER');
  logger.info('═══════════════════════════════════════════');
  logger.info(`📡 Serveur: http://localhost:${PORT}`);
  logger.info(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📋 Health: GET /api/health`);
  logger.info('═══════════════════════════════════════════');
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app;

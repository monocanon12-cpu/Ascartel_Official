require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const settings = require('./config/settings');

// Import des routes
const authRoutes = require('./routes/auth');
const articlesRoutes = require('./routes/articles');
const settingsRoutes = require('./routes/settings');
const ordersRoutes = require('./routes/orders');

const app = express();

// =============================================
// MIDDLEWARES
// =============================================

// CORS - Autoriser les requêtes du frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000'],
  credentials: true
}));

// Parser JSON
app.use(express.json());

// Logger des requêtes (développement)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// =============================================
// ROUTES API
// =============================================

app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', ordersRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API ASCARTEL opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur'
  });
});

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

const PORT = settings.port;

app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('   🚀 ASCARTEL API SERVER');
  console.log('═══════════════════════════════════════════');
  console.log(`\n📡 Serveur démarré sur: http://localhost:${PORT}`);
  console.log(`📋 Documentation API:`);
  console.log(`   - GET  /api/health          - Statut du serveur`);
  console.log(`   - POST /api/auth/login      - Connexion`);
  console.log(`   - GET  /api/articles        - Liste des articles`);
  console.log(`   - GET  /api/articles/flash-sales - Ventes flash`);
  console.log(`   - GET  /api/settings/status - Statut boutique`);
  console.log(`\n🔐 Admin: master@ascartel.com`);
  console.log('═══════════════════════════════════════════\n');
});

module.exports = app;

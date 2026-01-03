const jwt = require('jsonwebtoken');
const settings = require('../config/settings');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
  }

  jwt.verify(token, settings.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier le rôle Admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux administrateurs'
    });
  }
  next();
};

// Middleware pour vérifier Admin ou Collaborateur
const requireStaff = (req, res, next) => {
  if (!req.user || !['admin', 'collaborateur'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Accès réservé au personnel'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStaff
};

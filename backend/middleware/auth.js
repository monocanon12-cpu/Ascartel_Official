const jwt = require('jsonwebtoken');
const settings = require('../config/settings');
const { logger } = require('../utils/logger');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Authentication failed: No token provided', { ip: req.ip });
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis'
    });
  }

  jwt.verify(token, settings.jwt.secret, (err, user) => {
    if (err) {
      logger.warn('Authentication failed: Invalid token', { 
        ip: req.ip, 
        error: err.message 
      });
      return res.status(403).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }
    
    req.user = user;
    logger.debug('User authenticated', { userId: user.id, role: user.role });
    next();
  });
};

// Middleware pour vérifier le rôle Admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Authorization failed: Admin required', { 
      userId: req.user?.id, 
      role: req.user?.role,
      ip: req.ip 
    });
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
    logger.warn('Authorization failed: Staff required', { 
      userId: req.user?.id, 
      role: req.user?.role,
      ip: req.ip 
    });
    return res.status(403).json({
      success: false,
      error: 'Accès réservé au personnel'
    });
  }
  next();
};

// Middleware de sécurité pour les tentatives de brute force
const loginAttempts = new Map();

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 0, resetTime: now + windowMs });
  }

  const attempts = loginAttempts.get(ip);

  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }

  if (attempts.count >= maxAttempts) {
    logger.warn('Login rate limit exceeded', { ip, attempts: attempts.count });
    return res.status(429).json({
      success: false,
      error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
    });
  }

  // Incrémenter le compteur en cas d'échec
  const originalSend = res.json;
  res.json = function(data) {
    if (!data.success && res.statusCode === 401) {
      attempts.count++;
      logger.warn('Failed login attempt', { ip, attempts: attempts.count });
    }
    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStaff,
  rateLimitLogin
};

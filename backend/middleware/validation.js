const { body, param, query, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// Validations pour l'authentification
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  handleValidationErrors
];

// Validations pour les articles
const validateArticle = [
  body('nom').trim().isLength({ min: 2, max: 100 }).withMessage('Nom requis (2-100 caractères)'),
  body('prix_reel').isFloat({ min: 0 }).withMessage('Prix réel invalide'),
  body('prix_promo').optional().isFloat({ min: 0 }).withMessage('Prix promo invalide'),
  body('stock_quantite').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
  body('genre').optional().isIn(['homme', 'femme', 'unisexe']).withMessage('Genre invalide'),
  handleValidationErrors
];

const validateArticleUpdate = [
  param('id').isInt({ min: 1 }).withMessage('ID article invalide'),
  body('nom').optional().trim().isLength({ min: 2, max: 100 }),
  body('prix_reel').optional().isFloat({ min: 0 }),
  body('prix_promo').optional().isFloat({ min: 0 }),
  body('stock_quantite').optional().isInt({ min: 0 }),
  handleValidationErrors
];

const validateStock = [
  param('id').isInt({ min: 1 }).withMessage('ID article invalide'),
  body('stock_quantite').isInt({ min: 0 }).withMessage('Stock invalide'),
  handleValidationErrors
];

const validateFlash = [
  param('id').isInt({ min: 1 }).withMessage('ID article invalide'),
  body('flash_active').isBoolean().withMessage('Flash active requis'),
  body('prix_promo').optional().isFloat({ min: 0 }),
  handleValidationErrors
];

// Validations pour les requêtes
const validatePagination = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide (1-100)'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset invalide'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateArticle,
  validateArticleUpdate,
  validateStock,
  validateFlash,
  validatePagination,
  handleValidationErrors
};
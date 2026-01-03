const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { formatArticleWithFlash } = require('../utils/flashSale');

const router = express.Router();

// GET /api/articles - Liste tous les articles (public)
router.get('/', (req, res) => {
  try {
    const { categorie, genre, flash_only, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM articles WHERE actif = 1';
    const params = [];

    if (genre) {
      query += ' AND genre = ?';
      params.push(genre);
    }

    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }

    if (flash_only === 'true') {
      query += ' AND flash_active = 1';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const articles = db.prepare(query).all(...params);

    // Formater avec les infos de vente flash
    const formattedArticles = articles.map(formatArticleWithFlash);

    res.json({
      success: true,
      count: formattedArticles.length,
      articles: formattedArticles
    });

  } catch (error) {
    console.error('Erreur liste articles:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/articles/categories - Liste des catégories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT categorie FROM articles WHERE actif = 1 AND categorie IS NOT NULL').all();

    res.json({
      success: true,
      categories: categories.map(c => c.categorie)
    });

  } catch (error) {
    console.error('Erreur catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/articles/flash-sales - Articles en vente flash
router.get('/flash-sales', (req, res) => {
  try {
    const now = new Date().toISOString();

    const articles = db.prepare(`
      SELECT * FROM articles 
      WHERE actif = 1 
        AND flash_active = 1 
        AND (date_debut_flash IS NULL OR date_debut_flash <= ?)
        AND (date_fin_flash IS NULL OR date_fin_flash >= ?)
      ORDER BY prix_promo ASC
    `).all(now, now);

    const formattedArticles = articles.map(formatArticleWithFlash);

    res.json({
      success: true,
      count: formattedArticles.length,
      articles: formattedArticles
    });

  } catch (error) {
    console.error('Erreur flash sales:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/articles/:id - Détail d'un article
router.get('/:id', (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ? AND actif = 1').get(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    res.json({
      success: true,
      article: formatArticleWithFlash(article)
    });

  } catch (error) {
    console.error('Erreur détail article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// =============================================
// ROUTES ADMIN (Protégées)
// =============================================

// POST /api/articles - Créer un article (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      nom, 
      description, 
      genre,
      categorie, 
      prix_reel, 
      prix_promo, 
      stock_quantite,
      image_url,
      flash_active,
      date_debut_flash,
      date_fin_flash
    } = req.body;

    if (!nom || !prix_reel) {
      return res.status(400).json({
        success: false,
        error: 'Nom et prix réel requis'
      });
    }

    const result = db.prepare(`
      INSERT INTO articles (nom, description, genre, categorie, image_url, prix_reel, prix_promo, stock_quantite, flash_active, date_debut_flash, date_fin_flash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nom, description || null, genre || null, categorie || null, image_url || null,
      prix_reel, prix_promo || null, stock_quantite || 0,
      flash_active ? 1 : 0, date_debut_flash || null, date_fin_flash || null
    );

    const newArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Article créé',
      article: formatArticleWithFlash(newArticle)
    });

  } catch (error) {
    console.error('Erreur création article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PUT /api/articles/:id - Modifier un article (Admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    const {
      nom, description, genre, categorie, image_url,
      prix_reel, prix_promo, stock_quantite,
      flash_active, date_debut_flash, date_fin_flash, actif
    } = req.body;

    db.prepare(`
      UPDATE articles SET
        nom = COALESCE(?, nom),
        description = COALESCE(?, description),
        genre = COALESCE(?, genre),
        categorie = COALESCE(?, categorie),
        image_url = COALESCE(?, image_url),
        prix_reel = COALESCE(?, prix_reel),
        prix_promo = COALESCE(?, prix_promo),
        stock_quantite = COALESCE(?, stock_quantite),
        flash_active = COALESCE(?, flash_active),
        date_debut_flash = COALESCE(?, date_debut_flash),
        date_fin_flash = COALESCE(?, date_fin_flash),
        actif = COALESCE(?, actif),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nom, description, genre, categorie, image_url,
      prix_reel, prix_promo, stock_quantite,
      flash_active !== undefined ? (flash_active ? 1 : 0) : undefined,
      date_debut_flash, date_fin_flash,
      actif !== undefined ? (actif ? 1 : 0) : undefined,
      req.params.id
    );

    const updatedArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Article modifié',
      article: formatArticleWithFlash(updatedArticle)
    });

  } catch (error) {
    console.error('Erreur modification article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PATCH /api/articles/:id/stock - Modifier le stock (Admin)
router.patch('/:id/stock', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { stock_quantite } = req.body;

    if (stock_quantite === undefined || stock_quantite < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantité de stock invalide'
      });
    }

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    db.prepare('UPDATE articles SET stock_quantite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(stock_quantite, req.params.id);

    res.json({
      success: true,
      message: 'Stock mis à jour',
      article_id: parseInt(req.params.id),
      new_stock: stock_quantite
    });

  } catch (error) {
    console.error('Erreur modification stock:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PATCH /api/articles/:id/flash - Activer/Désactiver vente flash (Admin)
router.patch('/:id/flash', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { flash_active, prix_promo, date_debut_flash, date_fin_flash } = req.body;

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    db.prepare(`
      UPDATE articles SET 
        flash_active = ?,
        prix_promo = COALESCE(?, prix_promo),
        date_debut_flash = COALESCE(?, date_debut_flash),
        date_fin_flash = COALESCE(?, date_fin_flash),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      flash_active ? 1 : 0,
      prix_promo,
      date_debut_flash,
      date_fin_flash,
      req.params.id
    );

    const updatedArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: flash_active ? 'Vente flash activée' : 'Vente flash désactivée',
      article: formatArticleWithFlash(updatedArticle)
    });

  } catch (error) {
    console.error('Erreur flash sale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// DELETE /api/articles/:id - Supprimer un article (Admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    // Soft delete - on désactive l'article
    db.prepare('UPDATE articles SET actif = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(req.params.id);

    res.json({
      success: true,
      message: 'Article supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const { requireOpenStore } = require('../middleware/businessHours');
const { checkFlashSale } = require('../utils/flashSale');

const router = express.Router();

// POST /api/orders - Créer une commande (public, mais vérifie les horaires)
router.post('/', requireOpenStore, (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items } = req.body;

    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nom du client et articles requis'
      });
    }

    // Vérifier le stock et calculer le total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const article = db.prepare('SELECT * FROM articles WHERE id = ? AND actif = 1').get(item.article_id);

      if (!article) {
        return res.status(400).json({
          success: false,
          error: `Article ID ${item.article_id} non trouvé`
        });
      }

      if (article.stock_quantite < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuffisant pour "${article.nom}" (disponible: ${article.stock_quantite})`
        });
      }

      // Déterminer le prix applicable (flash sale ou normal)
      const flashStatus = checkFlashSale(article);
      const unitPrice = flashStatus.applicablePrice;

      orderItems.push({
        article_id: article.id,
        article_nom: article.nom,
        quantity: item.quantity,
        unit_price: unitPrice
      });

      totalAmount += unitPrice * item.quantity;
    }

    // Créer la commande
    const orderResult = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(customer_name, customer_email || null, customer_phone || null, totalAmount);

    const orderId = orderResult.lastInsertRowid;

    // Ajouter les lignes de commande et mettre à jour le stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, article_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE articles SET stock_quantite = stock_quantite - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const item of orderItems) {
      insertItem.run(orderId, item.article_id, item.quantity, item.unit_price);
      updateStock.run(item.quantity, item.article_id);
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order: {
        id: orderId,
        customer_name,
        total_amount: totalAmount,
        items: orderItems,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/orders - Liste des commandes (Staff)
router.get('/', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = db.prepare(query).all(...params);

    // Ajouter les items pour chaque commande
    const getItems = db.prepare(`
      SELECT oi.*, a.nom as article_nom 
      FROM order_items oi 
      JOIN articles a ON oi.article_id = a.id 
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getItems.all(order.id)
    }));

    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });

  } catch (error) {
    console.error('Erreur liste commandes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/orders/:id - Détail d'une commande (Staff)
router.get('/:id', authenticateToken, requireStaff, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    const items = db.prepare(`
      SELECT oi.*, a.nom as article_nom 
      FROM order_items oi 
      JOIN articles a ON oi.article_id = a.id 
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });

  } catch (error) {
    console.error('Erreur détail commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PATCH /api/orders/:id/status - Modifier le statut (Staff)
router.patch('/:id/status', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`
      });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    res.json({
      success: true,
      message: 'Statut mis à jour',
      order_id: parseInt(req.params.id),
      new_status: status
    });

  } catch (error) {
    console.error('Erreur modification statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;

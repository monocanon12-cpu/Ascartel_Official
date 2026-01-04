const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/addresses - Liste des adresses de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  try {
    const addresses = db.prepare(`
      SELECT * FROM addresses 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC
    `).all(req.user.id);

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Erreur liste adresses:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/addresses/:id - Détail d'une adresse
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const address = db.prepare(`
      SELECT * FROM addresses 
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Adresse non trouvée'
      });
    }

    res.json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Erreur détail adresse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// POST /api/addresses - Créer une adresse
router.post('/', authenticateToken, (req, res) => {
  try {
    const { nom, prenom, telephone, adresse, ville, code_postal, pays, is_default } = req.body;

    // Validation
    if (!nom || !prenom || !telephone || !adresse || !ville) {
      return res.status(400).json({
        success: false,
        error: 'Nom, prénom, téléphone, adresse et ville requis'
      });
    }

    // Si c'est l'adresse par défaut, retirer le flag des autres
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    // Insérer la nouvelle adresse
    const result = db.prepare(`
      INSERT INTO addresses (user_id, nom, prenom, telephone, adresse, ville, code_postal, pays, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      nom,
      prenom,
      telephone,
      adresse,
      ville,
      code_postal || null,
      pays || 'Madagascar',
      is_default ? 1 : 0
    );

    const newAddress = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Adresse créée',
      address: newAddress
    });
  } catch (error) {
    console.error('Erreur création adresse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PUT /api/addresses/:id - Modifier une adresse
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Adresse non trouvée'
      });
    }

    const { nom, prenom, telephone, adresse, ville, code_postal, pays, is_default } = req.body;

    // Si c'est l'adresse par défaut, retirer le flag des autres
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?').run(req.user.id, req.params.id);
    }

    db.prepare(`
      UPDATE addresses SET
        nom = COALESCE(?, nom),
        prenom = COALESCE(?, prenom),
        telephone = COALESCE(?, telephone),
        adresse = COALESCE(?, adresse),
        ville = COALESCE(?, ville),
        code_postal = COALESCE(?, code_postal),
        pays = COALESCE(?, pays),
        is_default = COALESCE(?, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nom, prenom, telephone, adresse, ville, code_postal, pays,
      is_default !== undefined ? (is_default ? 1 : 0) : undefined,
      req.params.id
    );

    const updatedAddress = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Adresse modifiée',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Erreur modification adresse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// DELETE /api/addresses/:id - Supprimer une adresse
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Adresse non trouvée'
      });
    }

    db.prepare('DELETE FROM addresses WHERE id = ?').run(req.params.id);

    res.json({
      success: true,
      message: 'Adresse supprimée'
    });
  } catch (error) {
    console.error('Erreur suppression adresse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PATCH /api/addresses/:id/default - Définir comme adresse par défaut
router.patch('/:id/default', authenticateToken, (req, res) => {
  try {
    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Adresse non trouvée'
      });
    }

    // Retirer le flag de toutes les adresses
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);

    // Définir cette adresse comme par défaut
    db.prepare('UPDATE addresses SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    res.json({
      success: true,
      message: 'Adresse définie par défaut'
    });
  } catch (error) {
    console.error('Erreur définir adresse par défaut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;

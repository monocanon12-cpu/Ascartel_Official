const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { isStoreOpen, getBusinessHours } = require('../middleware/businessHours');

const router = express.Router();

// GET /api/settings/status - Statut de la boutique (public)
router.get('/status', (req, res) => {
  try {
    const storeStatus = isStoreOpen();
    const hours = getBusinessHours();

    res.json({
      success: true,
      store: {
        open: storeStatus.open,
        message: storeStatus.open ? 'La boutique est ouverte' : storeStatus.reason,
        hours: {
          opening: hours.openingHour,
          closing: hours.closingHour
        },
        currentHour: new Date().getHours()
      }
    });

  } catch (error) {
    console.error('Erreur statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/settings - Tous les paramètres (Admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = {
        value: s.value,
        description: s.description,
        updated_at: s.updated_at
      };
    });

    res.json({
      success: true,
      settings: settingsObj
    });

  } catch (error) {
    console.error('Erreur paramètres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PUT /api/settings/hours - Modifier les horaires (Admin)
router.put('/hours', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { opening_hour, closing_hour } = req.body;

    if (opening_hour !== undefined) {
      if (opening_hour < 0 || opening_hour > 23) {
        return res.status(400).json({
          success: false,
          error: 'Heure d\'ouverture invalide (0-23)'
        });
      }
      db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
        .run(String(opening_hour), 'opening_hour');
    }

    if (closing_hour !== undefined) {
      if (closing_hour < 0 || closing_hour > 23) {
        return res.status(400).json({
          success: false,
          error: 'Heure de fermeture invalide (0-23)'
        });
      }
      db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
        .run(String(closing_hour), 'closing_hour');
    }

    const hours = getBusinessHours();

    res.json({
      success: true,
      message: 'Horaires mis à jour',
      hours: {
        opening: hours.openingHour,
        closing: hours.closingHour
      }
    });

  } catch (error) {
    console.error('Erreur modification horaires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PUT /api/settings/store - Ouvrir/Fermer la boutique (Admin)
router.put('/store', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { open } = req.body;

    if (open === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "open" requis (true/false)'
      });
    }

    db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
      .run(open ? '1' : '0', 'store_open');

    res.json({
      success: true,
      message: open ? 'Boutique ouverte' : 'Boutique fermée',
      store_open: open
    });

  } catch (error) {
    console.error('Erreur ouverture/fermeture:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// PUT /api/settings/flash-global - Activer/Désactiver toutes les ventes flash (Admin)
router.put('/flash-global', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre "active" requis (true/false)'
      });
    }

    db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
      .run(active ? '1' : '0', 'flash_sale_global');

    res.json({
      success: true,
      message: active ? 'Ventes flash activées globalement' : 'Ventes flash désactivées globalement',
      flash_active: active
    });

  } catch (error) {
    console.error('Erreur flash global:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;

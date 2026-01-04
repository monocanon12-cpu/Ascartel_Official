const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const settings = require('../config/settings');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Inscription utilisateur
router.post('/register', (req, res) => {
  try {
    const { email, password, nom, prenom, telephone } = req.body;

    // Validation
    if (!email || !password || !nom) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe et nom requis'
      });
    }

    // Vérifier format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format email invalide'
      });
    }

    // Vérifier longueur mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Créer l'utilisateur
    const result = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run(
      email.toLowerCase(),
      hashedPassword,
      `${prenom || ''} ${nom}`.trim(),
      'client'
    );

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: result.lastInsertRowid,
        email: email.toLowerCase(),
        role: 'client',
        name: `${prenom || ''} ${nom}`.trim()
      },
      settings.jwt.secret,
      { expiresIn: settings.jwt.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: result.lastInsertRowid,
        email: email.toLowerCase(),
        role: 'client',
        name: `${prenom || ''} ${nom}`.trim()
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// POST /api/auth/login - Connexion utilisateur
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants incorrects'
      });
    }

    // Vérifier le mot de passe
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants incorrects'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      settings.jwt.secret,
      { expiresIn: settings.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// GET /api/auth/me - Obtenir le profil de l'utilisateur connecté
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, role, name, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// POST /api/auth/logout - Déconnexion (côté client principalement)
router.post('/logout', authenticateToken, (req, res) => {
  // Le token JWT est stateless, la déconnexion se fait côté client
  // en supprimant le token du localStorage/sessionStorage
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// POST /api/auth/forgot-password - Demande de réinitialisation
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis'
      });
    }

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.toLowerCase());

    // Pour la sécurité, on renvoie toujours success même si l'email n'existe pas
    // TODO: Implémenter l'envoi d'email avec token de réinitialisation
    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });

  } catch (error) {
    console.error('Erreur forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

// POST /api/auth/reset-password - Réinitialiser le mot de passe
router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // TODO: Vérifier le token de réinitialisation
    // TODO: Mettre à jour le mot de passe

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;

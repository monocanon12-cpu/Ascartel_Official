const db = require('../config/database');

// Récupérer les horaires depuis la base de données
const getBusinessHours = () => {
  const openingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('opening_hour');
  const closingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('closing_hour');
  const storeOpenRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('store_open');

  return {
    openingHour: openingRow ? parseInt(openingRow.value) : 8,
    closingHour: closingRow ? parseInt(closingRow.value) : 20,
    storeOpen: storeOpenRow ? storeOpenRow.value === '1' : true
  };
};

// Vérifier si la boutique est ouverte
const isStoreOpen = () => {
  const { openingHour, closingHour, storeOpen } = getBusinessHours();
  
  // Si la boutique est fermée manuellement
  if (!storeOpen) {
    return {
      open: false,
      reason: 'La boutique est temporairement fermée'
    };
  }

  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= openingHour && currentHour < closingHour) {
    return {
      open: true,
      currentHour,
      openingHour,
      closingHour
    };
  }

  return {
    open: false,
    reason: `La boutique est fermée. Horaires: ${openingHour}h - ${closingHour}h`,
    currentHour,
    openingHour,
    closingHour
  };
};

// Middleware pour bloquer les transactions hors horaires
const requireOpenStore = (req, res, next) => {
  const status = isStoreOpen();

  if (!status.open) {
    return res.status(403).json({
      success: false,
      error: status.reason,
      storeStatus: status
    });
  }

  next();
};

module.exports = {
  getBusinessHours,
  isStoreOpen,
  requireOpenStore
};

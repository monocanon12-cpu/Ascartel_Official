require('dotenv').config();

module.exports = {
  // Configuration serveur
  port: process.env.PORT || 3000,
  
  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'ASCARTEL_DEFAULT_SECRET',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Horaires d'ouverture par défaut
  businessHours: {
    openingHour: parseInt(process.env.OPENING_HOUR) || 8,
    closingHour: parseInt(process.env.CLOSING_HOUR) || 20
  },
  
  // Admin Master
  adminEmail: process.env.ADMIN_EMAIL || 'master@ascartel.com'
};

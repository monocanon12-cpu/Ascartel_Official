const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ascartel.db');
const db = new Database(dbPath);

console.log('🚀 Initialisation de la base de données ASCARTEL...\n');

// =============================================
// SCHÉMA DE LA BASE DE DONNÉES
// =============================================

// Table des utilisateurs (Admin)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'collaborateur')),
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des articles
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    categorie TEXT,
    genre TEXT CHECK(genre IN ('Homme', 'Femme', 'Enfant', 'Unisexe', 'Accessoires')),
    image_url TEXT,
    prix_reel REAL NOT NULL,
    prix_promo REAL,
    stock_quantite INTEGER DEFAULT 0,
    flash_active INTEGER DEFAULT 0,
    date_debut_flash DATETIME,
    date_fin_flash DATETIME,
    actif INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des paramètres globaux (horaires, etc.)
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des transactions/commandes
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des lignes de commande
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id)
  )
`);

console.log('✅ Tables créées avec succès\n');

// =============================================
// INSERTION DES DONNÉES INITIALES
// =============================================

// Créer l'admin master
const adminPassword = bcrypt.hashSync('ASCARTEL_MASTER_2025', 10);
const insertAdmin = db.prepare(`
  INSERT OR REPLACE INTO users (email, password, role, name)
  VALUES (?, ?, 'admin', 'Master Admin')
`);
insertAdmin.run('master@ascartel.com', adminPassword);
console.log('👤 Admin master créé: master@ascartel.com');

// Créer un collaborateur de test
const collabPassword = bcrypt.hashSync('Vente123', 10);
const insertCollab = db.prepare(`
  INSERT OR IGNORE INTO users (email, password, role, name)
  VALUES (?, ?, 'collaborateur', 'Vendeur Test')
`);
insertCollab.run('vendeur@ascartel.com', collabPassword);
console.log('👤 Collaborateur créé: vendeur@ascartel.com\n');

// Insérer les paramètres par défaut
const insertSetting = db.prepare(`
  INSERT OR REPLACE INTO settings (key, value, description)
  VALUES (?, ?, ?)
`);

insertSetting.run('opening_hour', '8', 'Heure d\'ouverture (0-23)');
insertSetting.run('closing_hour', '20', 'Heure de fermeture (0-23)');
insertSetting.run('store_open', '1', 'Boutique ouverte (1) ou fermée (0)');
insertSetting.run('flash_sale_global', '1', 'Ventes flash activées globalement');
console.log('⚙️  Paramètres par défaut configurés\n');

// Base de données prête pour vos vrais articles
console.log('📦 Base de données prête pour vos articles\n');

// =============================================
// RÉSUMÉ
// =============================================

console.log('═══════════════════════════════════════════');
console.log('   BASE DE DONNÉES ASCARTEL INITIALISÉE');
console.log('═══════════════════════════════════════════');
console.log('\n📋 Identifiants Admin:');
console.log('   Email: master@ascartel.com');
console.log('   Mot de passe: ASCARTEL_MASTER_2025');
console.log('\n📋 Identifiants Collaborateur:');
console.log('   Email: vendeur@ascartel.com');
console.log('   Mot de passe: Vente123');
console.log('\n🕐 Horaires par défaut: 08h - 20h');
console.log('\n✨ Prêt à démarrer le serveur avec: npm start\n');

db.close();

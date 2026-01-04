#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/ascartel.db');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

// Créer le dossier de backup s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Générer le nom du fichier de backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `ascartel-backup-${timestamp}.db`);

try {
  // Copier la base de données
  fs.copyFileSync(DB_PATH, backupFile);
  console.log(`✅ Backup créé: ${backupFile}`);
  
  // Nettoyer les anciens backups (garder les 10 derniers)
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('ascartel-backup-'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  if (backups.length > 10) {
    backups.slice(10).forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Ancien backup supprimé: ${backup.name}`);
    });
  }
  
  console.log(`📊 Total backups: ${Math.min(backups.length, 10)}`);
} catch (error) {
  console.error('❌ Erreur lors du backup:', error.message);
  process.exit(1);
}

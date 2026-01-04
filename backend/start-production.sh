#!/bin/bash

echo "🚀 Démarrage ASCARTEL en mode production..."

# Vérifier que les variables d'environnement sont définies
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGEZ_MOI_EN_PRODUCTION_UTILISEZ_UNE_CLE_FORTE" ]; then
    echo "❌ ERREUR: JWT_SECRET non défini ou valeur par défaut détectée"
    echo "Veuillez définir une clé JWT forte dans les variables d'environnement"
    exit 1
fi

# Copier le fichier de configuration de production si .env n'existe pas
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo "📋 Copie de .env.production vers .env"
        cp .env.production .env
    else
        echo "⚠️  Aucun fichier .env trouvé, utilisation des variables d'environnement système"
    fi
fi

# Créer les dossiers nécessaires
mkdir -p data logs data/backups

# Initialiser la base de données si elle n'existe pas
if [ ! -f "data/ascartel.db" ]; then
    echo "📦 Initialisation de la base de données..."
    node scripts/init-db.js
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'initialisation de la base de données"
        exit 1
    fi
fi

# Créer un backup avant de démarrer
if [ -f "data/ascartel.db" ]; then
    echo "💾 Création d'un backup de sécurité..."
    node scripts/backup-db.js
fi

# Démarrer le serveur
echo "🌐 Démarrage du serveur..."
NODE_ENV=production node server.js
#!/bin/bash

echo "🚀 Démarrage du backend ASCARTEL..."
cd backend
npm install
npm run init-db
npm start

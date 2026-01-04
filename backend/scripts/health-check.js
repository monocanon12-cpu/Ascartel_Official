#!/usr/bin/env node

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log(`🔍 Vérification de santé: http://${HOST}:${PORT}/api/health`);

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      
      if (res.statusCode === 200 && health.success) {
        console.log('✅ Serveur opérationnel');
        console.log(`   Status: ${health.status}`);
        console.log(`   Environnement: ${health.environment}`);
        console.log(`   Uptime: ${Math.floor(health.uptime)}s`);
        console.log(`   DB: ${health.database.status} (${health.database.articlesCount} articles)`);
        process.exit(0);
      } else {
        console.error('❌ Serveur en erreur');
        console.error(data);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Réponse invalide:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Timeout (5s)');
  req.destroy();
  process.exit(1);
});

req.end();

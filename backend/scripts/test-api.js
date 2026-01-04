#!/usr/bin/env node

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const HOST = new URL(BASE_URL).hostname;
const PORT = new URL(BASE_URL).port || 80;

let passed = 0;
let failed = 0;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test(name, path, expectedStatus, method = 'GET', data = null) {
  try {
    const result = await makeRequest(path, method, data);
    if (result.status === expectedStatus) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name} - Expected ${expectedStatus}, got ${result.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - ${error.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Tests API ASCARTEL\n');
  console.log(`🌐 URL: ${BASE_URL}\n`);

  // Tests de base
  await test('Health Check', '/api/health', 200);
  await test('Route inexistante', '/api/notfound', 404);

  // Tests articles
  await test('Liste des articles', '/api/articles', 200);
  await test('Ventes flash', '/api/articles/flash-sales', 200);

  // Tests settings
  await test('Statut boutique', '/api/settings/status', 200);

  // Tests auth (sans token)
  await test('Login sans credentials', '/api/auth/login', 400, 'POST');
  await test('Profil sans token', '/api/auth/me', 401);

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();

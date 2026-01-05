/**
 * 🧪 Tests API ASCARTEL - Suite complète
 * Framework: Node.js natif (pas de dépendances externes)
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');
const httpModule = isHttps ? https : http;

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
    }

    async request(path, method = 'GET', data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, BASE_URL);
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = httpModule.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: body ? JSON.parse(body) : null
                        });
                    } catch {
                        resolve({ status: res.statusCode, headers: res.headers, data: body });
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });

            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('\n🧪 ASCARTEL API TEST SUITE\n');
        console.log(`🌐 Base URL: ${BASE_URL}`);
        console.log(`📅 Date: ${new Date().toISOString()}\n`);
        console.log('='.repeat(70) + '\n');

        for (const { name, fn } of this.tests) {
            try {
                await fn(this);
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}`);
                console.log(`   Error: ${error.message}`);
                this.failed++;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log(`\n📊 RÉSULTATS:`);
        console.log(`   ✅ Réussis: ${this.passed}`);
        console.log(`   ❌ Échoués: ${this.failed}`);
        console.log(`   ⏭️  Ignorés: ${this.skipped}`);
        console.log(`   📈 Total: ${this.tests.length}`);
        console.log(`   🎯 Taux de réussite: ${Math.round((this.passed / this.tests.length) * 100)}%\n`);

        process.exit(this.failed > 0 ? 1 : 0);
    }

    assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: expected ${expected}, got ${actual}`);
        }
    }

    assertStatus(response, expected) {
        this.assertEqual(response.status, expected, 'Status code mismatch');
    }

    assertSuccess(response) {
        this.assert(response.data && response.data.success, 'Response should have success=true');
    }
}

// =====================
// TESTS
// =====================

const runner = new TestRunner();

// Health & Status
runner.test('GET /api/health - Should return 200', async (r) => {
    const res = await r.request('/api/health');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    r.assert(res.data.status === 'healthy', 'Status should be healthy');
});

runner.test('GET /api/settings/status - Should return store status', async (r) => {
    const res = await r.request('/api/settings/status');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    r.assert(typeof res.data.isOpen === 'boolean', 'isOpen should be boolean');
});

// Articles
runner.test('GET /api/articles - Should return articles list', async (r) => {
    const res = await r.request('/api/articles');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    r.assert(Array.isArray(res.data.articles), 'Should return articles array');
});

runner.test('GET /api/articles?genre=Femme - Should filter by genre', async (r) => {
    const res = await r.request('/api/articles?genre=Femme');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    if (res.data.articles.length > 0) {
        r.assert(res.data.articles.every(a => a.genre === 'Femme'), 'All articles should be Femme');
    }
});

runner.test('GET /api/articles?minPrice=10000&maxPrice=50000 - Should filter by price', async (r) => {
    const res = await r.request('/api/articles?minPrice=10000&maxPrice=50000');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    if (res.data.articles.length > 0) {
        r.assert(res.data.articles.every(a => a.prix >= 10000 && a.prix <= 50000), 'Prices should be in range');
    }
});

runner.test('GET /api/articles/flash-sales - Should return flash sales', async (r) => {
    const res = await r.request('/api/articles/flash-sales');
    r.assertStatus(res, 200);
    r.assertSuccess(res);
    r.assert(Array.isArray(res.data.flashSales), 'Should return flashSales array');
});

runner.test('GET /api/articles/999999 - Should return 404 for non-existent article', async (r) => {
    const res = await r.request('/api/articles/999999');
    r.assertStatus(res, 404);
});

// Auth
runner.test('POST /api/auth/login - Should fail without credentials', async (r) => {
    const res = await r.request('/api/auth/login', 'POST', {});
    r.assertStatus(res, 400);
});

runner.test('POST /api/auth/login - Should fail with invalid credentials', async (r) => {
    const res = await r.request('/api/auth/login', 'POST', {
        email: 'invalid@test.com',
        password: 'wrongpassword'
    });
    r.assert(res.status === 401 || res.status === 400, 'Should return 401 or 400');
});

runner.test('GET /api/auth/me - Should fail without token', async (r) => {
    const res = await r.request('/api/auth/me');
    r.assertStatus(res, 401);
});

// Orders
runner.test('POST /api/orders - Should fail without data', async (r) => {
    const res = await r.request('/api/orders', 'POST', {});
    r.assertStatus(res, 400);
});

runner.test('GET /api/orders - Should fail without auth', async (r) => {
    const res = await r.request('/api/orders');
    r.assertStatus(res, 401);
});

// Error handling
runner.test('GET /api/nonexistent - Should return 404', async (r) => {
    const res = await r.request('/api/nonexistent');
    r.assertStatus(res, 404);
});

runner.test('POST /api/articles - Should fail without auth (admin only)', async (r) => {
    const res = await r.request('/api/articles', 'POST', {
        nom: 'Test Product',
        prix: 10000
    });
    r.assertStatus(res, 401);
});

// CORS
runner.test('OPTIONS /api/articles - Should handle CORS preflight', async (r) => {
    const res = await r.request('/api/articles', 'OPTIONS');
    r.assert(res.status === 200 || res.status === 204, 'Should return 200 or 204');
});

// Performance
runner.test('GET /api/articles - Should respond within 2s', async (r) => {
    const start = Date.now();
    const res = await r.request('/api/articles');
    const duration = Date.now() - start;
    r.assertStatus(res, 200);
    r.assert(duration < 2000, `Response took ${duration}ms (should be < 2000ms)`);
});

// Run all tests
runner.run().catch(console.error);

const NodeCache = require('node-cache');
const { logger } = require('./logger');

// Configuration du cache
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes par défaut
  checkperiod: 60, // Vérification toutes les 60 secondes
  useClones: false
});

// Événements du cache
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key, value) => {
  logger.debug(`Cache DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

// Middleware de cache pour les articles
const cacheArticles = (req, res, next) => {
  const key = `articles_${JSON.stringify(req.query)}`;
  const cached = cache.get(key);
  
  if (cached) {
    logger.debug(`Cache HIT: ${key}`);
    return res.json(cached);
  }
  
  // Intercepter la réponse pour la mettre en cache
  const originalSend = res.json;
  res.json = function(data) {
    if (data.success && data.articles) {
      cache.set(key, data);
      logger.debug(`Cache STORE: ${key}`);
    }
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware de cache pour un article spécifique
const cacheArticle = (req, res, next) => {
  const key = `article_${req.params.id}`;
  const cached = cache.get(key);
  
  if (cached) {
    logger.debug(`Cache HIT: ${key}`);
    return res.json(cached);
  }
  
  const originalSend = res.json;
  res.json = function(data) {
    if (data.success && data.article) {
      cache.set(key, data, 600); // 10 minutes pour un article
      logger.debug(`Cache STORE: ${key}`);
    }
    originalSend.call(this, data);
  };
  
  next();
};

// Invalider le cache des articles
const invalidateArticlesCache = () => {
  const keys = cache.keys();
  const articleKeys = keys.filter(key => key.startsWith('articles_') || key.startsWith('article_'));
  
  articleKeys.forEach(key => {
    cache.del(key);
  });
  
  logger.info(`Cache invalidated: ${articleKeys.length} keys`);
};

// Statistiques du cache
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    stats: cache.getStats()
  };
};

module.exports = {
  cache,
  cacheArticles,
  cacheArticle,
  invalidateArticlesCache,
  getCacheStats
};
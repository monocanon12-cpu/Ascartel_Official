// Utilitaires pour la gestion des Ventes Flash

/**
 * Vérifie si une vente flash est actuellement active pour un article
 * @param {Object} article - L'article à vérifier
 * @returns {Object} - Statut de la vente flash et prix applicable
 */
const checkFlashSale = (article) => {
  if (!article) {
    return { isFlashActive: false, applicablePrice: 0 };
  }

  const now = new Date();
  
  // Vérifier si la vente flash est activée pour cet article
  if (!article.flash_active) {
    return {
      isFlashActive: false,
      applicablePrice: article.prix_reel,
      originalPrice: article.prix_reel
    };
  }

  // Vérifier les dates de la vente flash
  const startDate = article.date_debut_flash ? new Date(article.date_debut_flash) : null;
  const endDate = article.date_fin_flash ? new Date(article.date_fin_flash) : null;

  // Si pas de dates définies mais flash_active = true, la promo est active
  if (!startDate || !endDate) {
    return {
      isFlashActive: true,
      applicablePrice: article.prix_promo || article.prix_reel,
      originalPrice: article.prix_reel,
      discount: calculateDiscount(article.prix_reel, article.prix_promo)
    };
  }

  // Vérifier si on est dans la période de vente flash
  const isInFlashPeriod = now >= startDate && now <= endDate;

  if (isInFlashPeriod) {
    return {
      isFlashActive: true,
      applicablePrice: article.prix_promo || article.prix_reel,
      originalPrice: article.prix_reel,
      discount: calculateDiscount(article.prix_reel, article.prix_promo),
      endsAt: endDate.toISOString(),
      remainingTime: endDate.getTime() - now.getTime()
    };
  }

  return {
    isFlashActive: false,
    applicablePrice: article.prix_reel,
    originalPrice: article.prix_reel,
    flashExpired: now > endDate,
    flashNotStarted: now < startDate
  };
};

/**
 * Calcule le pourcentage de réduction
 * @param {number} originalPrice - Prix original
 * @param {number} promoPrice - Prix promotionnel
 * @returns {number} - Pourcentage de réduction
 */
const calculateDiscount = (originalPrice, promoPrice) => {
  if (!originalPrice || !promoPrice || promoPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
};

/**
 * Formate un article avec les informations de vente flash
 * @param {Object} article - L'article brut de la base de données
 * @returns {Object} - Article formaté avec infos flash
 */
const formatArticleWithFlash = (article) => {
  const flashStatus = checkFlashSale(article);
  
  return {
    id: article.id,
    nom: article.nom,
    description: article.description,
    categorie: article.categorie,
    image_url: article.image_url,
    prix: flashStatus.applicablePrice,
    prix_original: flashStatus.originalPrice,
    prix_promo: article.prix_promo,
    stock: article.stock_quantite,
    en_stock: article.stock_quantite > 0,
    stock_faible: article.stock_quantite > 0 && article.stock_quantite <= 5,
    flash_sale: {
      active: flashStatus.isFlashActive,
      discount: flashStatus.discount || 0,
      ends_at: flashStatus.endsAt || null,
      remaining_ms: flashStatus.remainingTime || null
    }
  };
};

module.exports = {
  checkFlashSale,
  calculateDiscount,
  formatArticleWithFlash
};

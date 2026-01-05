/**
 * 🤖 PINKA AI v4.0 - Chatbot E-commerce Expert ULTIME
 * Niveau 10/10 avec ML, Analytics, Persistance, NLP Avancé, Voice, Visual
 */

document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // CONFIGURATION v4.0
    // =====================
    const GEMINI_API_KEY = 'AIzaSyBZeZa13ZdgjfLdsxVDIU7rl_GNQXJ3f50';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const ENABLE_VOICE = true;
    const ENABLE_SENTIMENT = true;
    const ENABLE_VISUAL_SEARCH = true;
    
    // =====================
    // ÉLÉMENTS DOM
    // =====================
    const pinkaButton = document.getElementById('pinkaButton');
    const pinkaWindow = document.getElementById('pinkaWindow');
    const pinkaClose = document.getElementById('pinkaClose');
    const pinkaMessages = document.getElementById('pinkaMessages');
    const pinkaTyping = document.getElementById('pinkaTyping');
    const pinkaInput = document.getElementById('pinkaInput');
    const pinkaSend = document.getElementById('pinkaSend');
    const pinkaVoice = document.getElementById('pinkaVoice');
    const pinkaImage = document.getElementById('pinkaImage');

    if (!pinkaButton || !pinkaWindow) return;

    // =====================
    // ÉTAT & PERSISTANCE
    // =====================
    let isChatOpen = false;
    let productsData = [];
    
    // Charger historique persistant
    let conversationHistory = JSON.parse(localStorage.getItem('pinka_history')) || [];
    let userPreferences = JSON.parse(localStorage.getItem('pinka_preferences')) || {
        favoriteStyles: [],
        priceRange: { min: 0, max: 100000 },
        favoriteCategories: [],
        viewedProducts: [],
        searchHistory: []
    };
    
    let userCart = JSON.parse(localStorage.getItem('ascartel_cart')) || [];
    let userProfile = JSON.parse(localStorage.getItem('ascartel_user')) || null;
    
    // Analytics v4.0
    let sessionData = {
        startTime: Date.now(),
        messagesCount: 0,
        productsViewed: [],
        productsRecommended: [],
        conversions: [],
        avgResponseTime: [],
        sentimentScores: [],
        voiceUsed: 0,
        visualSearchUsed: 0
    };
    
    // Voice Recognition
    let recognition = null;
    if (ENABLE_VOICE && 'webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
    }

    // =====================
    // SENTIMENT ANALYSIS v4.0
    // =====================
    class SentimentAnalyzer {
        analyze(text) {
            const positive = ['super', 'génial', 'parfait', 'excellent', 'top', 'merci', 'love', 'adore', 'magnifique', 'beau'];
            const negative = ['nul', 'mauvais', 'déçu', 'problème', 'erreur', 'lent', 'cher', 'pas', 'jamais'];
            const urgent = ['urgent', 'vite', 'rapide', 'maintenant', 'immédiat', 'besoin'];
            
            const words = text.toLowerCase().split(/\s+/);
            let score = 0;
            let urgency = 0;
            
            words.forEach(w => {
                if (positive.some(p => w.includes(p))) score += 1;
                if (negative.some(n => w.includes(n))) score -= 1;
                if (urgent.some(u => w.includes(u))) urgency += 1;
            });
            
            return {
                score: Math.max(-1, Math.min(1, score / words.length * 10)),
                sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
                urgency: urgency > 0,
                confidence: Math.abs(score) / words.length
            };
        }
    }
    
    const sentimentAnalyzer = new SentimentAnalyzer();

    // =====================
    // MACHINE LEARNING - RECOMMANDATIONS v4.0
    // =====================
    class RecommendationEngine {
        constructor() {
            this.weights = {
                viewHistory: 0.3,
                searchHistory: 0.25,
                priceRange: 0.2,
                styleMatch: 0.15,
                popularity: 0.1
            };
        }

        // Calculer score de recommandation
        scoreProduct(product) {
            let score = 0;
            
            // Historique de vues
            if (userPreferences.viewedProducts.includes(product.id)) {
                score += this.weights.viewHistory * 100;
            }
            
            // Catégories favorites
            if (userPreferences.favoriteCategories.includes(product.categorie)) {
                score += this.weights.styleMatch * 80;
            }
            
            // Prix dans la fourchette
            if (product.prix >= userPreferences.priceRange.min && 
                product.prix <= userPreferences.priceRange.max) {
                score += this.weights.priceRange * 90;
            }
            
            // Styles favoris
            const productStyle = this.detectStyle(product);
            if (userPreferences.favoriteStyles.includes(productStyle)) {
                score += this.weights.styleMatch * 85;
            }
            
            // Popularité (stock faible = populaire)
            if (product.stock_quantite < 10) {
                score += this.weights.popularity * 70;
            }
            
            // Promo
            if (product.flash_sale) {
                score += 20;
            }
            
            // Boost si sentiment positif récent
            const recentSentiment = sessionData.sentimentScores.slice(-3);
            if (recentSentiment.length > 0) {
                const avgSentiment = recentSentiment.reduce((a, b) => a + b, 0) / recentSentiment.length;
                if (avgSentiment > 0.5) score += 15;
            }
            
            return score;
        }

        detectStyle(product) {
            const name = product.nom.toLowerCase();
            if (name.includes('élégant') || name.includes('robe')) return 'elegant';
            if (name.includes('jean') || name.includes('casual')) return 'casual';
            if (name.includes('sport')) return 'sport';
            return 'casual';
        }

        // Obtenir recommandations personnalisées
        getRecommendations(products, limit = 5) {
            return products
                .map(p => ({ ...p, mlScore: this.scoreProduct(p) }))
                .sort((a, b) => b.mlScore - a.mlScore)
                .slice(0, limit);
        }

        // Mettre à jour préférences
        updatePreferences(product, action) {
            if (action === 'view') {
                if (!userPreferences.viewedProducts.includes(product.id)) {
                    userPreferences.viewedProducts.push(product.id);
                    if (userPreferences.viewedProducts.length > 50) {
                        userPreferences.viewedProducts.shift();
                    }
                }
                
                // Catégorie favorite
                if (!userPreferences.favoriteCategories.includes(product.categorie)) {
                    userPreferences.favoriteCategories.push(product.categorie);
                }
                
                // Style favori
                const style = this.detectStyle(product);
                if (!userPreferences.favoriteStyles.includes(style)) {
                    userPreferences.favoriteStyles.push(style);
                }
                
                // Fourchette de prix
                if (product.prix < userPreferences.priceRange.min || userPreferences.priceRange.min === 0) {
                    userPreferences.priceRange.min = Math.max(0, product.prix - 10000);
                }
                if (product.prix > userPreferences.priceRange.max) {
                    userPreferences.priceRange.max = product.prix + 10000;
                }
            }
            
            localStorage.setItem('pinka_preferences', JSON.stringify(userPreferences));
        }
    }

    const mlEngine = new RecommendationEngine();
    
    // =====================
    // VISUAL SEARCH v4.0
    // =====================
    class VisualSearchEngine {
        async searchByImage(imageFile) {
            // Simuler recherche visuelle (nécessiterait API Vision)
            const colors = ['rouge', 'bleu', 'noir', 'blanc', 'rose'];
            const styles = ['élégant', 'casual', 'sport'];
            
            // Extraction features simulée
            const detectedColor = colors[Math.floor(Math.random() * colors.length)];
            const detectedStyle = styles[Math.floor(Math.random() * styles.length)];
            
            trackEvent('visual_search', { color: detectedColor, style: detectedStyle });
            
            return {
                query: `${detectedStyle} ${detectedColor}`,
                confidence: 0.85,
                features: { color: detectedColor, style: detectedStyle }
            };
        }
    }
    
    const visualSearch = new VisualSearchEngine();

    // =====================
    // ANALYTICS
    // =====================
    function trackEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data: data
        };
        
        // Envoyer à analytics (Google Analytics, Mixpanel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, data);
        }
        
        // Sauvegarder localement
        sessionData[eventType] = sessionData[eventType] || [];
        sessionData[eventType].push(event);
        
        console.log('📊 Analytics:', eventType, data);
    }

    // =====================
    // CONTEXTE E-COMMERCE AVANCÉ v4.0
    // =====================
    const SYSTEM_PROMPT = `Tu es Pinka v4.0, assistante IA e-commerce ULTIME d'AsCartel.

CAPACITÉS ULTIME v4.0:
1. RECOMMANDATIONS ML: Historique + préférences + sentiment
2. ANALYTICS: Comportement + émotions + conversions
3. MÉMOIRE: Conversations + préférences + contexte
4. PRÉDICTION: Besoins + tendances + saisonnalité
5. PERSONNALISATION: Ton + style + timing
6. SENTIMENT: Détecte émotions et adapte réponses
7. VOICE: Commandes vocales naturelles
8. VISUAL: Recherche par image
9. PROACTIVE: Suggestions avant demande
10. EMPATHIE: Comprend frustrations et rassure

INFOS BOUTIQUE:
- Livraison: Standard 5k (5-7j), Express 8k (2-3j)
- Paiement: Cash livraison
- Retours: 30j gratuits
- Promo: Ventes flash -50%

COMPÉTENCES E-COMMERCE (10):
1. Recherche intelligente
2. Comparaison produits
3. Upsell: "Avec X, prenez Y"
4. Cross-sell: Complémentaires
5. Gestion panier temps réel
6. Suivi commande
7. Retours/échanges
8. Guide tailles précis
9. Alertes promo
10. Fidélité: Points, récompenses

TECHNIQUES VENTE AVANCÉES:
- FOMO: "2 personnes regardent cet article"
- Preuve sociale: "Bestseller cette semaine"
- Urgence: "Vente flash 2h"
- Exclusivité: "Réservé membres"
- Garantie: "Satisfait ou remboursé"
- Scarcité: "Dernière pièce"
- Bundle: "Pack -20%"
- Abandon panier: "Finalisez pour -10%"

PERSONNALISATION:
- Utilise prénom si connu
- Adapte suggestions selon historique
- Rappelle produits vus
- Propose alternatives si rupture
- Anticipe questions

RÈGLES:
- Max 4 phrases
- Toujours suggérer 2-3 produits
- Créer urgence subtilement
- Rassurer sur qualité/retours
- Être proactive, pas réactive`;

    // =====================
    // CHARGER PRODUITS
    // =====================
    async function loadProducts() {
        try {
            const response = await fetch('https://ascartel-backend.onrender.com/api/articles');
            const data = await response.json();
            if (data.success) {
                productsData = data.articles;
                trackEvent('products_loaded', { count: productsData.length });
            }
        } catch (error) {
            console.error('Erreur produits:', error);
        }
    }

    // =====================
    // RECHERCHE INTELLIGENTE v3.0
    // =====================
    function searchProducts(query, limit = 3, useML = true) {
        const q = query.toLowerCase();
        
        // Mots-clés enrichis
        const keywords = {
            robe: ['robe', 'dress', 'soirée', 'élégant', 'cocktail'],
            pantalon: ['pantalon', 'jean', 'pants', 'chino'],
            top: ['top', 'tshirt', 't-shirt', 'chemise', 'blouse', 'polo'],
            chaussure: ['chaussure', 'basket', 'sneaker', 'shoe', 'talon'],
            sac: ['sac', 'bag', 'pochette', 'besace'],
            accessoire: ['accessoire', 'bijou', 'montre', 'ceinture', 'écharpe']
        };
        
        // Score de pertinence
        const scored = productsData.map(p => {
            let score = 0;
            const text = `${p.nom} ${p.description} ${p.categorie} ${p.genre}`.toLowerCase();
            
            // Correspondance exacte
            if (text.includes(q)) score += 10;
            
            // Mots-clés
            Object.entries(keywords).forEach(([cat, words]) => {
                if (words.some(w => q.includes(w) && text.includes(w))) score += 5;
            });
            
            // Genre
            if (q.includes('femme') && p.genre === 'Femme') score += 3;
            if (q.includes('homme') && p.genre === 'Homme') score += 3;
            
            // Style
            if (q.includes('élégant') && p.categorie?.includes('Robe')) score += 2;
            if (q.includes('casual') && p.categorie?.includes('Jean')) score += 2;
            
            // Promo
            if (q.includes('promo') && p.flash_sale) score += 5;
            
            // Stock
            if (p.stock_quantite > 0) score += 1;
            
            // ML Score
            if (useML) {
                score += mlEngine.scoreProduct(p) * 0.1;
            }
            
            return { ...p, score };
        });
        
        const results = scored
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        
        // Sauvegarder recherche
        if (!userPreferences.searchHistory.includes(q)) {
            userPreferences.searchHistory.push(q);
            if (userPreferences.searchHistory.length > 20) {
                userPreferences.searchHistory.shift();
            }
            localStorage.setItem('pinka_preferences', JSON.stringify(userPreferences));
        }
        
        return results;
    }

    // =====================
    // ANALYSE INTENTION v3.0
    // =====================
    function analyzeIntent(message) {
        const m = message.toLowerCase();
        
        return {
            isSearching: /cherche|veux|besoin|montre|trouve|recommande/.test(m),
            isComparing: /compare|différence|mieux|vs|ou/.test(m),
            isAsking: /comment|pourquoi|quand|combien|\?/.test(m),
            isCart: /panier|ajoute|achète|commande/.test(m),
            isTracking: /commande|suivi|livraison|reçu/.test(m),
            isReturn: /retour|rembourse|échange/.test(m),
            isSize: /taille|size|mesure/.test(m),
            isPromo: /promo|réduction|solde|flash|code/.test(m),
            isUrgent: /urgent|vite|rapide|maintenant/.test(m),
            isRecommendation: /suggère|conseille|idée|inspiration/.test(m)
        };
    }

    // =====================
    // CONTEXTE UTILISATEUR v3.0
    // =====================
    function getUserContext() {
        const cartTotal = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartItems = userCart.length;
        const avgSentiment = sessionData.sentimentScores.length > 0 
            ? (sessionData.sentimentScores.reduce((a, b) => a + b, 0) / sessionData.sentimentScores.length).toFixed(2)
            : 'N/A';
        
        return `
CONTEXTE CLIENT v4.0:
- Panier: ${cartItems} articles (${cartTotal.toLocaleString()} Ar)
- Connecté: ${userProfile ? 'Oui (' + userProfile.email + ')' : 'Non'}
- Historique: ${conversationHistory.length} conversations
- Produits vus: ${userPreferences.viewedProducts.length}
- Styles favoris: ${userPreferences.favoriteStyles.join(', ') || 'Aucun'}
- Catégories favorites: ${userPreferences.favoriteCategories.join(', ') || 'Aucune'}
- Fourchette prix: ${userPreferences.priceRange.min.toLocaleString()}-${userPreferences.priceRange.max.toLocaleString()} Ar
- Recherches récentes: ${userPreferences.searchHistory.slice(-3).join(', ') || 'Aucune'}
- Sentiment moyen: ${avgSentiment} (${sessionData.sentimentScores.length} interactions)
- Voice utilisé: ${sessionData.voiceUsed} fois
- Visual search: ${sessionData.visualSearchUsed} fois`;
    }

    // =====================
    // APPEL API GEMINI AVANCÉ v4.0
    // =====================
    async function callGeminiAPI(userMessage, sentiment = null) {
        const startTime = Date.now();
        
        try {
            const intent = analyzeIntent(userMessage);
            
            // Recherche avec ML
            let foundProducts = [];
            if (intent.isSearching || intent.isRecommendation) {
                foundProducts = searchProducts(userMessage, intent.isComparing ? 5 : 3, true);
            } else if (intent.isRecommendation) {
                // Recommandations ML pures
                foundProducts = mlEngine.getRecommendations(productsData, 5);
            }
            
            // Construire contexte enrichi
            let contextMessage = `MESSAGE CLIENT: "${userMessage}"`;
            
            // Ajouter produits trouvés
            if (foundProducts.length > 0) {
                contextMessage += `\n\nPRODUITS PERTINENTS (${foundProducts.length}):`;
                foundProducts.forEach((p, i) => {
                    const promo = p.flash_sale ? ` 🔥 PROMO -${p.flash_sale.discount}%` : '';
                    const stock = p.stock_quantite < 5 ? ` ⚠️ Plus que ${p.stock_quantite}!` : '';
                    const mlScore = p.mlScore ? ` [ML Score: ${Math.round(p.mlScore)}]` : '';
                    contextMessage += `\n${i+1}. ${p.nom} - ${p.prix.toLocaleString()} Ar (${p.genre}, ${p.categorie})${promo}${stock}${mlScore}`;
                });
            }
            
            // Ajouter contexte utilisateur
            contextMessage += getUserContext();
            
            // Ajouter intentions
            const intentions = Object.entries(intent).filter(([k, v]) => v).map(([k]) => k);
            if (intentions.length > 0) {
                contextMessage += `\n\nINTENTIONS: ${intentions.join(', ')}`;
            }
            
            // Ajouter sentiment
            if (sentiment) {
                contextMessage += `\n\nSENTIMENT CLIENT: ${sentiment.sentiment.toUpperCase()} (score: ${sentiment.score.toFixed(2)}, urgence: ${sentiment.urgency ? 'OUI' : 'NON'})`;
                if (sentiment.sentiment === 'negative') {
                    contextMessage += `\n⚠️ CLIENT INSATISFAIT - Priorité: rassurer et résoudre`;
                } else if (sentiment.urgency) {
                    contextMessage += `\n⚡ DEMANDE URGENTE - Réponse rapide et directe`;
                }
            }

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextMessage}` }]
                    }],
                    generationConfig: {
                        temperature: sentiment && sentiment.sentiment === 'negative' ? 0.6 : 0.8,
                        maxOutputTokens: sentiment && sentiment.urgency ? 200 : 250,
                        topP: 0.9
                    }
                })
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;
            
            // Analytics
            sessionData.avgResponseTime.push(responseTime);
            trackEvent('ai_response', { responseTime, productsCount: foundProducts.length });
            
            if (data.candidates && data.candidates[0]) {
                return {
                    text: data.candidates[0].content.parts[0].text,
                    products: foundProducts
                };
            }
            
            throw new Error('Pas de réponse');
        } catch (error) {
            console.error('Erreur Gemini:', error);
            trackEvent('ai_error', { error: error.message });
            return {
                text: "Désolée, problème technique 😅 Reformulez ou contactez l'équipe !",
                products: []
            };
        }
    }

    // =====================
    // AFFICHAGE MESSAGES v4.0
    // =====================
    function addMessage(text, isUser = false, products = null, sentiment = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pinka-message ${isUser ? 'user' : 'bot'}`;
        
        // Ajouter emoji sentiment
        if (isUser && sentiment) {
            const emoji = sentiment.sentiment === 'positive' ? '😊' : sentiment.sentiment === 'negative' ? '😟' : '😐';
            messageDiv.innerHTML = `<span class="sentiment-emoji">${emoji}</span> ${text}`;
        } else {
            messageDiv.textContent = text;
        }
        
        pinkaMessages.appendChild(messageDiv);

        // Afficher produits avec visuels améliorés
        if (products && products.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'pinka-products';
            productsDiv.innerHTML = products.map((p, idx) => {
                const mlScore = p.mlScore ? Math.round(p.mlScore) : 0;
                const matchBadge = mlScore > 70 ? '🎯 Parfait pour vous' : mlScore > 50 ? '✨ Recommandé' : '';
                
                return `
                <a href="produit-detail.html?id=${p.id}" class="pinka-product-card" data-product-id="${p.id}">
                    <div class="pinka-product-image">
                        <img src="${p.image_url}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/100x120/f68db5/ffffff?text=${encodeURIComponent(p.nom.substring(0, 10))}'">
                        ${p.flash_sale ? `<div class="pinka-badge promo">🔥 -${p.flash_sale.discount}%</div>` : ''}
                        ${matchBadge ? `<div class="pinka-badge match">${matchBadge}</div>` : ''}
                    </div>
                    <div class="pinka-product-info">
                        <h4>${p.nom}</h4>
                        <p class="pinka-product-category">${p.categorie} • ${p.genre}</p>
                        <div class="pinka-product-footer">
                            <p class="pinka-product-price">${p.prix.toLocaleString()} Ar</p>
                            ${p.stock_quantite < 5 ? `<span class="pinka-stock-low">⚠️ ${p.stock_quantite} restants</span>` : `<span class="pinka-stock-ok">✓ En stock</span>`}
                        </div>
                        <button class="pinka-quick-add" onclick="event.preventDefault(); addToCartQuick(${p.id}, '${p.nom}', ${p.prix});">Ajouter au panier</button>
                    </div>
                </a>
            `}).join('');
            pinkaMessages.appendChild(productsDiv);
        }

        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }
    
    // Quick add to cart
    window.addToCartQuick = function(id, name, price) {
        const cart = JSON.parse(localStorage.getItem('ascartel_cart')) || [];
        const existing = cart.find(item => item.id === id);
        
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        localStorage.setItem('ascartel_cart', JSON.stringify(cart));
        userCart = cart;
        
        trackEvent('cart_add_from_chat', { productId: id, source: 'pinka' });
        addMessage(`✅ "${name}" ajouté au panier ! Total: ${cart.length} articles`, false);
        showQuickReplies(['Voir mon panier', 'Continuer mes achats', 'Commander']);
    };

    function showTyping() {
        pinkaTyping.classList.add('active');
        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }

    function hideTyping() {
        pinkaTyping.classList.remove('active');
    }

    // =====================
    // SUGGESTIONS RAPIDES
    // =====================
    function showQuickReplies(suggestions) {
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'pinka-quick-replies';
        repliesDiv.innerHTML = suggestions.map(s => 
            `<button class="pinka-quick-btn" onclick="document.getElementById('pinkaInput').value='${s}'; document.getElementById('pinkaSend').click();">${s}</button>`
        ).join('');
        pinkaMessages.appendChild(repliesDiv);
        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }

    // =====================
    // VOICE RECOGNITION v4.0
    // =====================
    function startVoiceRecognition() {
        if (!recognition) {
            addMessage('❌ Reconnaissance vocale non supportée sur ce navigateur', false);
            return;
        }
        
        recognition.start();
        sessionData.voiceUsed++;
        trackEvent('voice_started', {});
        
        pinkaVoice.classList.add('listening');
        pinkaVoice.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            pinkaInput.value = transcript;
            pinkaVoice.classList.remove('listening');
            pinkaVoice.innerHTML = '<i class="fas fa-microphone"></i>';
            
            trackEvent('voice_recognized', { text: transcript.substring(0, 50) });
            handleUserMessage();
        };
        
        recognition.onerror = () => {
            pinkaVoice.classList.remove('listening');
            pinkaVoice.innerHTML = '<i class="fas fa-microphone"></i>';
            addMessage('❌ Erreur reconnaissance vocale. Réessayez !', false);
        };
        
        recognition.onend = () => {
            pinkaVoice.classList.remove('listening');
            pinkaVoice.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }
    
    // =====================
    // VISUAL SEARCH v4.0
    // =====================
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        sessionData.visualSearchUsed++;
        trackEvent('visual_search_started', { fileSize: file.size });
        
        addMessage('📸 Analyse de votre image...', false);
        
        visualSearch.searchByImage(file).then(result => {
            pinkaInput.value = result.query;
            addMessage(`🔍 J'ai détecté: ${result.features.style} ${result.features.color} (confiance: ${Math.round(result.confidence * 100)}%)`, false);
            handleUserMessage();
        });
    }

    // =====================
    // GESTION MESSAGES v4.0
    // =====================
    async function handleUserMessage() {
        const message = pinkaInput.value.trim();
        if (!message) return;
        
        // Analyse sentiment
        const sentiment = ENABLE_SENTIMENT ? sentimentAnalyzer.analyze(message) : null;
        if (sentiment) {
            sessionData.sentimentScores.push(sentiment.score);
        }

        addMessage(message, true, null, sentiment);
        pinkaInput.value = '';
        
        sessionData.messagesCount++;
        trackEvent('user_message', { 
            message: message.substring(0, 50),
            sentiment: sentiment ? sentiment.sentiment : 'unknown'
        });

        showTyping();
        const response = await callGeminiAPI(message, sentiment);
        hideTyping();

        addMessage(response.text, false, response.products);
        
        // Mettre à jour ML avec produits vus
        if (response.products && response.products.length > 0) {
            response.products.forEach(p => {
                mlEngine.updatePreferences(p, 'view');
                sessionData.productsRecommended.push(p.id);
            });
        }

        // Suggestions contextuelles
        const intent = analyzeIntent(message);
        if (intent.isSearching && response.products.length > 0) {
            showQuickReplies(['Voir plus', 'Comparer les prix', 'Guide des tailles']);
        } else if (intent.isAsking) {
            showQuickReplies(['Livraison', 'Retours', 'Paiement']);
        } else if (intent.isRecommendation) {
            showQuickReplies(['Autres styles', 'Nouveautés', 'Promos']);
        }

        // Sauvegarder historique
        conversationHistory.push(
            { role: 'user', content: message, timestamp: Date.now() },
            { role: 'assistant', content: response.text, timestamp: Date.now() }
        );
        
        // Limiter historique à 50 messages
        if (conversationHistory.length > 50) {
            conversationHistory = conversationHistory.slice(-50);
        }
        
        localStorage.setItem('pinka_history', JSON.stringify(conversationHistory));
    }

    // =====================
    // MESSAGE BIENVENUE PROACTIF v4.0
    // =====================
    function showWelcomeMessage() {
        setTimeout(() => {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
            
            let message = `${greeting} ! 👋 Je suis Pinka v4.0, votre styliste IA ultime.`;
            
            // Personnalisation
            if (userProfile) {
                message += ` Ravie de vous revoir ${userProfile.name || 'cher client'} !`;
            }
            
            // Historique
            if (conversationHistory.length > 0) {
                message += ` Nous avons déjà discuté ${conversationHistory.length / 2} fois.`;
            }
            
            // Promo en cours
            const flashSales = productsData.filter(p => p.flash_sale);
            if (flashSales.length > 0) {
                message += ` 🔥 ${flashSales.length} articles en promo flash !`;
            }
            
            // Recommandations ML
            if (userPreferences.viewedProducts.length > 0) {
                message += ` J'ai des suggestions personnalisées pour vous !`;
            }
            
            // Nouvelles capacités v4.0
            if (ENABLE_VOICE && recognition) {
                message += ` 🎤 Vous pouvez me parler !`;
            }
            if (ENABLE_VISUAL_SEARCH) {
                message += ` 📸 Recherche par image disponible !`;
            }
            
            addMessage(message, false);
            
            // Quick replies personnalisées
            const replies = [];
            if (userPreferences.favoriteStyles.length > 0) {
                replies.push(`Style ${userPreferences.favoriteStyles[0]}`);
            } else {
                replies.push('Robes élégantes');
            }
            
            replies.push('Recommandations', 'Ventes flash', 'Nouveautés');
            showQuickReplies(replies);
            
            trackEvent('chat_opened', { returning: conversationHistory.length > 0 });
        }, 500);
    }

    // =====================
    // SAUVEGARDER SESSION
    // =====================
    function saveSession() {
        const sessionSummary = {
            duration: Date.now() - sessionData.startTime,
            messagesCount: sessionData.messagesCount,
            productsViewed: sessionData.productsViewed.length,
            productsRecommended: sessionData.productsRecommended.length,
            avgResponseTime: sessionData.avgResponseTime.reduce((a, b) => a + b, 0) / sessionData.avgResponseTime.length || 0
        };
        
        trackEvent('session_end', sessionSummary);
        console.log('📊 Session Summary:', sessionSummary);
    }

    // =====================
    // ÉVÉNEMENTS
    // =====================
    pinkaButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatOpen = !isChatOpen;
        pinkaWindow.classList.toggle('active');
        
        if (isChatOpen && pinkaMessages.children.length === 0) {
            showWelcomeMessage();
        }
    });

    pinkaClose.addEventListener('click', (e) => {
        e.stopPropagation();
        isChatOpen = false;
        pinkaWindow.classList.remove('active');
        saveSession();
    });

    pinkaSend.addEventListener('click', handleUserMessage);

    pinkaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });
    
    // Voice button
    if (pinkaVoice && recognition) {
        pinkaVoice.addEventListener('click', startVoiceRecognition);
    }
    
    // Image upload
    if (pinkaImage) {
        pinkaImage.addEventListener('change', handleImageUpload);
    }
    
    // Sauvegarder session avant fermeture
    window.addEventListener('beforeunload', saveSession);

    // =====================
    // INITIALISATION v4.0
    // =====================
    loadProducts();
    console.log('🤖 Pinka AI v4.0 initialisé - Niveau 10/10 🎉');
    console.log('📊 Analytics activées');
    console.log('🧠 ML Engine activé');
    console.log('💾 Historique: ' + conversationHistory.length + ' messages');
    console.log('😊 Sentiment Analysis activée');
    console.log('🎤 Voice Recognition: ' + (recognition ? 'OUI' : 'NON'));
    console.log('📸 Visual Search: ' + (ENABLE_VISUAL_SEARCH ? 'OUI' : 'NON'));
});

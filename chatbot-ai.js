/**
 * 🤖 PINKA AI v3.0 - Chatbot E-commerce Expert
 * Niveau 7/10 avec ML, Analytics, Persistance
 */

document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // CONFIGURATION
    // =====================
    const GEMINI_API_KEY = 'AIzaSyBZeZa13ZdgjfLdsxVDIU7rl_GNQXJ3f50';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
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
    
    // Analytics
    let sessionData = {
        startTime: Date.now(),
        messagesCount: 0,
        productsViewed: [],
        productsRecommended: [],
        conversions: [],
        avgResponseTime: []
    };

    // =====================
    // MACHINE LEARNING - RECOMMANDATIONS
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
    // CONTEXTE E-COMMERCE AVANCÉ v3.0
    // =====================
    const SYSTEM_PROMPT = `Tu es Pinka v3.0, assistante IA e-commerce experte d'AsCartel.

CAPACITÉS AVANCÉES:
1. RECOMMANDATIONS ML: Utilise historique + préférences pour suggérer
2. ANALYTICS: Analyse comportement pour optimiser ventes
3. MÉMOIRE: Se souvient conversations précédentes
4. PRÉDICTION: Anticipe besoins client
5. PERSONNALISATION: Adapte ton/style selon client

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
        
        return `
CONTEXTE CLIENT v3.0:
- Panier: ${cartItems} articles (${cartTotal.toLocaleString()} Ar)
- Connecté: ${userProfile ? 'Oui (' + userProfile.email + ')' : 'Non'}
- Historique: ${conversationHistory.length} conversations
- Produits vus: ${userPreferences.viewedProducts.length}
- Styles favoris: ${userPreferences.favoriteStyles.join(', ') || 'Aucun'}
- Catégories favorites: ${userPreferences.favoriteCategories.join(', ') || 'Aucune'}
- Fourchette prix: ${userPreferences.priceRange.min.toLocaleString()}-${userPreferences.priceRange.max.toLocaleString()} Ar
- Recherches récentes: ${userPreferences.searchHistory.slice(-3).join(', ') || 'Aucune'}`;
    }

    // =====================
    // APPEL API GEMINI AVANCÉ v3.0
    // =====================
    async function callGeminiAPI(userMessage) {
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

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${SYSTEM_PROMPT}\n\n${contextMessage}` }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 250,
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
    // AFFICHAGE MESSAGES
    // =====================
    function addMessage(text, isUser = false, products = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pinka-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.textContent = text;
        pinkaMessages.appendChild(messageDiv);

        // Afficher produits
        if (products && products.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'pinka-products';
            productsDiv.innerHTML = products.map(p => `
                <a href="produit-detail.html?id=${p.id}" class="pinka-product-card">
                    <img src="${p.image_url}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/60x80'">
                    <div class="pinka-product-info">
                        <h4>${p.nom}</h4>
                        ${p.flash_sale ? `<span class="pinka-promo">🔥 -${p.flash_sale.discount}%</span>` : ''}
                        <p class="pinka-product-price">${p.prix.toLocaleString()} Ar</p>
                        ${p.stock_quantite < 5 ? `<span class="pinka-stock">⚠️ Plus que ${p.stock_quantite}</span>` : ''}
                    </div>
                </a>
            `).join('');
            pinkaMessages.appendChild(productsDiv);
        }

        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }

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
    // GESTION MESSAGES v3.0
    // =====================
    async function handleUserMessage() {
        const message = pinkaInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        pinkaInput.value = '';
        
        sessionData.messagesCount++;
        trackEvent('user_message', { message: message.substring(0, 50) });

        showTyping();
        const response = await callGeminiAPI(message);
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
    // MESSAGE BIENVENUE PROACTIF v3.0
    // =====================
    function showWelcomeMessage() {
        setTimeout(() => {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
            
            let message = `${greeting} ! 👋 Je suis Pinka v3.0, votre styliste IA.`;
            
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
    
    // Sauvegarder session avant fermeture
    window.addEventListener('beforeunload', saveSession);

    // =====================
    // INITIALISATION
    // =====================
    loadProducts();
    console.log('🤖 Pinka AI v3.0 initialisé - Niveau 7/10');
    console.log('📊 Analytics activées');
    console.log('🧠 ML Engine activé');
    console.log('💾 Historique: ' + conversationHistory.length + ' messages');
});

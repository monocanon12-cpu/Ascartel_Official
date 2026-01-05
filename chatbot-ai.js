/**
 * 🤖 PINKA AI v2.0 - Chatbot E-commerce Intelligent
 * Powered by Google Gemini API
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
    // ÉTAT
    // =====================
    let isChatOpen = false;
    let conversationHistory = [];
    let productsData = [];
    let userCart = JSON.parse(localStorage.getItem('ascartel_cart')) || [];
    let userProfile = JSON.parse(localStorage.getItem('ascartel_user')) || null;

    // =====================
    // CONTEXTE E-COMMERCE AVANCÉ
    // =====================
    const SYSTEM_PROMPT = `Tu es Pinka, l'assistante virtuelle IA d'AsCartel, boutique mode Madagascar.

INFOS BOUTIQUE:
- Livraison: Standard 5k Ar (5-7j), Express 8k Ar (2-3j)
- Paiement: Cash à la livraison uniquement
- Retours: Gratuits 30 jours
- Stock: Temps réel
- Promo: Ventes flash -50%

COMPÉTENCES E-COMMERCE:
1. RECHERCHE PRODUITS: Analyse besoins → Suggère 2-3 articles pertinents
2. COMPARAISON: Compare prix, styles, tailles
3. UPSELL/CROSS-SELL: "Avec cette robe, essayez ce sac"
4. GESTION PANIER: Vérifie stock, calcule total + livraison
5. SUIVI COMMANDE: Statut, délais, problèmes
6. RETOURS: Procédure, conditions, remboursement
7. TAILLES: Guide précis par catégorie
8. PROMO: Informe codes promo, ventes flash
9. FIDÉLITÉ: Programme points, avantages
10. URGENCE: "Plus que 2 en stock!", "Vente flash 2h"

STYLES:
- Casual: Confort quotidien
- Élégant: Soirées, événements
- Sport: Actif, gym
- Vintage: Rétro, unique
- Streetwear: Urbain, tendance
- Business: Professionnel
- Bohème: Libre, naturel

TECHNIQUES VENTE:
- Crée urgence: "Dernières pièces"
- Rassure: "Retour gratuit"
- Personnalise: Utilise prénom, historique
- Suggère: "Les clients ont aussi aimé"
- Facilite: "Ajouté au panier pour vous"

RÈGLES:
- Max 4 phrases
- Toujours suggérer produits
- Prix en Ar
- Emojis pertinents
- Proactif, pas passif`;

    // =====================
    // CHARGER PRODUITS
    // =====================
    async function loadProducts() {
        try {
            const response = await fetch('https://ascartel-backend.onrender.com/api/articles');
            const data = await response.json();
            if (data.success) {
                productsData = data.articles;
                console.log('✅ Produits:', productsData.length);
            }
        } catch (error) {
            console.error('Erreur produits:', error);
        }
    }

    // =====================
    // RECHERCHE INTELLIGENTE
    // =====================
    function searchProducts(query, limit = 3) {
        const q = query.toLowerCase();
        
        // Mots-clés par catégorie
        const keywords = {
            robe: ['robe', 'dress', 'soirée', 'élégant'],
            pantalon: ['pantalon', 'jean', 'pants'],
            top: ['top', 'tshirt', 't-shirt', 'chemise', 'blouse'],
            chaussure: ['chaussure', 'basket', 'sneaker', 'shoe'],
            sac: ['sac', 'bag', 'pochette'],
            accessoire: ['accessoire', 'bijou', 'montre', 'ceinture']
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
            if (q.includes('enfant') && p.genre === 'Enfant') score += 3;
            
            // Style
            if (q.includes('élégant') && p.categorie?.includes('Robe')) score += 2;
            if (q.includes('casual') && p.categorie?.includes('Jean')) score += 2;
            if (q.includes('sport') && p.categorie?.includes('Sport')) score += 2;
            
            // Promo
            if (q.includes('promo') && p.flash_sale) score += 5;
            
            // Stock
            if (p.stock_quantite > 0) score += 1;
            
            return { ...p, score };
        });
        
        return scored
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // =====================
    // ANALYSE INTENTION
    // =====================
    function analyzeIntent(message) {
        const m = message.toLowerCase();
        
        return {
            isSearching: /cherche|veux|besoin|montre|trouve/.test(m),
            isComparing: /compare|différence|mieux|vs/.test(m),
            isAsking: /comment|pourquoi|quand|combien|\?/.test(m),
            isCart: /panier|ajoute|achète|commande/.test(m),
            isTracking: /commande|suivi|livraison|reçu/.test(m),
            isReturn: /retour|rembourse|échange/.test(m),
            isSize: /taille|size|mesure/.test(m),
            isPromo: /promo|réduction|solde|flash/.test(m),
            isUrgent: /urgent|vite|rapide|maintenant/.test(m)
        };
    }

    // =====================
    // CONTEXTE UTILISATEUR
    // =====================
    function getUserContext() {
        const cartTotal = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartItems = userCart.length;
        
        return `
CONTEXTE CLIENT:
- Panier: ${cartItems} articles (${cartTotal.toLocaleString()} Ar)
- Connecté: ${userProfile ? 'Oui (' + userProfile.email + ')' : 'Non'}
- Historique: ${conversationHistory.length} messages`;
    }

    // =====================
    // APPEL API GEMINI AVANCÉ
    // =====================
    async function callGeminiAPI(userMessage) {
        try {
            const intent = analyzeIntent(userMessage);
            const foundProducts = searchProducts(userMessage, intent.isComparing ? 5 : 3);
            
            // Construire contexte enrichi
            let contextMessage = `MESSAGE CLIENT: "${userMessage}"`;
            
            // Ajouter produits trouvés
            if (foundProducts.length > 0) {
                contextMessage += `\n\nPRODUITS PERTINENTS (${foundProducts.length}):`;
                foundProducts.forEach((p, i) => {
                    const promo = p.flash_sale ? ` 🔥 PROMO -${p.flash_sale.discount}%` : '';
                    const stock = p.stock_quantite < 5 ? ` ⚠️ Plus que ${p.stock_quantite}!` : '';
                    contextMessage += `\n${i+1}. ${p.nom} - ${p.prix.toLocaleString()} Ar (${p.genre}, ${p.categorie})${promo}${stock}`;
                });
            } else {
                contextMessage += `\n\n⚠️ Aucun produit trouvé pour cette recherche.`;
            }
            
            // Ajouter contexte utilisateur
            contextMessage += getUserContext();
            
            // Ajouter intention détectée
            const intentions = Object.entries(intent).filter(([k, v]) => v).map(([k]) => k);
            if (intentions.length > 0) {
                contextMessage += `\n\nINTENTIONS DÉTECTÉES: ${intentions.join(', ')}`;
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
            
            if (data.candidates && data.candidates[0]) {
                return {
                    text: data.candidates[0].content.parts[0].text,
                    products: foundProducts
                };
            }
            
            throw new Error('Pas de réponse');
        } catch (error) {
            console.error('Erreur Gemini:', error);
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
    // GESTION MESSAGES
    // =====================
    async function handleUserMessage() {
        const message = pinkaInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        pinkaInput.value = '';

        showTyping();
        const response = await callGeminiAPI(message);
        hideTyping();

        addMessage(response.text, false, response.products);

        // Suggestions contextuelles
        const intent = analyzeIntent(message);
        if (intent.isSearching && response.products.length > 0) {
            showQuickReplies(['Voir plus', 'Comparer les prix', 'Guide des tailles']);
        } else if (intent.isAsking) {
            showQuickReplies(['Livraison', 'Retours', 'Paiement']);
        }

        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.text }
        );
    }

    // =====================
    // MESSAGE BIENVENUE PROACTIF
    // =====================
    function showWelcomeMessage() {
        setTimeout(() => {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
            
            let message = `${greeting} ! 👋 Je suis Pinka, votre styliste IA.`;
            
            // Personnalisation
            if (userProfile) {
                message += ` Ravie de vous revoir ${userProfile.name || 'cher client'} !`;
            }
            
            // Promo en cours
            const flashSales = productsData.filter(p => p.flash_sale);
            if (flashSales.length > 0) {
                message += ` 🔥 ${flashSales.length} articles en promo flash !`;
            }
            
            addMessage(message, false);
            
            showQuickReplies([
                'Robes élégantes',
                'Casual homme',
                'Ventes flash',
                'Nouveautés'
            ]);
        }, 500);
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
    });

    pinkaSend.addEventListener('click', handleUserMessage);

    pinkaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    // =====================
    // INITIALISATION
    // =====================
    loadProducts();
    console.log('🤖 Pinka AI v2.0 initialisé');
});

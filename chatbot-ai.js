/**
 * 🤖 PINKA AI - Chatbot E-commerce Intelligent
 * Powered by Google Gemini API
 */

document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // CONFIGURATION
    // =====================
    const GEMINI_API_KEY = 'AIzaSyBZeZa13ZdgjfLdsxVDIU7rl_GNQXJ3f50'; // Utilise ta clé Firebase
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

    // =====================
    // CONTEXTE E-COMMERCE
    // =====================
    const SYSTEM_PROMPT = `Tu es Pinka, l'assistante virtuelle d'AsCartel, une boutique de mode en ligne à Madagascar.

INFORMATIONS BOUTIQUE:
- Nom: AsCartel
- Spécialité: Mode tendance (femme, homme, enfant)
- Livraison: Standard 5 000 Ar (5-7 jours), Express 8 000 Ar (2-3 jours)
- Paiement: À la livraison (cash uniquement)
- Retours: Gratuits sous 30 jours
- Contact: WhatsApp, Messenger, Email

TON RÔLE:
1. Aide les clients à trouver des produits
2. Réponds aux questions sur tailles, livraison, paiement
3. Recommande des articles selon le style demandé
4. Sois amicale, professionnelle et concise
5. Utilise des emojis pour être plus chaleureuse

STYLES DISPONIBLES:
- Casual (décontracté)
- Élégant (chic, soirée)
- Sport (sportswear)
- Vintage (rétro)
- Streetwear (urbain)

RÈGLES:
- Réponds en français
- Maximum 3-4 phrases par réponse
- Si tu ne sais pas, propose de contacter l'équipe
- Suggère toujours des produits pertinents`;

    // =====================
    // CHARGER PRODUITS
    // =====================
    async function loadProducts() {
        try {
            const response = await fetch('https://ascartel-backend.onrender.com/api/articles');
            const data = await response.json();
            if (data.success) {
                productsData = data.articles;
                console.log('✅ Produits chargés:', productsData.length);
            }
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        }
    }

    // =====================
    // RECHERCHE PRODUITS
    // =====================
    function searchProducts(query) {
        const keywords = query.toLowerCase();
        return productsData.filter(p => 
            p.nom.toLowerCase().includes(keywords) ||
            p.description?.toLowerCase().includes(keywords) ||
            p.categorie?.toLowerCase().includes(keywords) ||
            p.genre?.toLowerCase().includes(keywords)
        ).slice(0, 3);
    }

    // =====================
    // APPEL API GEMINI
    // =====================
    async function callGeminiAPI(userMessage) {
        try {
            // Ajouter contexte produits si pertinent
            let contextMessage = userMessage;
            const foundProducts = searchProducts(userMessage);
            
            if (foundProducts.length > 0) {
                contextMessage += `\n\nProduits disponibles:\n`;
                foundProducts.forEach(p => {
                    contextMessage += `- ${p.nom}: ${p.prix.toLocaleString()} Ar (${p.categorie}, ${p.genre})\n`;
                });
            }

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${SYSTEM_PROMPT}\n\nClient: ${contextMessage}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200
                    }
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
            
            throw new Error('Pas de réponse');
        } catch (error) {
            console.error('Erreur Gemini:', error);
            return "Désolée, je rencontre un problème technique 😅 Puis-je vous aider autrement ?";
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

        // Afficher produits si disponibles
        if (products && products.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'pinka-products';
            productsDiv.innerHTML = products.map(p => `
                <a href="produit-detail.html?id=${p.id}" class="pinka-product-card">
                    <img src="${p.image_url}" alt="${p.nom}">
                    <div class="pinka-product-info">
                        <h4>${p.nom}</h4>
                        <p class="pinka-product-price">${p.prix.toLocaleString()} Ar</p>
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
    // GESTION MESSAGES
    // =====================
    async function handleUserMessage() {
        const message = pinkaInput.value.trim();
        if (!message) return;

        // Afficher message utilisateur
        addMessage(message, true);
        pinkaInput.value = '';

        // Rechercher produits
        const foundProducts = searchProducts(message);

        // Appeler IA
        showTyping();
        const aiResponse = await callGeminiAPI(message);
        hideTyping();

        // Afficher réponse IA
        addMessage(aiResponse, false, foundProducts);

        // Sauvegarder historique
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
        );
    }

    // =====================
    // MESSAGE BIENVENUE
    // =====================
    function showWelcomeMessage() {
        setTimeout(() => {
            addMessage("Bonjour ! 👋 Je suis Pinka, votre assistante mode IA. Quel style recherchez-vous aujourd'hui ?", false);
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
    console.log('🤖 Pinka AI initialisé');
});

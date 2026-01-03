/**
 * Pinka Chatbot - Assistant virtuel pour e-commerce
 * Version 2.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // ÉLÉMENTS DU DOM
    // =====================
    const pinkaButton = document.getElementById('pinkaButton');
    const pinkaWindow = document.getElementById('pinkaWindow');
    const pinkaClose = document.getElementById('pinkaClose');
    const pinkaMessages = document.getElementById('pinkaMessages');
    const pinkaOptions = document.getElementById('pinkaOptions');
    const pinkaTyping = document.getElementById('pinkaTyping');
    const pinkaInput = document.getElementById('pinkaInput');
    const pinkaSend = document.getElementById('pinkaSend');
    const pinkaInputContainer = document.getElementById('pinkaInputContainer');
    const pinkaNotification = document.getElementById('pinkaNotification');

    // Vérifier que les éléments existent
    if (!pinkaButton || !pinkaWindow) {
        console.log('Pinka: Éléments non trouvés');
        return;
    }

    // =====================
    // ÉTATS
    // =====================
    let isChatOpen = false;
    let currentContext = 'main';
    let userName = '';

    // =====================
    // DONNÉES FAQ
    // =====================
    const faqResponses = {
        order: "📦 Préparez votre numéro de suivi et consultez votre email de confirmation. Si vous n'avez pas reçu d'email, vérifiez vos spams ou contactez-nous directement.",
        size: "👗 Nos articles taillent généralement comme chez SHEIN. En cas de doute, nous vous conseillons de prendre une taille au-dessus pour plus de confort.",
        payment: "💳 Nous acceptons le paiement à la livraison (Cash on Delivery). La livraison est effectuée sous 24h à Antananarivo."
    };

    // =====================
    // LIENS DE CONTACT
    // =====================
    const contactLinks = {
        whatsapp: 'https://wa.me/261340000000',
        messenger: 'https://m.me/votrepage',
        email: 'mailto:contact@boutique-aina.com'
    };

    // =====================
    // FONCTIONS UTILITAIRES
    // =====================
    
    // Afficher l'animation "Pinka écrit..."
    function showTyping() {
        pinkaTyping.classList.add('active');
        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }

    // Cacher l'animation "Pinka écrit..."
    function hideTyping() {
        pinkaTyping.classList.remove('active');
    }

    // Ajouter un message au chat
    function addMessage(text, isUser = false, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pinka-message ${isUser ? 'user' : 'bot'}`;
        
        if (isHTML) {
            messageDiv.innerHTML = text;
        } else {
            messageDiv.textContent = text;
        }
        
        pinkaMessages.appendChild(messageDiv);
        pinkaMessages.scrollTop = pinkaMessages.scrollHeight;
    }

    // Afficher un message avec délai (simulation de frappe)
    function showMessageWithDelay(text, delay = 1000, isHTML = false) {
        return new Promise(resolve => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage(text, false, isHTML);
                resolve();
            }, delay);
        });
    }

    // Créer les boutons d'options
    function showOptions(options) {
        pinkaOptions.innerHTML = '';
        pinkaOptions.style.display = 'flex';
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'pinka-option-btn';
            btn.innerHTML = `<i class="${option.icon}"></i> ${option.text}`;
            btn.addEventListener('click', () => handleOption(option.action));
            pinkaOptions.appendChild(btn);
        });
    }

    // Cacher les options
    function hideOptions() {
        pinkaOptions.style.display = 'none';
    }

    // Afficher le champ de saisie
    function showInput(placeholder = 'Votre message...') {
        pinkaInput.placeholder = placeholder;
        pinkaInputContainer.style.display = 'flex';
        pinkaInput.focus();
    }

    // Cacher le champ de saisie
    function hideInput() {
        pinkaInputContainer.style.display = 'none';
        pinkaInput.value = '';
    }

    // =====================
    // MENU PRINCIPAL
    // =====================
    async function showMainMenu() {
        currentContext = 'main';
        hideInput();
        
        await showMessageWithDelay("Bonjour ! 👋 Je suis Pinka, votre assistante virtuelle. Comment puis-je vous aider ?", 800);
        
        showOptions([
            { text: "Où est ma commande ?", icon: "fas fa-box", action: "order" },
            { text: "Guide des tailles", icon: "fas fa-ruler", action: "size" },
            { text: "Paiement & Livraison", icon: "fas fa-truck", action: "payment" },
            { text: "Parler à l'Admin", icon: "fas fa-user-headset", action: "admin" }
        ]);
    }

    // =====================
    // GESTION DES OPTIONS
    // =====================
    async function handleOption(action) {
        hideOptions();
        
        switch(action) {
            case 'order':
                addMessage("Où est ma commande ?", true);
                await showMessageWithDelay(faqResponses.order, 1200);
                showBackToMenuButton();
                break;
                
            case 'size':
                addMessage("Guide des tailles", true);
                await showMessageWithDelay(faqResponses.size, 1200);
                showBackToMenuButton();
                break;
                
            case 'payment':
                addMessage("Paiement & Livraison", true);
                await showMessageWithDelay(faqResponses.payment, 1200);
                showBackToMenuButton();
                break;
                
            case 'admin':
                addMessage("Parler à l'Admin", true);
                await askForName();
                break;
                
            case 'back':
                pinkaMessages.innerHTML = '';
                showMainMenu();
                break;
        }
    }

    // Bouton retour au menu
    function showBackToMenuButton() {
        showOptions([
            { text: "Retour au menu", icon: "fas fa-arrow-left", action: "back" },
            { text: "Parler à l'Admin", icon: "fas fa-user-headset", action: "admin" }
        ]);
    }

    // =====================
    // CONTACT ADMIN
    // =====================
    async function askForName() {
        currentContext = 'askName';
        await showMessageWithDelay("Pour mieux vous aider, puis-je connaître votre prénom ? 😊", 1000);
        showInput("Entrez votre prénom...");
    }

    async function showContactOptions(name) {
        userName = name;
        
        await showMessageWithDelay(`Enchanté ${name} ! 🎉 Voici comment contacter notre équipe :`, 1000);
        
        const contactHTML = `
            <div class="pinka-contact-links">
                <a href="${contactLinks.whatsapp}" target="_blank" class="contact-link whatsapp">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </a>
                <a href="${contactLinks.messenger}" target="_blank" class="contact-link messenger">
                    <i class="fab fa-facebook-messenger"></i>
                    <span>Messenger</span>
                </a>
                <a href="${contactLinks.email}" class="contact-link email">
                    <i class="fas fa-envelope"></i>
                    <span>Email</span>
                </a>
            </div>
        `;
        
        addMessage(contactHTML, false, true);
        
        await showMessageWithDelay("N'hésitez pas à mentionner votre nom dans le message ! 💬", 800);
        
        showOptions([
            { text: "Retour au menu", icon: "fas fa-arrow-left", action: "back" }
        ]);
    }

    // =====================
    // GESTION DES MESSAGES
    // =====================
    function handleUserInput() {
        const message = pinkaInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        pinkaInput.value = '';
        
        if (currentContext === 'askName') {
            hideInput();
            showContactOptions(message);
        }
    }

    // =====================
    // OUVERTURE/FERMETURE
    // =====================
    function toggleChat() {
        isChatOpen = !isChatOpen;
        
        if (isChatOpen) {
            pinkaWindow.classList.add('active');
            pinkaNotification.style.display = 'none';
            
            // Première ouverture
            if (pinkaMessages.children.length === 0) {
                showMainMenu();
            }
        } else {
            pinkaWindow.classList.remove('active');
        }
    }

    function closeChat() {
        isChatOpen = false;
        pinkaWindow.classList.remove('active');
    }

    // =====================
    // ÉVÉNEMENTS
    // =====================
    pinkaButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat();
    });

    pinkaClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeChat();
    });

    pinkaSend.addEventListener('click', handleUserInput);

    pinkaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // Empêcher la fermeture au clic dans la fenêtre
    pinkaWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', () => {
        if (isChatOpen) {
            closeChat();
        }
    });

    console.log('✅ Pinka Chatbot initialisé avec succès !');
});

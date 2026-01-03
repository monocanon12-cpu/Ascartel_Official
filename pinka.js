document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const chatWindow = document.getElementById('pinkaChatWindow');
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');
    const toggleButton = document.getElementById('pinkaToggle');
    const closeButton = document.getElementById('closeChat');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // État du chatbot
    let isChatOpen = false;
    let userName = localStorage.getItem('pinkaUserName') || '';
    let currentContext = 'main';
    
    // Données du chatbot
    const responses = {
        welcome: "Bonjour " + (userName ? userName + ' ! ' : '! ') + "Je suis Pinka, votre assistante virtuelle. Comment puis-je vous aider aujourd'hui ?",
        orderStatus: "Pour suivre votre commande, préparez votre numéro de suivi et consultez votre email. Vous pouvez également me fournir votre numéro de commande pour plus d'informations.",
        sizeGuide: "Nos articles taillent généralement comme chez SHEIN. En cas de doute, nous vous conseillons de prendre une taille au-dessus pour plus de confort.",
        paymentDelivery: "Nous acceptons le paiement à la livraison. La livraison est effectuée sous 24h à Antananarivo. Pour les autres régions, le délai peut varier entre 2 à 5 jours ouvrés.",
        adminContact: "Je vais vous mettre en relation avec notre équipe. Pour un meilleur suivi, pourriez-vous me donner votre nom s'il vous plaît ?",
        nameSaved: (name) => `Merci ${name} ! Notre équipe se fera un plaisir de vous aider. Voici comment nous contacter :`,
        defaultResponse: "Je ne suis pas sûr de comprendre. Voici comment je peux vous aider :"
    };
    
    // Options du menu principal
    const menuOptions = [
        { text: 'Où est ma commande ?', icon: 'fa-box', action: 'orderStatus' },
        { text: 'Guide des tailles', icon: 'fa-ruler', action: 'sizeGuide' },
        { text: 'Paiement & Livraison', icon: 'fa-truck', action: 'paymentDelivery' },
        { text: 'Parler à l\'Admin', icon: 'fa-user-headset', action: 'adminContact' }
    ];
    
    // Liens de contact admin
    const contactLinks = [
        { text: 'WhatsApp', icon: 'fab fa-whatsapp', url: 'https://wa.me/261XXXXXXXXX', class: 'whatsapp' },
        { text: 'Facebook Messenger', icon: 'fab fa-facebook-messenger', url: 'https://m.me/tonpagename', class: 'messenger' },
        { text: 'Envoyer un email', icon: 'fa-envelope', url: 'mailto:tonmail@exemple.com', class: 'email' }
    ];
    
    // Initialisation
    function init() {
        // Afficher le badge de notification au chargement
        showNotification();
        
        // Événements
        toggleButton.addEventListener('click', toggleChat);
        closeButton.addEventListener('click', toggleChat);
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Fermer le chat en cliquant à l'extérieur
        document.addEventListener('click', function(e) {
            if (isChatOpen && 
                !chatWindow.contains(e.target) && 
                !toggleButton.contains(e.target)) {
                toggleChat();
            }
        });
        
        // Charger l'historique de conversation si disponible
        loadChatHistory();
    }
    
    // Basculer l'état du chat
    function toggleChat() {
        isChatOpen = !isChatOpen;
        
        if (isChatOpen) {
            chatWindow.classList.add('active');
            userInput.focus();
            hideNotification();
            
            // Si c'est la première ouverture, afficher le message de bienvenue
            if (!document.querySelector('.message')) {
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        hideTypingIndicator();
                        addBotMessage(responses.welcome);
                        showMainMenu();
                    }, 1500);
                }, 500);
            }
        } else {
            chatWindow.classList.remove('active');
        }
    }
    
    // Afficher le menu principal
    function showMainMenu() {
        currentContext = 'main';
        
        const menuHTML = `
            <div class="menu-options">
                ${menuOptions.map(option => `
                    <button class="option-btn" data-action="${option.action}">
                        <i class="fas ${option.icon}"></i> ${option.text}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Ajouter le menu uniquement s'il n'existe pas déjà
        if (!document.querySelector('.menu-options')) {
            addHTML(menuHTML);
        }
        
        // Activer les écouteurs d'événements pour les boutons du menu
        document.querySelectorAll('.option-btn').forEach(button => {
            button.addEventListener('click', handleMenuAction);
        });
    }
    
    // Gérer les actions du menu
    function handleMenuAction(e) {
        const action = e.currentTarget.getAttribute('data-action');
        const optionText = e.currentTarget.textContent.trim();
        
        // Ajouter le message de l'utilisateur
        addUserMessage(optionText);
        
        // Effacer le menu actuel
        const menu = document.querySelector('.menu-options');
        if (menu) menu.remove();
        
        // Afficher l'indicateur de frappe
        showTypingIndicator();
        
        // Répondre après un court délai
        setTimeout(() => {
            hideTypingIndicator();
            
            switch(action) {
                case 'orderStatus':
                    addBotMessage(responses.orderStatus);
                    showMainMenu();
                    break;
                    
                case 'sizeGuide':
                    addBotMessage(responses.sizeGuide);
                    showMainMenu();
                    break;
                    
                case 'paymentDelivery':
                    addBotMessage(responses.paymentDelivery);
                    showMainMenu();
                    break;
                    
                case 'adminContact':
                    currentContext = 'adminContact';
                    if (userName) {
                        showContactOptions();
                    } else {
                        addBotMessage(responses.adminContact);
                        showNameInput();
                    }
                    break;
            }
        }, 1000);
    }
    
    // Afficher le champ de saisie du nom
    function showNameInput() {
        const nameFormHTML = `
            <div class="name-form-container">
                <div class="name-form">
                    <input type="text" class="name-input" id="userNameInput" placeholder="Votre nom">
                    <button class="submit-btn" id="submitName">Envoyer</button>
                </div>
                <div class="error-message" id="nameError">Veuillez entrer un nom valide</div>
            </div>
        `;
        
        addHTML(nameFormHTML);
        
        // Activer le bouton d'envoi
        document.getElementById('submitName').addEventListener('click', saveUserName);
        document.getElementById('userNameInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveUserName();
        });
    }
    
    // Enregistrer le nom de l'utilisateur
    function saveUserName() {
        const nameInput = document.getElementById('userNameInput');
        const nameError = document.getElementById('nameError');
        const name = nameInput.value.trim();
        
        if (name.length < 2) {
            nameError.style.display = 'block';
            return;
        }
        
        // Sauvegarder le nom
        userName = name;
        localStorage.setItem('pinkaUserName', name);
        
        // Cacher le formulaire et afficher les options de contact
        document.querySelector('.name-form-container').remove();
        
        // Mettre à jour le message de bienvenue avec le nom
        responses.welcome = `Bonjour ${name} ! Comment puis-je vous aider aujourd'hui ?`;
        
        // Afficher les options de contact
        addBotMessage(responses.nameSaved(name));
        showContactOptions();
    }
    
    // Afficher les options de contact
    function showContactOptions() {
        const contactHTML = `
            <div class="contact-links">
                ${contactLinks.map(link => `
                    <a href="${link.url}" target="_blank" class="contact-link ${link.class}">
                        <i class="${link.icon}"></i> ${link.text}
                    </a>
                `).join('')}
                <button class="option-btn" id="backToMenu">
                    <i class="fas fa-arrow-left"></i> Retour au menu
                </button>
            </div>
        `;
        
        addHTML(contactHTML);
        
        // Activer le bouton de retour
        document.getElementById('backToMenu').addEventListener('click', () => {
            document.querySelector('.contact-links').remove();
            showMainMenu();
        });
    }
    
    // Envoyer un message
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Ajouter le message de l'utilisateur
        addUserMessage(message);
        userInput.value = '';
        
        // Réponse automatique
        setTimeout(() => {
            showTypingIndicator();
            
            setTimeout(() => {
                hideTypingIndicator();
                
                // Réponse par défaut si le contexte n'est pas géré
                let response = responses.defaultResponse;
                
                // Ajouter la réponse du bot
                addBotMessage(response);
                
                // Revenir au menu principal
                setTimeout(showMainMenu, 500);
            }, 1500);
        }, 500);
    }
    
    // Afficher l'indicateur de frappe
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Cacher l'indicateur de frappe
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Ajouter un message de l'utilisateur
    function addUserMessage(text) {
        addMessage(text, true);
    }
    
    // Ajouter un message du bot
    function addBotMessage(text) {
        addMessage(text, false);
    }
    
    // Ajouter un message au chat
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} slide-in-up`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatBody.appendChild(messageDiv);
        
        // Faire défiler vers le bas
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Sauvegarder le message dans l'historique
        saveMessageToHistory(text, isUser);
    }
    
    // Ajouter du HTML au chat
    function addHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.className = 'slide-in-up';
        tempDiv.innerHTML = html;
        chatBody.appendChild(tempDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Afficher la notification
    function showNotification() {
        notificationBadge.style.display = 'flex';
    }
    
    // Cacher la notification
    function hideNotification() {
        notificationBadge.style.display = 'none';
    }
    
    // Sauvegarder un message dans l'historique
    function saveMessageToHistory(message, isUser) {
        let history = JSON.parse(localStorage.getItem('pinkaChatHistory') || '[]');
        history.push({
            message,
            isUser,
            timestamp: new Date().toISOString()
        });
        
        // Conserver uniquement les 50 derniers messages
        if (history.length > 50) {
            history = history.slice(-50);
        }
        
        localStorage.setItem('pinkaChatHistory', JSON.stringify(history));
    }
    
    // Charger l'historique des messages
    function loadChatHistory() {
        const history = JSON.parse(localStorage.getItem('pinkaChatHistory') || '[]');
        if (history.length > 0) {
            history.forEach(item => {
                if (item.isUser) {
                    addUserMessage(item.message);
                } else {
                    addBotMessage(item.message);
                }
            });
        }
    }
    
    // Démarrer le chatbot
    init();
});

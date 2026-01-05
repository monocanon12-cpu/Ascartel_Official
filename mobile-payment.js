/**
 * 💳 Système de Paiement Mobile Madagascar
 * Intégration: MVola, Orange Money, Airtel Money
 */

class MobilePaymentMadagascar {
    constructor() {
        this.providers = {
            mvola: {
                name: 'MVola',
                logo: '🟢',
                prefix: ['032', '033', '034', '038'],
                apiUrl: 'https://api.mvola.mg/v1',
                enabled: true
            },
            orange: {
                name: 'Orange Money',
                logo: '🟠',
                prefix: ['032', '037'],
                apiUrl: 'https://api.orange.mg/omcoreapis/1.0.2',
                enabled: true
            },
            airtel: {
                name: 'Airtel Money',
                logo: '🔴',
                prefix: ['033'],
                apiUrl: 'https://openapiuat.airtel.africa/merchant/v1',
                enabled: true
            }
        };
        
        this.currentTransaction = null;
    }

    // Détecter opérateur depuis numéro
    detectProvider(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const prefix = cleaned.substring(0, 3);
        
        for (const [key, provider] of Object.entries(this.providers)) {
            if (provider.prefix.includes(prefix) && provider.enabled) {
                return key;
            }
        }
        
        return null;
    }

    // Valider numéro malgache
    validatePhone(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Format: 03X XXX XXXX (10 chiffres)
        if (cleaned.length !== 10) {
            return { valid: false, error: 'Le numéro doit contenir 10 chiffres' };
        }
        
        if (!cleaned.startsWith('03')) {
            return { valid: false, error: 'Le numéro doit commencer par 03' };
        }
        
        const provider = this.detectProvider(cleaned);
        if (!provider) {
            return { valid: false, error: 'Opérateur non supporté' };
        }
        
        return { valid: true, provider, formatted: this.formatPhone(cleaned) };
    }

    // Formater numéro
    formatPhone(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return `+261 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }

    // Initier paiement
    async initiatePayment(phoneNumber, amount, orderId, customerName) {
        const validation = this.validatePhone(phoneNumber);
        
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        const provider = this.providers[validation.provider];
        
        this.currentTransaction = {
            id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            orderId,
            provider: validation.provider,
            providerName: provider.name,
            phoneNumber: validation.formatted,
            amount,
            customerName,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min
        };
        
        // Simuler appel API (en production, appeler vraie API)
        console.log(`📱 Initiation paiement ${provider.name}:`, this.currentTransaction);
        
        // En production, faire:
        // const response = await this.callProviderAPI(validation.provider, {
        //     phone: validation.formatted,
        //     amount,
        //     reference: this.currentTransaction.id
        // });
        
        return {
            success: true,
            transaction: this.currentTransaction,
            message: `Un code USSD a été envoyé au ${validation.formatted}. Composez *${this.getUSSDCode(validation.provider)}# pour confirmer.`
        };
    }

    // Code USSD par opérateur
    getUSSDCode(provider) {
        const codes = {
            mvola: '111',
            orange: '144',
            airtel: '123'
        };
        return codes[provider] || '000';
    }

    // Vérifier statut transaction
    async checkTransactionStatus(transactionId) {
        if (!this.currentTransaction || this.currentTransaction.id !== transactionId) {
            return { success: false, error: 'Transaction introuvable' };
        }
        
        // Simuler vérification (en production, appeler API)
        const isExpired = new Date() > new Date(this.currentTransaction.expiresAt);
        
        if (isExpired) {
            this.currentTransaction.status = 'expired';
            return {
                success: false,
                status: 'expired',
                message: 'Transaction expirée. Veuillez réessayer.'
            };
        }
        
        // Simuler confirmation aléatoire (en production, vraie vérification)
        const isConfirmed = Math.random() > 0.3; // 70% succès
        
        if (isConfirmed) {
            this.currentTransaction.status = 'completed';
            this.currentTransaction.completedAt = new Date().toISOString();
            
            return {
                success: true,
                status: 'completed',
                transaction: this.currentTransaction,
                message: 'Paiement confirmé avec succès !'
            };
        }
        
        return {
            success: false,
            status: 'pending',
            message: 'En attente de confirmation...'
        };
    }

    // Annuler transaction
    async cancelTransaction(transactionId) {
        if (this.currentTransaction && this.currentTransaction.id === transactionId) {
            this.currentTransaction.status = 'cancelled';
            this.currentTransaction.cancelledAt = new Date().toISOString();
            
            return {
                success: true,
                message: 'Transaction annulée'
            };
        }
        
        return { success: false, error: 'Transaction introuvable' };
    }

    // Obtenir frais transaction
    getTransactionFees(amount, provider) {
        const fees = {
            mvola: { fixed: 0, percent: 0.01 }, // 1%
            orange: { fixed: 100, percent: 0.015 }, // 100 Ar + 1.5%
            airtel: { fixed: 50, percent: 0.012 } // 50 Ar + 1.2%
        };
        
        const fee = fees[provider] || { fixed: 0, percent: 0.02 };
        const total = fee.fixed + (amount * fee.percent);
        
        return {
            amount,
            fees: Math.round(total),
            total: amount + Math.round(total)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePaymentMadagascar;
}

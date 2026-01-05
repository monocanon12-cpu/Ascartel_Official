/**
 * 💳 Routes Paiement Mobile Madagascar
 */

const express = require('express');
const router = express.Router();

// Simuler base de données transactions
const transactions = new Map();

// Initier paiement
router.post('/initiate', async (req, res) => {
    try {
        const { phoneNumber, amount, orderId, customerName, provider } = req.body;

        if (!phoneNumber || !amount || !orderId || !customerName || !provider) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes'
            });
        }

        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const transaction = {
            id: transactionId,
            orderId,
            provider,
            phoneNumber,
            amount,
            customerName,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };

        transactions.set(transactionId, transaction);

        res.json({
            success: true,
            transaction,
            message: `Paiement initié. Composez le code USSD pour confirmer.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Vérifier statut
router.get('/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = transactions.get(transactionId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction introuvable'
            });
        }

        const isExpired = new Date() > new Date(transaction.expiresAt);
        
        if (isExpired && transaction.status === 'pending') {
            transaction.status = 'expired';
            transactions.set(transactionId, transaction);
        }

        // Simuler confirmation (70% succès)
        if (transaction.status === 'pending' && Math.random() > 0.3) {
            transaction.status = 'completed';
            transaction.completedAt = new Date().toISOString();
            transactions.set(transactionId, transaction);
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Annuler transaction
router.post('/cancel/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = transactions.get(transactionId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction introuvable'
            });
        }

        transaction.status = 'cancelled';
        transaction.cancelledAt = new Date().toISOString();
        transactions.set(transactionId, transaction);

        res.json({
            success: true,
            message: 'Transaction annulée'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Webhook callback (pour vraies APIs)
router.post('/callback', async (req, res) => {
    try {
        const { transactionId, status, providerReference } = req.body;
        
        const transaction = transactions.get(transactionId);
        if (transaction) {
            transaction.status = status;
            transaction.providerReference = providerReference;
            transaction.updatedAt = new Date().toISOString();
            transactions.set(transactionId, transaction);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

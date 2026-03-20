const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// POST /api/payment/simulate
router.post('/simulate', async (req, res) => {
    try {
        const { userId, policyId, amount } = req.body;

        if (!userId || !policyId || !amount) {
            return res.status(400).json({ success: false, message: "userId, policyId, and amount are required" });
        }

        // 1. Generate transaction ID
        const transactionId = 'TXN_' + Date.now();

        // 2. Save transaction in MongoDB
        const transaction = new Transaction({
            transactionId,
            userId,
            policyId,
            amount,
            status: 'success',
            type: 'simulate_payment',
            transactionReference: 'SIM_' + transactionId
        });

        await transaction.save();

        // 3. Return response
        res.status(200).json({
            success: true,
            transactionId
        });
    } catch (error) {
        console.error("Payment Simulation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

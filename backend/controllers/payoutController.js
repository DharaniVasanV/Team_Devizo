const Transaction = require('../models/Transaction');
const Claim = require('../models/Claim');

const processPayout = async (req, res) => {
    try {
        const { claimId, amount } = req.body;
        const userId = req.user.id;

        const claim = await Claim.findById(claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        if (claim.status === 'paid') {
            return res.status(400).json({ message: 'Claim already paid' });
        }

        // Simulating payout through Stripe/Razorpay
        const transactionReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const transaction = new Transaction({
            userId,
            claimId,
            amount,
            type: 'claim_payout',
            paymentStatus: 'completed',
            transactionReference
        });

        await transaction.save();

        // Update claim status
        claim.status = 'paid';
        await claim.save();

        res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing payout' });
    }
};

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

module.exports = { processPayout, getTransactions };

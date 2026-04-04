const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
    type: { type: String, enum: ['premium_payment', 'claim_payout', 'simulate_payment'] },
    amount: { type: Number, required: true },
    status: { type: String, default: 'success' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionReference: { type: String, sparse: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);

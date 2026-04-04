const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weeklyPremium: { type: Number, required: true },
    coverageHours: { type: Number, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    planType: { type: String, enum: ['Basic', 'Standard', 'Premium'], required: true }
});

module.exports = mongoose.model('Policy', PolicySchema);

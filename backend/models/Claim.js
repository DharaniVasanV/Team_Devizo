const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    triggerType: {
        type: String,
        enum: ['Heavy Rain', 'Extreme Heat', 'Severe Pollution', 'Flood', 'Area Restriction'],
        required: true,
    },
    claimAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'rejected', 'fraud suspected'],
        default: 'pending',
    },
    // disruptionDetails stores ground truth, GPS checks, and weather checks
    disruptionDetails: { type: Object },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claim', ClaimSchema);

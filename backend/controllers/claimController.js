const axios = require('axios');
const Claim = require('../models/Claim');

const getClaims = async (req, res) => {
    try {
        const userId = req.user.id;
        const claims = await Claim.find({ userId }).populate('policyId').sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching claims' });
    }
};

const triggerClaim = async (req, res) => {
    // Manually trigger a claim (for demonstration or manual override)
    try {
        const { policyId, triggerType, claimAmount, disruptionDetails } = req.body;
        const userId = req.user.id;

        let claimStatus = 'approved';

        try {
            const mlData = {
                rainfall: req.body.rainfall || 0,
                temperature: req.body.temperature || 0,
                aqi: req.body.aqi || 0,
                delivery_hours: req.body.delivery_hours || 0
            };

            const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, mlData);
            
            if (mlResponse.data && mlResponse.data.prediction === -1) {
                claimStatus = 'fraud suspected';
            } else if (mlResponse.data && mlResponse.data.prediction === 1) {
                claimStatus = 'approved';
            }
        } catch (mlError) {
            console.error('ML service error:', mlError.message);
            // Fallback status if ML service is down
            claimStatus = 'pending';
        }

        const claim = new Claim({
            policyId,
            userId,
            triggerType,
            claimAmount,
            disruptionDetails,
            status: claimStatus
        });

        await claim.save();
        res.status(201).json(claim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error triggering claim' });
    }
};

module.exports = { getClaims, triggerClaim };

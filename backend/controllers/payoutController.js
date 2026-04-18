const Transaction = require('../models/Transaction');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const axios = require('axios');

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

const simulateDisasterPayout = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await require('../models/User').findById(userId);
        
        // 1. Fetch active policy
        const activePolicy = await Policy.findOne({ userId, status: 'active' });
        if (!activePolicy) {
            return res.status(400).json({ message: 'No active policy found to process payout.' });
        }

        // Check for existing claim today to prevent abuse (Moved up as requested)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingClaim = await Claim.findOne({
            policyId: activePolicy._id,
            createdAt: { $gte: today }
        });
        if (existingClaim) {
            return res.status(400).json({ message: 'A payout has already been processed today.' });
        }

        // 2. Fetch live environmental data from OpenWeatherAPI
        const { getWeatherData } = require('../services/weatherService');
        let envData = await getWeatherData(user);
        
        if (!envData) {
            console.log('Using fallback default safe values due to Weather API failure.');
            envData = {
                rainfall: 0,
                temperature: 30,
                aqi: 50,
                delivery_hours: user?.avgDeliveryHours || 6,
                city: user?.city || 'Chennai'
            };
        }

        console.log(`Live weather fetched for ${envData.city}`);
        console.log(`Rainfall: ${envData.rainfall} mm, AQI: ${envData.aqi}`);

        // 3. Call ML API for Parametric Insurance logic
        let risk_level = "low";
        let recommended_payout = 0; 
        
        if (process.env.ML_API_URL) {
            try {
                const mlResponse = await axios.post(`${process.env.ML_API_URL}/payout-simulation`, envData);
                if (mlResponse.data && mlResponse.data.recommended_payout !== undefined) {
                    risk_level = mlResponse.data.risk_level;
                    recommended_payout = mlResponse.data.recommended_payout;
                    console.log(`ML predicted risk: ${risk_level.toUpperCase()}`);
                }
            } catch (mlErr) {
                console.error("ML service failed.", mlErr.message);
                // Fallback basic logic if ML service is down
                if (envData.rainfall > 50 || envData.temperature > 40 || envData.aqi > 200) {
                     risk_level = "high";
                     recommended_payout = 2500;
                }
            }
        } else {
             // Fallback basic logic if ML missing
             if (envData.rainfall > 50 || envData.temperature > 40 || envData.aqi > 200) {
                  risk_level = "high";
                  recommended_payout = 2500;
             }
        }
        
        console.log(`₹${recommended_payout} payout processed`);

        // Determine dynamic triggerType safely
        let triggerType = 'Heavy Rain'; // Safe Enum default
        if (envData.aqi > 150) triggerType = 'Severe Pollution';
        if (envData.temperature > 38) triggerType = 'Extreme Heat';
        if (envData.rainfall > 30) triggerType = 'Heavy Rain';

        let isNormal = recommended_payout === 0;

        // 4. Create Claim (Status: rejected if NO risk)
        const claim = new Claim({
            policyId: activePolicy._id,
            userId,
            triggerType,
            claimAmount: recommended_payout,
            status: isNormal ? 'rejected' : 'paid',
            disruptionDetails: { risk_level, envData }
        });
        await claim.save();

        // 5. Create Transaction (Status: failed if NO risk)
        const transaction = new Transaction({
            userId,
            claimId: claim._id,
            policyId: activePolicy._id,
            type: 'claim_payout',
            amount: recommended_payout,
            status: isNormal ? 'failed' : 'success',
            paymentStatus: isNormal ? 'failed' : 'completed'
        });
        await transaction.save();

        return res.status(200).json({
            message: isNormal ? "No risk detected in current live weather condition. Rupee 0 will be paid." : "Risk detected. Dynamic calculated payout processed successfully.",
            payoutAmount: recommended_payout,
            claimId: claim._id,
            risk_level
        });

    } catch (error) {
        console.error("Payout processing error:", error);
        return res.status(500).json({ message: 'Error processing automated payout flow', error: error.message });
    }
};

module.exports = { processPayout, getTransactions, simulateDisasterPayout };

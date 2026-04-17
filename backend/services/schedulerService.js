const cron = require('node-cron');
const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const { getWeatherData } = require('./weatherService');

const disruptionThresholds = {
    rain: 50, // mm
    heat: 40, // celsius
    pollution: 200 // AQI
};

const checkDisruptions = async () => {
    console.log('Running disruption check scheduler...');
    try {
        const activePolicies = await Policy.find({ status: 'active' });
        console.log(`Found ${activePolicies.length} active policies in DB.`);
        
        for (const policy of activePolicies) {
            const user = await User.findById(policy.userId);
            if (!user) continue;

            const city = user.city || 'Chennai';
            console.log(`Checking city: ${city}`);
            
            let envData = await getWeatherData(user);
            if (!envData) {
                console.log('Using fallback default safe values due to Weather API failure.');
                envData = {
                    rainfall: 0,
                    temperature: 30,
                    aqi: 50,
                    delivery_hours: user?.avgDeliveryHours || 6,
                    city: city
                };
            }
            
            console.log(`Rainfall: ${envData.rainfall}, AQI: ${envData.aqi}`);

            let risk_level = "low";
            let recommended_payout = 0;

            if (process.env.ML_API_URL) {
                try {
                    const mlResponse = await axios.post(`${process.env.ML_API_URL}/payout-simulation`, envData);
                    if (mlResponse.data && mlResponse.data.recommended_payout !== undefined) {
                        risk_level = mlResponse.data.risk_level;
                        recommended_payout = mlResponse.data.recommended_payout;
                    }
                } catch (mlErr) {
                    console.error("ML Error:", mlErr.message);
                }
            }
            
            console.log(`Risk predicted: ${risk_level.toUpperCase()}`);

            if (risk_level === 'high') {
                let triggerType = 'Normal';
                if (envData.rainfall > disruptionThresholds.rain) triggerType = 'Heavy Rain';
                else if (envData.temperature > disruptionThresholds.heat) triggerType = 'Extreme Heat';
                else if (envData.aqi > disruptionThresholds.pollution) triggerType = 'Severe Pollution';
                
                if (triggerType === 'Normal') triggerType = 'High Risk Event';

                // Check if a claim already exists for this policy and today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const existingClaim = await Claim.findOne({
                    policyId: policy._id,
                    createdAt: { $gte: today }
                });

                if (!existingClaim) {
                    console.log(`Payout triggered: ₹${recommended_payout}`);
                    
                    // 1. Create claim as approved
                    const claim = new Claim({
                        policyId: policy._id,
                        userId: policy.userId,
                        triggerType,
                        claimAmount: recommended_payout,
                        disruptionDetails: { risk_level, envData },
                        status: 'approved'
                    });
                    await claim.save();
                    console.log(`Automatic claim created and approved for user ${policy.userId} due to ${triggerType}.`);

                    // 2. Add Automatic Payout Logic
                    const transaction = new Transaction({
                        userId: policy.userId,
                        claimId: claim._id,
                        policyId: policy._id,
                        type: 'claim_payout', 
                        amount: recommended_payout,
                        status: 'success',
                        paymentStatus: 'completed'
                    });
                    await transaction.save();
                    console.log(`Payout transaction processed for claim ${claim._id}. Amount distributed: ₹${recommended_payout}`);

                    // 3. Update claim status to paid
                    claim.status = 'paid';
                    await claim.save();
                    console.log(`Claim lifecycle completed: Claim ${claim._id} marked as 'paid' instantly.`);
                } else {
                    console.log(`Skipping payout for ${policy.userId}: A claim has already been filed today.`);
                }
            } else {
                console.log(`No disruptions detected currently for user ${policy.userId}. Risk level is ${risk_level}.`);
            }
        }
    } catch (error) {
        console.error('Error in scheduler:', error);
    }
};

const start = () => {
    // Run every hour
    cron.schedule('0 * * * *', checkDisruptions);
    
    // Also run once on startup for demo
    setTimeout(checkDisruptions, 5000);
};

module.exports = { start };

const cron = require('node-cron');
const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');

const disruptionThresholds = {
    rain: 50, // mm
    heat: 40, // celsius
    pollution: 300 // AQI
};

const checkDisruptions = async () => {
    console.log('Running disruption check scheduler...');
    try {
        const activePolicies = await Policy.find({ status: 'active' });
        
        for (const policy of activePolicies) {
            // In a real app, you would call a Weather API using policy user's city
            // For this demo, we simulate a disruption check
            const simulatedRain = Math.random() * 100;
            const simulatedHeat = Math.random() * 50;
            
            let disruptionDetected = false;
            let triggerType = '';
            let disruptionValue = 0;

            if (simulatedRain > disruptionThresholds.rain) {
                disruptionDetected = true;
                triggerType = 'Heavy Rain';
                disruptionValue = simulatedRain.toFixed(1) + 'mm';
            } else if (simulatedHeat > disruptionThresholds.heat) {
                disruptionDetected = true;
                triggerType = 'Extreme Heat';
                disruptionValue = simulatedHeat.toFixed(1) + '°C';
            }

            if (disruptionDetected) {
                // Check if a claim already exists for this policy and today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const existingClaim = await Claim.findOne({
                    policyId: policy._id,
                    createdAt: { $gte: today }
                });

                if (!existingClaim) {
                    
                    let claimStatus = 'approved';
                    const simulatedAqi = Math.random() * 500;
                    const simulatedDeliveryHours = Math.random() * 24;

                    try {
                        const mlResponse = await axios.post('http://localhost:8000/predict', {
                            rainfall: simulatedRain,
                            temperature: simulatedHeat,
                            aqi: simulatedAqi,
                            delivery_hours: simulatedDeliveryHours
                        });

                        if (mlResponse.data && mlResponse.data.prediction === -1) {
                            claimStatus = 'fraud suspected';
                        } else if (mlResponse.data && mlResponse.data.prediction === 1) {
                            claimStatus = 'approved';
                        }
                    } catch (mlError) {
                        console.error('ML service error in scheduler:', mlError.message);
                        claimStatus = 'pending'; // fallback
                    }

                    const claim = new Claim({
                        policyId: policy._id,
                        userId: policy.userId,
                        triggerType,
                        claimAmount: 500, // Fixed payout for disruption for demo
                        disruptionDetails: { value: disruptionValue, threshold: disruptionThresholds },
                        status: claimStatus
                    });
                    await claim.save();
                    console.log(`Automatic claim triggered for user ${policy.userId} due to ${triggerType}. Status: ${claimStatus}`);
                }
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

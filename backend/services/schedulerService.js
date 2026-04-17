const cron = require('node-cron');
const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

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
                    // 1. Create claim as approved
                    const claimAmount = 500; // Fixed payout for disruption for demo
                    const claim = new Claim({
                        policyId: policy._id,
                        userId: policy.userId,
                        triggerType,
                        claimAmount,
                        disruptionDetails: { value: disruptionValue, threshold: disruptionThresholds },
                        status: 'approved'
                    });
                    await claim.save();
                    console.log(`Automatic claim created and approved for user ${policy.userId} due to ${triggerType}.`);

                    // 2. Add Automatic Payout Logic
                    const transaction = new Transaction({
                        userId: policy.userId,
                        claimId: claim._id,
                        policyId: policy._id,
                        type: 'claim_payout', // Using 'claim_payout' as per Transaction schema enum
                        amount: claimAmount,
                        status: 'success',
                        paymentStatus: 'completed'
                    });
                    await transaction.save();
                    console.log(`Payout transaction processed for claim ${claim._id}. Amount distributed: ₹${claimAmount}`);

                    // 3. Update claim status to paid
                    claim.status = 'paid';
                    await claim.save();
                    console.log(`Claim lifecycle completed: Claim ${claim._id} marked as 'paid' instantly.`);
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

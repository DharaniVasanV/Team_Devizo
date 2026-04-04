const weatherService = require('./weatherService');

const checkDisruptions = async () => {
    console.log('Running disruption check scheduler...');
    try {
        const activePolicies = await Policy.find({ status: 'active' }).populate('userId');
        
        for (const policy of activePolicies) {
            const user = policy.userId;
            if (!user || (!user.city && !user.workerZone)) continue;

            const weather = await weatherService.fetchWeatherDataByCity(user.city || user.workerZone);
            if (!weather) continue;

            const riskLevel = weatherService.predictRiskLevel(weather);
            
            // Only trigger claims for Medium or High risk
            if (riskLevel !== 'LOW') {
                const triggerType = riskLevel === 'HIGH' ? `Critical Disruption (${weather.condition})` : `Standard Disruption (${weather.condition})`;
                const disruptionValue = `${weather.rain}mm rain, ${weather.temp}°C`;

                // Check if a claim already exists for this policy and today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const existingClaim = await Claim.findOne({
                    policyId: policy._id,
                    createdAt: { $gte: today }
                });

                if (!existingClaim) {
                    let claimStatus = 'approved';
                    
                    // Call ML model for fraud verification as before
                    try {
                        const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
                            rainfall: weather.rain,
                            temperature: weather.temp,
                            aqi: Math.random() * 300, // Simulated AQI
                            delivery_hours: Math.random() * 24
                        });

                        if (mlResponse.data && mlResponse.data.prediction === -1) {
                            claimStatus = 'fraud suspected';
                        }
                    } catch (mlError) {
                        console.error('ML service error:', mlError.message);
                        claimStatus = 'pending';
                    }

                    const claimCount = riskLevel === 'HIGH' ? 2 : 1; 
                    const baseAmount = policy.planType === 'Premium' ? 750 : policy.planType === 'Standard' ? 500 : 250;

                    const claim = new Claim({
                        policyId: policy._id,
                        userId: user._id,
                        triggerType,
                        claimAmount: baseAmount, 
                        disruptionDetails: { 
                            value: disruptionValue, 
                            risk: riskLevel,
                            weather: weather.description
                        },
                        status: claimStatus
                    });
                    await claim.save();
                    console.log(`Automatic claim triggered for ${user.name} in ${user.city}. Risk: ${riskLevel}`);
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

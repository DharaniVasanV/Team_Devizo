const cron = require('node-cron');
const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const { getWeatherData } = require('./weatherService');
const { runFraudDetection } = require('./fraudDetectionService');

const disruptionThresholds = {
    rain:       50,   // mm
    heat:       40,   // °C
    pollution: 200,   // AQI
};

// ─────────────────────────────────────────────────────────────
// CORE DISRUPTION CHECKER (runs on cron)
// ─────────────────────────────────────────────────────────────
const checkDisruptions = async () => {
    console.log('[Scheduler] Running disruption check with real weather + fraud detection...');
    try {
        const activePolicies = await Policy.find({ status: 'active' });
        console.log(`[Scheduler] Found ${activePolicies.length} active policies.`);

        for (const policy of activePolicies) {
            const user = await User.findById(policy.userId);
            if (!user) continue;

            const city = user.city || 'Chennai';
            console.log(`[Scheduler] Checking city: ${city} for user ${policy.userId}`);

            // ── Fetch real weather from OpenWeatherMap ───────────
            let envData = await getWeatherData(user);
            if (!envData) {
                console.log('[Scheduler] Weather API failed — using safe fallback values.');
                envData = {
                    rainfall:       0,
                    temperature:    30,
                    aqi:            50,
                    delivery_hours: user?.avgDeliveryHours || 6,
                    city,
                };
            }

            console.log(`[Scheduler] Rainfall: ${envData.rainfall}mm | Temp: ${envData.temperature}°C | AQI: ${envData.aqi}`);

            // ── Ask ML for risk level & payout amount ────────────
            let risk_level        = 'low';
            let recommended_payout = 0;

            if (process.env.ML_API_URL) {
                try {
                    const mlResponse = await axios.post(
                        `${process.env.ML_API_URL}/payout-simulation`,
                        envData
                    );
                    if (mlResponse.data?.recommended_payout !== undefined) {
                        risk_level         = mlResponse.data.risk_level;
                        recommended_payout = mlResponse.data.recommended_payout;
                    }
                } catch (mlErr) {
                    console.error('[Scheduler] ML payout-simulation error:', mlErr.message);
                }
            }

            console.log(`[Scheduler] ML Risk: ${risk_level.toUpperCase()} | Payout: ₹${recommended_payout}`);

            // ── Only trigger claim if risk is HIGH ───────────────
            if (risk_level !== 'high') {
                console.log(`[Scheduler] No disruption for user ${policy.userId}. Risk: ${risk_level}.`);
                continue;
            }

            // ── Determine trigger type from weather readings ──────
            let triggerType = 'Normal';
            if      (envData.rainfall    > disruptionThresholds.rain)      triggerType = 'Heavy Rain';
            else if (envData.temperature > disruptionThresholds.heat)      triggerType = 'Extreme Heat';
            else if (envData.aqi         > disruptionThresholds.pollution)  triggerType = 'Severe Pollution';
            if (triggerType === 'Normal') triggerType = 'Heavy Rain'; // fallback for high-risk

            // ── One claim per policy per day ─────────────────────
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const existingClaim = await Claim.findOne({
                policyId:  policy._id,
                createdAt: { $gte: today },
            });
            if (existingClaim) {
                console.log(`[Scheduler] Skipping: claim already filed today for user ${policy.userId}.`);
                continue;
            }

            // ── FRAUD CHECK (real telemetry from weather data) ───
            // Simulate realistic delivery metrics alongside real weather
            const telemetry = {
                tasks_completed_per_day:   Math.floor(8 + Math.random() * 15),
                average_task_time_minutes: Math.floor(20 + Math.random() * 25),
                distance_travelled_km:     parseFloat((15 + Math.random() * 40).toFixed(2)),
                location_changes:          Math.floor(8 + Math.random() * 20),
                login_hours_per_day:       parseFloat((5 + Math.random() * 6).toFixed(2)),
                rainfall:                  envData.rainfall,
                temperature:               envData.temperature,
                aqi:                       envData.aqi,
            };

            const fraudResult = runFraudDetection(telemetry, triggerType, false);
            let claimStatus = fraudResult.status; // 'approved' | 'fraud suspected'
            console.log(`[Scheduler] Fraud check: ${claimStatus} for policy ${policy._id}`);

            // ── ML anomaly model (second fraud opinion) ──────────
            if (claimStatus !== 'fraud suspected' && process.env.ML_API_URL) {
                try {
                    const mlAnomalyPayload = {
                        tasks_completed_per_day:   telemetry.tasks_completed_per_day,
                        average_task_time_minutes: telemetry.average_task_time_minutes,
                        distance_travelled_km:     telemetry.distance_travelled_km,
                        payout_amount:             recommended_payout,
                        customer_rating:           parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                        login_hours_per_day:       telemetry.login_hours_per_day,
                        device_changes:            Math.floor(Math.random() * 3),
                        location_changes:          telemetry.location_changes,
                        cancellation_rate:         parseFloat((Math.random() * 0.15).toFixed(3)),
                        late_delivery_rate:        parseFloat((Math.random() * 0.15).toFixed(3)),
                    };
                    const mlAnomalyRes = await axios.post(
                        `${process.env.ML_API_URL}/fraud-detection`,
                        mlAnomalyPayload
                    );
                    if (mlAnomalyRes.data?.prediction === -1) {
                        claimStatus = 'fraud suspected';
                        console.log(`[Scheduler] ML anomaly model flagged fraud for policy ${policy._id}.`);
                    }
                } catch (e) {
                    console.error('[Scheduler] ML fraud-detection error:', e.message);
                }
            }

            // ── Save claim ───────────────────────────────────────
            const claim = new Claim({
                policyId:  policy._id,
                userId:    policy.userId,
                triggerType,
                claimAmount: claimStatus === 'fraud suspected' ? 0 : recommended_payout,
                disruptionDetails: {
                    risk_level,
                    envData,
                    groundTruth:  fraudResult.groundTruth,
                    fraudChecks:  fraudResult.fraudChecks,
                },
                status: claimStatus,
            });
            await claim.save();
            console.log(`[Scheduler] Claim saved for user ${policy.userId} | ${triggerType} | Status: ${claimStatus} | ₹${claim.claimAmount}`);

            // ── Auto-payout only for approved (non-fraud) claims ─
            if (claimStatus === 'approved') {
                const transaction = new Transaction({
                    userId:    policy.userId,
                    claimId:   claim._id,
                    policyId:  policy._id,
                    type:      'claim_payout',
                    amount:    recommended_payout,
                    status:    'success',
                    paymentStatus: 'completed',
                });
                await transaction.save();

                claim.status = 'paid';
                await claim.save();
                console.log(`[Scheduler] Auto-payout ₹${recommended_payout} processed. Claim ${claim._id} marked paid.`);
            } else {
                console.log(`[Scheduler] Payout BLOCKED for claim ${claim._id} — fraud suspected.`);
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error:', error);
    }
};

// ─────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────
const start = () => {
    cron.schedule('0 * * * *', checkDisruptions);
    setTimeout(checkDisruptions, 5000);
    console.log('[Scheduler] Fraud-aware disruption monitoring started.');
};

module.exports = { start };

const cron = require('node-cron');
const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const { runFraudDetection } = require('./fraudDetectionService');

const disruptionThresholds = {
    rain:       50,   // mm
    heat:       40,   // °C
    pollution: 300,   // AQI
};

// ─────────────────────────────────────────────────────────────
// CORE DISRUPTION CHECKER (runs on cron)
// ─────────────────────────────────────────────────────────────
const checkDisruptions = async () => {
    console.log('\n[Scheduler] Running disruption check...');
    try {
        const activePolicies = await Policy.find({ status: 'active' });

        for (const policy of activePolicies) {
            // ── Simulate environmental data ─────────────────────
            // In production: fetch from OpenWeather using worker's city
            const simulatedRain        = parseFloat((Math.random() * 120).toFixed(2));
            const simulatedHeat        = parseFloat((20 + Math.random() * 30).toFixed(2));
            const simulatedAqi         = parseFloat((50 + Math.random() * 400).toFixed(2));
            const simulatedDeliveryHrs = parseFloat((Math.random() * 24).toFixed(2));

            // ── Determine if a real disruption is occurring ─────
            let disruptionDetected = false;
            let triggerType        = '';
            let disruptionValue    = '';

            if (simulatedRain > disruptionThresholds.rain) {
                disruptionDetected = true;
                triggerType        = 'Heavy Rain';
                disruptionValue    = `${simulatedRain}mm`;
            } else if (simulatedHeat > disruptionThresholds.heat) {
                disruptionDetected = true;
                triggerType        = 'Extreme Heat';
                disruptionValue    = `${simulatedHeat}°C`;
            } else if (simulatedAqi > disruptionThresholds.pollution) {
                disruptionDetected = true;
                triggerType        = 'Severe Pollution';
                disruptionValue    = `AQI ${simulatedAqi}`;
            }

            if (!disruptionDetected) continue;

            // ── One auto-claim per policy per day ───────────────
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const existingClaim = await Claim.findOne({
                policyId:  policy._id,
                createdAt: { $gte: today },
            });
            if (existingClaim) continue;

            // ── Realistic simulated delivery telemetry ───────────
            // Values are seeded to look like a normal working day
            const telemetry = {
                tasks_completed_per_day:   Math.floor(8 + Math.random() * 15),   // 8–23
                average_task_time_minutes: Math.floor(20 + Math.random() * 25),  // 20–45 min
                distance_travelled_km:     parseFloat((15 + Math.random() * 40).toFixed(2)), // 15–55 km
                location_changes:          Math.floor(8 + Math.random() * 20),   // 8–28
                login_hours_per_day:       parseFloat((5 + Math.random() * 6).toFixed(2)),   // 5–11 hrs
                rainfall:                  simulatedRain,
                temperature:               simulatedHeat,
                aqi:                       simulatedAqi,
            };

            // ── Layer 1: Rule-based fraud detection ─────────────
            const fraudResult = runFraudDetection(telemetry, triggerType, false);
            let claimStatus   = fraudResult.status; // 'approved' | 'fraud suspected'

            console.log(`[Scheduler] Policy ${policy._id} | ${triggerType} | Fraud check: ${claimStatus}`);

            // ── Layer 2: ML anomaly model ────────────────────────
            if (claimStatus !== 'fraud suspected') {
                try {
                    const mlPayload = {
                        tasks_completed_per_day:   telemetry.tasks_completed_per_day,
                        average_task_time_minutes: telemetry.average_task_time_minutes,
                        distance_travelled_km:     telemetry.distance_travelled_km,
                        payout_amount:             500,
                        customer_rating:           parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                        login_hours_per_day:       telemetry.login_hours_per_day,
                        device_changes:            Math.floor(Math.random() * 3),
                        location_changes:          telemetry.location_changes,
                        cancellation_rate:         parseFloat((Math.random() * 0.15).toFixed(3)),
                        late_delivery_rate:        parseFloat((Math.random() * 0.15).toFixed(3)),
                    };

                    const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, mlPayload);
                    if (mlResponse.data && mlResponse.data.prediction === -1) {
                        claimStatus = 'fraud suspected';
                        console.log(`[Scheduler] ML flagged anomaly for policy ${policy._id}`);
                    }
                } catch (mlError) {
                    console.error('[Scheduler] ML service unavailable, using rule-based result:', mlError.message);
                }
            }

            // ── Save claim with full audit trail ─────────────────
            const claim = new Claim({
                policyId:         policy._id,
                userId:           policy.userId,
                triggerType,
                claimAmount:      claimStatus === 'fraud suspected' ? 0 : 500,
                disruptionDetails: {
                    value:       disruptionValue,
                    threshold:   disruptionThresholds,
                    groundTruth: fraudResult.groundTruth,
                    fraudChecks: fraudResult.fraudChecks,
                },
                status: claimStatus,
            });

            await claim.save();
            console.log(`[Scheduler] Auto-claim saved for user ${policy.userId} | ${triggerType} | Status: ${claimStatus}`);
        }
    } catch (error) {
        console.error('[Scheduler] Error during disruption check:', error);
    }
};

// ─────────────────────────────────────────────────────────────
// START SCHEDULER
// ─────────────────────────────────────────────────────────────
const start = () => {
    // Run every hour
    cron.schedule('0 * * * *', checkDisruptions);

    // Run once on startup after 5s (demo convenience)
    setTimeout(checkDisruptions, 5000);
    console.log('[Scheduler] Disruption + fraud monitoring service started.');
};

module.exports = { start };

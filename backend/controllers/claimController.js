const axios = require('axios');
const Claim = require('../models/Claim');
const { runFraudDetection } = require('../services/fraudDetectionService');

// ─────────────────────────────────────────────────────────────
// GET CLAIMS
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// TRIGGER CLAIM (manual / user-submitted)
// ─────────────────────────────────────────────────────────────
const triggerClaim = async (req, res) => {
    try {
        const {
            policyId,
            triggerType,
            claimAmount,
            disruptionDetails,
            // GPS metrics (from app telemetry)
            tasks_completed_per_day,
            average_task_time_minutes,
            distance_travelled_km,
            location_changes,
            login_hours_per_day,
            cancellation_rate,
            late_delivery_rate,
            customer_rating,
            payout_amount,
            // Weather reported by user
            rainfall,
            temperature,
            aqi,
            delivery_hours,
            // Demo flag — triggers fraud simulation
            simulateFraud,
        } = req.body;

        const userId = req.user.id;

        // ── Step 1: Rule-based + heuristic fraud detection ──────
        const fraudResult = runFraudDetection(
            {
                tasks_completed_per_day,
                average_task_time_minutes,
                distance_travelled_km,
                location_changes,
                login_hours_per_day,
                rainfall,
                temperature,
                aqi,
            },
            triggerType,
            simulateFraud === true
        );

        console.log(`\n[FRAUD CHECK] triggerType="${triggerType}" | Result: ${fraudResult.status}`);
        fraudResult.fraudChecks.forEach(check => {
            console.log(`  [${check.type}] ${check.verdict}`);
            if (check.reasons.length > 0) {
                check.reasons.forEach(r => console.log(`    • ${r}`));
            }
        });

        let claimStatus = fraudResult.status; // 'approved' | 'fraud suspected'

        // ── Step 2: ML anomaly model (second layer of validation) ─
        // Only consult ML if rule-based layer didn't already flag fraud.
        if (claimStatus !== 'fraud suspected') {
            try {
                const mlPayload = {
                    tasks_completed_per_day:   tasks_completed_per_day   || 10,
                    average_task_time_minutes: average_task_time_minutes || 30,
                    distance_travelled_km:     distance_travelled_km     || 20,
                    payout_amount:             payout_amount             || claimAmount || 500,
                    customer_rating:           customer_rating           || 4.0,
                    login_hours_per_day:       login_hours_per_day       || 8,
                    device_changes:            req.body.device_changes   || 1,
                    location_changes:          location_changes          || 10,
                    cancellation_rate:         cancellation_rate         || 0.05,
                    late_delivery_rate:        late_delivery_rate        || 0.05,
                };

                const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, mlPayload);

                if (mlResponse.data && mlResponse.data.prediction === -1) {
                    claimStatus = 'fraud suspected';
                    console.log('  [ML MODEL] Anomaly detected — overriding status to "fraud suspected"');
                } else {
                    console.log(`  [ML MODEL] Prediction: ${mlResponse.data?.status || 'normal'}`);
                }
            } catch (mlError) {
                console.error('  [ML MODEL] Service unavailable — continuing without ML check:', mlError.message);
                // Fallback: keep rule-based result; don't override to pending
            }
        }

        // ── Step 3: Save claim with full fraud audit trail ───────
        const claim = new Claim({
            policyId,
            userId,
            triggerType,
            claimAmount: claimStatus === 'fraud suspected' ? 0 : (claimAmount || 500),
            disruptionDetails: {
                ...disruptionDetails,
                groundTruth:       fraudResult.groundTruth,
                fraudChecks:       fraudResult.fraudChecks,
                simulateFraud:     !!simulateFraud,
            },
            status: claimStatus,
        });

        await claim.save();
        return res.status(201).json({
            ...claim.toObject(),
            fraudSummary: {
                status:     fraudResult.status,
                isFraud:    fraudResult.isFraud,
                groundTruth: fraudResult.groundTruth,
                checks:     fraudResult.fraudChecks,
            },
        });
    } catch (error) {
        console.error('Error triggering claim:', error);
        res.status(500).json({ message: 'Error triggering claim' });
    }
};

// ─────────────────────────────────────────────────────────────
// SIMULATE FRAUD (Demo endpoint — for the 5-min presentation)
// ─────────────────────────────────────────────────────────────
const simulateFraudClaim = async (req, res) => {
    try {
        const userId = req.user.id;
        const { policyId, fraudType } = req.body;

        let payload;
        let triggerType;

        if (fraudType === 'GPS_SPOOFING') {
            // Impossible delivery metrics — will trigger GPS fraud flags
            triggerType = 'Heavy Rain';
            payload = {
                tasks_completed_per_day:   55,     // > 40 limit → fraud
                average_task_time_minutes:  2,     // < 5 min limit → fraud
                distance_travelled_km:    400,     // 400km but only 4h login → 100 km/h → fraud
                location_changes:         120,     // > 50 limit → fraud
                login_hours_per_day:        4,
                rainfall:                  70,
                temperature:               30,
                aqi:                      100,
            };
        } else {
            // FAKE_WEATHER — claiming rain on a clear sunny day
            triggerType = 'Heavy Rain';
            payload = {
                tasks_completed_per_day:   10,
                average_task_time_minutes: 35,
                distance_travelled_km:     22,
                location_changes:          12,
                login_hours_per_day:        8,
                rainfall:                  75,    // Claims 75mm rain …
                temperature:               28,
                aqi:                      100,
                // forceFraud=true → ground truth will be sunny (0–5mm)
            };
        }

        const fraudResult = runFraudDetection(payload, triggerType, true /* forceFraud */);

        console.log(`\n[DEMO FRAUD SIMULATION] Type: ${fraudType}`);
        fraudResult.fraudChecks.forEach(check => {
            console.log(`  [${check.type}] ${check.verdict}`);
            check.reasons.forEach(r => console.log(`    • ${r}`));
        });

        // Also run ML model
        let mlStatus = 'approved';
        try {
            const mlPayload = {
                tasks_completed_per_day:   payload.tasks_completed_per_day,
                average_task_time_minutes: payload.average_task_time_minutes,
                distance_travelled_km:     payload.distance_travelled_km,
                payout_amount:             500,
                customer_rating:           4.0,
                login_hours_per_day:       payload.login_hours_per_day,
                device_changes:            1,
                location_changes:          payload.location_changes,
                cancellation_rate:         0.05,
                late_delivery_rate:        0.05,
            };
            const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, mlPayload);
            if (mlResponse.data && mlResponse.data.prediction === -1) {
                mlStatus = 'fraud suspected';
            }
        } catch (e) { /* ignore ML unavailability in demo */ }

        const finalStatus = fraudResult.isFraud ? 'fraud suspected' : mlStatus;

        const claim = new Claim({
            policyId: policyId || '000000000000000000000001',
            userId,
            triggerType,
            claimAmount: 0, // No payout for fraudulent claims
            disruptionDetails: {
                value: fraudType === 'GPS_SPOOFING' ? 'Impossible GPS Pattern' : 'Clear Sky (reported as rain)',
                groundTruth: fraudResult.groundTruth,
                fraudChecks: fraudResult.fraudChecks,
                simulateFraud: true,
                demoFraudType: fraudType,
            },
            status: finalStatus,
        });

        await claim.save();

        return res.status(201).json({
            message: `Demo fraud simulation complete: ${fraudType}`,
            claim: claim.toObject(),
            fraudSummary: {
                status: finalStatus,
                isFraud: fraudResult.isFraud,
                groundTruth: fraudResult.groundTruth,
                checks: fraudResult.fraudChecks,
            },
        });
    } catch (error) {
        console.error('Error in fraud simulation:', error);
        return res.status(500).json({ message: 'Error running fraud simulation' });
    }
};

module.exports = { getClaims, triggerClaim, simulateFraudClaim };

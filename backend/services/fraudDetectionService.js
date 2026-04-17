/**
 * fraudDetectionService.js
 * Advanced AI-based fraud detection for GigGuard.
 * Covers two major fraud vectors:
 *   1. GPS Spoofing — detecting impossible movement patterns
 *   2. Fake Weather Claims — cross-checking reported weather vs ground truth
 */

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const MAX_SPEED_KMPH = 80;          // Max realistic delivery speed (bike ~80 km/h)
const MIN_TASK_TIME_MIN = 5;        // A task cannot complete in < 5 minutes legitimately
const MAX_TASKS_PER_DAY = 40;       // Physically impossible to do > 40 deliveries/day
const MAX_LOCATION_CHANGES = 50;    // > 50 GPS pings/day is suspicious (app abuse)
const MIN_KM_PER_TASK = 0.5;        // Each task should involve at least 0.5 km travel

// Thresholds for what counts as a "real" weather disruption
const WEATHER_THRESHOLDS = {
    rainfall_mm: 50,        // Must be > 50mm to qualify for rain claim
    temperature_c: 40,      // Must be > 40°C to qualify for heat claim
    aqi: 300,               // Must be > 300 AQI to qualify for pollution claim
};

// Acceptable deviation between reported and "ground truth" simulated weather
// (In a real system, ground truth comes from a trusted Weather API)
const WEATHER_TOLERANCE = {
    rainfall:    0.40,  // 40% — reported value must be within 40% of actual
    temperature: 0.25,  // 25% — temperature is harder to fake, stricter tolerance
    aqi:         0.35,  // 35%
};

// ─────────────────────────────────────────────────────────────
// GPS SPOOFING DETECTION
// ─────────────────────────────────────────────────────────────
/**
 * Analyzes delivery metrics for GPS spoofing patterns.
 * @param {Object} data
 * @param {number} data.tasks_completed_per_day  - Number of tasks claimed per day
 * @param {number} data.average_task_time_minutes - Average minutes per task
 * @param {number} data.distance_travelled_km     - Total km travelled
 * @param {number} data.location_changes          - Number of GPS location change events
 * @param {number} data.login_hours_per_day       - Hours the app was active
 *
 * @returns {{ isFraud: boolean, confidence: number, reasons: string[] }}
 */
const checkGPSSpoofing = (data) => {
    const reasons = [];
    let fraudScore = 0; // 0–100; ≥ 60 = fraud

    const {
        tasks_completed_per_day = 0,
        average_task_time_minutes = 0,
        distance_travelled_km = 0,
        location_changes = 0,
        login_hours_per_day = 0,
    } = data;

    // ── Rule 1: Impossible task count ──────────────────────────
    if (tasks_completed_per_day > MAX_TASKS_PER_DAY) {
        fraudScore += 35;
        reasons.push(`Unrealistic task count: ${tasks_completed_per_day} tasks/day exceeds the physical limit of ${MAX_TASKS_PER_DAY}.`);
    }

    // ── Rule 2: Task completed too fast ────────────────────────
    if (average_task_time_minutes > 0 && average_task_time_minutes < MIN_TASK_TIME_MIN) {
        fraudScore += 30;
        reasons.push(`Suspiciously fast task completion: ${average_task_time_minutes} min/task (min allowed: ${MIN_TASK_TIME_MIN} min).`);
    }

    // ── Rule 3: Speed check — distance vs login hours ──────────
    if (login_hours_per_day > 0 && distance_travelled_km > 0) {
        const impliedSpeedKmph = distance_travelled_km / login_hours_per_day;
        if (impliedSpeedKmph > MAX_SPEED_KMPH) {
            fraudScore += 40;
            reasons.push(`Impossible GPS speed: implied ${impliedSpeedKmph.toFixed(1)} km/h (max allowed: ${MAX_SPEED_KMPH} km/h).`);
        }
    }

    // ── Rule 4: Too many location changes relative to distance ─
    if (distance_travelled_km > 0 && location_changes > 0) {
        const distancePerPing = distance_travelled_km / location_changes;
        if (distancePerPing < MIN_KM_PER_TASK) {
            fraudScore += 20;
            reasons.push(`GPS ping farming: Location changed ${location_changes} times for only ${distance_travelled_km.toFixed(1)} km (${distancePerPing.toFixed(2)} km/ping). Possible app-based spoofing.`);
        }
    }

    // ── Rule 5: Excessive location fishing with no travel ──────
    if (location_changes > MAX_LOCATION_CHANGES && distance_travelled_km < 5) {
        fraudScore += 25;
        reasons.push(`Location spoofing pattern: ${location_changes} GPS pings with only ${distance_travelled_km.toFixed(1)} km travel. Possible virtual GPS app usage.`);
    }

    const confidence = Math.min(fraudScore, 100);
    const isFraud = confidence >= 60;

    return {
        type: 'GPS_SPOOFING',
        isFraud,
        confidence,
        reasons,
        verdict: isFraud
            ? `🚨 GPS SPOOFING DETECTED (Score: ${confidence}/100)`
            : `✅ GPS patterns look legitimate (Score: ${confidence}/100)`,
    };
};

// ─────────────────────────────────────────────────────────────
// FAKE WEATHER CLAIM DETECTION
// ─────────────────────────────────────────────────────────────
/**
 * Verifies a user-reported weather disruption against ground truth.
 * In this simulation, ground truth is generated by the schedulerService.
 * In production, this would call a real Weather API (e.g., OpenWeather).
 *
 * @param {Object} reported   - What the user claims triggered the event
 * @param {Object} actual     - Ground truth weather data at time of claim
 * @param {string} claimType  - 'Heavy Rain' | 'Extreme Heat' | 'Severe Pollution'
 *
 * @returns {{ isFraud: boolean, confidence: number, reasons: string[] }}
 */
const verifyWeatherClaim = (reported, actual, claimType) => {
    const reasons = [];
    let fraudScore = 0;

    // ── 1. Does the threshold actually qualify? ────────────────
    const meetsThreshold = checkWeatherThreshold(actual, claimType);
    if (!meetsThreshold.qualifies) {
        fraudScore += 50;
        reasons.push(`Environmental conditions do NOT meet claim threshold. ${meetsThreshold.detail}`);
    }

    // ── 2. Is reported data wildly different from actual? ──────
    if (reported.rainfall !== undefined && actual.rainfall !== undefined) {
        const deviation = Math.abs(reported.rainfall - actual.rainfall) / (actual.rainfall + 0.001);
        if (deviation > WEATHER_TOLERANCE.rainfall) {
            fraudScore += 25;
            reasons.push(`Rainfall mismatch: Reported ${reported.rainfall.toFixed(1)}mm vs actual ${actual.rainfall.toFixed(1)}mm (${(deviation * 100).toFixed(0)}% deviation, limit: ${WEATHER_TOLERANCE.rainfall * 100}%).`);
        }
    }

    if (reported.temperature !== undefined && actual.temperature !== undefined) {
        const deviation = Math.abs(reported.temperature - actual.temperature) / (actual.temperature + 0.001);
        if (deviation > WEATHER_TOLERANCE.temperature) {
            fraudScore += 25;
            reasons.push(`Temperature mismatch: Reported ${reported.temperature.toFixed(1)}°C vs actual ${actual.temperature.toFixed(1)}°C (${(deviation * 100).toFixed(0)}% deviation, limit: ${WEATHER_TOLERANCE.temperature * 100}%).`);
        }
    }

    // ── 3. Claiming rain but it's a sunny day? ─────────────────
    if (claimType === 'Heavy Rain' && actual.rainfall < 10) {
        fraudScore += 40;
        reasons.push(`Clear weather fraud: Claiming Heavy Rain but actual rainfall is only ${actual.rainfall.toFixed(1)}mm – well below the 10mm minimum for "rain" conditions.`);
    }

    // ── 4. Claiming heat but temperature is normal? ────────────
    if (claimType === 'Extreme Heat' && actual.temperature < 35) {
        fraudScore += 40;
        reasons.push(`Temperature fraud: Claiming Extreme Heat but actual temperature is only ${actual.temperature.toFixed(1)}°C – well below the 35°C minimum for extreme conditions.`);
    }

    const confidence = Math.min(fraudScore, 100);
    const isFraud = confidence >= 50;

    return {
        type: 'FAKE_WEATHER_CLAIM',
        isFraud,
        confidence,
        reasons,
        verdict: isFraud
            ? `🚨 FAKE WEATHER CLAIM DETECTED (Score: ${confidence}/100)`
            : `✅ Weather claim appears legitimate (Score: ${confidence}/100)`,
    };
};

/**
 * Helper: Does an actual weather reading meet the threshold to justify a claim?
 */
const checkWeatherThreshold = (actual, claimType) => {
    switch (claimType) {
        case 'Heavy Rain':
            return actual.rainfall >= WEATHER_THRESHOLDS.rainfall_mm
                ? { qualifies: true, detail: '' }
                : { qualifies: false, detail: `Rainfall ${actual.rainfall?.toFixed(1)}mm < threshold ${WEATHER_THRESHOLDS.rainfall_mm}mm.` };
        case 'Extreme Heat':
            return actual.temperature >= WEATHER_THRESHOLDS.temperature_c
                ? { qualifies: true, detail: '' }
                : { qualifies: false, detail: `Temperature ${actual.temperature?.toFixed(1)}°C < threshold ${WEATHER_THRESHOLDS.temperature_c}°C.` };
        case 'Severe Pollution':
            return actual.aqi >= WEATHER_THRESHOLDS.aqi
                ? { qualifies: true, detail: '' }
                : { qualifies: false, detail: `AQI ${actual.aqi?.toFixed(0)} < threshold ${WEATHER_THRESHOLDS.aqi}.` };
        default:
            return { qualifies: true, detail: '' }; // Unknown type — pass through
    }
};

// ─────────────────────────────────────────────────────────────
// GENERATE GROUND TRUTH WEATHER (Simulation)
// In production: replace this with a real OpenWeather API call.
// ─────────────────────────────────────────────────────────────
/**
 * Generates a "ground truth" weather snapshot.
 * When FORCE_FRAUD is true we intentionally make conditions non-threatening
 * so that any claim submitted during this window gets flagged.
 */
const generateGroundTruthWeather = (forceFraud = false) => {
    if (forceFraud) {
        // Sunny, normal day — any disruption claim will be fraud
        return {
            rainfall: parseFloat((Math.random() * 5).toFixed(2)),        // 0–5mm (clear)
            temperature: parseFloat((25 + Math.random() * 8).toFixed(2)),// 25–33°C (comfortable)
            aqi: parseFloat((50 + Math.random() * 80).toFixed(2)),       // 50–130 (good)
        };
    }
    // Normal randomised weather
    return {
        rainfall: parseFloat((Math.random() * 120).toFixed(2)),
        temperature: parseFloat((20 + Math.random() * 30).toFixed(2)),
        aqi: parseFloat((50 + Math.random() * 350).toFixed(2)),
    };
};

// ─────────────────────────────────────────────────────────────
// AGGREGATE FRAUD CHECK (combines GPS + Weather)
// ─────────────────────────────────────────────────────────────
/**
 * Run all fraud checks and return a combined verdict.
 *
 * @param {Object} claimPayload - Full claim submission
 * @param {string} claimType    - Type of weather disruption claimed
 * @param {boolean} forceFraud  - Demo mode: simulate fraudulent conditions
 *
 * @returns {{
 *   isFraud: boolean,
 *   status: 'approved' | 'fraud suspected',
 *   fraudChecks: Object[],
 *   groundTruth: Object
 * }}
 */
const runFraudDetection = (claimPayload, claimType, forceFraud = false) => {
    const groundTruth = generateGroundTruthWeather(forceFraud);

    const gpsCheck = checkGPSSpoofing({
        tasks_completed_per_day:    claimPayload.tasks_completed_per_day    || 0,
        average_task_time_minutes:  claimPayload.average_task_time_minutes  || 0,
        distance_travelled_km:      claimPayload.distance_travelled_km      || 0,
        location_changes:           claimPayload.location_changes           || 0,
        login_hours_per_day:        claimPayload.login_hours_per_day        || 0,
    });

    const weatherCheck = verifyWeatherClaim(
        {
            rainfall:    claimPayload.rainfall,
            temperature: claimPayload.temperature,
            aqi:         claimPayload.aqi,
        },
        groundTruth,
        claimType
    );

    const isFraud = gpsCheck.isFraud || weatherCheck.isFraud;

    return {
        isFraud,
        status: isFraud ? 'fraud suspected' : 'approved',
        fraudChecks: [gpsCheck, weatherCheck],
        groundTruth,
    };
};

module.exports = {
    checkGPSSpoofing,
    verifyWeatherClaim,
    generateGroundTruthWeather,
    runFraudDetection,
    WEATHER_THRESHOLDS,
};

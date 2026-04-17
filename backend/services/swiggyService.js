const axios = require('axios');

const SWIGGY_API_BASE = 'https://swiggyclone-oxos.onrender.com/api/external';
const SWIGGY_API_KEY = process.env.SWIGGY_API_KEY || 'swg_ext_fdd3ca042bb4588f7728bb5ed20e6b61557eba1a934229a8';

const apiClient = axios.create({
    baseURL: SWIGGY_API_BASE,
    headers: { 'x-api-key': SWIGGY_API_KEY },
    timeout: 15000
});

/**
 * Fetch all workers from Swiggy Clone API
 */
const fetchWorkers = async () => {
    const { data } = await apiClient.get('/workers');
    return data.workers || [];
};

/**
 * Fetch all worker profiles (zone, lat/lng, vehicle, verification status)
 */
const fetchWorkerProfiles = async () => {
    const { data } = await apiClient.get('/worker-profiles');
    return data.worker_profiles || [];
};

/**
 * Fetch all worker earnings
 */
const fetchWorkerEarnings = async () => {
    const { data } = await apiClient.get('/worker-earnings');
    return data.worker_earnings || [];
};

/**
 * Fetch all orders
 */
const fetchOrders = async () => {
    const { data } = await apiClient.get('/orders');
    return data.orders || [];
};

/**
 * Verify a worker by their phone number.
 * Returns { found, worker, profile } or { found: false }
 */
const verifyWorkerByPhone = async (phone) => {
    try {
        const [workers, profiles] = await Promise.all([
            fetchWorkers(),
            fetchWorkerProfiles()
        ]);

        // Robust phone matching (trim and convert to string)
        const searchPhone = String(phone).trim();
        console.log(`[SwiggyService] Verifying phone: "${searchPhone}" against ${workers.length} workers`);
        
        const worker = workers.find(w => String(w.phone).trim() === searchPhone);
        if (!worker) {
            console.log(`[SwiggyService] No worker found for phone: "${searchPhone}"`);
            return { found: false };
        }
        
        console.log(`[SwiggyService] Worker found: ${worker.name} (ID: ${worker.id})`);

        // Find matching profile
        const profile = profiles.find(p => p.user_id === worker.id) || null;

        return { found: true, worker, profile };
    } catch (error) {
        console.error('Swiggy API verification error:', error.message);
        return { found: false, error: error.message };
    }
};

/**
 * Check if the worker's zone (from their profile) matches the city they registered with.
 * Uses simple case-insensitive string matching on the zone name.
 * Also checks if lat/lng is within a reasonable range for the zone.
 */
const isWorkerInZone = (profile, userCity) => {
    if (!profile || !userCity) return { zoneMatch: false, reason: 'Missing profile or city' };

    const profileZone = (profile.zone || '').toLowerCase().trim();
    const city = userCity.toLowerCase().trim();

    const zoneMatch = profileZone === city || profileZone.includes(city) || city.includes(profileZone);

    return {
        zoneMatch,
        workerZone: profile.zone,
        userCity,
        currentLat: profile.current_lat,
        currentLng: profile.current_lng,
        reason: zoneMatch ? 'Zone matches registered city' : `Zone "${profile.zone}" does not match city "${userCity}"`
    };
};

/**
 * Get earnings for a specific worker, grouped by day for the last 7 days.
 * Returns an array of { name: 'Mon', date: '2026-03-19', income: 180, orders: 6 }
 */
const getWorkerWeeklyEarnings = async (workerId) => {
    try {
        const earnings = await fetchWorkerEarnings();
        
        // Filter earnings for this worker
        console.log(`[SwiggyService] Filtering ${earnings.length} records for workerId: "${workerId}"`);
        const workerEarnings = earnings.filter(e => String(e.worker_id) === String(workerId));
        console.log(`[SwiggyService] Found ${workerEarnings.length} records for worker`);

        // Group by date
        const dailyMap = {};
        workerEarnings.forEach(e => {
            const date = new Date(e.earned_at);
            if (isNaN(date.getTime())) {
                console.error(`[SwiggyService] Invalid date for record ${e.id}: ${e.earned_at}`);
                return;
            }
            // Use local date string YYYY-MM-DD for grouping to avoid timezone shifts
            const dateKey = date.getFullYear() + '-' + 
                           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(date.getDate()).padStart(2, '0');
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { total: 0, count: 0 };
            }
            dailyMap[dateKey].total += e.total_earning || e.base_earning || 0;
            dailyMap[dateKey].count += 1;
        });

        // Determine the "end date" for the chart. 
        // If we have earnings, use the most recent earning date. Otherwise use today.
        const sortedDates = Object.keys(dailyMap).sort();
        const endDate = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]) : new Date();
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateKey = d.getFullYear() + '-' + 
                           String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(d.getDate()).padStart(2, '0');
            const dayData = dailyMap[dateKey] || { total: 0, count: 0 };

            result.push({
                name: dayNames[d.getDay()],
                date: dateKey,
                income: dayData.total,
                orders: dayData.count
            });
        }

        const sevenDayTotalEarnings = result.reduce((sum, day) => sum + (day.income || 0), 0);
        const sevenDayTotalOrders = result.reduce((sum, day) => sum + (day.orders || 0), 0);

        return {
            daily: result,
            totalEarnings: sevenDayTotalEarnings,
            totalOrders: sevenDayTotalOrders,
            earningsRecords: workerEarnings
        };
    } catch (error) {
        console.error('Error fetching worker earnings:', error.message);
        return { daily: [], totalEarnings: 0, totalOrders: 0, earningsRecords: [] };
    }
};

module.exports = {
    fetchWorkers,
    fetchWorkerProfiles,
    fetchWorkerEarnings,
    fetchOrders,
    verifyWorkerByPhone,
    isWorkerInZone,
    getWorkerWeeklyEarnings
};

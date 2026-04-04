const axios = require('axios');

const SWIGGY_BASE_URL = 'https://swiggyclone-oxos.onrender.com/api/external';

const swiggyApi = axios.create({
    baseURL: SWIGGY_BASE_URL,
    headers: {
        'x-api-key': process.env.SWIGGY_API_KEY || 'your_swiggy_clone_api_key'
    }
});

/**
 * Verify if a phone number belongs to a registered Swiggy worker.
 */
const verifyWorkerByPhone = async (phone) => {
    try {
        const response = await swiggyApi.get(`/workers?phone=${phone}`);
        const workers = response.data;
        
        if (workers && workers.length > 0) {
            const worker = workers[0];
            const profileRes = await swiggyApi.get(`/worker-profiles/${worker.id}`);
            return { found: true, worker, profile: profileRes.data };
        }
        return { found: false };
    } catch (error) {
        console.error(`[SwiggyService] Failed to verify phone ${phone}:`, error.message);
        return { found: false };
    }
};

/**
 * Check if the worker's current zone matches their registered city.
 */
const isWorkerInZone = (profile, city) => {
    if (!profile || !city) return { zoneMatch: false };
    const zoneMatch = profile.zone.toLowerCase().includes(city.toLowerCase());
    return {
        zoneMatch,
        workerZone: profile.zone,
        city
    };
};

const getWorkerProfile = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/worker-profiles/${cwid}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

const getRecentOrders = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/orders?workerId=${cwid}`);
        return response.data;
    } catch (error) {
        return [];
    }
};

/**
 * Fetch weekly earnings data for the worker.
 */
const getWorkerWeeklyEarnings = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/worker-earnings/${cwid}`);
        return response.data;
    } catch (error) {
        return { daily: [], totalEarnings: 0, totalOrders: 0 };
    }
};

module.exports = {
    verifyWorkerByPhone,
    isWorkerInZone,
    getWorkerProfile,
    getRecentOrders,
    getWorkerWeeklyEarnings
};

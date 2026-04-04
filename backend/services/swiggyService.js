const axios = require('axios');

const SWIGGY_BASE_URL = 'https://swiggyclone-oxos.onrender.com/api/external';
const SWIGGY_API_KEY = process.env.SWIGGY_API_KEY;

const swiggyApi = axios.create({
    baseURL: SWIGGY_BASE_URL,
    headers: {
        'x-api-key': SWIGGY_API_KEY
    }
});

const getWorkerProfile = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/worker-profiles/${cwid}`);
        return response.data;
    } catch (error) {
        console.error(`[SwiggyService] Failed to fetch profile for ${cwid}:`, error.message);
        return null;
    }
};

const getRecentOrders = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/orders?workerId=${cwid}`);
        return response.data;
    } catch (error) {
        console.error(`[SwiggyService] Failed to fetch orders for ${cwid}:`, error.message);
        return [];
    }
};

const getWorkerEarnings = async (cwid) => {
    try {
        const response = await swiggyApi.get(`/worker-earnings/${cwid}`);
        return response.data;
    } catch (error) {
        console.error(`[SwiggyService] Failed to fetch earnings for ${cwid}:`, error.message);
        return null;
    }
};

module.exports = {
    getWorkerProfile,
    getRecentOrders,
    getWorkerEarnings
};

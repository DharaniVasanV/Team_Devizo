const User = require('../models/User');
const swiggyService = require('../services/swiggyService');

/**
 * POST /api/worker/verify
 * Body: { phone }
 * Verifies if a phone number belongs to a registered Swiggy worker.
 */
const verifyWorker = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const result = await swiggyService.verifyWorkerByPhone(phone);

        if (!result.found) {
            return res.json({
                verified: false,
                message: 'No worker found with this phone number on the Swiggy platform'
            });
        }

        // Check zone if we have a profile
        let zoneInfo = null;
        if (result.profile) {
            // Try to get the user's city from DB if they're already registered
            const existingUser = await User.findOne({ phone });
            const userCity = existingUser?.city || '';
            zoneInfo = swiggyService.isWorkerInZone(result.profile, userCity);
        }

        return res.json({
            verified: true,
            worker: {
                id: result.worker.id,
                name: result.worker.name,
                phone: result.worker.phone,
                is_verified: result.worker.is_verified
            },
            profile: result.profile ? {
                zone: result.profile.zone,
                vehicle_type: result.profile.vehicle_type,
                current_lat: result.profile.current_lat,
                current_lng: result.profile.current_lng,
                verification_status: result.profile.verification_status,
                current_status: result.profile.current_status
            } : null,
            zoneCheck: zoneInfo
        });
    } catch (error) {
        console.error('Worker verification error:', error);
        res.status(500).json({ message: 'Error verifying worker' });
    }
};

/**
 * GET /api/worker/earnings
 * Auth-protected. Fetches earnings for the logged-in user from Swiggy API.
 */
const getEarnings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isSwiggyVerified || !user.swiggyCwid) {
            return res.json({
                verified: false,
                message: 'User is not verified on Swiggy platform',
                earnings: { daily: [], totalEarnings: 0, totalOrders: 0 }
            });
        }

        console.log(`[WorkerController] Fetching earnings for CWID: "${user.swiggyCwid}"`);
        const earnings = await swiggyService.getWorkerWeeklyEarnings(user.swiggyCwid);
        console.log(`[WorkerController] Earnings fetched: ${earnings.daily.length} days of data`);

        return res.json({
            verified: true,
            workerZone: user.workerZone,
            zoneVerified: user.zoneVerified,
            earnings
        });
    } catch (error) {
        console.error('Error fetching worker earnings:', error);
        res.status(500).json({ message: 'Error fetching earnings data' });
    }
};

module.exports = { verifyWorker, getEarnings };

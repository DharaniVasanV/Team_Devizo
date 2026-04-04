const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const swiggyService = require('../services/swiggyService');

const register = async (req, res) => {
    try {
        const { name, phone, password, platform, city } = req.body;
        
        // Find existing user
        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            phone,
            password: hashedPassword,
            platform,
            city
        });

        // Auto-verify against Swiggy if platform is Swiggy
        let swiggyVerification = null;
        if (platform === 'Swiggy') {
            console.log(`[AuthController] Starting Swiggy verification for phone: "${phone}"`);
            try {
                const result = await swiggyService.verifyWorkerByPhone(phone);
                console.log(`[AuthController] Swiggy verification result: ${JSON.stringify(result)}`);
                if (result.found) {
                    user.swiggyCwid = result.worker.id;
                    user.isSwiggyVerified = true;
                    user.workerZone = result.profile?.zone || null;

                    // Check zone match
                    if (result.profile) {
                        const zoneCheck = swiggyService.isWorkerInZone(result.profile, city);
                        user.zoneVerified = zoneCheck.zoneMatch;
                    }

                    swiggyVerification = {
                        isSwiggyVerified: true,
                        workerZone: user.workerZone,
                        zoneVerified: user.zoneVerified,
                        workerName: result.worker.name,
                        currentLat: result.profile?.current_lat,
                        currentLng: result.profile?.current_lng,
                        vehicleType: result.profile?.vehicle_type,
                        verificationStatus: result.profile?.verification_status
                    };
                } else {
                    swiggyVerification = {
                        isSwiggyVerified: false,
                        message: 'Phone number not found on Swiggy platform'
                    };
                }
            } catch (err) {
                console.error('Swiggy verification during registration failed:', err.message);
                swiggyVerification = { isSwiggyVerified: false, message: 'Verification service unavailable' };
            }
        }

        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                platform: user.platform,
                city: user.city,
                isSwiggyVerified: user.isSwiggyVerified,
                swiggyCwid: user.swiggyCwid,
                workerZone: user.workerZone,
                zoneVerified: user.zoneVerified
            },
            swiggyVerification
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // If Swiggy platform user hasn't been verified yet, try now
        let swiggyVerification = null;
        if (user.platform === 'Swiggy' && !user.isSwiggyVerified) {
            try {
                const result = await swiggyService.verifyWorkerByPhone(phone);
                if (result.found) {
                    user.swiggyCwid = result.worker.id;
                    user.isSwiggyVerified = true;
                    user.workerZone = result.profile?.zone || null;

                    if (result.profile) {
                        const zoneCheck = swiggyService.isWorkerInZone(result.profile, user.city);
                        user.zoneVerified = zoneCheck.zoneMatch;
                    }
                    await user.save();

                    swiggyVerification = {
                        isSwiggyVerified: true,
                        workerZone: user.workerZone,
                        zoneVerified: user.zoneVerified
                    };
                }
            } catch (err) {
                console.error('Swiggy verification during login failed:', err.message);
            }
        }

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                platform: user.platform,
                city: user.city,
                isSwiggyVerified: user.isSwiggyVerified,
                swiggyCwid: user.swiggyCwid,
                workerZone: user.workerZone,
                zoneVerified: user.zoneVerified
            },
            swiggyVerification
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { register, login };

const Policy = require('../models/Policy');
const axios = require('axios');

const createPolicy = async (req, res) => {
    try {
        const { planType, weeklyPremium, coverageHours } = req.body;
        const userId = req.user.id;

        // One active policy at a time
        const activePolicy = await Policy.findOne({ userId, status: 'active' });
        if (activePolicy) {
            return res.status(400).json({ message: 'You already have an active policy' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7); // Weekly plan

        const policy = new Policy({
            userId,
            weeklyPremium,
            coverageHours,
            planType,
            startDate,
            endDate,
            status: 'active'
        });

        await policy.save();

        res.status(201).json(policy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating policy' });
    }
};

const getUserPolicy = async (req, res) => {
    try {
        const userId = req.user.id;
        const policy = await Policy.findOne({ userId, status: 'active' });
        res.json(policy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching policy' });
    }
};

const calculateRisk = async (req, res) => {
    try {
        const envData = {
            rainfall: Math.random() * 100,
            temperature: Math.random() * 45,
            aqi: Math.random() * 300,
            delivery_hours: Math.random() * 24
        };

        if (!process.env.ML_API_URL) {
            // Fallback mock response so the frontend doesn't break when ML service is offline
            return res.json({
                risk_score: 72,
                risk_level: 'medium',
                recommended_premium: 199
            });
        }

        const { data } = await axios.post(`${process.env.ML_API_URL}/payout-simulation`, envData);
        
        res.json({
            risk_score: data.risk_score,
            risk_level: data.risk_level,
            recommended_premium: data.recommended_payout
        });
    } catch (error) {
        console.error('Error calculating risk:', error.message);
        res.status(500).json({ message: 'Error calculating risk' });
    }
};

module.exports = { createPolicy, getUserPolicy, calculateRisk };

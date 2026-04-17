const Policy = require('../models/Policy');
const User = require('../models/User');
const axios = require('axios');
const swiggyService = require('../services/swiggyService');

const roundToNearestTen = (value, minimum = 10) => Math.max(minimum, Math.round(value / 10) * 10);

const getRiskMultiplier = (riskLevel) => {
    if (riskLevel === 'high') return 1.2;
    if (riskLevel === 'low') return 0.9;
    return 1;
};

const buildPlansFromEarnings = ({ weeklyEarnings, affordableBudget, riskLevel, riskPremium }) => {
    const riskMultiplier = getRiskMultiplier(riskLevel);
    const adjustedBudget = affordableBudget * riskMultiplier;

    // Keep premiums anchored to the worker's affordable weekly spend.
    const basePremium = roundToNearestTen(adjustedBudget * 0.8, 20);
    const standardPremium = roundToNearestTen(adjustedBudget, 30);
    const premiumPremium = roundToNearestTen(adjustedBudget * 1.15, 40);

    // Payout caps should scale with actual weekly earnings, not fixed floors.
    const payoutBase = roundToNearestTen(Math.max(weeklyEarnings * 0.85, basePremium * 2.5), 50);
    const payoutStandard = roundToNearestTen(Math.max(weeklyEarnings, standardPremium * 3), 60);
    const payoutPremium = roundToNearestTen(Math.max(weeklyEarnings * 1.15, premiumPremium * 3.25), 80);

    return [
        {
            name: 'Basic',
            premium: basePremium,
            coverageHours: 36,
            payoutCap: roundToNearestTen(payoutBase),
            recommendedFor: 'Budget-friendly starter cover',
            features: [
                'Heavy Rain Protection',
                'Sudden Area Restrictions',
                `Payout up to Rs ${roundToNearestTen(payoutBase)}`,
                'Weekly Plan'
            ]
        },
        {
            name: 'Standard',
            premium: Math.max(standardPremium, basePremium + 10),
            coverageHours: 60,
            payoutCap: roundToNearestTen(payoutStandard),
            recommendedFor: 'Balanced coverage for regular workers',
            popular: true,
            features: [
                'Heavy Rain Protection',
                'Extreme Heat Protection',
                'Sudden Area Restrictions',
                `Payout up to Rs ${roundToNearestTen(payoutStandard)}`,
                'Priority Claim Processing'
            ]
        },
        {
            name: 'Premium',
            premium: Math.max(premiumPremium, standardPremium + 10),
            coverageHours: 84,
            payoutCap: roundToNearestTen(payoutPremium),
            recommendedFor: 'Maximum cover for high earners',
            features: [
                'All Weather Disruptions',
                'Severe Pollution Protection',
                'Sudden Area Restrictions',
                `Payout up to Rs ${roundToNearestTen(payoutPremium)}`,
                'Instant Payout Processing'
            ]
        }
    ];
};

const getUserWeeklyEarnings = async (user) => {
    if (user?.isSwiggyVerified && user?.swiggyCwid) {
        const earnings = await swiggyService.getWorkerWeeklyEarnings(user.swiggyCwid);
        return {
            weeklyEarnings: earnings.totalEarnings || 0,
            source: 'swiggy'
        };
    }

    return {
        weeklyEarnings: 4500,
        source: 'estimated'
    };
};

const calculatePricingForUser = async (user) => {
    const { weeklyEarnings, source } = await getUserWeeklyEarnings(user);

    const envData = {
        rainfall: Math.random() * 100,
        temperature: Math.random() * 45,
        aqi: Math.random() * 300,
        delivery_hours: Math.random() * 24
    };

    let riskData = {
        risk_score: 72,
        risk_level: 'medium',
        recommended_premium: 199
    };

    if (process.env.ML_API_URL) {
        try {
            const { data } = await axios.post(`${process.env.ML_API_URL}/payout-simulation`, envData);
            riskData = {
                risk_score: data.risk_score,
                risk_level: data.risk_level,
                recommended_premium: data.recommended_payout
            };
        } catch (error) {
            console.error('Error calculating ML risk, falling back to mock values:', error.message);
        }
    }

    const affordabilityRate = riskData.risk_level === 'high' ? 0.08 : riskData.risk_level === 'low' ? 0.05 : 0.065;
    const affordableBudget = roundToNearestTen(Math.max(120, weeklyEarnings * affordabilityRate), 120);
    const plans = buildPlansFromEarnings({
        weeklyEarnings,
        affordableBudget,
        riskLevel: riskData.risk_level,
        riskPremium: riskData.recommended_premium
    });

    return {
        ...riskData,
        weekly_earnings: weeklyEarnings,
        earnings_source: source,
        affordable_budget: affordableBudget,
        plans
    };
};

const createPolicy = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.user.id;

        // One active policy at a time
        const activePolicy = await Policy.findOne({ userId, status: 'active' });
        if (activePolicy) {
            return res.status(400).json({ message: 'You already have an active policy' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const pricing = await calculatePricingForUser(user);
        const selectedPlan = pricing.plans.find((plan) => plan.name === planType);

        if (!selectedPlan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7); // Weekly plan

        const policy = new Policy({
            userId,
            weeklyPremium: selectedPlan.premium,
            coverageHours: selectedPlan.coverageHours,
            planType: selectedPlan.name,
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
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const pricing = await calculatePricingForUser(user);
        res.json(pricing);
    } catch (error) {
        console.error('Error calculating risk:', error.message);
        res.status(500).json({ message: 'Error calculating risk' });
    }
};

module.exports = { createPolicy, getUserPolicy, calculateRisk };

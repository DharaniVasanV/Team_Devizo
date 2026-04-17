const axios = require('axios');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Transaction = require('../models/Transaction');

const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const buildTrend = (claims) => {
    const today = getStartOfDay(new Date());
    const dailyMap = {};

    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = { date: key, claims: 0, payout: 0 };
    }

    claims.forEach((claim) => {
        const key = getStartOfDay(claim.createdAt).toISOString().slice(0, 10);
        if (!dailyMap[key]) {
            return;
        }

        dailyMap[key].claims += 1;
        dailyMap[key].payout += claim.claimAmount || 0;
    });

    return Object.values(dailyMap);
};

const getDominantTrigger = (claims) => {
    const counts = claims.reduce((acc, claim) => {
        const key = claim.triggerType || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || 'Heavy Rain';
};

const getAdminDashboard = async (req, res) => {
    try {
        const [workers, activePolicies, allClaims, transactions] = await Promise.all([
            User.countDocuments({ role: 'worker' }),
            Policy.countDocuments({ status: 'active' }),
            Claim.find({})
                .populate('userId', 'name city platform')
                .sort({ createdAt: -1 }),
            Transaction.find({}).sort({ createdAt: -1 })
        ]);

        const totalClaims = allClaims.length;
        const paidClaims = allClaims.filter((claim) => claim.status === 'paid');
        const approvedClaims = allClaims.filter((claim) => claim.status === 'approved' || claim.status === 'paid');
        const suspiciousClaims = allClaims.filter((claim) => claim.status === 'fraud suspected');

        const totalPremiums = transactions
            .filter((txn) => txn.type === 'premium_payment' || txn.type === 'simulate_payment')
            .reduce((sum, txn) => sum + (txn.amount || 0), 0);

        const totalPayouts = transactions
            .filter((txn) => txn.type === 'claim_payout')
            .reduce((sum, txn) => sum + (txn.amount || 0), 0);

        const averageClaimAmount = totalClaims > 0
            ? allClaims.reduce((sum, claim) => sum + (claim.claimAmount || 0), 0) / totalClaims
            : 0;

        const claimsTrend = buildTrend(allClaims);
        const claimsByTriggerMap = allClaims.reduce((acc, claim) => {
            acc[claim.triggerType] = (acc[claim.triggerType] || 0) + 1;
            return acc;
        }, {});

        const claimsByTrigger = Object.entries(claimsByTriggerMap)
            .map(([trigger, count]) => ({ trigger, count }))
            .sort((a, b) => b.count - a.count);

        let riskScore = 0.42;
        let riskLevel = 'medium';
        let recommendedPremium = 200;

        try {
            const { data } = await axios.post(`${process.env.ML_API_URL}/predict-risk`, {
                rainfall: 62,
                temperature: 37,
                aqi: 210,
                delivery_hours: 10
            });

            if (typeof data.risk_score === 'number') {
                riskScore = data.risk_score;
            }
            if (data.risk_level) {
                riskLevel = data.risk_level;
            }
            if (data.recommended_premium) {
                recommendedPremium = data.recommended_premium;
            }
        } catch (error) {
            console.error('Admin dashboard ML risk fetch failed:', error.message);
        }

        const dominantTrigger = getDominantTrigger(allClaims);
        const expectedClaims = Math.max(
            1,
            Math.round((activePolicies || workers || 1) * (0.05 + (riskScore * 0.18)))
        );
        const expectedPayout = Math.round(expectedClaims * (averageClaimAmount || 650));

        res.json({
            overview: {
                totalWorkers: workers,
                activePolicies,
                totalClaims,
                approvedClaims: approvedClaims.length,
                suspiciousClaims: suspiciousClaims.length,
                totalPremiums,
                totalPayouts,
                averageClaimAmount: Math.round(averageClaimAmount),
                lossRatio: totalPremiums > 0 ? Number(((totalPayouts / totalPremiums) * 100).toFixed(1)) : 0
            },
            prediction: {
                riskScore,
                riskLevel,
                recommendedPremium,
                likelyTrigger: dominantTrigger,
                expectedClaims,
                expectedPayout
            },
            charts: {
                claimsTrend,
                claimsByTrigger
            },
            recentClaims: allClaims.slice(0, 5).map((claim) => ({
                id: claim._id,
                workerName: claim.userId?.name || 'Unknown Worker',
                city: claim.userId?.city || 'Unknown City',
                platform: claim.userId?.platform || 'Unknown Platform',
                triggerType: claim.triggerType,
                status: claim.status,
                claimAmount: claim.claimAmount,
                createdAt: claim.createdAt
            })),
            portfolioHealth: {
                paidClaims: paidClaims.length,
                claimApprovalRate: totalClaims > 0 ? Number(((approvedClaims.length / totalClaims) * 100).toFixed(1)) : 0,
                payoutCoverageRate: totalClaims > 0 ? Number(((paidClaims.length / totalClaims) * 100).toFixed(1)) : 0
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Error loading admin dashboard' });
    }
};

module.exports = { getAdminDashboard };

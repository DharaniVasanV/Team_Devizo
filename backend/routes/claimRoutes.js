const express = require('express');
const router = express.Router();
const { getClaims, triggerClaim, simulateFraudClaim } = require('../controllers/claimController');
const auth = require('../middlewares/auth');

router.get('/', auth, getClaims);
router.post('/trigger', auth, triggerClaim);

// ── Demo: simulate GPS spoofing or fake weather fraud ────────
// POST /api/claims/simulate-fraud  { fraudType: 'GPS_SPOOFING' | 'FAKE_WEATHER' }
router.post('/simulate-fraud', auth, simulateFraudClaim);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getClaims, triggerClaim } = require('../controllers/claimController');
const auth = require('../middlewares/auth');

router.get('/', auth, getClaims);
router.post('/trigger', auth, triggerClaim);

module.exports = router;

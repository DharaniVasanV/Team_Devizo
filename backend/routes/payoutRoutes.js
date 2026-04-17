const express = require('express');
const router = express.Router();
const { processPayout, getTransactions, simulateDisasterPayout } = require('../controllers/payoutController');
const auth = require('../middlewares/auth');

router.post('/', auth, processPayout);
router.get('/transactions', auth, getTransactions);
router.post('/process-payout', auth, simulateDisasterPayout);

module.exports = router;

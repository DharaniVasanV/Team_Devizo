const express = require('express');
const router = express.Router();
const { processPayout, getTransactions } = require('../controllers/payoutController');
const auth = require('../middlewares/auth');

router.post('/', auth, processPayout);
router.get('/transactions', auth, getTransactions);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createPolicy, getUserPolicy, calculateRisk } = require('../controllers/policyController');
const auth = require('../middlewares/auth');

router.post('/create', auth, createPolicy);
router.get('/user', auth, getUserPolicy);
router.get('/calculate-risk', auth, calculateRisk);

module.exports = router;

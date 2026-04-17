const express = require('express');
const router = express.Router();
const { verifyWorker, getEarnings } = require('../controllers/workerController');
const authMiddleware = require('../middlewares/auth');

// Public — verify worker by phone
router.post('/verify', verifyWorker);

// Protected — get earnings for logged-in user
router.get('/earnings', authMiddleware, getEarnings);

module.exports = router;

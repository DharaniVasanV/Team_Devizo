const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getCurrentWeather } = require('../controllers/weatherController');

// GET /api/weather/current
router.get('/current', authMiddleware, getCurrentWeather);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const { getAdminDashboard } = require('../controllers/adminController');

router.get('/dashboard', authMiddleware, adminMiddleware, getAdminDashboard);

module.exports = router;

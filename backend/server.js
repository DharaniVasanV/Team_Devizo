require('dotenv').config();

// Fix for MongoDB DNS Resolution on Windows (Local only)
if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch(e) { /* Ignore */ }
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const schedulerService = require('./services/schedulerService');

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes (defined before connectDB to avoid missing them)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/policy', require('./routes/policyRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/payout', require('./routes/payoutRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/worker', require('./routes/workerRoutes'));

// Database Connection
connectDB().then(() => {
    console.log('Database connected, starting services...');
    // Start Scheduler after DB connection
    schedulerService.start();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
});

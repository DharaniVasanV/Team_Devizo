// Fix for MongoDB DNS Resolution on Windows
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const schedulerService = require('./services/schedulerService');

dotenv.config();

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

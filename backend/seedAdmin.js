const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
    dns.setDefaultResultOrder('ipv4first');
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (error) {
        // Ignore DNS server override failures and continue with system defaults.
    }
}

const seedAdmin = async () => {
    const phone = (process.env.ADMIN_PHONE || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    const name = (process.env.ADMIN_NAME || 'Insurer Admin').trim();
    const city = (process.env.ADMIN_CITY || 'Bengaluru').trim();
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    try {
        if (!mongoUri) {
            throw new Error('MONGO_URI or MONGODB_URI is not configured');
        }

        if (!phone || !password) {
            throw new Error('ADMIN_PHONE and ADMIN_PASSWORD must be set in backend/.env');
        }

        await mongoose.connect(mongoUri, {
            family: 4
        });

        const existingAdmin = await User.findOne({ phone });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingAdmin) {
            existingAdmin.name = name;
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.platform = 'Other';
            existingAdmin.city = city;
            await existingAdmin.save();
            console.log(`Updated admin user from env: ${phone}`);
        } else {
            await User.create({
                name,
                phone,
                password: hashedPassword,
                role: 'admin',
                platform: 'Other',
                city
            });
            console.log(`Created admin user from env: ${phone}`);
        }
    } catch (error) {
        console.error('Admin seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

if (require.main === module) {
    seedAdmin();
}

module.exports = seedAdmin;

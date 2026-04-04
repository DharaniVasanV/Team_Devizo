const mongoose = require('mongoose');
const User = require('./models/User');

const cleanup = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/payprotect');
        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users. Database is now empty.`);
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

cleanup();

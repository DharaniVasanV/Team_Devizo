const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
    platform: { type: String, enum: ['Zomato', 'Swiggy', 'Amazon', 'Zepto', 'Other'], required: true },
    city: { type: String, required: true },
    // Swiggy verification fields
    swiggyCwid: { type: String, default: null },
    isSwiggyVerified: { type: Boolean, default: false },
    workerZone: { type: String, default: null },
    zoneVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

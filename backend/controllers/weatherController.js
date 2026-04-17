const User = require('../models/User');
const { getWeatherData } = require('../services/weatherService');

const getCurrentWeather = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const envData = await getWeatherData(user);
        
        if (!envData) {
            return res.status(500).json({ message: 'Weather API returning null' });
        }

        // Return expected schema
        return res.status(200).json({
            city: envData.city,
            rainfall: envData.rainfall,
            temperature: envData.temperature,
            aqi: envData.aqi
        });
    } catch (error) {
        console.error('Error fetching current weather:', error.message);
        return res.status(500).json({ message: 'Server error parsing weather data' });
    }
};

module.exports = { getCurrentWeather };

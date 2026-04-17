const axios = require('axios');

const getWeatherData = async (user) => {
    const city = user?.city || 'Chennai';
    const delivery_hours = user?.avgDeliveryHours || 6;

    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            console.log('Skipping real weather check: Missing WEATHER_API_KEY');
            return {
                rainfall: 0,
                temperature: 30,
                aqi: 50,
                delivery_hours,
                city
            };
        }

        // Fetch primary weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const weatherRes = await axios.get(weatherUrl);
        const { main, coord, rain } = weatherRes.data;

        const temperature = main?.temp || 30;
        const rainfall = (rain && (rain["1h"] || rain["3h"])) || 0;
        const { lat, lon } = coord;

        // Fetch AQI
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const aqiRes = await axios.get(aqiUrl);
        
        // Map AQI to scale suitable for ML
        const rawAqi = aqiRes.data?.list[0]?.main?.aqi || 1;
        const aqiMap = { 1: 30, 2: 70, 3: 120, 4: 180, 5: 250 };
        const aqi = aqiMap[rawAqi] || 50;

        return {
            rainfall,
            temperature,
            aqi,
            delivery_hours,
            city
        };
    } catch (error) {
        console.error('Weather API failed:', error.message);
        return {
            rainfall: 0,
            temperature: 30,
            aqi: 50,
            delivery_hours,
            city
        };
    }
};

module.exports = { getWeatherData };

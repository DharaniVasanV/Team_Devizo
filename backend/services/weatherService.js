const axios = require('axios');
const NodeCache = require('node-cache');

// Configure Cache - TTL is 10 minutes (600 seconds)
const weatherCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getRegionKey = (lat, lon) => {
    // Round to 1 decimal place (~11km precision) to group nearby users
    const roundedLat = Math.round(lat * 10) / 10;
    const roundedLon = Math.round(lon * 10) / 10;
    return `region_${roundedLat}_${roundedLon}`;
};

const fetchWeatherData = async (lat, lon) => {
    if (!lat || !lon) return null;
    const regionKey = getRegionKey(lat, lon);
    const cachedData = weatherCache.get(regionKey);

    if (cachedData) {
        console.log(`[WeatherService] Serving cached data for ${regionKey}`);
        return cachedData;
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        const weatherInfo = {
            temp: data.main.temp,
            wind_speed: data.wind.speed,
            rain: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            city: data.name,
            timestamp: Date.now()
        };

        weatherCache.set(regionKey, weatherInfo);
        return weatherInfo;
    } catch (error) {
        return null;
    }
};

const fetchWeatherDataByCity = async (city) => {
    if (!city) return null;
    const cacheKey = `city_${city.toLowerCase()}`;
    const cachedData = weatherCache.get(cacheKey);

    if (cachedData) return cachedData;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        const weatherInfo = {
            temp: data.main.temp,
            wind_speed: data.wind.speed,
            rain: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            city: data.name,
            timestamp: Date.now()
        };

        weatherCache.set(cacheKey, weatherInfo);
        return weatherInfo;
    } catch (error) {
        return null;
    }
};

/**
 * Modular Risk Prediction Model
 */
const predictRiskLevel = (weather) => {
    if (!weather) return 'LOW';

    const { rain, wind_speed, condition } = weather;
    
    // HIGH Risk conditions
    if (
        rain > 15 || 
        wind_speed > 25 || 
        ['Thunderstorm', 'Tornado', 'Squall'].includes(condition)
    ) {
        return 'HIGH';
    }

    // MEDIUM Risk conditions
    if (
        (rain > 5 && rain <= 15) || 
        (wind_speed > 12 && wind_speed <= 25) || 
        ['Rain', 'Drizzle', 'Snow'].includes(weather.condition)
    ) {
        return 'MEDIUM';
    }

    return 'LOW';
};

/**
 * Dynamic Pricing Engine
 */
const calculateDynamicPricing = (riskLevel) => {
    const baseExtra = 0;
    switch(riskLevel) {
        case 'HIGH':
            return 300; // Significant increase for high risk (Flat charge or multiplier)
        case 'MEDIUM':
            return 150; // Moderate increase
        default:
            return 0; // Minimal/Zero extra for low risk
    }
};

module.exports = {
    fetchWeatherData,
    fetchWeatherDataByCity,
    predictRiskLevel,
    calculateDynamicPricing
};

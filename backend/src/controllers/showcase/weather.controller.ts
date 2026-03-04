import { Request, Response } from 'express';

const API_KEY = process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
const LAT = '10.38'; // Mỹ Tho
const LON = '106.25'; // Mỹ Tho

export const getWeatherData = async (_req: Request, res: Response) => {
    if (!API_KEY) {
        console.warn('Weather API Key is not defined. Returning mock data.');
        res.json(getMockData());
        return;
    }

    try {
        // Fetch Current Weather
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!currentRes.ok) {
            const err: any = await currentRes.json();
            throw new Error(`Current Weather API Error: ${err.message || currentRes.statusText}`);
        }
        const currentData: any = await currentRes.json();

        // Fetch Forecast
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!forecastRes.ok) {
            const err: any = await forecastRes.json();
            throw new Error(`Forecast API Error: ${err.message || forecastRes.statusText}`);
        }
        const forecastData: any = await forecastRes.json();

        const dailyForecast = forecastData.list
            .filter((item: any) => item.dt_txt.includes('12:00:00'))
            .slice(0, 3)
            .map((item: any) => {
                const date = new Date(item.dt * 1000);
                const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                return {
                    day: days[date.getDay()],
                    temp: Math.round(item.main.temp),
                    condition: item.weather[0].main
                };
            });

        res.json({
            temp: Math.round(currentData.main.temp),
            condition: currentData.weather[0].main,
            description: currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1),
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind.speed * 3.6),
            uvIndex: 0,
            forecast: dailyForecast
        });
    } catch (error: any) {
        console.error('Backend Weather Service Error:', error.message);
        res.json(getMockData());
    }
};

const getMockData = () => {
    return {
        temp: 32,
        condition: 'Clear',
        description: 'Trời quang đãng (Backend Mock)',
        humidity: 65,
        windSpeed: 12,
        uvIndex: 8,
        forecast: [
            { day: 'Mai', temp: 31, condition: 'Clouds' },
            { day: 'T5', temp: 33, condition: 'Clear' },
            { day: 'T6', temp: 29, condition: 'Rain' },
        ]
    };
};

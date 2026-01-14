export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    forecast: Array<{
        day: string;
        temp: number;
        condition: string;
    }>;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const LAT = '10.38'; // Mỹ Tho
const LON = '106.25'; // Mỹ Tho

export const getWeatherData = async (_location: string): Promise<WeatherData> => {
    if (!API_KEY) {
        console.warn('VITE_OPENWEATHER_API_KEY is not defined. Using mock data.');
        return getMockData();
    }

    try {
        // Gọi Current Weather API
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!currentRes.ok) {
            const err = await currentRes.json();
            throw new Error(`Current Weather API Error: ${err.message || currentRes.statusText}`);
        }
        const currentData = await currentRes.json();

        // Gọi Forecast API (5 days / 3 hours)
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!forecastRes.ok) {
            const err = await forecastRes.json();
            throw new Error(`Forecast API Error: ${err.message || forecastRes.statusText}`);
        }
        const forecastData = await forecastRes.json();

        // Xử lý dữ liệu forecast (lấy 3 ngày tiếp theo, mỗi ngày lấy 1 mốc 12:00)
        if (!forecastData.list) {
            throw new Error('Forecast data format is invalid');
        }

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

        return {
            temp: Math.round(currentData.main.temp),
            condition: currentData.weather[0].main,
            description: currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1),
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind.speed * 3.6),
            uvIndex: 0,
            forecast: dailyForecast
        };
    } catch (error) {
        console.error('Weather Service Error:', error);
        return getMockData();
    }
};

const getMockData = (): Promise<WeatherData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                temp: 32,
                condition: 'Clear',
                description: 'Trời quang đãng (Mock)',
                humidity: 65,
                windSpeed: 12,
                uvIndex: 8,
                forecast: [
                    { day: 'Mai', temp: 31, condition: 'Clouds' },
                    { day: 'T5', temp: 33, condition: 'Clear' },
                    { day: 'T6', temp: 29, condition: 'Rain' },
                ]
            });
        }, 500);
    });
};

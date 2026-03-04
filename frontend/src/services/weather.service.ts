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

import api from './api';

export const getWeatherData = async (_location: string): Promise<WeatherData> => {
    try {
        const response = await api.get('/showcase/weather');
        return response.data;
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

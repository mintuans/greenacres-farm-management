import React, { useEffect, useState } from 'react';
import { getWeatherData, WeatherData } from '../services/weather.service';

const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getWeatherData('Mỹ Tho');
                setWeather(data);
            } catch (error) {
                console.error('Failed to fetch weather:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, []);

    const getIcon = (condition: string) => {
        switch (condition) {
            case 'Clear': return 'wb_sunny';
            case 'Clouds': return 'cloud_queue';
            case 'Rain':
            case 'Drizzle': return 'rainy';
            case 'Thunderstorm': return 'thunderstorm';
            case 'Mist':
            case 'Smoke':
            case 'Haze':
            case 'Dust':
            case 'Fog': return 'foggy';
            default: return 'filter_drama';
        }
    };

    const getIconColor = (condition: string) => {
        switch (condition) {
            case 'Clear': return 'text-orange-400';
            case 'Clouds': return 'text-gray-400';
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm': return 'text-blue-500';
            case 'Mist':
            case 'Fog': return 'text-slate-300';
            default: return 'text-primary';
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-5 rounded-2xl border border-[#dbe6de] shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#dbe6de] shadow-sm hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#111813] flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">thermostat</span>
                    Thời tiết tại vườn
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-500`}>
                        <span className={`material-symbols-outlined text-4xl ${getIconColor(weather.condition)}`}>
                            {getIcon(weather.condition)}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#111813]">{weather.temp}°</span>
                            <span className="text-gray-400 font-bold">C</span>
                        </div>
                        <p className="text-sm font-medium text-[#61896b]">{weather.description}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mb-4">
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Độ ẩm</p>
                    <div className="flex items-center justify-center gap-1 text-[#111813] font-bold">
                        <span className="material-symbols-outlined text-sm text-blue-400">humidity_percentage</span>
                        {weather.humidity}%
                    </div>
                </div>
                <div className="text-center border-x border-gray-100 px-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sức gió</p>
                    <div className="flex items-center justify-center gap-1 text-[#111813] font-bold">
                        <span className="material-symbols-outlined text-sm text-green-400">air</span>
                        {weather.windSpeed} km/h
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">UV</p>
                    <div className="flex items-center justify-center gap-1 text-[#111813] font-bold">
                        <span className="material-symbols-outlined text-sm text-orange-400">sunny</span>
                        {weather.uvIndex}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dự báo 3 ngày tới</p>
                {weather.forecast.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-bold text-[#3c4740] w-10">{f.day}</span>
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-xl ${getIconColor(f.condition)}`}>
                                {getIcon(f.condition)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {f.condition === 'Clear' ? 'Nắng' : f.condition === 'Clouds' ? 'Mây' : f.condition === 'Rain' ? 'Có mưa' : 'Thay đổi'}
                            </span>
                        </div>
                        <span className="text-sm font-black text-[#111813]">{f.temp}°</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherWidget;

import React, { useState, useMemo } from 'react';
import {
    generateCalendarDays,
    getMonthName,
    isSameDay,
    CalendarDay
} from '@/src/utils/calendar.utils';
import { ScheduleEvent, EventType } from '@/src/@types/schedule.types';

const Schedule: React.FC = () => {
    // State cho tháng/năm hiện tại
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'field' | 'machine'>('all');

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Sample events data - Sau này sẽ lấy từ API
    const [events] = useState<ScheduleEvent[]>([
        {
            id: '1',
            title: 'Bắt đầu mùa trồng',
            type: 'task',
            date: new Date(2026, 0, 8), // 8/1/2026
            description: 'Chuẩn bị đất và gieo hạt',
        },
        {
            id: '2',
            title: 'Ca sáng - Đội A',
            type: 'staff',
            date: new Date(2026, 0, 8),
            startTime: '06:00',
            endTime: '12:00',
        },
        {
            id: '3',
            title: 'Bảo trì máy móc',
            type: 'maintenance',
            date: new Date(2026, 0, 9),
            description: 'Kiểm tra và bảo dưỡng máy cày',
        },
        {
            id: '4',
            title: 'Ca làm việc đầy đủ',
            type: 'staff',
            date: new Date(2026, 0, 10),
        },
        {
            id: '5',
            title: 'Thu hoạch ngô',
            type: 'harvest',
            date: new Date(2026, 0, 12),
            description: 'Thu hoạch khu vực B',
        },
        {
            id: '6',
            title: 'Kiểm tra tưới tiêu',
            type: 'task',
            date: new Date(2026, 0, 13),
        },
        {
            id: '7',
            title: 'Thiếu nhân sự',
            type: 'issue',
            date: new Date(2026, 0, 15),
            description: '3 công nhân nghỉ ốm',
        },
        {
            id: '8',
            title: 'Ca làm việc',
            type: 'staff',
            date: new Date(2026, 0, 16),
        },
        {
            id: '9',
            title: 'Kiểm kê thiết bị',
            type: 'maintenance',
            date: new Date(2026, 0, 18),
        },
        {
            id: '10',
            title: 'Phân công - James L.',
            type: 'staff',
            date: new Date(2026, 0, 19),
        },
    ]);

    // Tạo lịch cho tháng hiện tại
    const calendarDays = useMemo(() => {
        return generateCalendarDays(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    // Lấy events cho một ngày cụ thể
    const getEventsForDay = (day: CalendarDay): ScheduleEvent[] => {
        return events.filter(event => isSameDay(event.date, day.date));
    };

    // Chuyển sang tháng trước
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    // Chuyển sang tháng sau
    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    // Về tháng hiện tại
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Lấy màu cho từng loại event
    const getEventColor = (type: EventType): string => {
        switch (type) {
            case 'staff':
                return 'bg-blue-500';
            case 'task':
                return 'bg-green-500';
            case 'harvest':
                return 'bg-yellow-500';
            case 'issue':
                return 'bg-red-500';
            case 'maintenance':
                return 'bg-orange-400';
            default:
                return 'bg-gray-400';
        }
    };

    // Tên tháng hiện tại
    const monthYearDisplay = `${getMonthName(currentMonth)} ${currentYear}`;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Lịch làm việc
                    </h1>
                    <p className="text-slate-500">Quản lý ca làm việc và sự kiện trang trại hàng tháng</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm ca làm việc</span>
                </button>
            </div>

            {/* Calendar Card */}
            <div className="flex flex-col gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Filters and Controls */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 border-b border-slate-200 gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
                            Bộ lọc:
                        </span>
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedFilter === 'all'
                                    ? 'bg-[#13ec49]/20 text-slate-900 border-[#13ec49]/30'
                                    : 'bg-transparent hover:bg-slate-100 text-slate-500 border-transparent'
                                }`}
                        >
                            Tất cả vai trò
                        </button>
                        <button
                            onClick={() => setSelectedFilter('field')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedFilter === 'field'
                                    ? 'bg-[#13ec49]/20 text-slate-900 border-[#13ec49]/30'
                                    : 'bg-transparent hover:bg-slate-100 text-slate-500 border-transparent'
                                }`}
                        >
                            Công nhân đồng ruộng
                        </button>
                        <button
                            onClick={() => setSelectedFilter('machine')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedFilter === 'machine'
                                    ? 'bg-[#13ec49]/20 text-slate-900 border-[#13ec49]/30'
                                    : 'bg-transparent hover:bg-slate-100 text-slate-500 border-transparent'
                                }`}
                        >
                            Người vận hành máy
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-blue-500"></div>
                            <span className="text-slate-500">Nhân viên</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-green-500"></div>
                            <span className="text-slate-500">Công việc</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-yellow-500"></div>
                            <span className="text-slate-500">Thu hoạch</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-red-500"></div>
                            <span className="text-slate-500">Vấn đề</span>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                        <button
                            onClick={goToToday}
                            className="text-sm font-medium text-[#13ec49] hover:underline"
                        >
                            Hôm nay
                        </button>
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                className="size-8 flex items-center justify-center rounded hover:bg-white shadow-sm transition-all text-slate-900"
                                onClick={goToPreviousMonth}
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <span className="px-4 text-sm font-bold text-slate-900 min-w-[140px] text-center">
                                {monthYearDisplay}
                            </span>
                            <button
                                className="size-8 flex items-center justify-center rounded hover:bg-white shadow-sm transition-all text-slate-900"
                                onClick={goToNextMonth}
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full overflow-x-auto pb-4">
                    {/* Day Headers */}
                    <div className="min-w-[800px] grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                            <div
                                key={idx}
                                className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="min-w-[800px] grid grid-cols-7 bg-white">
                        {calendarDays.map((day, idx) => {
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[110px] p-2 border-b border-r border-slate-200 group transition-colors relative flex flex-col justify-between cursor-pointer ${!day.isCurrentMonth
                                            ? 'bg-slate-50'
                                            : day.isToday
                                                ? 'bg-[#13ec49]/5 hover:bg-[#13ec49]/10'
                                                : 'hover:bg-slate-50'
                                        } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                                    title={dayEvents.map(e => e.title).join(', ')}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className={`text-sm font-medium p-1 rounded-full size-7 flex items-center justify-center ${day.isToday
                                                    ? 'bg-[#13ec49] text-black font-bold shadow-sm'
                                                    : day.isCurrentMonth
                                                        ? 'text-slate-900'
                                                        : 'text-slate-400'
                                                }`}
                                        >
                                            {day.dayOfMonth}
                                        </span>
                                    </div>

                                    {/* Event Indicators */}
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-1.5 flex-wrap p-1">
                                            {dayEvents.map((event, eventIdx) => (
                                                <div
                                                    key={eventIdx}
                                                    className={`h-2.5 w-2.5 rounded-full ${getEventColor(event.type)} ${event.type === 'harvest' ? 'ring-2 ring-yellow-200' : ''
                                                        }`}
                                                    title={event.title}
                                                ></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    Sự kiện tháng {getMonthName(currentMonth)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-bold text-slate-700">Nhân viên</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                            {events.filter(e => e.type === 'staff').length}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-bold text-slate-700">Công việc</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                            {events.filter(e => e.type === 'task').length}
                        </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-bold text-slate-700">Thu hoạch</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                            {events.filter(e => e.type === 'harvest').length}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-red-500"></div>
                            <span className="text-sm font-bold text-slate-700">Vấn đề</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                            {events.filter(e => e.type === 'issue').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;

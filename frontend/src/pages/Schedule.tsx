import React, { useState, useMemo, useEffect } from 'react';
import {
    generateCalendarDays,
    getMonthName,
    isSameDay,
    CalendarDay,
    formatDate
} from '@/src/utils/calendar.utils';
import { EventType } from '@/src/@types/schedule.types';
import { getPartners, Partner } from '../api/partner-solid.api';
import { getWorkShifts, WorkShift } from '../api/work-shift.api';
import { getJobTypes, JobType } from '../api/job-type.api';
import { getSchedulesByMonth, ScheduleEvent as APIScheduleEvent } from '../api/schedule.api';

// Interface để map dữ liệu từ API sang format hiện tại
interface ScheduleEvent {
    id: string;
    title: string;
    type: EventType;
    date: Date;
    startTime?: string;
    endTime?: string;
    description?: string;
}

const Schedule: React.FC = () => {
    // State cho tháng/năm hiện tại
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'field' | 'machine'>('all');

    // State cho việc hiển thị chi tiết ngày
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
    const [showDayModal, setShowDayModal] = useState(false);

    // State cho Modal thêm ca làm việc
    const [showAddShiftModal, setShowAddShiftModal] = useState(false);
    const [workers, setWorkers] = useState<Partner[]>([]);
    const [shiftTemplates, setShiftTemplates] = useState<WorkShift[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    const [formShift, setFormShift] = useState({
        worker_id: '',
        shift_id: '',
        job_id: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Real events data from API
    const [events, setEvents] = useState<ScheduleEvent[]>([]);

    // Fetch schedules from API
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoadingSchedules(true);
                const apiEvents = await getSchedulesByMonth(currentYear, currentMonth + 1);

                // Map API data to component format
                const mappedEvents: ScheduleEvent[] = apiEvents.map(event => ({
                    id: event.event_id,
                    title: event.title,
                    type: event.event_type === 'WORK_SHIFT' ? 'staff' :
                        event.description?.includes('Thu hoạch') ? 'harvest' :
                            event.description?.includes('Vấn đề') ? 'issue' : 'task',
                    date: new Date(event.event_date),
                    startTime: event.start_time,
                    endTime: event.end_time,
                    description: event.description
                }));

                setEvents(mappedEvents);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setLoadingSchedules(false);
            }
        };
        fetchSchedules();
    }, [currentYear, currentMonth]);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                setLoadingData(true);
                const [w, s, j] = await Promise.all([
                    getPartners('WORKER'),
                    getWorkShifts(),
                    getJobTypes()
                ]);
                setWorkers(w);
                setShiftTemplates(s);
                setJobTypes(j);
            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchFormData();
    }, []);

    const calendarDays = useMemo(() => {
        return generateCalendarDays(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    const getEventsForDay = (day: CalendarDay): ScheduleEvent[] => {
        return events.filter(event => isSameDay(event.date, day.date));
    };

    const handleRemoveEvent = (eventId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn gỡ sự kiện này khỏi lịch?')) {
            setEvents(prev => prev.filter(event => event.id !== eventId));
        }
    };

    const handleAddShiftSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const worker = workers.find(w => w.id === formShift.worker_id);
        const shift = shiftTemplates.find(s => s.id === formShift.shift_id);
        const job = jobTypes.find(j => j.id === formShift.job_id);

        if (!worker || !shift) return;

        const newEvent: ScheduleEvent = {
            id: Date.now().toString(),
            title: `${worker.partner_name} - ${shift.shift_name} (${job?.job_name || 'Công việc'})`,
            type: 'staff',
            date: new Date(formShift.date),
            startTime: shift.start_time,
            endTime: shift.end_time,
            description: formShift.note
        };

        setEvents(prev => [...prev, newEvent]);
        setShowAddShiftModal(false);
        setFormShift({
            worker_id: '',
            shift_id: '',
            job_id: '',
            date: new Date().toISOString().split('T')[0],
            note: ''
        });
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getEventColor = (type: EventType): string => {
        switch (type) {
            case 'staff': return 'bg-blue-500';
            case 'task': return 'bg-green-500';
            case 'harvest': return 'bg-yellow-500';
            case 'issue': return 'bg-red-500';
            case 'maintenance': return 'bg-orange-400';
            default: return 'bg-gray-400';
        }
    };

    const getEventLabel = (type: EventType): string => {
        switch (type) {
            case 'staff': return 'Nhân viên';
            case 'task': return 'Công việc';
            case 'harvest': return 'Thu hoạch';
            case 'issue': return 'Vấn đề';
            case 'maintenance': return 'Bảo trì';
            default: return 'Khác';
        }
    };

    // State cho Month/Year Picker
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [tempYear, setTempYear] = useState(currentYear);

    const monthYearDisplay = `${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-slate-50/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                        Lịch làm việc
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Quản lý ca làm việc và sự kiện trang trại hàng tháng</p>
                </div>
                {/* 
                <button
                    onClick={() => setShowAddShiftModal(true)}
                    className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#10d63f] text-black font-black h-12 px-8 rounded-2xl shadow-xl shadow-[#13ec49]/30 transition-all active:scale-95 group"
                >
                    <span className="material-symbols-outlined font-black text-[22px] group-hover:rotate-90 transition-transform">add</span>
                    <span>Thêm ca làm việc</span>
                </button>
                */}
            </div>

            {/* Calendar Card */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
                {/* Filters and Controls */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-6 border-b border-slate-100 gap-6">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-5 text-[11px] font-black uppercase tracking-wider">
                        <div className="flex items-center gap-2 text-blue-600/80">
                            <div className="size-2.5 rounded-full bg-blue-500 shadow-sm ring-4 ring-blue-50"></div>
                            <span>Nhân viên</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600/80">
                            <div className="size-2.5 rounded-full bg-green-500 shadow-sm ring-4 ring-green-50"></div>
                            <span>Công việc</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600/80">
                            <div className="size-2.5 rounded-full bg-yellow-500 shadow-sm ring-4 ring-yellow-50"></div>
                            <span>Thu hoạch</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600/80">
                            <div className="size-2.5 rounded-full bg-red-500 shadow-sm ring-4 ring-red-50"></div>
                            <span>Vấn đề</span>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
                        <button
                            onClick={goToToday}
                            className="text-[10px] font-black uppercase tracking-widest text-[#13ec49] hover:text-[#10d63f] transition-colors whitespace-nowrap"
                        >
                            Hôm nay
                        </button>
                        <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100 relative">
                            <button
                                className="size-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-900"
                                onClick={goToPreviousMonth}
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setTempYear(currentYear);
                                        setIsYearPickerOpen(!isYearPickerOpen);
                                    }}
                                    className="px-6 text-sm font-black text-slate-900 min-w-[120px] text-center hover:text-[#13ec49] transition-colors"
                                >
                                    {monthYearDisplay}
                                </button>

                                {isYearPickerOpen && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[120] p-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <button
                                                onClick={() => setTempYear(prev => prev - 1)}
                                                className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                            </button>
                                            <span className="font-black text-slate-900 tracking-tighter text-lg">{tempYear}</span>
                                            <button
                                                onClick={() => setTempYear(prev => prev + 1)}
                                                className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setCurrentDate(new Date(tempYear, i, 1));
                                                        setIsYearPickerOpen(false);
                                                    }}
                                                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentMonth === i && currentYear === tempYear
                                                        ? 'bg-[#13ec49] text-black'
                                                        : 'hover:bg-slate-50 text-slate-500'
                                                        }`}
                                                >
                                                    T{i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => setIsYearPickerOpen(false)}
                                                className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 transition-colors"
                                            >
                                                Đóng
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="size-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-900"
                                onClick={goToNextMonth}
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full overflow-x-auto">
                    {/* Day Headers */}
                    <div className="min-w-[800px] grid grid-cols-7 border-b-2 border-slate-200 bg-slate-50/30">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                            <div
                                key={idx}
                                className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r-2 border-slate-200 last:border-r-0"
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
                                    onClick={() => {
                                        setSelectedDay(day);
                                        setShowDayModal(true);
                                    }}
                                    className={`min-h-[140px] p-3 border-b-2 border-r-2 border-slate-200 group transition-all relative flex flex-col justify-between cursor-pointer ${!day.isCurrentMonth
                                        ? 'bg-slate-50/40 opacity-40'
                                        : day.isToday
                                            ? 'bg-[#13ec49]/5 hover:bg-[#13ec49]/10'
                                            : 'hover:bg-slate-50/60'
                                        } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className={`text-sm font-black p-1 rounded-xl size-8 flex items-center justify-center transition-all ${day.isToday
                                                ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/30'
                                                : day.isCurrentMonth
                                                    ? 'text-slate-900 group-hover:scale-110'
                                                    : 'text-slate-300'
                                                }`}
                                        >
                                            {day.dayOfMonth}
                                        </span>
                                    </div>

                                    {/* Event Indicators */}
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-2 flex-wrap p-1">
                                            {dayEvents.map((event, eventIdx) => (
                                                <div
                                                    key={eventIdx}
                                                    className={`h-2.5 w-2.5 rounded-full shadow-sm ${getEventColor(event.type)} transition-all group-hover:scale-150 ring-2 ring-white`}
                                                    title={event.title}
                                                ></div>
                                            ))}
                                            {dayEvents.length > 4 && (
                                                <span className="text-[9px] font-black text-slate-400">+{dayEvents.length - 4}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal - Chi tiết ngày & Gỡ sự kiện */}
            {showDayModal && selectedDay && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Sự kiện ngày</h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                    {formatDate(selectedDay.date)}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDayModal(false)}
                                className="size-11 flex items-center justify-center rounded-[18px] bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {getEventsForDay(selectedDay).length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="size-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <span className="material-symbols-outlined text-slate-200 text-5xl">event_busy</span>
                                    </div>
                                    <p className="text-slate-400 font-bold italic">Không có sự kiện</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {getEventsForDay(selectedDay).map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-slate-50/50 rounded-[24px] p-5 flex items-center justify-between gap-5 border-2 border-transparent hover:border-white hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group/item"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${getEventColor(event.type)} shadow-sm ring-4 ring-white`}></div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 leading-tight">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        {getEventLabel(event.type)} {event.startTime ? `• ${event.startTime}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveEvent(event.id)}
                                                className="size-10 rounded-[14px] bg-white border border-slate-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover/item:scale-110"
                                                title="Gỡ sự kiện"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50/50 flex gap-4">
                            <button
                                onClick={() => setShowDayModal(false)}
                                className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                            >
                                Đóng
                            </button>
                            {/* 
                            <button
                                onClick={() => {
                                    setFormShift({ ...formShift, date: selectedDay.date.toISOString().split('T')[0] });
                                    setShowDayModal(false);
                                    setShowAddShiftModal(true);
                                }}
                                className="px-6 py-4 bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-[#13ec49]/20"
                            >
                                <span className="material-symbols-outlined font-black">add</span>
                                <span>Thêm mới</span>
                            </button>
                            */}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Thêm ca làm việc cho nhân viên */}
            {showAddShiftModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleAddShiftSubmit}>
                            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Lên lịch làm việc</h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                        Phân công ca làm cho nhân viên
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddShiftModal(false)}
                                    className="size-11 flex items-center justify-center rounded-[18px] bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Chọn nhân viên</label>
                                        <select
                                            required
                                            value={formShift.worker_id}
                                            onChange={e => setFormShift({ ...formShift, worker_id: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#13ec49]/30 focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold transition-all appearance-none"
                                        >
                                            <option value="">-- Chọn nhân sự --</option>
                                            {workers.map(w => (
                                                <option key={w.id} value={w.id}>{w.partner_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Chọn ca làm</label>
                                        <select
                                            required
                                            value={formShift.shift_id}
                                            onChange={e => setFormShift({ ...formShift, shift_id: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#13ec49]/30 focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold transition-all appearance-none"
                                        >
                                            <option value="">-- Chọn ca --</option>
                                            {shiftTemplates.map(s => (
                                                <option key={s.id} value={s.id}>{s.shift_name} ({s.start_time}-{s.end_time})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Loại công việc</label>
                                        <select
                                            value={formShift.job_id}
                                            onChange={e => setFormShift({ ...formShift, job_id: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#13ec49]/30 focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold transition-all appearance-none"
                                        >
                                            <option value="">-- Chọn loại việc --</option>
                                            {jobTypes.map(j => (
                                                <option key={j.id} value={j.id}>{j.job_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Ngày làm việc</label>
                                        <input
                                            type="date"
                                            required
                                            value={formShift.date}
                                            onChange={e => setFormShift({ ...formShift, date: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#13ec49]/30 focus:bg-white rounded-2xl px-5 py-3.5 outline-none font-bold transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Ghi chú công việc</label>
                                    <textarea
                                        rows={3}
                                        value={formShift.note}
                                        onChange={e => setFormShift({ ...formShift, note: e.target.value })}
                                        placeholder="Giao nhiệm vụ cụ thể cho nhân viên..."
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#13ec49]/30 focus:bg-white rounded-2xl px-5 py-4 outline-none font-medium transition-all"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddShiftModal(false)}
                                    className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined font-black">calendar_add_on</span>
                                    <span>Xác nhận lên lịch</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Event Summary */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/50 p-8">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#13ec49] text-2xl">analytics</span>
                    Thống kê tiến độ tháng {getMonthName(currentMonth)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(['staff', 'task', 'harvest', 'issue'] as EventType[]).map((type) => {
                        const count = events.filter(e => e.type === type).length;
                        const label = getEventLabel(type);
                        const colorClass = type === 'staff' ? 'border-blue-100 bg-blue-50/50 text-blue-600' :
                            type === 'task' ? 'border-green-100 bg-green-50/50 text-green-600' :
                                type === 'harvest' ? 'border-yellow-100 bg-yellow-50/50 text-yellow-600' :
                                    'border-red-100 bg-red-50/50 text-red-600';

                        return (
                            <div key={type} className={`p-6 rounded-[28px] border-2 transition-all hover:shadow-xl hover:bg-white ${colorClass} group`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`size-3 rounded-full ${getEventColor(type)} shadow-sm ring-4 ring-white`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100">{label}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-slate-900">{count}</p>
                                    <span className="text-[11px] font-black uppercase opacity-40">Sự kiện</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Schedule;

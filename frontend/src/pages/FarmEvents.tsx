import React, { useState, useEffect, useRef } from 'react';
import { getFarmEvents, createFarmEvent, updateFarmEvent, deleteFarmEvent, FarmEvent } from '../api/farm-event.api';
import { getSeasons, Season } from '../api/season-solid.api';
import { getProductionUnits, ProductionUnit } from '../api/production-unit.api';

const FarmEvents: React.FC = () => {
    const [events, setEvents] = useState<FarmEvent[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [units, setUnits] = useState<ProductionUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<FarmEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        event_type: 'TASK',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: '',
        is_all_day: true,
        description: '',
        season_id: '',
        unit_id: ''
    });

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsData, seasonsData, unitsData] = await Promise.all([
                getFarmEvents(),
                getSeasons(),
                getProductionUnits()
            ]);
            setEvents(eventsData || []);
            setSeasons(seasonsData || []);
            setUnits(unitsData || []);
        } catch (error) {
            console.error('Error fetching farm events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateFarmEvent(editingItem.id, formData);
            } else {
                await createFarmEvent(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving farm event:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa sự kiện này?')) {
            await deleteFarmEvent(id);
            fetchData();
        }
    };

    const getEventTypeStyle = (type: string) => {
        switch (type) {
            case 'HARVEST': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'grass' };
            case 'ISSUE': return { color: 'text-red-600', bg: 'bg-red-100', icon: 'warning' };
            case 'TASK': return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: 'task_alt' };
            default: return { color: 'text-blue-600', bg: 'bg-blue-100', icon: 'event' };
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const filteredEvents = (events || []).filter(ev =>
        ev.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CustomSelect = ({ label, options, value, onChange, placeholder, id }: any) => {
        const isOpen = openDropdown === id;
        const selectedOption = options.find((o: any) => o.value === value);

        return (
            <div className="relative" ref={isOpen ? dropdownRef : null}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                <div
                    onClick={() => setOpenDropdown(isOpen ? null : id)}
                    className={`w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold flex justify-between items-center cursor-pointer transition-all border-2 ${isOpen ? 'border-[#13ec49] bg-white ring-4 ring-[#13ec49]/10' : 'border-transparent'}`}
                >
                    <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#13ec49]' : 'text-slate-400'}`}>
                        expand_more
                    </span>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[240px] overflow-y-auto">
                        {options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpenDropdown(null);
                                }}
                                className={`px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group ${value === opt.value ? 'bg-[#13ec49]/5 text-[#13ec49]' : 'text-slate-600'}`}
                            >
                                <span className="font-bold">{opt.label}</span>
                                {value === opt.value && <span className="material-symbols-outlined text-sm">check_circle</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Sự kiện Nông trại</h1>
                    <p className="text-slate-500 mt-2 font-medium">Theo dõi các sự kiện quan trọng, thu hoạch và vấn đề phát sinh.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({
                            title: '', event_type: 'TASK', start_time: new Date().toISOString().slice(0, 16),
                            end_time: '', is_all_day: true, description: '', season_id: '', unit_id: ''
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] transition-all shadow-xl shadow-[#13ec49]/20 active:scale-95"
                >
                    <span className="material-symbols-outlined font-black">add</span>
                    <span>Thêm sự kiện</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sự kiện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Tên sự kiện</th>
                                    <th className="px-8 py-5">Loại</th>
                                    <th className="px-8 py-5">Thời gian</th>
                                    <th className="px-8 py-5">Vị trí / Vụ mùa</th>
                                    <th className="px-8 py-5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEvents.map((item) => {
                                    const style = getEventTypeStyle(item.event_type);
                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${style.bg} ${style.color}`}>
                                                        <span className="material-symbols-outlined">{style.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-900">{item.title}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description || 'Không có mô tả'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${style.bg} ${style.color}`}>
                                                    {item.event_type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-slate-700">{formatDate(item.start_time)}</p>
                                                {item.is_all_day && <span className="text-[9px] font-black text-blue-500 uppercase">Cả ngày</span>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    {item.unit_name && (
                                                        <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                                                            <span className="material-symbols-outlined text-sm">location_on</span> {item.unit_name}
                                                        </span>
                                                    )}
                                                    {item.season_name && (
                                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                            <span className="material-symbols-outlined text-sm">potted_plant</span> {item.season_name}
                                                        </span>
                                                    )}
                                                    {!item.unit_name && !item.season_name && <span className="text-slate-300 italic text-xs">Chưa gán</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setFormData({ ...item, start_time: new Date(item.start_time).toISOString().slice(0, 16) });
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">{editingItem ? 'Cập nhật sự kiện' : 'Thêm sự kiện nông trại'}</h2>
                            <button onClick={() => setShowModal(false)} className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên sự kiện</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold transition-all border-none"
                                    placeholder="Ví dụ: Thu hoạch hái mận Vườn A"
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="event_type"
                                    label="Loại sự kiện"
                                    placeholder="Loại sự kiện"
                                    value={formData.event_type}
                                    onChange={(val: string) => setFormData({ ...formData, event_type: val as any })}
                                    options={[
                                        { value: 'TASK', label: 'Công việc (TASK)' },
                                        { value: 'HARVEST', label: 'Thu hoạch (HARVEST)' },
                                        { value: 'ISSUE', label: 'Vấn đề (ISSUE)' },
                                        { value: 'OTHER', label: 'Khác (OTHER)' }
                                    ]}
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="unit"
                                    label="Đơn vị / Vị trí"
                                    placeholder="-- Không gán --"
                                    value={formData.unit_id}
                                    onChange={(val: string) => setFormData({ ...formData, unit_id: val })}
                                    options={[
                                        { value: '', label: '-- Không gán --' },
                                        ...units.map(u => ({ value: u.id, label: u.unit_name }))
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold transition-all border-none"
                                />
                            </div>

                            <div className="flex items-center mt-8 pl-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_all_day}
                                            onChange={e => setFormData({ ...formData, is_all_day: e.target.checked })}
                                            className="sr-only p-2"
                                        />
                                        <div className={`w-14 h-7 rounded-full bg-slate-200 transition-all ${formData.is_all_day ? 'bg-[#13ec49]' : ''}`}></div>
                                        <div className={`absolute top-1 left-1 size-5 rounded-full bg-white transition-all shadow-sm ${formData.is_all_day ? 'translate-x-7' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Sự kiện cả ngày</span>
                                </label>
                            </div>

                            <div className="col-span-full">
                                <CustomSelect
                                    id="season"
                                    label="Vụ mùa liên quan"
                                    placeholder="-- Chọn vụ mùa (nếu có) --"
                                    value={formData.season_id}
                                    onChange={(val: string) => setFormData({ ...formData, season_id: val })}
                                    options={[
                                        { value: '', label: '-- Chọn vụ mùa (nếu có) --' },
                                        ...seasons.map(s => ({ value: s.id, label: s.season_name }))
                                    ]}
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all border-none"
                                    placeholder="Nội dung chi tiết sự kiện..."
                                ></textarea>
                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
                                >
                                    {editingItem ? 'Lưu thay đổi' : 'Tạo sự kiện'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmEvents;

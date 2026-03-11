import React, { useState, useEffect, useRef } from 'react';
import { getFarmEvents, createFarmEvent, updateFarmEvent, deleteFarmEvent, FarmEvent } from '../api/farm-event.api';
import { getSeasons, Season } from '../api/season.api';
import { getProductionUnits, ProductionUnit } from '../api/production-unit.api';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';
import { useTranslation } from 'react-i18next';


const FarmEvents: React.FC = () => {
    const [events, setEvents] = useState<FarmEvent[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [units, setUnits] = useState<ProductionUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<FarmEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t, i18n } = useTranslation();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedItem, setSelectedItem] = useState<FarmEvent | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FarmEvent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

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
        try {
            setIsDeleting(true);
            await deleteFarmEvent(id);
            setDeleteTarget(null);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting farm event:', error);
            alert(t('farm_events.messages.delete_error'));
        } finally {

            setIsDeleting(false);
        }
    };

    const handleImport = async (file: File) => {
        console.log('Importing farm events from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting farm events...');
        alert(t('common.exporting'));
    };


    const handleDownloadTemplate = () => {
        console.log('Downloading farm event template...');
        alert(t('common.downloading_template'));
    };


    const handleEditItem = (item: FarmEvent) => {
        setEditingItem(item);
        setFormData({ ...item, start_time: new Date(item.start_time).toISOString().slice(0, 16) });
        setShowModal(true);
    };

    const getEventTypeStyle = (type: string) => {
        switch (type) {
            case 'HARVEST': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'grass', label: t('farm_events.types.harvest') };
            case 'ISSUE': return { color: 'text-red-600', bg: 'bg-red-100', icon: 'warning', label: t('farm_events.types.issue') };
            case 'TASK': return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: 'task_alt', label: t('farm_events.types.task') };
            default: return { color: 'text-blue-600', bg: 'bg-blue-100', icon: 'event', label: t('farm_events.types.other') };
        }
    };


    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
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
        <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('farm_events.title')}</h1>
                <p className="text-slate-500 mt-1 font-medium text-xs">{t('farm_events.subtitle')}</p>
            </div>


            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder={t('farm_events.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all text-sm"
                        />

                    </div>
                    <ActionToolbar
                        onAdd={() => {
                            setEditingItem(null);
                            setFormData({
                                title: '', event_type: 'TASK', start_time: new Date().toISOString().slice(0, 16),
                                end_time: '', is_all_day: true, description: '', season_id: '', unit_id: ''
                            });
                            setShowModal(true);
                        }}
                        addLabel={t('farm_events.add_btn')}
                        onEdit={() => selectedItem && handleEditItem(selectedItem)}

                        editDisabled={!selectedItem}
                        onDelete={() => selectedItem && setDeleteTarget(selectedItem)}
                        deleteDisabled={!selectedItem}
                        onRefresh={fetchData}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                <tr>
                                    <th className="px-8 py-5">{t('farm_events.table.title')}</th>
                                    <th className="px-8 py-5">{t('farm_events.table.type')}</th>
                                    <th className="px-8 py-5">{t('farm_events.table.time')}</th>
                                    <th className="px-8 py-5">{t('farm_events.table.location_season')}</th>
                                    <th className="px-8 py-5 text-right">{t('farm_events.table.actions')}</th>
                                </tr>

                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEvents.map((item) => {
                                    const style = getEventTypeStyle(item.event_type);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedItem(prev => prev?.id === item.id ? null : item)}
                                            className={`group transition-all cursor-pointer ${selectedItem?.id === item.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/30' : 'hover:bg-slate-50/80'}`}
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${style.bg} ${style.color}`}>
                                                        <span className="material-symbols-outlined">{style.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-900">{item.title}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description || t('farm_events.table.no_desc')}</p>
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${style.bg} ${style.color}`}>
                                                    {style.label}
                                                </span>

                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-slate-700">{formatDate(item.start_time)}</p>
                                                {item.is_all_day && <span className="text-[9px] font-black text-blue-500 uppercase">{t('farm_events.table.all_day')}</span>}
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
                                                    {!item.unit_name && !item.season_name && <span className="text-slate-300 italic text-xs">{t('farm_events.table.unassigned')}</span>}
                                                </div>

                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
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
                            <h2 className="text-2xl font-black text-slate-900">{editingItem ? t('farm_events.modal.edit_title') : t('farm_events.modal.add_title')}</h2>
                            <button onClick={() => setShowModal(false)} className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">

                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('farm_events.modal.title')}</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold transition-all border-none"
                                    placeholder={t('farm_events.modal.title_placeholder')}
                                />
                            </div>


                            <div>
                                <CustomSelect
                                    id="event_type"
                                    label={t('farm_events.modal.event_type')}
                                    placeholder={t('farm_events.modal.event_type')}
                                    value={formData.event_type}
                                    onChange={(val: string) => setFormData({ ...formData, event_type: val as any })}
                                    options={[
                                        { value: 'TASK', label: t('farm_events.types.task') },
                                        { value: 'HARVEST', label: t('farm_events.types.harvest') },
                                        { value: 'ISSUE', label: t('farm_events.types.issue') },
                                        { value: 'OTHER', label: t('farm_events.types.other') }
                                    ]}

                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="unit"
                                    label={t('farm_events.modal.production_unit')}
                                    placeholder={t('farm_events.modal.no_unit')}
                                    value={formData.unit_id}
                                    onChange={(val: string) => setFormData({ ...formData, unit_id: val })}
                                    options={[
                                        { value: '', label: t('farm_events.modal.no_unit') },
                                        ...units.map(u => ({ value: u.id, label: u.unit_name }))
                                    ]}

                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('farm_events.modal.start_time')}</label>
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
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{t('farm_events.modal.all_day')}</span>
                                </label>
                            </div>

                            <div className="col-span-full">
                                <CustomSelect
                                    id="season"
                                    label={t('farm_events.modal.season')}
                                    placeholder={t('farm_events.modal.season_placeholder')}
                                    value={formData.season_id}
                                    onChange={(val: string) => setFormData({ ...formData, season_id: val })}
                                    options={[
                                        { value: '', label: t('farm_events.modal.season_placeholder') },
                                        ...seasons.map(s => ({ value: s.id, label: s.season_name }))
                                    ]}

                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('farm_events.modal.description')}</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all border-none"
                                    placeholder={t('farm_events.modal.description_placeholder')}
                                ></textarea>

                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
                                >
                                    {editingItem ? t('farm_events.modal.save_edit') : t('farm_events.modal.save_new')}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.title}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName={t('sidebar.events').toLowerCase()}
                columnGuide={[
                    t('farm_events.modal.title'),
                    t('farm_events.modal.event_type'),
                    t('farm_events.modal.start_time'),
                    t('farm_events.modal.end_time'),
                    t('farm_events.modal.all_day'),
                    t('farm_events.modal.description'),
                    t('farm_events.modal.season'),
                    t('farm_events.modal.production_unit')
                ]}

                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default FarmEvents;

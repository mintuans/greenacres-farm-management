import React, { useState, useEffect, useRef } from 'react';
import { getWorkSchedules, createWorkSchedule, updateWorkSchedule, deleteWorkSchedule, WorkSchedule } from '../api/work-schedule.api';
import { getPartners, Partner } from '../api/partner.api';
import { getWorkShifts, WorkShift } from '../api/work-shift.api';
import { getJobTypes, JobType } from '../api/job-type.api';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';
import { getSeasons, Season } from '../api/season.api';
import { useTranslation } from 'react-i18next';

const WorkSchedules: React.FC = () => {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [workers, setWorkers] = useState<Partner[]>([]);
    const [shifts, setShifts] = useState<WorkShift[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<WorkSchedule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // New states for ActionToolbar components
    const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<WorkSchedule | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const { t, i18n } = useTranslation();

    const [formData, setFormData] = useState({
        partner_id: '',
        shift_id: '',
        job_type_id: '',
        work_date: new Date().toISOString().split('T')[0],
        status: 'PLANNED',
        note: '',
        season_id: ''
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
            const [schedulesData, workersData, shiftsData, jobsData, seasonsData] = await Promise.all([
                getWorkSchedules(),
                getPartners('WORKER'),
                getWorkShifts(),
                getJobTypes(),
                getSeasons()
            ]);
            setSchedules(schedulesData || []);
            setWorkers(workersData || []);
            setShifts(shiftsData || []);
            setJobTypes(jobsData || []);
            setSeasons(seasonsData || []);
        } catch (error) {
            console.error('Error fetching work schedules:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateWorkSchedule(editingItem.id, formData);
            } else {
                await createWorkSchedule(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteWorkSchedule(id);
            setDeleteTarget(null);
            setSelectedSchedule(null);
            fetchData();
        } catch (error: any) {
            console.error('Error deleting schedule:', error);
            alert(error.response?.data?.message || 'Không thể xóa kế hoạch này.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = () => {
        console.log('Exporting schedules...');
        // toast.success('Đang trích xuất kế hoạch làm việc...');
    };

    const handleImport = async (file: File) => {
        console.log('Importing schedules from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading schedule template...');
        // toast.success('Đang tải tệp mẫu...');
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200'; // PLANNED
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return t('work_schedules.status.confirmed');
            case 'CANCELLED': return t('work_schedules.status.cancelled');
            default: return t('work_schedules.status.planned');
        }
    };

    const filteredSchedules = (schedules || []).filter(s =>
        (s.partner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.job_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Custom Select Component
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
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t('work_schedules.title')}</h1>
                    <p className="text-slate-500 mt-2 font-medium">{t('work_schedules.subtitle')}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder={t('work_schedules.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all"
                        />
                    </div>
                    <ActionToolbar
                        onAdd={() => {
                            setEditingItem(null);
                            setFormData({
                                partner_id: '', shift_id: '', job_type_id: '',
                                work_date: new Date().toISOString().split('T')[0],
                                status: 'PLANNED', note: '', season_id: ''
                            });
                            setShowModal(true);
                        }}
                        addLabel={t('work_schedules.add_btn')}
                        onEdit={() => selectedSchedule && setEditingItem(selectedSchedule) && setShowModal(true)}
                        editDisabled={!selectedSchedule || selectedSchedule.has_payroll}
                        onDelete={() => selectedSchedule && setDeleteTarget(selectedSchedule)}
                        deleteDisabled={!selectedSchedule || selectedSchedule.has_payroll}
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
                                    <th className="px-8 py-5 min-w-[250px]">{t('work_schedules.table.worker_shift')}</th>
                                    <th className="px-8 py-5">{t('work_schedules.table.job')}</th>
                                    <th className="px-8 py-5">{t('work_schedules.table.date')}</th>
                                    <th className="px-8 py-5">{t('work_schedules.table.status')}</th>
                                    <th className="px-8 py-5 text-right">{t('work_schedules.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSchedules.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`group hover:bg-slate-50/80 transition-all cursor-pointer ${selectedSchedule?.id === item.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/20' : ''}`}
                                        onClick={() => setSelectedSchedule(prev => prev?.id === item.id ? null : item)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                                    {(item.partner_name || 'N').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900">{item.partner_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{item.shift_name || t('work_schedules.table.no_shift')}</p>
                                                        {item.season_name && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-[10px] font-black text-[#13ec49] uppercase tracking-widest">{item.season_name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400 text-[20px]">work</span>
                                                <span className="font-bold text-slate-700 whitespace-nowrap">{item.job_name || t('work_schedules.table.other_job')}</span>
                                            </div>
                                            {item.note && <p className="text-xs text-slate-400 mt-1 italic">"{item.note}"</p>}
                                        </td>
                                        <td className="px-8 py-5 font-black text-slate-900">
                                            {new Date(item.work_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap ${getStatusStyle(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {item.has_payroll ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed" title={t('work_schedules.table.lock_tooltip')}>
                                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                                        <span className="text-[10px] font-black uppercase">{t('work_schedules.table.payroll_calculated')}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setFormData({
                                                                    partner_id: item.partner_id,
                                                                    shift_id: item.shift_id,
                                                                    job_type_id: item.job_type_id,
                                                                    work_date: new Date(item.work_date).toISOString().split('T')[0],
                                                                    status: item.status,
                                                                    note: item.note || '',
                                                                    season_id: item.season_id || ''
                                                                });
                                                                setShowModal(true);
                                                            }}
                                                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="Sửa kế hoạch"
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Xóa kế hoạch"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">{editingItem ? t('work_schedules.modal.edit_title') : t('work_schedules.modal.add_title')}</h2>
                            <button onClick={() => setShowModal(false)} className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <CustomSelect
                                    id="worker"
                                    label={t('work_schedules.modal.worker')}
                                    placeholder={t('work_schedules.modal.worker_placeholder')}
                                    value={formData.partner_id}
                                    onChange={(val: string) => setFormData({ ...formData, partner_id: val })}
                                    options={workers.map(w => ({ value: w.id, label: w.partner_name }))}
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="shift"
                                    label={t('work_schedules.modal.shift')}
                                    placeholder={t('work_schedules.modal.shift_placeholder')}
                                    value={formData.shift_id}
                                    onChange={(val: string) => setFormData({ ...formData, shift_id: val })}
                                    options={shifts.map(s => ({ value: s.id, label: s.shift_name }))}
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="job"
                                    label={t('work_schedules.modal.job')}
                                    placeholder={t('work_schedules.modal.job_placeholder')}
                                    value={formData.job_type_id}
                                    onChange={(val: string) => setFormData({ ...formData, job_type_id: val })}
                                    options={jobTypes.map(j => ({ value: j.id, label: j.job_name }))}
                                />
                            </div>

                            <div className="col-span-full">
                                <CustomSelect
                                    id="season"
                                    label={t('work_schedules.modal.season')}
                                    placeholder={t('work_schedules.modal.season_placeholder')}
                                    value={formData.season_id}
                                    onChange={(val: string) => setFormData({ ...formData, season_id: val })}
                                    options={seasons.map(s => ({ value: s.id, label: s.season_name, sublabel: s.status }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('work_schedules.modal.date')}</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.work_date}
                                    onChange={e => setFormData({ ...formData, work_date: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold transition-all border-none"
                                />
                            </div>

                            <div>
                                <CustomSelect
                                    id="status"
                                    label={t('work_schedules.modal.status')}
                                    placeholder={t('work_schedules.modal.status')}
                                    value={formData.status}
                                    onChange={(val: string) => setFormData({ ...formData, status: val })}
                                    options={[
                                        { value: 'PLANNED', label: `${t('work_schedules.status.planned')} (PLANNED)` },
                                        { value: 'CONFIRMED', label: `${t('work_schedules.status.confirmed')} (CONFIRMED)` },
                                        { value: 'CANCELLED', label: `${t('work_schedules.status.cancelled')} (CANCELLED)` }
                                    ]}
                                />
                            </div>

                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('work_schedules.modal.note')}</label>
                                <textarea
                                    rows={3}
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full bg-slate-50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all border-none"
                                    placeholder={t('work_schedules.modal.note_placeholder')}
                                ></textarea>
                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    {t('work_schedules.modal.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] active:scale-95 transition-all shadow-xl shadow-[#13ec49]/20"
                                >
                                    {editingItem ? t('work_schedules.modal.save') : t('work_schedules.modal.create')}
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
                itemName={`${t('work_schedules.modal.edit_title')} ${deleteTarget ? new Date(deleteTarget.work_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : ''} for ${deleteTarget?.partner_name}`}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName={t('work_schedules.import.entity_name')}
                columnGuide={t('work_schedules.import.columns', { returnObjects: true }) as string[]}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default WorkSchedules;

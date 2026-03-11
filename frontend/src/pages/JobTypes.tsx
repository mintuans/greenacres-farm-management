import React, { useState, useEffect } from 'react';
import { JobType, getJobTypes, createJobType, updateJobType, deleteJobType, CreateJobTypeInput } from '../api/job-type.api';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

const JobTypes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<JobType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<JobType | null>(null);
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<CreateJobTypeInput>({
        job_code: '',
        job_name: '',
        base_rate: 0,
        description: ''
    });
    const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<JobType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await getJobTypes();
            setJobs(data);
        } catch (error) {
            console.error('Error loading job types:', error);
            alert(t('job_types.messages.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await updateJobType(editingJob.id, formData);
            } else {
                await createJobType(formData);
            }
            setShowModal(false);
            resetForm();
            loadJobs();
        } catch (error: any) {
            console.error('Error saving job type:', error);
            alert(error.response?.data?.message || t('job_types.messages.save_error'));
        }
    };

    const handleEdit = (job: JobType) => {
        setEditingJob(job);
        setFormData({
            job_code: job.job_code,
            job_name: job.job_name,
            base_rate: job.base_rate,
            description: job.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteJobType(id);
            setDeleteTarget(null);
            setSelectedJob(null);
            loadJobs();
        } catch (error: any) {
            console.error('Error deleting job type:', error);
            alert(error.response?.data?.message || t('job_types.messages.delete_error'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet(t('job_types.export.sheet_name'));
        const columns = t('job_types.import.columns', { returnObjects: true }) as string[];
        ws.columns = [
            { header: columns[0], key: 'code', width: 16 },
            { header: columns[1], key: 'name', width: 30 },
            { header: columns[2], key: 'rate', width: 16 },
            { header: columns[3], key: 'desc', width: 40 },
        ];
        ws.getRow(1).eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF13EC49' } };
            cell.font = { bold: true };
        });
        filteredJobs.forEach(j => ws.addRow({
            code: j.job_code,
            name: j.job_name,
            rate: j.base_rate,
            desc: j.description || '',
        }));
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), t('job_types.export.filename', { date: new Date().toISOString().split('T')[0] }));
    };

    const handleImport = async (file: File) => {
        console.log('Importing jobs from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const downloadTemplate = () => {
        const columns = t('job_types.import.columns', { returnObjects: true }) as string[];
        const csv = [
            columns.join(','),
            'JOB-001,Hái trái,200000,Công việc hái trái cây theo ngày',
        ].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, t('job_types.template.filename'));
    };

    const resetForm = () => {
        setFormData({
            job_code: '',
            job_name: '',
            base_rate: 0,
            description: ''
        });
        setEditingJob(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredJobs = (jobs || []).filter(job =>
        job.job_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3 md:p-4 space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        {t('job_types.title')}
                    </h1>
                    <p className="text-slate-500 mt-2">{t('job_types.subtitle')}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-[#13ec49]">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder={t('job_types.search_placeholder')}
                        />
                    </div>
                    <ActionToolbar
                        onAdd={() => { resetForm(); setShowModal(true); }}
                        addLabel={t('job_types.add_btn')}
                        onEdit={() => selectedJob && handleEdit(selectedJob)}
                        editDisabled={!selectedJob}
                        onDelete={() => selectedJob && setDeleteTarget(selectedJob)}
                        deleteDisabled={!selectedJob}
                        onRefresh={loadJobs}
                        isRefreshing={loading}
                        onExport={handleExport}
                        onImport={() => setShowImportModal(true)}
                        onDownloadTemplate={downloadTemplate}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-slate-600">{t('common.loading') || 'Đang tải...'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4">{t('job_types.table.code')}</th>
                                    <th className="px-6 py-4">{t('job_types.table.name')}</th>
                                    <th className="px-6 py-4">{t('job_types.table.rate')}</th>
                                    <th className="px-6 py-4">{t('job_types.table.desc')}</th>
                                    <th className="px-6 py-4 text-right">{t('job_types.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? t('job_types.table.not_found') : t('job_types.table.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <tr
                                            key={job.id}
                                            onClick={() => setSelectedJob(prev => prev?.id === job.id ? null : job)}
                                            className={`group transition-all cursor-pointer ${selectedJob?.id === job.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/30' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {job.job_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{job.job_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-green-600">{formatCurrency(job.base_rate)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{job.description || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(job); }}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(job); }}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">
                            {editingJob ? t('job_types.modal.edit_title') : t('job_types.modal.add_title')}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('job_types.modal.code')}</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingJob}
                                    value={formData.job_code}
                                    onChange={(e) => setFormData({ ...formData, job_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 disabled:bg-slate-100 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder={t('job_types.modal.code_placeholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('job_types.modal.name')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.job_name}
                                    onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder={t('job_types.modal.name_placeholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('job_types.modal.rate')}</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1000"
                                    value={formData.base_rate}
                                    onChange={(e) => setFormData({ ...formData, base_rate: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder={t('job_types.modal.rate_placeholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('job_types.modal.desc')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    rows={3}
                                    placeholder={t('job_types.modal.desc_placeholder')}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-all"
                                >
                                    {t('job_types.modal.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#13ec49] text-black font-bold rounded-lg hover:bg-[#13ec49]/90 transition-all active:scale-95"
                                >
                                    {editingJob ? t('job_types.modal.save') : t('job_types.modal.create')}
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
                itemName={deleteTarget?.job_name}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName={t('job_types.import.entity_name')}
                columnGuide={t('job_types.import.columns', { returnObjects: true }) as string[]}
                onDownloadTemplate={downloadTemplate}
            />
        </div>
    );
};

export default JobTypes;
